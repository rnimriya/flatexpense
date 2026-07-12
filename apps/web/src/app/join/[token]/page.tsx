"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from '@/lib/api-client';


export default function JoinApartmentPage() {
  const { token } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  
  const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "ERROR">("LOADING");

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const jwt = await getToken();
        if (!jwt) {
          router.push('/sign-in'); // Fallback if not logged in
          return;
        }

        const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/apartments/invites/${token}/accept`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${jwt}` 
          },
        });

        if (!response.ok) {
          throw new Error('Failed to accept invitation');
        }
        
        setStatus("SUCCESS");
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (err) {
        console.error(err);
        setStatus("ERROR");
      }
    };

    if (token) acceptInvite();
  }, [token, getToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-2xl text-center p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Joining Apartment</CardTitle>
            <CardDescription>Please wait while we set up your access.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            {status === "LOADING" && (
              <>
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Verifying invitation...</p>
              </>
            )}
            
            {status === "SUCCESS" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-emerald-500">You're In!</h3>
                <p className="text-muted-foreground mt-2">Redirecting to dashboard...</p>
              </motion.div>
            )}

            {status === "ERROR" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <XCircle className="w-16 h-16 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-destructive">Invalid or Expired Link</h3>
                <p className="text-muted-foreground mt-2 mb-6">This invitation might have been used already, or it has expired.</p>
                <Button onClick={() => router.push('/onboarding')} variant="outline" className="border-white/10">
                  Go to Onboarding
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
