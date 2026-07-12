"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Receipt, Calendar, CreditCard, Banknote, Search, Download, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { fetchApi } from '@/lib/api-client';


export default function PaymentsPage() {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayments = async () => {
    try {
      const token = await getToken();
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/payments/default`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p: any) => {
    const fromName = `${p.sender.firstName} ${p.sender.lastName}`.toLowerCase();
    const toName = `${p.receiver.firstName} ${p.receiver.lastName}`.toLowerCase();
    return fromName.includes(searchTerm.toLowerCase()) || toName.includes(searchTerm.toLowerCase());
  });

  const getMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'VENMO':
      case 'PAYPAL':
      case 'STRIPE':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Banknote className="w-5 h-5" />;
    }
  };

  // Calculate monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySettled = payments
    .filter(p => {
      const d = new Date(p.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments Ledger</h1>
          <p className="text-muted-foreground mt-1">A complete history of all settlements and transactions.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-1 bg-primary/10 border-primary/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary/80 font-medium">Settled This Month</CardDescription>
            <CardTitle className="text-3xl text-primary">${monthlySettled.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="col-span-1 md:col-span-2 backdrop-blur-md bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-muted-foreground mb-4">
              <Calendar className="w-5 h-5" />
              <span>Monthly Closing Analytics</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 w-[60%] h-full" title="60% Settled"></div>
              <div className="bg-amber-500 w-[40%] h-full" title="40% Pending"></div>
            </div>
            <div className="flex justify-between text-sm mt-2 text-muted-foreground">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Settled</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Unsettled Debts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-md bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
          <CardTitle>Transaction History</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search people..." 
              className="pl-8 bg-white/5 border-white/10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading history...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No payments found.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredPayments.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-full text-muted-foreground">
                      {getMethodIcon(payment.method)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{payment.sender.firstName}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">{payment.receiver.firstName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                        <span className="uppercase text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded ml-2">
                          {payment.method || 'CASH'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">${Number(payment.amount).toFixed(2)}</span>
                    <div className="text-xs text-emerald-500 flex items-center justify-end gap-1 mt-1">
                      <Check className="w-3 h-3" /> Completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
