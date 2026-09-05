'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Brain,
  CalendarRange,
  CalendarDays,
  Gauge,
  FlaskConical,
  Network,
  Cpu,
  HelpCircle,
  Bell,
  User,
  Train,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getGlossaryTerms, getNotifications } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/requests', label: 'Maintenance Requests', icon: ClipboardList },
  { href: '/ai-engine', label: 'AI Priority Engine', icon: Brain },
  { href: '/weekly-plan', label: 'Optimized Weekly Plan', icon: CalendarRange },
  { href: '/monthly-plan', label: 'Monthly Plan', icon: CalendarDays },
  { href: '/assets', label: 'Asset Availability', icon: Gauge },
  { href: '/simulator', label: 'What-If Simulator', icon: FlaskConical },
  { href: '/coordination', label: 'Department Coordination', icon: Network },
  { href: '/architecture', label: 'Technical Architecture', icon: Cpu },
];

function getPageTitle(pathname: string): string {
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  return item?.label || 'Rail Optimizer';
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-accent/15 text-accent border-l-2 border-accent'
                : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground border-l-2 border-transparent'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-rail-navy border-r border-rail-blue/30">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-rail-blue/30">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/90">
          <Train className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-tight">Rail Optimizer</span>
          <span className="text-[10px] text-primary-foreground/50 font-medium uppercase tracking-wider">
            Maintenance Block Planning
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <NavLinks />
      </ScrollArea>
      <div className="border-t border-rail-blue/30 p-4">
        <div className="flex items-center gap-2 rounded-md bg-rail-blue/40 px-3 py-2.5">
          <ShieldCheck className="h-4 w-4 text-success shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-white">Decision-Support Prototype</span>
            <span className="text-[10px] text-primary-foreground/50">
              AI recommendations only — human approval required
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NotificationsDropdown() {
  const notifications = getNotifications();
  const unread = notifications.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>{unread} unread notifications</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] -mx-6 px-6">
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'rounded-lg border p-3',
                  n.type === 'warning' && 'border-warning/30 bg-warning/5',
                  n.type === 'success' && 'border-success/30 bg-success/5',
                  n.type === 'info' && 'border-accent/30 bg-accent/5',
                  !n.read && 'ring-1 ring-ring/20'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function GlossaryDialog() {
  const [open, setOpen] = useState(false);
  const terms = getGlossaryTerms();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        onClick={() => setOpen(true)}
        title="Glossary & Help"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Glossary &amp; Help</DialogTitle>
          <DialogDescription>
            Key terms used throughout the Rail Optimizer system
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[55vh] -mx-6 px-6">
          <div className="space-y-4">
            {terms.map((t) => (
              <div key={t.term} className="border-b border-border pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t.term}</span>
                  {t.abbreviation && (
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {t.abbreviation}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.definition}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-rail-navy px-4 lg:px-6 border-b border-rail-blue/30">
            <div className="flex items-center gap-3">
              {/* Mobile menu trigger */}
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-2 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/90">
                  <Train className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">Rail Optimizer</span>
              </div>
              <h1 className="hidden lg:block text-lg font-semibold text-white tracking-tight">
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {/* Prototype indicator */}
              <Badge className="hidden sm:flex bg-warning/90 hover:bg-warning/90 text-warning-foreground border-0 font-mono text-[10px] tracking-wide gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning-foreground animate-pulse-soft" />
                Prototype • Synthetic Data
              </Badge>
              <NotificationsDropdown />
              <GlossaryDialog />
              <Separator orientation="vertical" className="h-6 bg-primary-foreground/20" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rail-blue/60 border border-primary-foreground/20">
                  <User className="h-4 w-4 text-primary-foreground/80" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-semibold text-white">R. Sharma</span>
                  <span className="text-[10px] text-primary-foreground/50">Chief Controller</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto scrollbar-thin">
            <div className="mx-auto max-w-[1600px] p-4 lg:p-6">{children}</div>
          </main>
        </div>

        <SheetContent side="left" className="w-72 bg-rail-navy border-rail-blue/30 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center gap-2.5 px-5 border-b border-rail-blue/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/90">
              <Train className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight">Rail Optimizer</span>
              <span className="text-[10px] text-primary-foreground/50 font-medium uppercase tracking-wider">
                Maintenance Block Planning
              </span>
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
