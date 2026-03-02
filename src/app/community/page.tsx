"use client"

import Navigation from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Map, ThumbsUp, Star, Users, ArrowUpRight, TrendingUp } from "lucide-react"

export default function CommunityPage() {
  const roadmaps = [
    { title: "Senior DevOps Engineer", author: "jason_cloud", upvotes: 1240, rating: 4.8, length: "12 Months", tags: ["Cloud", "DevOps", "Intermediate"] },
    { title: "Fullstack Web3 Developer", author: "eth_wizard", upvotes: 856, rating: 4.5, length: "8 Months", tags: ["Solidity", "React", "Advanced"] },
    { title: "AI/ML Product Manager", author: "sarah_pms", upvotes: 2100, rating: 4.9, length: "6 Months", tags: ["Product", "AI", "Business"] },
    { title: "Cybersecurity Analyst", author: "hack_shield", upvotes: 540, rating: 4.2, length: "10 Months", tags: ["Security", "Network", "Junior"] },
    { title: "Data Scientist Pathway", author: "data_guru", upvotes: 1890, rating: 4.7, length: "14 Months", tags: ["Python", "Stats", "Advanced"] },
    { title: "UX/UI Designer Guide", author: "design_queen", upvotes: 3200, rating: 5.0, length: "4 Months", tags: ["Design", "Figma", "Creative"] },
  ]

  return (
    <div className="flex-1 flex flex-col bg-background/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-4">
            <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none px-4 py-1">Community Insights</Badge>
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">Community Roadmaps</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">Browse, validate, and learn from pathways generated and battle-tested by thousands of professionals.</p>
          </div>
          <div className="flex-shrink-0">
             <Button className="bg-primary text-primary-foreground font-bold px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-transform">
               Share Your Roadmap
             </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input className="pl-10 bg-white h-12 rounded-xl border-none shadow-sm" placeholder="Search roles, skills..." />
            </div>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <CategoryItem label="Software Engineering" count={120} active />
                <CategoryItem label="Data & AI" count={85} />
                <CategoryItem label="Design & Creative" count={64} />
                <CategoryItem label="Business & Product" count={42} />
                <CategoryItem label="Marketing" count={18} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-accent text-accent-foreground">
              <CardContent className="p-6 text-center space-y-4">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <h3 className="font-headline font-bold text-xl">Top Validated Paths</h3>
                <p className="text-sm opacity-80 leading-relaxed">Pathways with 500+ upvotes are verified for high industry relevance.</p>
              </CardContent>
            </Card>
          </aside>

          {/* Roadmaps Grid */}
          <div className="lg:w-3/4">
            <div className="grid md:grid-cols-2 gap-6">
              {roadmaps.map((roadmap, idx) => (
                <Card key={idx} className="group border-none shadow-sm hover:shadow-xl transition-all bg-white overflow-hidden flex flex-col">
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-accent/10 transition-colors">
                        <Map className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{roadmap.upvotes.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{roadmap.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">by <span className="text-primary font-medium">@{roadmap.author}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {roadmap.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] bg-muted/50 border-none">{tag}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium pt-2 border-t text-muted-foreground">
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="h-3.5 w-3.5 fill-accent" />
                        <span>{roadmap.rating}</span>
                      </div>
                      <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                      <span>{roadmap.length}</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-muted/50 font-bold text-sm text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2">
                    View Pathway <ArrowUpRight className="h-4 w-4" />
                  </button>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" className="px-12 py-6 rounded-2xl border-primary/10 text-primary font-bold shadow-sm">
                Load More Roadmaps
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function CategoryItem({ label, count, active }: { label: string, count: number, active?: boolean }) {
  return (
    <button className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary/5 text-primary' : 'hover:bg-muted text-muted-foreground'}`}>
      <span>{label}</span>
      <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">{count}</span>
    </button>
  )
}