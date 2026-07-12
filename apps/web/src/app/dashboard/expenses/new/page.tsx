"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Split, Percent, DollarSign, Camera, ScanLine, CheckCircle2, Tags, Repeat } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { fetchApi } from '@/lib/api-client';


export default function NewExpensePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [splitType, setSplitType] = useState<"EQUAL" | "PERCENTAGE" | "EXACT">("EQUAL");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoommates = async () => {
      try {
        const token = await getToken();
        const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/expenses/roommates/default`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setRoommates(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoommates();
  }, [getToken]);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTitle("Target Groceries");
      setAmount("145.20");
      setTags("Groceries, Household");
    }, 2000);
  };

  const handleSplitValueChange = (userId: string, val: string) => {
    setSplitValues(prev => ({ ...prev, [userId]: val }));
  };

  const handleSave = async () => {
    if (!title || !amount || roommates.length === 0) return;
    setIsSubmitting(true);
    
    // We will assume the current user is the first roommate for demo purposes
    const currentUser = roommates[0];
    const totalAmount = parseFloat(amount);
    
    const splits = roommates.map(r => {
      let splitAmount = 0;
      let percentage = null;
      if (splitType === "EQUAL") {
        splitAmount = totalAmount / roommates.length;
      } else if (splitType === "PERCENTAGE") {
        percentage = parseFloat(splitValues[r.id] || "0");
        splitAmount = (totalAmount * percentage) / 100;
      } else if (splitType === "EXACT") {
        splitAmount = parseFloat(splitValues[r.id] || "0");
      }
      
      return {
        userId: r.id,
        amount: splitAmount,
        percentage
      };
    });

    try {
      const token = await getToken();
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          apartmentId: "default",
          payerId: currentUser.id,
          title,
          amount: totalAmount,
          date: new Date().toISOString(),
          splitType,
          splits,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isRecurring
        })
      });

      if (res.ok) {
        router.push("/dashboard/expenses");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save expense");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
          <p className="text-muted-foreground mt-1">Log a new expense and split it with your roommates.</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary" />
            AI Receipt Scanner
          </CardTitle>
          <CardDescription>Upload a photo of your receipt and let AI extract the details.</CardDescription>
        </CardHeader>
        <CardContent>
          {!scanSuccess ? (
            <Button 
              variant="outline" 
              className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
              onClick={simulateScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <ScanLine className="w-6 h-6 animate-pulse text-primary" />
                  <span className="animate-pulse">Processing via AI...</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-muted-foreground" />
                  <span>Click to Scan Receipt</span>
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
              <div className="text-sm font-medium">Receipt parsed successfully! Details auto-filled below.</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>What did you pay for?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input 
              placeholder="e.g. Internet Bill, Groceries..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="0.00" 
                  type="number"
                  className="pl-9"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <div className="relative">
                <Tags className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Groceries, Utilities" 
                  className="pl-9"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="recurring" 
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary/50"
            />
            <label htmlFor="recurring" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <Repeat className="w-4 h-4 text-muted-foreground" /> Make this a recurring expense
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Split Options</CardTitle>
          <CardDescription>How would you like to split this cost?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Button 
              variant={splitType === "EQUAL" ? "default" : "outline"} 
              className="w-full flex-col h-auto py-4 gap-2"
              onClick={() => setSplitType("EQUAL")}
            >
              <Split className="w-6 h-6" />
              <span>Equally</span>
            </Button>
            <Button 
              variant={splitType === "PERCENTAGE" ? "default" : "outline"} 
              className="w-full flex-col h-auto py-4 gap-2"
              onClick={() => setSplitType("PERCENTAGE")}
            >
              <Percent className="w-6 h-6" />
              <span>Percentage</span>
            </Button>
            <Button 
              variant={splitType === "EXACT" ? "default" : "outline"} 
              className="w-full flex-col h-auto py-4 gap-2"
              onClick={() => setSplitType("EXACT")}
            >
              <DollarSign className="w-6 h-6" />
              <span>Exact Amounts</span>
            </Button>
          </div>

          <div className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-medium flex justify-between">
              <span>Roommates</span>
              {splitType === "PERCENTAGE" && <span className="text-muted-foreground text-xs font-normal">Income-based % calculation support</span>}
            </h3>
            {roommates.length === 0 && <p className="text-sm text-muted-foreground">Loading roommates...</p>}
            {roommates.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-sm font-medium">{person.firstName} {person.lastName}</span>
                {splitType === "EQUAL" ? (
                  <span className="text-sm font-medium text-emerald-500">
                    ${amount && roommates.length > 0 ? (parseFloat(amount) / roommates.length).toFixed(2) : "0.00"}
                  </span>
                ) : splitType === "PERCENTAGE" ? (
                  <div className="flex items-center gap-2 w-28">
                    <Input 
                      placeholder="0" 
                      className="h-8" 
                      value={splitValues[person.id] || ""}
                      onChange={(e) => handleSplitValueChange(person.id, e.target.value)}
                    />
                    <span className="text-sm">%</span>
                  </div>
                ) : (
                  <div className="relative w-32">
                    <DollarSign className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="0.00" 
                      className="pl-8 h-8"
                      value={splitValues[person.id] || ""}
                      onChange={(e) => handleSplitValueChange(person.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
