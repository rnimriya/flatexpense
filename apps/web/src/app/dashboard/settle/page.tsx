"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Wallet, AlertCircle, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SettleContent() {
  const searchParams = useSearchParams();
  const defaultTo = searchParams.get('to') || "Alex";
  const defaultAmount = searchParams.get('amount') || "45.20";

  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripeCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      window.location.href = `https://checkout.stripe.com/pay/cs_test_mock_${Date.now()}`;
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard/balances" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settle Up</h1>
          <p className="text-muted-foreground mt-1">Pay your roommates instantly via Stripe.</p>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Confirm the amount you wish to pay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-background rounded-full border shadow-sm">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paying</p>
                <p className="font-semibold text-lg">{defaultTo}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-xl font-medium text-muted-foreground">$</span>
              <Input 
                type="number"
                className="pl-8 text-2xl h-16 font-semibold"
                defaultValue={defaultAmount}
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              This will settle your current outstanding balance with {defaultTo}.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button 
            className="w-full h-14 text-lg font-medium" 
            size="lg"
            onClick={handleStripeCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay with Stripe
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Payments are securely processed by Stripe.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default function SettlePage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SettleContent />
    </Suspense>
  );
}
