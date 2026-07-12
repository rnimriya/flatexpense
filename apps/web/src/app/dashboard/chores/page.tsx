"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, 
  Calendar, 
  Trophy, 
  Plus, 
  MoreVertical, 
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useUser } from "@clerk/nextjs";

export default function ChoresPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [chores, setChores] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Chore Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const token = await getToken();
      
      const [choresRes, leaderRes, roomRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/chores/default`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/chores/leaderboard/default`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/roommates/default`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [cData, lData, rData] = await Promise.all([
        choresRes.json(), leaderRes.json(), roomRes.json()
      ]);

      setChores(cData);
      setLeaderboard(lData);
      setRoommates(rData);
      if (rData.length > 0 && !newAssignee) {
        setNewAssignee(rData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getToken]);

  const handleToggleComplete = async (chore: any) => {
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chores/${chore.id}/complete`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isCompleted: !chore.isCompleted })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this chore?")) return;
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chores/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChore = async () => {
    if (!newTitle || !newAssignee || !newDueDate) return;
    setIsSubmitting(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          apartmentId: "default",
          title: newTitle,
          assigneeId: newAssignee,
          dueDate: new Date(newDueDate).toISOString()
        })
      });
      setShowModal(false);
      setNewTitle("");
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingChores = chores.filter(c => !c.isCompleted);
  const completedChores = chores.filter(c => c.isCompleted);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chore Management</h1>
          <p className="text-muted-foreground mt-1">Keep the apartment clean and see who does the most.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Chore
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" /> Pending Chores
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pendingChores.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">All caught up! 🎉</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {pendingChores.map(chore => (
                      <div key={chore.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleToggleComplete(chore)}>
                          <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          <div>
                            <p className="font-medium">{chore.title}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> 
                                Due: {new Date(chore.dueDate).toLocaleDateString()}
                              </span>
                              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                {chore.assignee.firstName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(chore.id)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md opacity-70">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5" /> Completed Recently
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {completedChores.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No completed chores yet.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {completedChores.slice(0, 5).map(chore => (
                      <div key={chore.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4 flex-1 opacity-60">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          <div>
                            <p className="font-medium line-through">{chore.title}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              Completed by {chore.assignee.firstName}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleToggleComplete(chore)}>
                          Undo
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md sticky top-24">
              <CardHeader className="text-center pb-2 border-b border-white/5">
                <div className="mx-auto bg-amber-500/20 p-3 rounded-full w-fit mb-2">
                  <Trophy className="w-8 h-8 text-amber-500" />
                </div>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Most chores completed this month</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <div className="divide-y divide-white/5">
                  {leaderboard.map((leader, idx) => (
                    <div key={leader.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-6 text-center ${idx === 0 ? 'text-amber-500 text-lg' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{leader.user.firstName}</p>
                          <p className="text-xs text-muted-foreground">Level {Math.floor(leader.count / 5) + 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-primary">{leader.count}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Chores</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* Add Chore Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-[1.5rem] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">New Chore</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chore Name</label>
                    <Input 
                      placeholder="e.g. Take out the trash" 
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign To</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      value={newAssignee}
                      onChange={e => setNewAssignee(e.target.value)}
                    >
                      {roommates.map(r => (
                        <option key={r.id} value={r.id} className="bg-background text-foreground">
                          {r.firstName} {r.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input 
                      type="date"
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg" 
                  onClick={handleCreateChore}
                  disabled={isSubmitting || !newTitle || !newDueDate}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign Chore"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
