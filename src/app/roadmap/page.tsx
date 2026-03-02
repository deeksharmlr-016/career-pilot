'use client';

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { generatePersonalizedRoadmap, type PersonalizedRoadmapOutput } from "@/ai/flows/ai-personalized-roadmap-generation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Layers, BookOpen, CheckCircle2, ArrowLeft, Target, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser, useCollection } from "@/firebase";
import { collection, addDoc, updateDoc, doc, query, where, limit, arrayUnion, arrayRemove, serverTimestamp, orderBy } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

function RoadmapContent() {
  const { user, firestore } = useUser();
  const searchParams = useSearchParams();
  const goal = searchParams.get('goal');
  
  const [generating, setGenerating] = useState(false);
  const [guestRoadmap, setGuestRoadmap] = useState<any>(null);

  // Firestore Queries
  const analysisQuery = useMemo(() => {
    if (!user?.uid || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'analyses'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [user?.uid, firestore]);

  const roadmapQuery = useMemo(() => {
    if (!user?.uid || !firestore || !goal) return null;
    return query(
      collection(firestore, 'users', user.uid, 'roadmaps'),
      where('goal', '==', goal),
      limit(1)
    );
  }, [user?.uid, firestore, goal]);

  const { data: analyses } = useCollection(analysisQuery);
  const { data: roadmaps, loading: roadmapLoading } = useCollection(roadmapQuery);

  // Guest fallbacks
  useEffect(() => {
    if (!user) {
      const guestRoadmaps = JSON.parse(localStorage.getItem('guest_roadmaps') || '[]');
      const foundRoadmap = guestRoadmaps.find((r: any) => r.goal === goal);
      if (foundRoadmap) setGuestRoadmap(foundRoadmap);
    }
  }, [user, goal]);

  const activeRoadmap = user ? roadmaps?.[0] : guestRoadmap;

  const handleGenerate = async () => {
    if (!goal) return;
    
    setGenerating(true);
    try {
      const latestAnalysis = user 
        ? analyses?.[0] as any 
        : JSON.parse(localStorage.getItem('guest_analyses') || '[]')[0];

      const specificGaps = latestAnalysis?.skillGapAnalysis
        ?.filter((g: any) => g.role === goal)
        ?.map((g: any) => g.gap) || [];

      const output = await generatePersonalizedRoadmap({
        careerGoal: goal,
        userSkills: latestAnalysis?.userSkills || [],
        userExperience: latestAnalysis?.userExperience || "Beginner profile",
        skillGaps: specificGaps.length > 0 ? specificGaps : ["Fundamentals of " + goal],
        learningSpeed: "medium"
      });

      const roadmapData = {
        goal: goal,
        phases: output.phases,
        completedTaskIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (user && firestore) {
        addDoc(collection(firestore, 'users', user.uid, 'roadmaps'), roadmapData);
      } else {
        const localId = Math.random().toString(36).substr(2, 9);
        const guestData = { ...roadmapData, id: localId };
        const existing = JSON.parse(localStorage.getItem('guest_roadmaps') || '[]');
        localStorage.setItem('guest_roadmaps', JSON.stringify([guestData, ...existing]));
        setGuestRoadmap(guestData);
      }

      toast({ title: "Roadmap Generated!", description: `Your journey to ${goal} has begun.` });
    } catch (e: any) {
      console.error(e);
      const isQuotaError = e.message?.includes('429') || e.message?.toLowerCase().includes('quota') || e.message?.includes('RESOURCE_EXHAUSTED');
      toast({ 
        variant: "destructive", 
        title: isQuotaError ? "AI Service Busy" : "Generation Failed", 
        description: isQuotaError 
          ? "The AI roadmap architect is currently busy. Please wait a few moments and try again." 
          : "Could not create your roadmap at this time." 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = (taskId: string, completed: boolean) => {
    if (user && firestore && activeRoadmap?.id) {
      const roadmapRef = doc(firestore, 'users', user.uid, 'roadmaps', activeRoadmap.id);
      updateDoc(roadmapRef, {
        completedTaskIds: completed ? arrayUnion(taskId) : arrayRemove(taskId),
        updatedAt: serverTimestamp()
      }).catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: roadmapRef.path, operation: 'update' }));
      });
    } else if (activeRoadmap) {
      const guestRoadmaps = JSON.parse(localStorage.getItem('guest_roadmaps') || '[]');
      const updated = guestRoadmaps.map((r: any) => {
        if (r.goal === goal) {
          const taskIds = new Set(r.completedTaskIds || []);
          if (completed) taskIds.add(taskId); else taskIds.delete(taskId);
          return { ...r, completedTaskIds: Array.from(taskIds), updatedAt: new Date().toISOString() };
        }
        return r;
      });
      localStorage.setItem('guest_roadmaps', JSON.stringify(updated));
      setGuestRoadmap(updated.find((r: any) => r.goal === goal));
    }
  };

  const totalTasks = useMemo(() => {
    if (!activeRoadmap) return 0;
    return activeRoadmap.phases.reduce((acc: number, phase: any) => acc + (phase.tasks?.length || 0), 0);
  }, [activeRoadmap]);

  const completedCount = activeRoadmap?.completedTaskIds?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  if (roadmapLoading || generating) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <Loader2 className="h-16 w-16 animate-spin text-accent" />
      <p className="font-bold text-2xl text-primary">{generating ? "AI Architecting Your Future..." : "Syncing data..."}</p>
    </div>
  );

  if (!goal) return (
    <div className="text-center py-24 bg-white rounded-3xl border shadow-sm max-w-2xl mx-auto px-6">
      <Target className="h-20 w-20 text-muted mx-auto mb-6 opacity-20" />
      <h2 className="text-3xl font-bold mb-4">Choose Your Target</h2>
      <Button asChild size="lg" className="rounded-full px-10 py-6 text-lg font-bold">
        <Link href="/analysis">Start Discovery Session</Link>
      </Button>
    </div>
  );

  if (!activeRoadmap) return (
    <div className="text-center py-24 bg-white rounded-3xl border shadow-sm max-w-2xl mx-auto px-10">
      <Layers className="h-12 w-12 text-accent mx-auto mb-8" />
      <h2 className="text-4xl font-bold mb-4 text-primary">Commit to Excellence</h2>
      <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
        Ready to generate your step-by-step master plan for <strong>{goal}</strong>?
      </p>
      <Button onClick={handleGenerate} className="w-full sm:w-auto rounded-full px-12 py-8 text-xl font-bold shadow-2xl bg-primary">
        Generate My Interactive Roadmap
      </Button>
    </div>
  );

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-white p-10 rounded-[2rem] border shadow-lg relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <Link href="/dashboard" className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Dashboard Overview
          </Link>
          <div className="space-y-1">
            <Badge className="bg-accent text-accent-foreground border-none px-4 py-1 mb-2">Mastery Track</Badge>
            <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">{goal}</h1>
          </div>
        </div>
        <div className="w-full md:w-80 space-y-4 relative z-10 bg-muted/20 p-6 rounded-2xl border">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Overall Progress</span>
            <span className="text-3xl font-headline font-bold text-accent">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-4 rounded-full bg-white border" />
        </div>
      </header>

      <div className="grid gap-16 relative">
        <div className="absolute left-10 top-10 bottom-10 w-1 bg-gradient-to-b from-primary via-accent to-muted rounded-full opacity-10 hidden md:block"></div>
        {activeRoadmap.phases.map((phase: any, pIdx: number) => (
          <section key={pIdx} className="space-y-8 relative">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-headline font-bold text-xl shadow-lg relative z-10">
                {pIdx + 1}
              </div>
              <h3 className="text-3xl font-headline font-bold text-primary">{phase.title}</h3>
            </div>
            <div className="grid gap-4 md:ml-16">
              {phase.tasks.map((task: any) => {
                const isCompleted = activeRoadmap.completedTaskIds?.includes(task.id);
                return (
                  <Card key={task.id} className={`transition-all duration-500 border-2 ${isCompleted ? 'bg-muted/10 border-muted opacity-80' : 'bg-white border-transparent hover:border-accent/30'}`}>
                    <CardContent className="p-0">
                      <div className="flex items-stretch min-h-[100px]">
                        <div className={`w-14 flex items-center justify-center border-r ${isCompleted ? 'bg-muted/20' : 'bg-muted/5'}`}>
                           <Checkbox 
                            id={task.id}
                            checked={isCompleted}
                            onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)}
                            className="h-6 w-6 rounded-full border-2"
                          />
                        </div>
                        <div className="flex-1 p-6 space-y-4">
                          <label htmlFor={task.id} className={`text-lg font-bold cursor-pointer transition-all ${isCompleted ? 'line-through text-muted-foreground opacity-60' : 'text-primary'}`}>
                            {task.description}
                          </label>
                          <Badge variant="secondary" className="text-[10px] font-bold px-3 py-1 rounded-md uppercase">
                            {task.type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <div className="flex-1 flex flex-col bg-background/50">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <Suspense fallback={<Loader2 className="animate-spin h-12 w-12 text-accent" />}>
          <RoadmapContent />
        </Suspense>
      </main>
    </div>
  );
}
