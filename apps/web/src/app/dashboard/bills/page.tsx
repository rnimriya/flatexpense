"use client";

import { motion } from "framer-motion";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function BillsPage() {
  const bills = [
    { id: 1, title: "Internet (Comcast)", amount: 89.99, dueDate: "2024-03-25", isPaid: false, isRecurring: true },
    { id: 2, title: "Rent", amount: 2400.00, dueDate: "2024-04-01", isPaid: false, isRecurring: true },
    { id: 3, title: "Netflix Shared", amount: 19.99, dueDate: "2024-03-15", isPaid: true, isRecurring: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills & Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage recurring expenses and upcoming due dates.</p>
        </div>
        <Link href="/dashboard/bills/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
          <CardDescription>Don't miss a payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${bill.isPaid ? 'bg-emerald-500/10' : 'bg-primary/10'}`}>
                    <Calendar className={`w-5 h-5 ${bill.isPaid ? 'text-emerald-500' : 'text-primary'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{bill.title}</p>
                      {bill.isRecurring && (
                        <span className="text-[10px] uppercase font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          Recurring
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      Due {bill.dueDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">${bill.amount.toFixed(2)}</p>
                    <p className={`text-xs font-medium ${bill.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {bill.isPaid ? 'Paid' : 'Upcoming'}
                    </p>
                  </div>
                  {!bill.isPaid && (
                    <Button variant="outline" size="sm">Mark Paid</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
