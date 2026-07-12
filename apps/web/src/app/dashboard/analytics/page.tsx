"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Download, 
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { fetchApi } from '@/lib/api-client';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await getToken();
        const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/analytics/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.apartmentId) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
        <p className="text-muted-foreground">It looks like you don't have any expense data yet.</p>
      </div>
    );
  }

  const { currentMonthTotal, previousMonthTotal, categoryBreakdown, dailyTrend, userVsAverage } = data;
  
  const percentageChange = previousMonthTotal === 0 
    ? 100 
    : ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;

  const isPositiveChange = percentageChange > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your apartment's spending habits.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="w-4 h-4" /> This Month
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription>Total Spent (This Month)</CardDescription>
            <CardTitle className="text-4xl text-primary">${currentMonthTotal.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 text-sm ${isPositiveChange ? 'text-rose-500' : 'text-emerald-500'}`}>
              {isPositiveChange ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(percentageChange).toFixed(1)}% {isPositiveChange ? 'more' : 'less'} than last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="w-5 h-5" /> Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground">No category data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle>You vs Average</CardTitle>
            <CardDescription>How your personal spending compares to the apartment average.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[300px] space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground">Your Spending</span>
                <span className="text-2xl font-bold text-primary">${userVsAverage.userSpending.toFixed(2)}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${Math.min(100, (userVsAverage.userSpending / Math.max(userVsAverage.userSpending, userVsAverage.apartmentAverage)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground">Apartment Average</span>
                <span className="text-2xl font-bold text-blue-500">${userVsAverage.apartmentAverage.toFixed(2)}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${Math.min(100, (userVsAverage.apartmentAverage / Math.max(userVsAverage.userSpending, userVsAverage.apartmentAverage)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-center text-muted-foreground">
                You are spending <span className="font-bold text-foreground">
                  {userVsAverage.userSpending > userVsAverage.apartmentAverage ? 'more' : 'less'}
                </span> than the average roommate this month.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
