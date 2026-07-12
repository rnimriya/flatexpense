"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Menu, Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeToDemoMode } from "@/lib/api-client";

export function TopNav() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    return subscribeToDemoMode(setIsDemoMode);
  }, []);

  const mockNotifications = [
    { id: 1, text: "Alex assigned you: Take out the trash", time: "2m ago", unread: true },
    { id: 2, text: "Sarah added an expense: Groceries", time: "1h ago", unread: false },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold tracking-tight hidden md:block">Overview</h2>
        
        {isDemoMode && (
          <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-semibold ml-4 shadow-sm animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            Database Offline - Demo Mode Active
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
          )}
        </Button>

        {showNotifications && (
          <div className="absolute top-full right-12 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {mockNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${notif.unread ? 'bg-primary/5' : ''}`}
                >
                  <p className="text-sm">{notif.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <UserButton />
      </div>
    </header>
  );
}
