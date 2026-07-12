"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Check, UserMinus, Crown, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApartmentSettings() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const fetchApartments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apartments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, [getToken]);

  const activeApartment = apartments[0];

  const handleGenerateInvite = async () => {
    if (!activeApartment) return;
    setInviteLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apartments/${activeApartment.id}/invites`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ email: inviteEmail || "anyone@example.com" })
      });
      const data = await res.json();
      const link = `${window.location.origin}/join/${data.token}`;
      setGeneratedLink(link);
      setInviteEmail("");
    } catch (err) {
      console.error(err);
      alert('Failed to generate invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async (targetUserId: string) => {
    if (!activeApartment) return;
    const isSelf = user?.id === targetUserId;
    if (isSelf && !confirm("Are you sure you want to leave this apartment?")) return;
    if (!isSelf && !confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const token = await getToken();
      // We need the internal DB userId for the target.
      // Wait, the API requires the internal userId.
      // In activeApartment.members, we have member.userId.
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apartments/${activeApartment.id}/members/${targetUserId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (isSelf) {
        window.location.href = '/onboarding';
      } else {
        fetchApartments();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process request');
    }
  };

  const handleTransfer = async (newOwnerId: string) => {
    if (!activeApartment) return;
    if (!confirm("Are you sure you want to transfer ownership to this member? You will become a regular Admin.")) return;
    
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apartments/${activeApartment.id}/transfer-ownership/${newOwnerId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchApartments();
    } catch (err) {
      console.error(err);
      alert('Failed to transfer ownership');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!activeApartment) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        You are not a member of any apartment.
        <Button className="mt-4 block mx-auto" onClick={() => router.push('/onboarding')}>Create or Join</Button>
      </div>
    );
  }

  // Find current user's member record
  const currentMember = activeApartment.members.find((m: any) => m.user.clerkUserId === user?.id);
  const isOwner = currentMember?.role === 'OWNER';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{activeApartment.name}</h2>
        <p className="text-muted-foreground">{activeApartment.description}</p>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Roommates</CardTitle>
          <CardDescription>Manage members of your apartment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden bg-black/20">
            {activeApartment.members.map((member: any) => {
              const isSelf = member.user.clerkUserId === user?.id;
              return (
                <div key={member.id} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {member.user.firstName} {member.user.lastName}
                      {isSelf && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">You</span>}
                      {member.role === 'OWNER' && <Crown className="w-4 h-4 text-amber-500" />}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && !isSelf && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleTransfer(member.userId)}>
                          Make Owner
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleLeave(member.userId)}>
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {isSelf && (
                      <Button variant="destructive" size="sm" onClick={() => handleLeave(member.userId)} disabled={isOwner && activeApartment.members.length > 1}>
                        <LogOut className="w-4 h-4 mr-2" /> Leave
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Invite Roommates</CardTitle>
          <CardDescription>Generate an invite link to add new people to your apartment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Optional: Email address to invite" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-white/5 border-white/10"
            />
            <Button onClick={handleGenerateInvite} disabled={inviteLoading}>
              {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Link"}
            </Button>
          </div>
          
          {generatedLink && (
            <div className="mt-4 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-between">
              <div className="truncate flex-1 mr-4 text-emerald-600 font-mono text-sm">
                {generatedLink}
              </div>
              <Button size="sm" variant="outline" className="shrink-0 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-600" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
