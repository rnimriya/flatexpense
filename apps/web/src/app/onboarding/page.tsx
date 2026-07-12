"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Home, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  
  const [mode, setMode] = useState<"SELECT" | "CREATE" | "JOIN">("SELECT");
  const [apartmentName, setApartmentName] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!apartmentName) return;
    setLoading(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apartments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: apartmentName, description: 'Created via Onboarding' })
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to create apartment');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteToken) return;
    router.push(`/join/${inviteToken}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to SplitNest</h1>
          <p className="text-muted-foreground">Let's get your apartment set up.</p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <CardTitle>{mode === "SELECT" ? "Choose an option" : mode === "CREATE" ? "Create an Apartment" : "Join an Apartment"}</CardTitle>
            <CardDescription>
              {mode === "SELECT" ? "Are you starting a new household or joining an existing one?" : 
               mode === "CREATE" ? "Give your new home a name." : "Enter the invite code from your roommate."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "SELECT" && (
              <div className="grid gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 justify-start p-6 text-left hover:bg-primary/10 hover:border-primary/50 transition-all border-white/10 bg-white/5"
                  onClick={() => setMode("CREATE")}
                >
                  <Home className="w-8 h-8 mr-4 text-primary" />
                  <div>
                    <div className="font-bold text-lg">Create Apartment</div>
                    <div className="text-sm text-muted-foreground font-normal">I'm the first one here.</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 justify-start p-6 text-left hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all border-white/10 bg-white/5"
                  onClick={() => setMode("JOIN")}
                >
                  <Users className="w-8 h-8 mr-4 text-emerald-500" />
                  <div>
                    <div className="font-bold text-lg">Join with Code</div>
                    <div className="text-sm text-muted-foreground font-normal">My roommates invited me.</div>
                  </div>
                </Button>
              </div>
            )}

            {mode === "CREATE" && (
              <div className="space-y-4">
                <Input 
                  placeholder="e.g. 123 Baker St, or The Batcave" 
                  value={apartmentName}
                  onChange={(e) => setApartmentName(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 text-lg"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setMode("SELECT")}>Back</Button>
                  <Button className="flex-1" onClick={handleCreate} disabled={!apartmentName || loading}>
                    {loading ? "Creating..." : "Create"} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {mode === "JOIN" && (
              <div className="space-y-4">
                <Input 
                  placeholder="Enter invite code (e.g. 8x2p9...)" 
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 text-lg text-center tracking-widest font-mono"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setMode("SELECT")}>Back</Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleJoin} disabled={!inviteToken}>
                    Join <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
