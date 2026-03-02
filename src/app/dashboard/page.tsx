
'use client';

import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, Loader2, ArrowRight, TrendingUp, Map as MapIcon, Award } from "lucide-react";
import Link from "next/link";
import { useUser, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user, firestore } = useUser();
  const [guestAnalyses, setGuestAnalyses] = useState<any[]>([]);
  const [guestRoadmaps, setGuestRoadmaps] = useState<any[]>([]);

  // Firestore Queries
  const analysesQuery = useMemo(() => {
    if (!user?.uid || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'analyses'), orderBy('createdAt', 'desc'), limit(1));
  }, [user?.uid, firestore]);

  const roadmapsQuery = useMemo(() => {
    if (!user?.uid || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'roadmaps'), orderBy('updatedAt', 'desc'), limit(5));
  }, [user?.uid, firestore]);

  const { data: analyses, loading: analysesLoading } = useCollection(analysesQuery);
  const { data: roadmaps, loading: roadmapsLoading } = useCollection(roadmapsQuery);

  // Load guest data
  useEffect(() => {
    if (!user) {
      setGuestAnalyses(JSON.parse(localStorage.getItem('guest_analyses') || '[]'));
      setGuestRoadmaps(JSON.parse(localStorage.getItem('guest_roadmaps') || '[]'));
    }
  }, [user]);

  const latestAnalysis = user ? analyses?.[0] : guestAnalyses[0];
  const activeRoadmaps = user ? (roadmaps || []) : guestRoadmaps;

  const overallProgress = useMemo(() => {
    if (activeRoadmaps.length === 0) return 0;
    const totals = activeRoadmaps.reduce((acc: any, rm: any) => {
      const taskCount = rm.phases?.reduce((pAcc: number, p: any) => pAcc + (p.tasks?.length || 0), 0) || 0;
      const completedCount = rm.completedTaskIds?.length || 0;
      return { total: acc.total + taskCount, completed: acc.completed + completedCount };
    }, { total: 0, completed: 0 });
    return totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;
  }, [activeRoadmaps]);

  if (analysesLoading || roadmapsLoading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background/30 pb-20">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        
        {!latestAnalysis && activeRoadmaps.length === 0 ? (
          <div className="text-center py-32 space-y-10 bg-white rounded-[3rem] border shadow-xl max-w-4xl mx-auto px-10">
            <div className="p-8 bg-accent/10 rounded-full w-fit mx-auto">
              <Sparkles className="h-20 w-20 text-accent animate-pulse" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-headline font-bold text-primary">Your Career Journey Starts Here</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-xl">Let AI analyze your profile and architect a path to your dream career.</p>
            </div>
            <Link href="/analysis">
              <Button size="lg" className="rounded-full px-16 py-8 text-2xl font-bold bg-primary shadow-2xl">Start Career Discovery</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-white/50 p-8 rounded-3xl border">
              <div className="space-y-2">
                <h1 className="text-6xl font-headline font-bold text-primary tracking-tighter">Command Center</h1>
                <p className="text-muted-foreground text-xl">Real-time tracking of your professional evolution.</p>
              </div>
              {activeRoadmaps.length > 0 && (
                 <div className="bg-primary text-primary-foreground px-8 py-3 rounded-full shadow-lg flex items-center gap-4">
                    <TrendingUp className="h-6 w-6 text-accent" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase opacity-70">Mastery Score</span>
                      <span className="text-xl font-headline font-bold">{overallProgress}%</span>
                    </div>
                 </div>
              )}
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-12">
                {activeRoadmaps.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-3xl font-headline font-bold flex items-center gap-3"><MapIcon className="h-8 w-8 text-accent" /> Active Roadmaps</h2>
                    <div className="grid gap-6">
                      {activeRoadmaps.map((rm: any) => {
                        const taskCount = rm.phases?.reduce((acc: number, p: any) => acc + (p.tasks?.length || 0), 0) || 0;
                        const completedCount = rm.completedTaskIds?.length || 0;
                        const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
                        return (
                          <Card key={rm.id} className="hover:border-accent/50 transition-all shadow-sm bg-white border-2">
                            <CardContent className="p-8 flex flex-col sm:flex-row justify-between items-center gap-8">
                              <div className="flex-1 space-y-2 text-center sm:text-left">
                                <h3 className="text-2xl font-bold text-primary">{rm.goal}</h3>
                                <span className="text-xs text-muted-foreground font-bold uppercase">{completedCount} of {taskCount} Tasks Done</span>
                              </div>
                              <div className="w-full sm:w-72 space-y-3">
                                <Progress value={progress} className="h-3 rounded-full" />
                              </div>
                              <Link href={`/roadmap?goal=${encodeURIComponent(rm.goal)}`}>
                                <Button size="lg" variant="secondary" className="rounded-full px-8 font-bold">Continue <ArrowRight className="ml-2 h-5 w-5" /></Button>
                              </Link>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </section>
                )}

                {latestAnalysis && (
                  <section className="space-y-6">
                    <h2 className="text-3xl font-headline font-bold flex items-center gap-3"><Target className="h-8 w-8 text-accent" /> Discovery Matches</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {latestAnalysis.recommendedRoles.map((role: any, i: number) => {
                        const hasRoadmap = activeRoadmaps.some((rm: any) => rm.goal === role.role);
                        return (
                          <Card key={i} className="bg-white border-2 hover:border-accent/20 transition-all">
                            <CardHeader className="pb-2">
                              <Badge className="bg-accent/10 text-accent border-none font-bold w-fit">{role.matchScore}% Match</Badge>
                              <CardTitle className="text-xl font-bold pt-4">{role.role}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <p className="text-sm text-muted-foreground line-clamp-3">{role.reasoning}</p>
                              <Link href={`/roadmap?goal=${encodeURIComponent(role.role)}`} className="block">
                                <Button variant={hasRoadmap ? "outline" : "default"} className="w-full rounded-xl font-bold py-6">
                                  {hasRoadmap ? "View Roadmap" : "Start Path"}
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              <aside className="lg:col-span-4">
                <Card className="bg-primary text-primary-foreground rounded-[2.5rem] border-none shadow-2xl p-10 space-y-8">
                  <Award className="h-10 w-10 text-accent" />
                  <h3 className="text-3xl font-headline font-bold">AI Insight</h3>
                  <p className="text-lg opacity-90 italic">"Focus on bridging the next 3 skill gaps. You're already ahead of 40% of applicants for the {activeRoadmaps[0]?.goal || 'target'} role."</p>
                </Card>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
