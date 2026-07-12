"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, DollarSign, Calendar as CalendarIcon, Repeat } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function NewBillPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bills" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Bill</h1>
          <p className="text-muted-foreground mt-1">Log a recurring subscription or one-time bill.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
          <CardDescription>What's this bill for?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bill Name</label>
            <Input 
              placeholder="e.g. Internet, Rent, Electricity..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
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
            <label className="text-sm font-medium">Due Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="date"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recurrence</CardTitle>
          <CardDescription>Does this bill repeat?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={!isRecurring ? "default" : "outline"} 
              className="w-full flex-col h-auto py-4 gap-2"
              onClick={() => setIsRecurring(false)}
            >
              <CalendarIcon className="w-6 h-6" />
              <span>One Time</span>
            </Button>
            <Button 
              variant={isRecurring ? "default" : "outline"} 
              className="w-full flex-col h-auto py-4 gap-2"
              onClick={() => setIsRecurring(true)}
            >
              <Repeat className="w-6 h-6" />
              <span>Recurring</span>
            </Button>
          </div>

          {isRecurring && (
            <div className="pt-4 border-t space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg">Save Bill</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
