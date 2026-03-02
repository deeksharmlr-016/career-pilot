'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { aiCareerFitAnalysis, type AICareerFitAnalysisInput, type AICareerFitAnalysisOutput } from "@/ai/flows/ai-career-fit-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Target, X, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function AnalysisPage() {
  const { user, firestore } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AICareerFitAnalysisOutput | null>(null);
  const [formData, setFormData] = useState<AICareerFitAnalysisInput>({
    userSkills: [],
    userExperience: "",
    interests: []
  });
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const runAnalysis = async () => {
    if (formData.userSkills.length === 0 || !formData.userExperience) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please add skills and experience." });
      return;
    }
    setLoading(true);
    try {
      const output = await aiCareerFitAnalysis(formData);
      setResult(output);
      
      const analysisData = {
        ...output,
        ...formData,
        createdAt: new Date().toISOString()
      };

      if (user && firestore) {
        addDoc(collection(firestore, 'users', user.uid, 'analyses'), analysisData);
      } else {
        const existing = JSON.parse(localStorage.getItem('guest_analyses') || '[]');
        localStorage.setItem('guest_analyses', JSON.stringify([analysisData, ...existing]));
      }
    } catch (error: any) {
      console.error(error);
      const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      toast({ 
        variant: "destructive", 
        title: isQuotaError ? "AI Service Busy" : "Analysis Failed", 
        description: isQuotaError 
          ? "The AI is currently at its request limit. Please wait about 30 seconds and try again." 
          : "We couldn't complete your career analysis right now." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary mb-4 flex items-center justify-center gap-2">
            <Target className="text-accent" /> Career Discovery
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Analyze your profile to discover matching career paths.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-2 shadow-lg h-fit">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Skills</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add skill..." 
                    value={skillInput} 
                    onChange={(e) => setSkillInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && (setFormData({...formData, userSkills: [...formData.userSkills, skillInput]}), setSkillInput(""))} 
                  />
                  <Button size="sm" onClick={() => (setFormData({...formData, userSkills: [...formData.userSkills, skillInput]}), setSkillInput(""))}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.userSkills.map(s => <Badge key={s} variant="secondary">{s} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFormData({...formData, userSkills: formData.userSkills.filter(x => x !== s)})} /></Badge>)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Interests</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="E.g. FinTech, Healthcare..." 
                    value={interestInput} 
                    onChange={(e) => setInterestInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && (setFormData({...formData, interests: [...(formData.interests || []), interestInput]}), setInterestInput(""))} 
                  />
                  <Button size="sm" onClick={() => (setFormData({...formData, interests: [...(formData.interests || []), interestInput]}), setInterestInput(""))}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.interests?.map(i => <Badge key={i} variant="outline" className="border-accent/30">{i} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFormData({...formData, interests: formData.interests?.filter(x => x !== i)})} /></Badge>)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Experience</label>
                <Textarea placeholder="Brief summary of your background..." className="min-h-[120px]" value={formData.userExperience} onChange={(e) => setFormData({...formData, userExperience: e.target.value})} />
              </div>

              <Button className="w-full py-6 font-bold" onClick={runAnalysis} disabled={loading}>
                {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />} 
                {loading ? "Analyzing..." : "Discover Paths"}
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            {!result && !loading && (
              <div className="h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-20 text-muted-foreground bg-muted/5">
                <Target className="h-12 w-12 opacity-20 mb-4" />
                <p>Results will appear here</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-accent" />
                <p>Analyzing matching roles...</p>
              </div>
            )}

            {result && result.recommendedRoles.map((role, i) => (
              <Card key={i} className="hover:border-accent/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-primary">{role.role}</h3>
                      <p className="text-sm text-muted-foreground">{role.reasoning}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => router.push(`/roadmap?goal=${encodeURIComponent(role.role)}`)}
                      >
                        <Map className="mr-2 h-4 w-4" /> Generate Roadmap
                      </Button>
                    </div>
                    <Badge className="text-lg py-1 px-3 bg-accent/10 text-accent border-none">{role.matchScore}%</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
