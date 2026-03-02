'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Chrome } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPage() {
  const { auth } = useAuth();
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return null;

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-2xl">
              <Compass className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-headline font-bold">Welcome to CareerPilot</CardTitle>
            <CardDescription className="text-lg">Sign in to start mapping your future.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-10 pt-4">
          <Button 
            className="w-full py-7 text-lg font-bold flex items-center justify-center gap-3 bg-white text-black border-2 border-muted hover:bg-muted/10 transition-colors"
            onClick={handleGoogleLogin}
          >
            <Chrome className="h-6 w-6" />
            Continue with Google
          </Button>
          <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy. Your data is secured with enterprise-grade encryption.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
