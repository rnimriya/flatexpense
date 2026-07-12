"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Wallet, Check, CreditCard, Banknote, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/nextjs";

export default function BalancesPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settle Up Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDebts = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settlements/default`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDebts(data);
    } catch (err) {
      console.error("Failed to fetch debts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleSettleUp = (debt: any) => {
    setSelectedDebt(debt);
    setShowModal(true);
  };

  const handlePayment = async (method: string) => {
    if (!selectedDebt || !user) return;
    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromUserId: selectedDebt.from.id,
          toUserId: selectedDebt.to.id,
          amount: selectedDebt.amount,
          apartmentId: "default",
          method
        })
      });
      
      setShowModal(false);
      fetchDebts(); // Refresh balances
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVenmoLink = (amount: number, note: string) => {
    return `https://venmo.com/?txn=pay&audience=private&amount=${amount}&note=${encodeURIComponent(note)}`;
  };
  const getPayPalLink = (amount: number) => {
    return `https://paypal.me/mockuser/${amount}`;
  };

  // Calculate totals for current user
  let totalOwed = 0;
  let totalOwe = 0;
  
  if (user) {
    debts.forEach(d => {
      // clerkUserId match check (d.to.clerkUserId or similar depending on the DTO)
      // For now we check if the debt to/from firstName/lastName matches or just by ID if it's the internal ID.
      // Since we don't have internal DB ID on the frontend easily, we compare clerkUserId if returned.
      // Wait, user.id is the clerk ID!
      if (d.to.clerkUserId === user.id) totalOwed += d.amount;
      if (d.from.clerkUserId === user.id) totalOwe += d.amount;
    });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Balances</h1>
        <p className="text-muted-foreground mt-1">See who owes who in your apartment.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-emerald-500/10 border-emerald-500/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-700 dark:text-emerald-400 font-medium">You are owed</CardDescription>
            <CardTitle className="text-3xl text-emerald-600 dark:text-emerald-500">${totalOwed.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-amber-500/10 border-amber-500/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700 dark:text-amber-400 font-medium">You owe</CardDescription>
            <CardTitle className="text-3xl text-amber-600 dark:text-amber-500">${totalOwe.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settlement Summary</CardTitle>
          <CardDescription>We've minimized the number of transactions to settle all debts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground animate-pulse">Calculating settlements...</div>
          ) : debts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">All settled up! 🎉</div>
          ) : (
            debts.map((debt, idx) => {
              const isCurrentUserDebtor = user && debt.from.clerkUserId === user.id;
              const isCurrentUserCreditor = user && debt.to.clerkUserId === user.id;
              
              const fromName = isCurrentUserDebtor ? "You" : debt.from.firstName;
              const toName = isCurrentUserCreditor ? "You" : debt.to.firstName;

              return (
                <div key={idx} className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{fromName}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-lg">{toName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold">${debt.amount.toFixed(2)}</span>
                    {isCurrentUserDebtor && (
                      <Button onClick={() => handleSettleUp(debt)}>Settle Up</Button>
                    )}
                    {isCurrentUserCreditor && (
                      <Button variant="outline">Remind</Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Settle Up Modal */}
      <AnimatePresence>
        {showModal && selectedDebt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-[1.5rem] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Settle Up</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="text-center mb-8">
                  <p className="text-muted-foreground mb-2">You are paying</p>
                  <p className="text-2xl font-bold">{selectedDebt.to.firstName} {selectedDebt.to.lastName}</p>
                  <p className="text-4xl font-black text-primary mt-4">${selectedDebt.amount.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-14 text-lg justify-start gap-4 bg-[#008CFF] hover:bg-[#007BFF] text-white"
                    onClick={() => {
                      window.open(getVenmoLink(selectedDebt.amount, 'SplitNest Settlement'), '_blank');
                      handlePayment('VENMO');
                    }}
                    disabled={isSubmitting}
                  >
                    <div className="bg-white/20 p-1.5 rounded-md"><CreditCard className="w-5 h-5" /></div>
                    Pay via Venmo
                  </Button>
                  <Button 
                    className="w-full h-14 text-lg justify-start gap-4 bg-[#003087] hover:bg-[#001C66] text-white"
                    onClick={() => {
                      window.open(getPayPalLink(selectedDebt.amount), '_blank');
                      handlePayment('PAYPAL');
                    }}
                    disabled={isSubmitting}
                  >
                    <div className="bg-white/20 p-1.5 rounded-md"><CreditCard className="w-5 h-5" /></div>
                    Pay via PayPal
                  </Button>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or manual</span></div>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full h-14 text-lg justify-start gap-4"
                    onClick={() => handlePayment('CASH')}
                    disabled={isSubmitting}
                  >
                    <div className="bg-primary/10 p-1.5 rounded-md text-primary"><Banknote className="w-5 h-5" /></div>
                    Mark as Paid (Cash)
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
