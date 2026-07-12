"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { DollarSign, Activity, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show"
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your apartment.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">+$124.50</div>
              <p className="text-xs text-muted-foreground">You are owed in total</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,294.00</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Chores</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Roommates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">In your apartment</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={itemVariants} className="col-span-4">
          <Card className="h-full min-h-[300px]">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>
                You have 4 expenses logged this week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, title: "Groceries at Whole Foods", category: "Food", amount: 145.20, date: "Today", paidBy: "You" },
                  { id: 2, title: "Internet Bill - July", category: "Utilities", amount: 89.99, date: "Yesterday", paidBy: "Alex" },
                  { id: 3, title: "Apartment Cleaning Supplies", category: "Household", amount: 34.50, date: "Jul 9", paidBy: "Sarah" },
                  { id: 4, title: "Uber from Airport", category: "Transport", amount: 42.00, date: "Jul 8", paidBy: "You" },
                ].map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {expense.category[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{expense.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Paid by {expense.paidBy} • {expense.date}</p>
                      </div>
                    </div>
                    <div className="font-semibold text-sm">
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-3">
          <Card className="h-full min-h-[300px]">
            <CardHeader>
              <CardTitle>Who Owes Who</CardTitle>
              <CardDescription>
                Settlement summary for the current month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-semibold text-xs">
                      AL
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-500">Alex owes you</p>
                      <p className="text-xs text-emerald-500/70">For Groceries</p>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-500">+$45.00</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-destructive/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-semibold text-xs">
                      SA
                    </div>
                    <div>
                      <p className="text-sm font-medium text-destructive">You owe Sarah</p>
                      <p className="text-xs text-destructive/70">For Internet Bill</p>
                    </div>
                  </div>
                  <div className="font-bold text-destructive">-$30.00</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-semibold text-xs">
                      MI
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-500">Mike owes you</p>
                      <p className="text-xs text-emerald-500/70">For Transport</p>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-500">+$14.00</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
