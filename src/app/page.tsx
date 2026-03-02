import Link from "next/link"
import Image from "next/image"
import Navigation from "@/components/Navigation"
import { ArrowRight, Compass, Target, Map, Award, Users, CheckCircle, FileText } from "lucide-react"
import { PlaceHolderImages } from "./lib/placeholder-images"

export default function LandingPage() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-image')

  return (
    <div className="flex-1 flex flex-col overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-primary border border-accent/20 font-medium text-sm animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              AI-Powered Career Intelligence
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-headline font-bold text-primary leading-tight">
              Navigate Your Professional Path with <span className="text-accent italic">Precision</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              CareerPilot uses advanced machine learning to analyze your skills, identify gaps, and generate actionable roadmaps to your dream career.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/analysis" 
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl"
              >
                Analyze My Career Fit <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/community" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-primary border border-primary/10 font-bold rounded-full text-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                Explore Roadmaps
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background visual element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-transparent via-accent/5 to-transparent -z-10 blur-3xl opacity-30"></div>
      </section>

      {/* Hero Image */}
      <section className="container mx-auto px-4 -mt-10 mb-20">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          <Image 
            src={heroImg?.imageUrl || "https://picsum.photos/seed/career/1200/600"} 
            alt={heroImg?.description || "Career Path"} 
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
            data-ai-hint={heroImg?.imageHint || "career technology"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-headline text-primary">Comprehensive Career Toolkit</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for modern professionals who want more than just job listings.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Target className="h-8 w-8 text-accent" />}
              title="Career Fit Scoring"
              description="Get a 0-100% score for target roles based on your current skills and experience."
            />
            <FeatureCard 
              icon={<Map className="h-8 w-8 text-accent" />}
              title="Dynamic Roadmaps"
              description="Personalized month-by-month execution plans that adapt to your learning speed."
            />
            <FeatureCard 
              icon={<Award className="h-8 w-8 text-accent" />}
              title="Skill Gap Analysis"
              description="Identify exactly what you're missing and get curated resources to bridge the gap."
            />
            <FeatureCard 
              icon={<FileText className="h-8 w-8 text-accent" />}
              title="AI Resume Builder"
              description="Automatically optimize your resume for specific job descriptions with AI."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-accent" />}
              title="Community Validated"
              description="Upvote and rate effective roadmaps shared by high-performers in your field."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-8 w-8 text-accent" />}
              title="Progress Tracking"
              description="Manage your career journey with integrated task management and milestones."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-headline">Ready to start your journey?</h2>
            <p className="text-primary-foreground/80 text-lg">Join thousands of professionals using CareerPilot to navigate their next big career move.</p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-bold rounded-full text-xl hover:scale-105 transition-transform shadow-lg"
            >
              Get Started for Free <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-headline font-bold text-lg">CareerPilot</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 CareerPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border bg-white hover:border-accent hover:shadow-xl transition-all group">
      <div className="mb-6 p-3 bg-muted rounded-xl w-fit group-hover:bg-accent/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-primary">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
