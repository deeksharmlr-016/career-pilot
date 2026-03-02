"use client"

import { useState } from "react"
import Navigation from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Wand2, Loader2, Layout, Copy, Check, Plus, Trash2, GraduationCap, Briefcase, Code, User, Printer } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

// Internal types to maintain compatibility without AI imports
type ResumeOutput = {
  optimizedResumeContent: string
  portfolioSuggestions: string
}

export default function ResumeBuilderPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResumeOutput | null>(null)
  const [copied, setCopied] = useState(false)

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    summary: "",
    education: [{ degree: "", institution: "", year: "", gpa: "" }],
    experience: [{ title: "", company: "", duration: "", details: "" }],
    projects: [{ title: "", description: "", technologies: "" }],
    technicalSkills: "",
    softSkills: "",
    certifications: "",
    achievements: "",
  })

  const [jobContext, setJobContext] = useState({
    jobDescription: "",
    targetPost: "",
    oldResumeContent: ""
  })

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Template-based Resume Generation Logic
  const generateResumeFromTemplate = (p: typeof profile, j: typeof jobContext): ResumeOutput => {
    let content = `# ${p.fullName || 'Professional Name'}\n`
    content += `${p.email || ''} ${p.email && p.phone ? '|' : ''} ${p.phone || ''}\n`
    content += `${p.linkedin || ''} ${p.linkedin && p.portfolio ? '|' : ''} ${p.portfolio || ''}\n\n`

    if (p.summary) {
      content += `## PROFESSIONAL SUMMARY\n${p.summary}\n\n`
    }

    const validSkills = [
      p.technicalSkills ? `**Technical:** ${p.technicalSkills}` : null,
      p.softSkills ? `**Soft:** ${p.softSkills}` : null
    ].filter(Boolean)

    if (validSkills.length > 0) {
      content += `## SKILLS\n${validSkills.join('\n')}\n\n`
    }

    const validExp = p.experience.filter(e => e.title || e.company)
    if (validExp.length > 0) {
      content += `## WORK EXPERIENCE\n`
      validExp.forEach(e => {
        content += `### ${e.title} | ${e.company}\n`
        content += `*${e.duration}*\n`
        content += `${e.details}\n\n`
      })
    }

    const validEdu = p.education.filter(e => e.degree || e.institution)
    if (validEdu.length > 0) {
      content += `## EDUCATION\n`
      validEdu.forEach(e => {
        content += `### ${e.degree}\n`
        content += `${e.institution} | ${e.year}\n`
        if (e.gpa) content += `Grade: ${e.gpa}\n`
        content += `\n`
      })
    }

    const validProj = p.projects.filter(e => e.title)
    if (validProj.length > 0) {
      content += `## PROJECTS\n`
      validProj.forEach(e => {
        content += `### ${e.title}\n`
        content += `${e.description}\n`
        if (e.technologies) content += `**Technologies:** ${e.technologies}\n`
        content += `\n`
      })
    }

    if (p.certifications) {
      content += `## CERTIFICATIONS\n${p.certifications}\n\n`
    }

    if (p.achievements) {
      content += `## ACHIEVEMENTS\n${p.achievements}\n\n`
    }

    // Static but high-quality portfolio strategy
    const suggestions = `### Strategic Recommendations for ${j.targetPost || 'Target Role'}

1. **Highlight Core Proficiencies**: Ensure your "${p.technicalSkills ? 'top technical skills' : 'key strengths'}" are prominently featured in the top third of your resume.
2. **Quantify Achievements**: In your work experience, focus on results (e.g., "Increased efficiency by 20%") rather than just tasks.
3. **Project Relevance**: Your projects section should specifically demonstrate skills requested in the job description: "${j.jobDescription.substring(0, 100)}..."
4. **Keyword Alignment**: Use standard industry terminology to pass ATS filters effectively.`

    return {
      optimizedResumeContent: content,
      portfolioSuggestions: suggestions
    }
  }

  const handleOptimize = async () => {
    setLoading(true)
    // Artificial delay for UX feel, though generation is instant
    setTimeout(() => {
      try {
        const output = generateResumeFromTemplate(profile, jobContext)
        setResult(output)
        toast({ title: "Resume Generated!", description: "Your professional application is ready." })
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e: any) {
        console.error(e)
        toast({ 
          variant: "destructive", 
          title: "Generation Failed", 
          description: "Something went wrong while formatting your resume." 
        })
      } finally {
        setLoading(false)
      }
    }, 800)
  }

  const updateArrayField = (field: string, index: number, key: string, value: string) => {
    const newArr = [...(profile as any)[field]]
    newArr[index][key] = value
    setProfile({ ...profile, [field]: newArr })
  }

  const addArrayField = (field: string, defaultValue: any) => {
    setProfile({ ...profile, [field]: [...(profile as any)[field], defaultValue] })
  }

  const removeArrayField = (field: string, index: number) => {
    const newArr = [...(profile as any)[field]]
    newArr.splice(index, 1)
    setProfile({ ...profile, [field]: newArr })
  }

  return (
    <div className="flex-1 flex flex-col bg-background/30 pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <FileText className="text-accent h-10 w-10" /> Professional Resume Architect
          </h1>
          <p className="text-muted-foreground mt-2">Generate a battle-tested, professionally formatted resume for your next target role.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <Card className="shadow-lg border-none overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5" /> Resume Details
                </CardTitle>
                <CardDescription className="text-primary-foreground/70">Complete your profile to generate your professional resume.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="w-full flex justify-start gap-1 bg-muted p-1 h-auto flex-wrap rounded-none border-b">
                    <TabsTrigger value="personal" className="text-xs font-bold px-4 py-2">Personal</TabsTrigger>
                    <TabsTrigger value="experience" className="text-xs font-bold px-4 py-2">Experience</TabsTrigger>
                    <TabsTrigger value="education" className="text-xs font-bold px-4 py-2">Education</TabsTrigger>
                    <TabsTrigger value="projects" className="text-xs font-bold px-4 py-2">Projects</TabsTrigger>
                    <TabsTrigger value="skills" className="text-xs font-bold px-4 py-2">Skills</TabsTrigger>
                    <TabsTrigger value="target" className="text-xs font-bold px-4 py-2 bg-accent/10">Target Job</TabsTrigger>
                  </TabsList>

                  <div className="p-6">
                    <TabsContent value="personal" className="space-y-4 mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} placeholder="john@example.com" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="+1 234 567 890" />
                        </div>
                        <div className="space-y-2">
                          <Label>LinkedIn</Label>
                          <Input value={profile.linkedin} onChange={(e) => setProfile({...profile, linkedin: e.target.value})} placeholder="linkedin.com/in/johndoe" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Portfolio / Website</Label>
                        <Input value={profile.portfolio} onChange={(e) => setProfile({...profile, portfolio: e.target.value})} placeholder="johndoe.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Professional Summary</Label>
                        <Textarea value={profile.summary} onChange={(e) => setProfile({...profile, summary: e.target.value})} placeholder="Brief objective or career summary..." className="min-h-[120px]" />
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4 text-accent" /> Work Experience</h3>
                        {profile.experience.map((exp, idx) => (
                          <div key={idx} className="p-5 border-2 rounded-xl space-y-4 relative group bg-muted/5">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayField('experience', idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            <div className="space-y-2">
                              <Label>Job Title</Label>
                              <Input value={exp.title} onChange={(e) => updateArrayField('experience', idx, 'title', e.target.value)} placeholder="Senior Software Engineer" />
                            </div>
                            <div className="space-y-2">
                              <Label>Company</Label>
                              <Input value={exp.company} onChange={(e) => updateArrayField('experience', idx, 'company', e.target.value)} placeholder="Tech Solutions Inc." />
                            </div>
                            <div className="space-y-2">
                              <Label>Duration</Label>
                              <Input value={exp.duration} onChange={(e) => updateArrayField('experience', idx, 'duration', e.target.value)} placeholder="Jan 2021 - Present" />
                            </div>
                            <div className="space-y-2">
                              <Label>Details</Label>
                              <Textarea value={exp.details} onChange={(e) => updateArrayField('experience', idx, 'details', e.target.value)} placeholder="Key responsibilities and achievements..." className="min-h-[100px]" />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full py-6 border-dashed border-2" onClick={() => addArrayField('experience', { title: "", company: "", duration: "", details: "" })}><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-accent" /> Education</h3>
                        {profile.education.map((edu, idx) => (
                          <div key={idx} className="p-5 border-2 rounded-xl space-y-4 relative group bg-muted/5">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayField('education', idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            <div className="space-y-2">
                              <Label>Degree</Label>
                              <Input value={edu.degree} onChange={(e) => updateArrayField('education', idx, 'degree', e.target.value)} placeholder="B.S. in Computer Science" />
                            </div>
                            <div className="space-y-2">
                              <Label>Institution</Label>
                              <Input value={edu.institution} onChange={(e) => updateArrayField('education', idx, 'institution', e.target.value)} placeholder="University of Technology" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Year</Label>
                                <Input value={edu.year} onChange={(e) => updateArrayField('education', idx, 'year', e.target.value)} placeholder="2016 - 2020" />
                              </div>
                              <div className="space-y-2">
                                <Label>GPA / Grade %</Label>
                                <Input value={edu.gpa} onChange={(e) => updateArrayField('education', idx, 'gpa', e.target.value)} placeholder="3.8 / 4.0" />
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full py-6 border-dashed border-2" onClick={() => addArrayField('education', { degree: "", institution: "", year: "", gpa: "" })}><Plus className="mr-2 h-4 w-4" /> Add Education</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><Code className="h-4 w-4 text-accent" /> Projects</h3>
                        {profile.projects.map((proj, idx) => (
                          <div key={idx} className="p-5 border-2 rounded-xl space-y-4 relative group bg-muted/5">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayField('projects', idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            <div className="space-y-2">
                              <Label>Project Title</Label>
                              <Input value={proj.title} onChange={(e) => updateArrayField('projects', idx, 'title', e.target.value)} placeholder="E-commerce Platform" />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea value={proj.description} onChange={(e) => updateArrayField('projects', idx, 'description', e.target.value)} placeholder="What did you build and what problem did it solve?" className="min-h-[100px]" />
                            </div>
                            <div className="space-y-2">
                              <Label>Technologies Used</Label>
                              <Input value={proj.technologies} onChange={(e) => updateArrayField('projects', idx, 'technologies', e.target.value)} placeholder="React, Node.js, MongoDB" />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full py-6 border-dashed border-2" onClick={() => addArrayField('projects', { title: "", description: "", technologies: "" })}><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-6 mt-0">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Technical Skills</Label>
                          <Textarea value={profile.technicalSkills} onChange={(e) => setProfile({...profile, technicalSkills: e.target.value})} placeholder="TypeScript, Python, AWS, Docker, Git..." className="min-h-[100px]" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Soft Skills</Label>
                          <Textarea value={profile.softSkills} onChange={(e) => setProfile({...profile, softSkills: e.target.value})} placeholder="Project Leadership, Public Speaking, Mentoring..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Certifications</Label>
                          <Textarea value={profile.certifications} onChange={(e) => setProfile({...profile, certifications: e.target.value})} placeholder="AWS Certified Developer, Google Cloud Architect..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Achievements</Label>
                          <Textarea value={profile.achievements} onChange={(e) => setProfile({...profile, achievements: e.target.value})} placeholder="Winner of Hackathon 2024, Employee of the Month..." />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="target" className="space-y-6 mt-0">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Target Job Title</Label>
                          <Input value={jobContext.targetPost} onChange={(e) => setJobContext({...jobContext, targetPost: e.target.value})} placeholder="e.g. Lead Product Designer" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-accent">Full Job Description</Label>
                          <Textarea value={jobContext.jobDescription} onChange={(e) => setJobContext({...jobContext, jobDescription: e.target.value})} className="min-h-[250px] border-accent/30" placeholder="Paste the complete job description from the posting..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Optional: Old Resume Text</Label>
                          <Textarea value={jobContext.oldResumeContent} onChange={(e) => setJobContext({...jobContext, oldResumeContent: e.target.value})} className="min-h-[150px]" placeholder="If you have an existing resume, paste its content here..." />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <div className="p-6 border-t bg-muted/10">
                <Button 
                  className="w-full bg-accent text-accent-foreground font-bold py-8 text-xl shadow-xl hover:scale-[1.01] transition-all"
                  onClick={handleOptimize}
                  disabled={loading}
                >
                  {loading ? <><Loader2 className="animate-spin mr-3 h-6 w-6" /> Building Resume...</> : <><Wand2 className="mr-3 h-6 w-6" /> Generate Professional Resume</>}
                </Button>
              </div>
            </Card>
          </div>

          <div className="sticky top-24">
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center p-20 text-center bg-white/40 rounded-3xl border-4 border-dashed border-muted/50 shadow-inner">
                <Wand2 className="h-32 w-32 text-muted-foreground opacity-10 mb-8" />
                <h3 className="text-3xl font-bold text-primary">Professional Output</h3>
                <p className="text-muted-foreground max-w-sm mt-4 text-lg">
                  Complete your details to generate an industry-standard resume formatted for top corporate applications.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center p-20 space-y-8 text-center bg-white/90 rounded-3xl shadow-2xl border animate-pulse">
                <div className="relative">
                  <div className="h-32 w-32 border-8 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">Architecting Document...</h3>
                  <p className="text-muted-foreground text-lg">Formatting data to ATS-friendly standards.</p>
                </div>
              </div>
            )}

            {result && (
              <Tabs defaultValue="resume" className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-16 p-1.5 bg-white border-2 shadow-sm rounded-2xl">
                  <TabsTrigger value="resume" className="rounded-xl font-bold flex items-center justify-center gap-2 text-base">
                    <FileText className="h-5 w-5" /> Standard Resume
                  </TabsTrigger>
                  <TabsTrigger value="portfolio" className="rounded-xl font-bold flex items-center justify-center gap-2 text-base">
                    <Layout className="h-5 w-5" /> Application Strategy
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="resume" className="mt-0">
                  <Card className="border-accent/30 shadow-2xl overflow-hidden bg-white rounded-3xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 py-5 px-8">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">Formatted Resume</CardTitle>
                        <CardDescription className="text-sm italic">Clean, hierarchical corporate layout.</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="font-bold border-2" onClick={() => handleCopy(result.optimizedResumeContent)}>
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          <span className="ml-2 hidden sm:inline">{copied ? "Copied" : "Copy Content"}</span>
                        </Button>
                        <Button variant="secondary" size="sm" className="font-bold bg-primary text-primary-foreground" onClick={() => window.print()}>
                          <Printer className="h-4 w-4" />
                          <span className="ml-2 hidden sm:inline">Print / PDF</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 bg-muted/5">
                      <div className="max-w-[800px] mx-auto my-8 bg-white shadow-xl border p-12 min-h-[1100px] prose prose-sm max-w-none prose-headings:font-headline prose-headings:text-primary prose-headings:mb-2 prose-h1:text-4xl prose-h1:border-b-2 prose-h1:pb-4 prose-h2:text-xl prose-h2:uppercase prose-h2:tracking-wider prose-h2:bg-muted/30 prose-h2:px-2 prose-h2:py-1 prose-h3:text-lg prose-h3:mt-4 prose-p:my-1 prose-ul:my-2 prose-li:my-0.5 whitespace-pre-line text-black font-body print:shadow-none print:border-none print:p-0 print:my-0">
                        {result.optimizedResumeContent}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="portfolio" className="mt-0">
                  <Card className="border-accent/30 shadow-2xl overflow-hidden bg-white rounded-3xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 py-5 px-8">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">Strategic Advice</CardTitle>
                        <CardDescription className="text-sm italic">Optimizing for the target role.</CardDescription>
                      </div>
                      <Button variant="outline" className="font-bold border-2" onClick={() => handleCopy(result.portfolioSuggestions)}>
                        <Copy className="h-5 w-5" />
                        <span className="ml-2">Copy Advice</span>
                      </Button>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="prose prose-blue max-w-none whitespace-pre-wrap leading-relaxed text-primary/90 text-lg">
                        {result.portfolioSuggestions}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
