"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { Check, CreditCard, Zap, Crown, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Free",
    icon: <Check className="w-5 h-5 text-emerald-500" />,
    price: "$0",
    description: "Perfect for a single apartment with basic needs.",
    features: ["Up to 4 roommates", "Basic expense tracking", "Equal & percentage splits", "Standard chores list"],
    tier: "FREE"
  },
  {
    name: "Pro",
    icon: <Zap className="w-5 h-5 text-blue-500" />,
    price: "$4.99",
    period: "/mo",
    description: "Advanced tracking for active households.",
    features: ["Up to 8 roommates", "Advanced analytics & charts", "Custom splitting rules", "Receipt scanning (OCR)", "AI Financial Assistant"],
    tier: "PRO",
    popular: true
  },
  {
    name: "Premium",
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    price: "$9.99",
    period: "/mo",
    description: "The ultimate shared living experience.",
    features: ["Unlimited roommates", "Priority AI processing", "Multiple apartment management", "Automated debt settlement", "24/7 Priority Support"],
    tier: "PREMIUM"
  }
];

export default function BillingPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSubscription(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, [getToken]);

  const handleCheckout = async (tier: string) => {
    setActionLoading(tier);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleManagePortal = async () => {
    setActionLoading('portal');
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/portal`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentTier = subscription?.tier || "FREE";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-6xl mx-auto pb-10"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
          <p className="text-muted-foreground mt-1">Manage your plan and billing details.</p>
        </div>
        {subscription?.stripeCustomerId && (
          <Button variant="outline" onClick={handleManagePortal} disabled={actionLoading === 'portal'} className="gap-2 border-white/20 bg-white/5 hover:bg-white/10">
            {actionLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Manage Billing
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isActive = currentTier === plan.tier;
          
          return (
            <Card 
              key={plan.name} 
              className={`relative bg-white/5 border-white/10 backdrop-blur-md overflow-hidden ${
                plan.popular ? 'border-primary/50 shadow-[0_0_30px_rgba(37,99,235,0.1)]' : ''
              } ${isActive ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}
              <CardHeader>
                <div className="mb-2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isActive ? (
                  <Button className="w-full bg-white/10 text-white hover:bg-white/20" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    onClick={() => handleCheckout(plan.tier)}
                    disabled={!!actionLoading || plan.tier === 'FREE'}
                  >
                    {actionLoading === plan.tier ? <Loader2 className="w-4 h-4 animate-spin" /> : (plan.tier === 'FREE' ? 'Included' : `Upgrade to ${plan.name}`)}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
