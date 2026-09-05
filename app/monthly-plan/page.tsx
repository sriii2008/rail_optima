'use client';

import { useState } from 'react';
import {
  CalendarDays,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DepartmentBadge,
  PriorityBadge,
  StatusBadge,
  DepartmentDot,
  PrototypeNotice,
} from '@/components/shared';
import { StatCard, SectionHeader } from '@/components/stat-card';
import { getMonthlyPlan } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { MonthlyActivity } from '@/lib/types';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthlyPlanPage() {
  const activities = getMonthlyPlan();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const year = 2026;
  const month = 8; // September (0-indexed)

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activitiesByDate = activities.reduce((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {} as Record<string, MonthlyActivity[]>);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Stats
  const total = activities.length;
  const completed = activities.filter((a) => a.status === 'Completed').length;
  const scheduled = activities.filter((a) => a.status === 'Scheduled').length;
  const pending = activities.filter((a) => a.status === 'Pending Review').length;
  const critical = activities.filter((a) => a.priority === 'Critical').length;

  const selectedActivities = selectedDate ? activitiesByDate[selectedDate] || [] : [];

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Monthly Plan"
        description="Maintenance planning calendar for September 2026"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-sm font-semibold px-3">September 2026</span>
            <Button variant="outline" size="sm" disabled>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <PrototypeNotice />

      {/* Monthly summary */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-5">
        <StatCard label="Total Activities" value={total} icon={CalendarDays} accent="accent" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} accent="success" />
        <StatCard label="Scheduled" value={scheduled} icon={Clock} accent="default" />
        <StatCard label="Pending" value={pending} icon={AlertTriangle} accent="warning" />
        <StatCard label="Critical" value={critical} icon={AlertTriangle} accent="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Calendar View</CardTitle>
            <CardDescription>Click a date to view planned activities. Color dots indicate department and priority.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1.5">
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={i} className="aspect-square" />;
                const dateStr = new Date(year, month, day).toISOString().split('T')[0];
                const dayActivities = activitiesByDate[dateStr] || [];
                const hasCritical = dayActivities.some((a) => a.priority === 'Critical');
                const hasCoordinated = dayActivities.some((a) => a.coordinated);
                const isSelected = selectedDate === dateStr;
                const isToday = day === 7;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      'aspect-square rounded-md border p-1.5 text-left transition-all hover:border-accent/40 hover:shadow-sm relative',
                      isSelected ? 'border-accent bg-accent/5 ring-1 ring-accent/30' : 'border-border',
                      dayActivities.length === 0 && 'bg-muted/20',
                      isToday && !isSelected && 'border-rail-blue/40 bg-rail-navy/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-xs font-semibold',
                        isToday && 'text-accent',
                        !isToday && dayActivities.length > 0 && 'text-foreground',
                        !isToday && dayActivities.length === 0 && 'text-muted-foreground/50'
                      )}>
                        {day}
                      </span>
                      {hasCritical && <AlertTriangle className="h-2.5 w-2.5 text-destructive" />}
                      {hasCoordinated && !hasCritical && <Layers className="h-2.5 w-2.5 text-accent" />}
                    </div>
                    {/* Activity dots */}
                    {dayActivities.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayActivities.slice(0, 3).map((a) => (
                          <div key={a.id} className="flex items-center gap-1">
                            <DepartmentDot department={a.department} className="h-1.5 w-1.5" />
                            <span className="text-[9px] text-muted-foreground truncate flex-1">{a.activity.split(' ').slice(0, 2).join(' ')}</span>
                          </div>
                        ))}
                        {dayActivities.length > 3 && (
                          <span className="text-[9px] text-muted-foreground">+{dayActivities.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><DepartmentDot department="Engineering" className="h-2 w-2" /> <span className="text-muted-foreground">Engineering</span></div>
              <div className="flex items-center gap-1.5"><DepartmentDot department="S&T" className="h-2 w-2" /> <span className="text-muted-foreground">S&amp;T</span></div>
              <div className="flex items-center gap-1.5"><DepartmentDot department="Traction" className="h-2 w-2" /> <span className="text-muted-foreground">Traction</span></div>
              <Separator orientation="vertical" className="h-3" />
              <div className="flex items-center gap-1.5"><AlertTriangle className="h-2.5 w-2.5 text-destructive" /> <span className="text-muted-foreground">Critical priority</span></div>
              <div className="flex items-center gap-1.5"><Layers className="h-2.5 w-2.5 text-accent" /> <span className="text-muted-foreground">Coordinated</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Selected date detail */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Select a Date'}
            </CardTitle>
            <CardDescription>
              {selectedActivities.length > 0
                ? `${selectedActivities.length} maintenance ${selectedActivities.length === 1 ? 'activity' : 'activities'} planned`
                : 'Click a calendar date to view scheduled activities'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No activities scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedActivities.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{a.activity}</span>
                      <PriorityBadge priority={a.priority} />
                    </div>
                    <div className="flex items-center gap-2">
                      <DepartmentBadge department={a.department} />
                      <Badge variant="secondary" className="font-mono text-[10px]">{a.section}</Badge>
                      {a.coordinated && <Badge className="bg-accent/10 text-accent border-accent/30 text-[10px]"><Layers className="h-2.5 w-2.5 mr-1" />Coordinated</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{a.duration}h</span>
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section utilization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Section Utilization</CardTitle>
          <CardDescription>Maintenance activity distribution across corridor sections this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(['SEC-A', 'SEC-B', 'SEC-C', 'SEC-D', 'SEC-E'] as const).map((sec) => {
              const secActivities = activities.filter((a) => a.section === sec);
              const secHours = secActivities.reduce((s, a) => s + a.duration, 0);
              const maxHours = Math.max(...(['SEC-A', 'SEC-B', 'SEC-C', 'SEC-D', 'SEC-E'] as const).map((s) => activities.filter((a) => a.section === s).reduce((sum, a) => sum + a.duration, 0)));
              return (
                <div key={sec} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold">{sec}</span>
                    <Badge variant="secondary" className="text-[10px]">{secActivities.length}</Badge>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(secHours / maxHours) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{secHours}h total</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
