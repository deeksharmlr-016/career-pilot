"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Compass, BarChart2, Map, FileText, Users, Home, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useAuth } from "@/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Analysis", href: "/analysis", icon: BarChart2 },
  { name: "Roadmap", href: "/roadmap", icon: Map },
  { name: "Resume", href: "/resume-builder", icon: FileText },
  { name: "Community", href: "/community", icon: Users },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const { auth } = useAuth()

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut()
      router.push("/")
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-primary rounded-lg group-hover:bg-accent transition-colors">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight">CareerPilot</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 border-2 border-accent/20 hover:border-accent transition-all cursor-pointer">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs uppercase">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/analysis")}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>New Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
