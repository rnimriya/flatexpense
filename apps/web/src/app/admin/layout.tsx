export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center bg-fixed text-white font-sans selection:bg-primary/30">
      <div className="min-h-screen bg-black/60 backdrop-blur-md">
        <header className="h-16 border-b border-white/10 flex items-center px-6 bg-black/40">
          <h1 className="text-xl font-bold tracking-tight text-primary">SplitNest Admin</h1>
        </header>
        <main className="p-6 overflow-auto h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
