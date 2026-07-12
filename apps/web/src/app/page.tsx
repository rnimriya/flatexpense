"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Receipt,
  PiggyBank,
  CheckCircle,
  CalendarCheck,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-white overflow-x-hidden selection:bg-brand-purple/30 selection:text-white">
      {/* Soft Ambient Background */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden h-[1000px]">
         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-purple/15 blur-[120px] rounded-full" />
         <div className="absolute top-[10%] left-1/4 w-[500px] h-[500px] bg-brand-cyan/15 blur-[100px] rounded-full" />
      </div>

      <Navbar isSignedIn={isSignedIn} />
      
      <main className="flex flex-col items-center w-full relative z-10">
        <HeroSection isSignedIn={isSignedIn} />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <CtaSection isSignedIn={isSignedIn} />
      </main>

      <Footer />
    </div>
  );
}

function Navbar({ isSignedIn }: { isSignedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#09090b]/80 backdrop-blur-lg border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-4" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Brand */}
        <div className="flex items-center flex-1">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-purple to-brand-cyan text-white shadow-md shadow-brand-purple/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white transition-opacity group-hover:opacity-80">
              SplitNest
            </span>
          </Link>
        </div>
        
        {/* Center: Links */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-none">
          <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="#faq" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">FAQ</Link>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center justify-end gap-4 flex-1">
          {isSignedIn ? (
            <Link href="/dashboard">
              <button className="h-10 px-5 bg-white text-black rounded-full font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5">
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="hidden sm:inline-flex text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="h-10 px-5 bg-white text-black rounded-full font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 active:scale-95">
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ isSignedIn }: { isSignedIn?: boolean }) {
  return (
    <section className="w-full max-w-7xl px-6 pt-32 lg:pt-48 pb-16 sm:pb-24 flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center w-full"
      >
        <div className="inline-flex items-center rounded-full border border-brand-purple/30 bg-brand-purple/10 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-brand-purple-light mb-8 shadow-sm">
          <Sparkles className="mr-2 h-4 w-4 text-brand-purple" />
          The smartest way to live together
        </div>

        <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-8">
          Co-living without the <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">
            financial friction.
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-zinc-400 font-medium leading-relaxed mb-10">
          Split expenses, manage recurring bills, assign chores, and settle debts instantly. Your entire shared apartment, organized in one beautiful workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full sm:w-auto">
          {isSignedIn ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
               <button className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                 Go to Dashboard <ArrowRight className="w-5 h-5" />
               </button>
            </Link>
          ) : (
            <>
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                  Get Started for Free <ArrowRight className="w-5 h-5" />
                </button>
              </SignUpButton>
              <Link href="#pricing" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 px-8 rounded-full bg-transparent border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-all flex items-center justify-center">
                  View Pricing
                </button>
              </Link>
            </>
          )}
        </div>
        
        {/* Hero Image Mockup - Dark Mode */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
           className="w-full max-w-5xl rounded-2xl sm:rounded-[2rem] border border-white/10 bg-[#09090b] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 sm:p-4 relative"
        >
           <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-[2rem] opacity-20 blur-xl -z-10" />
           <div className="w-full aspect-video rounded-xl sm:rounded-[1.5rem] bg-[#121214] border border-white/5 overflow-hidden relative">
              {/* Mockup Top Bar */}
              <div className="absolute top-0 left-0 w-full h-12 border-b border-white/5 bg-[#09090b] flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-zinc-700" />
                 <div className="w-3 h-3 rounded-full bg-zinc-700" />
                 <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
              
              {/* Mockup Content */}
              <div className="absolute top-12 left-0 w-full bottom-0 bg-[#121214] flex p-6 gap-6">
                 {/* Sidebar */}
                 <div className="hidden sm:flex w-48 flex-col gap-2">
                    <div className="h-8 w-3/4 rounded-lg bg-zinc-800 mb-4" />
                    <div className="h-8 w-full rounded-lg bg-brand-purple/15 border border-brand-purple/30" />
                    <div className="h-8 w-full rounded-lg bg-zinc-800/50" />
                    <div className="h-8 w-full rounded-lg bg-zinc-800/50" />
                 </div>
                 {/* Main Content */}
                 <div className="flex-1 flex flex-col gap-6">
                    <div className="flex justify-between items-end">
                       <div className="h-10 w-48 rounded-lg bg-zinc-800" />
                       <div className="h-10 w-24 rounded-full bg-brand-purple" />
                    </div>
                    <div className="flex gap-4">
                       <div className="h-32 flex-1 rounded-2xl bg-[#09090b] border border-white/10 p-4 flex flex-col justify-between">
                          <div className="w-8 h-8 rounded-full bg-zinc-800" />
                          <div className="h-6 w-1/2 rounded bg-zinc-800" />
                       </div>
                       <div className="h-32 flex-1 rounded-2xl bg-[#09090b] border border-white/10 p-4 flex flex-col justify-between">
                          <div className="w-8 h-8 rounded-full bg-zinc-800" />
                          <div className="h-6 w-1/2 rounded bg-zinc-800" />
                       </div>
                       <div className="h-32 flex-1 rounded-2xl bg-[#09090b] border border-white/10 p-4 flex flex-col justify-between">
                          <div className="w-8 h-8 rounded-full bg-zinc-800" />
                          <div className="h-6 w-1/2 rounded bg-zinc-800" />
                       </div>
                    </div>
                    <div className="flex-1 rounded-2xl bg-[#09090b] border border-white/10" />
                 </div>
              </div>
           </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "AI Receipt Scanner",
      description: "Don't type out 20 grocery items. Snap a photo and let our AI parse the items and prices automatically.",
      icon: <Receipt className="h-6 w-6 text-brand-purple" />,
      color: "bg-brand-purple/10 border-brand-purple/30",
    },
    {
      title: "Smart Settlements",
      description: "Our algorithm simplifies messy IOUs. We calculate the minimum number of transactions needed to settle all debts.",
      icon: <PiggyBank className="h-6 w-6 text-brand-cyan" />,
      color: "bg-brand-cyan/10 border-brand-cyan/30",
    },
    {
      title: "Recurring Bills",
      description: "Set up rent, internet, and utilities once. We automatically generate expense splits on their due dates.",
      icon: <CalendarCheck className="h-6 w-6 text-brand-rose" />,
      color: "bg-brand-rose/10 border-brand-rose/30",
    },
    {
      title: "Chore Kanban Board",
      description: "Keep the apartment clean and fair. Assign chores, set schedules, and track completion on a transparent board.",
      icon: <CheckCircle className="h-6 w-6 text-emerald-400" />,
      color: "bg-emerald-500/10 border-emerald-500/30",
    },
  ];

  return (
    <section id="features" className="w-full max-w-7xl px-6 py-16 sm:py-24">
      <div className="flex flex-col items-center text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
          Everything you need in one place
        </h2>
        <p className="text-lg text-zinc-400 max-w-2xl">
          We built the perfect toolkit for shared living. No more switching between spreadsheets, payment apps, and group chats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {features.map((feature, i) => (
          <motion.div 
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors shadow-lg shadow-black/20"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.color} mb-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-zinc-400 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="w-full max-w-7xl px-6 py-24 sm:py-32 bg-[#121214] border border-white/5 rounded-[3rem] text-white my-8 sm:my-16 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-[800px] h-[400px] bg-brand-purple/10 blur-[100px] rounded-full pointer-events-none" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Start for free, upgrade when your apartment needs supercharged features.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
        {/* Tier 1 */}
        <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] flex flex-col">
           <h3 className="text-xl font-semibold mb-2">Free</h3>
           <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-zinc-400">/forever</span>
           </div>
           <p className="text-zinc-400 mb-8 border-b border-white/10 pb-8">Perfect for simple apartments just starting out.</p>
           <ul className="flex flex-col gap-4 mb-8 flex-1">
              {["Basic manual expenses", "Debt simplification", "Manual chore board", "Up to 3 roommates"].map((f, i) => (
                 <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-brand-cyan" />
                    <span className="text-zinc-300">{f}</span>
                 </li>
              ))}
           </ul>
           <SignUpButton mode="modal">
              <button className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-colors">
                 Get Started
              </button>
           </SignUpButton>
        </div>

        {/* Tier 2 */}
        <div className="bg-gradient-to-b from-brand-purple/15 to-[#09090b]/80 backdrop-blur-xl border-2 border-brand-purple p-8 rounded-[2rem] flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-brand-purple/20">
           <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-purple text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              Most Popular
           </div>
           <h3 className="text-xl font-semibold mb-2 text-brand-purple-light">Pro</h3>
           <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">$5</span>
              <span className="text-zinc-400">/month per apt</span>
           </div>
           <p className="text-zinc-400 mb-8 border-b border-white/10 pb-8">Everything you need to automate your shared life.</p>
           <ul className="flex flex-col gap-4 mb-8 flex-1">
              {["AI Receipt Scanning", "Recurring Bills Engine", "Advanced Chore Scheduling", "Up to 8 roommates", "Export data to CSV"].map((f, i) => (
                 <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-brand-purple" />
                    <span className="text-white">{f}</span>
                 </li>
              ))}
           </ul>
           <SignUpButton mode="modal">
              <button className="w-full h-12 rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold transition-colors shadow-lg shadow-brand-purple/25">
                 Upgrade to Pro
              </button>
           </SignUpButton>
        </div>

        {/* Tier 3 */}
        <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] flex flex-col">
           <h3 className="text-xl font-semibold mb-2">House</h3>
           <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">$12</span>
              <span className="text-zinc-400">/month per house</span>
           </div>
           <p className="text-zinc-400 mb-8 border-b border-white/10 pb-8">For large living situations, fraternities, and co-ops.</p>
           <ul className="flex flex-col gap-4 mb-8 flex-1">
              {["Everything in Pro", "Unlimited roommates", "Multiple apartment sub-groups", "Priority support"].map((f, i) => (
                 <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-brand-cyan" />
                    <span className="text-zinc-300">{f}</span>
                 </li>
              ))}
           </ul>
           <Link href="mailto:sales@splitnest.com" className="w-full">
              <button className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-colors">
                 Contact Sales
              </button>
           </Link>
        </div>

      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    {
      question: "How does the debt simplification algorithm work?",
      answer: "SplitNest uses a graph algorithm to calculate the most efficient way to settle debts. If Alice owes Bob $20, and Bob owes Charlie $20, SplitNest simplifies it so Alice just owes Charlie $20 directly, saving you a transaction.",
    },
    {
      question: "Do you process the actual money transfers?",
      answer: "No. SplitNest acts as a ledger to keep track of exactly who owes what. You settle up the actual money using your preferred app (Venmo, Zelle, CashApp) and mark it as 'Paid' inside SplitNest.",
    },
    {
      question: "Can I use this for trips or just apartments?",
      answer: "While it was designed for roommates and long-term co-living, many users create a separate 'Apartment' just for a weekend trip to track group expenses easily!",
    },
    {
      question: "How does the AI Receipt Scanner work?",
      answer: "In the Pro plan, you can upload a photo of any receipt. Our AI reads the text, identifies each item and its price, and presents you with a checklist where you can assign specific items to specific roommates. It handles taxes and tips proportionally as well.",
    }
  ];

  return (
    <section id="faq" className="w-full max-w-3xl px-6 py-16 sm:py-24">
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center mb-12">
        Frequently asked questions
      </h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
}

function AccordionItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-all hover:bg-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left outline-none"
      >
        <span className="text-lg font-semibold text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-zinc-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-black/20 border-t border-white/5"
          >
            <div className="p-6 text-base text-zinc-400 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CtaSection({ isSignedIn }: { isSignedIn?: boolean }) {
  return (
    <section className="w-full max-w-7xl px-6 pt-8 pb-24">
      <div className="relative isolate overflow-hidden bg-white/5 border border-white/10 px-6 py-24 text-center rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-cyan/20 via-transparent to-transparent opacity-50" />
        
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Start living in harmony today.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          Join thousands of roommates who have stopped fighting over spreadsheets and started enjoying their shared space.
        </p>
        <div className="mt-10 flex items-center justify-center">
          {isSignedIn ? (
            <Link href="/dashboard">
              <button className="bg-white text-black hover:bg-zinc-200 rounded-full px-10 h-14 text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-1">
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="bg-brand-purple text-white hover:bg-brand-purple/90 rounded-full px-10 h-14 text-lg font-bold shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all hover:-translate-y-1">
                Get Started for Free
              </button>
            </SignUpButton>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#09090b] py-12 relative z-20">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-purple to-brand-cyan shadow-md shadow-brand-purple/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            SplitNest
          </span>
        </div>
        
        <div className="flex gap-8">
           <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Privacy</Link>
           <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Terms</Link>
           <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Contact</Link>
        </div>

        <p className="text-sm text-zinc-500 font-medium">
          &copy; {new Date().getFullYear()} SplitNest Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
