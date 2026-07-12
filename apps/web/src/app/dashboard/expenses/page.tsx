"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Receipt, Filter, Trash2, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { useAuth } from "@clerk/nextjs";
import { fetchApi } from '@/lib/api-client';


export default function ExpensesPage() {
  const { getToken } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const fetchExpenses = async () => {
    try {
      const token = await getToken();
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/expenses/default`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      const token = await getToken();
      await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/expenses/bulk-delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      setSelectedIds(new Set());
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExpenses = expenses.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage and track shared expenses.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} className="animate-in fade-in">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={async () => {
              const token = await getToken();
              const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/expenses/export/default`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'expenses.csv';
              a.click();
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/dashboard/expenses/new" className={buttonVariants({ variant: "default" })}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
          <div>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>A timeline of recent expenses in your apartment.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search expenses..." 
                className="pl-8 bg-background/50 border-white/10" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading expenses...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No expenses found.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredExpenses.map((expense) => {
                const dateObj = new Date(expense.date);
                const isSettled = expense.splits.every((s: any) => s.isSettled);
                return (
                  <div key={expense.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary/50"
                      checked={selectedIds.has(expense.id)}
                      onChange={() => handleSelect(expense.id)}
                    />
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate flex items-center gap-2">
                        {expense.title}
                        {expense.isRecurring && <span className="text-[10px] uppercase bg-secondary/50 px-2 py-0.5 rounded-full text-secondary-foreground">Recurring</span>}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{dateObj.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Paid by {expense.payer?.firstName || 'Unknown'}</span>
                        {expense.tags?.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-primary/80">{expense.tags.join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">${parseFloat(expense.amount).toFixed(2)}</p>
                      <p className={`text-xs font-medium ${isSettled ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {isSettled ? 'Settled' : 'Pending'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
