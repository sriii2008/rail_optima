'use client';

import { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  Clock,
  Timer,
  Train,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DepartmentBadge,
  PriorityBadge,
  StatusBadge,
  DepartmentDot,
  PrototypeNotice,
  InfoTooltip,
} from '@/components/shared';
import { StatCard, SectionHeader } from '@/components/stat-card';
import { getWeeklyPlan } from '@/lib/data';
import type { MaintenanceBlock, Department } from '@/lib/types';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 - 23:00

const DEPT_COLORS: Record<Department, { bg: string; border: string; text: string; solid: string }> = {
  Engineering: { bg: 'bg-chart-1/15', border: 'border-chart-1/40', text: 'text-chart-1', solid: 'bg-chart-1' },
  'S&T': { bg: 'bg-chart-2/15', border: 'border-chart-2/40', text: 'text-chart-2', solid: 'bg-chart-2' },
  Traction: { bg: 'bg-chart-3/15', border: 'border-chart-3/40', text: 'text-chart-3', solid: 'bg-chart-3' },
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToPercent(minutes: number): number {
  const start = 6 * 60; // 6:00
  const end = 23 * 60; // 23:00
  return ((minutes - start) / (end - start)) * 100;
}

export default function WeeklyPlanPage() {
  const blocks = getWeeklyPlan();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedBlock = selectedId ? blocks.find((b) => b.id === selectedId) : null;

  const totalBlocks = blocks.length;
  const coordinatedBlocks = blocks.filter((b) => b.coordinated).length;
  const avoidedConflicts = 7;
  const maintenanceHours = Math.round(blocks.reduce((s, b) => s + b.duration, 0) * 10) / 10;
  const trainImpactHours = Math.round(blocks.reduce((s, b) => s + b.duration * (b.operationalImpact === 'High' ? 1 : b.operationalImpact === 'Medium' ? 0.5 : 0.1), 0) * 10) / 10;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Optimized Weekly Plan"
        description="AI-optimized maintenance block schedule for September 7–13, 2026"
        action={
          <div className="flex items-center gap-2">
            <Badge className="bg-accent/10 text-accent border-accent/30 hover:bg-accent/10">
              <ShieldCheck className="h-3 w-3 mr-1" /> Optimized Schedule
            </Badge>
            <Badge className="bg-warning/10 text-warning border-warning/30 hover:bg-warning/10">
              <Eye className="h-3 w-3 mr-1" /> Controller Review Required
            </Badge>
          </div>
        }
      />

      <PrototypeNotice />

      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-5">
        <StatCard label="Total Blocks" value={totalBlocks} icon={Layers} accent="accent" />
        <StatCard label="Coordinated" value={coordinatedBlocks} icon={ShieldCheck} accent="success" subtitle="Multi-dept blocks" />
        <StatCard label="Avoided Conflicts" value={avoidedConflicts} icon={AlertTriangle} accent="warning" />
        <StatCard label="Maint. Hours" value={`${maintenanceHours}h`} icon={Timer} accent="default" />
        <StatCard label="Train Impact" value={`${trainImpactHours}h`} icon={Train} accent="destructive" subtitle="Estimated disruption" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="font-medium text-muted-foreground">Departments:</span>
        <div className="flex items-center gap-1.5"><DepartmentDot department="Engineering" /> <span>Engineering</span></div>
        <div className="flex items-center gap-1.5"><DepartmentDot department="S&T" /> <span>S&amp;T</span></div>
        <div className="flex items-center gap-1.5"><DepartmentDot department="Traction" /> <span>Traction</span></div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-dashed border-muted-foreground/40" />
          <span className="text-muted-foreground">Train operational window</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-2 ring-accent/50" />
          <span className="text-muted-foreground">Coordinated block</span>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">7-Day Maintenance Block Timeline</CardTitle>
          <CardDescription>Each block shows activity, department, time window, and priority. Coordinated blocks are highlighted.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Hour scale header */}
            <div className="flex gap-16 pl-2">
              <div className="flex-1 relative h-6">
                {HOURS.filter((h) => h % 3 === 0).map((h) => (
                  <div
                    key={h}
                    className="absolute text-[10px] font-mono text-muted-foreground/70 -translate-x-1/2"
                    style={{ left: `${minutesToPercent(h * 60)}%` }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {DAYS.map((_, dayIdx) => {
              const dayBlocks = blocks.filter((b) => b.day === dayIdx);
              return (
                <div key={dayIdx} className="flex gap-2 items-stretch">
                  {/* Day label */}
                  <div className="w-14 shrink-0 flex flex-col items-center justify-center rounded-md bg-rail-navy/95 text-white py-2">
                    <span className="text-xs font-bold">{DAY_SHORT[dayIdx]}</span>
                    <span className="text-[10px] text-primary-foreground/60">{dayBlocks.length} blk</span>
                  </div>

                  {/* Timeline track */}
                  <div className="flex-1 relative bg-rail-grid bg-muted/30 rounded-md border border-border min-h-[60px]">
                    {/* Train operational windows (background) */}
                    <div className="absolute inset-0 rounded-md overflow-hidden">
                      {/* Night window — lower traffic */}
                      <div className="absolute top-0 bottom-0 border-r border-dashed border-muted-foreground/20" style={{ left: `${minutesToPercent(6 * 60)}%`, width: `${minutesToPercent(9 * 60) - minutesToPercent(6 * 60)}%` }} />
                      {/* Peak hours indicator */}
                      <div className="absolute top-0 bottom-0 bg-warning/5" style={{ left: `${minutesToPercent(9 * 60)}%`, width: `${minutesToPercent(11 * 60) - minutesToPercent(9 * 60)}%` }} />
                      <div className="absolute top-0 bottom-0 bg-warning/5" style={{ left: `${minutesToPercent(17 * 60)}%`, width: `${minutesToPercent(20 * 60) - minutesToPercent(17 * 60)}%` }} />
                    </div>

                    {/* Blocks */}
                    {dayBlocks.map((block) => {
                      const startMin = timeToMinutes(block.startTime);
                      const endMin = timeToMinutes(block.endTime);
                      const left = minutesToPercent(startMin);
                      const width = minutesToPercent(endMin) - minutesToPercent(startMin);
                      const colors = DEPT_COLORS[block.department];

                      return (
                        <button
                          key={block.id}
                          onClick={() => setSelectedId(block.id)}
                          className={cn(
                            'absolute top-1.5 bottom-1.5 rounded-md border px-2 py-1 text-left transition-all hover:z-10 hover:shadow-md',
                            colors.bg,
                            colors.border,
                            block.coordinated && 'ring-2 ring-accent/50 ring-offset-1 ring-offset-background'
                          )}
                          style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                          title={`${block.activity} — ${block.startTime} to ${block.endTime}`}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className={cn('h-1.5 w-1.5 rounded-full', colors.solid)} />
                            <span className="text-[10px] font-semibold truncate text-foreground">{block.activity}</span>
                            {block.coordinated && <Layers className="h-2.5 w-2.5 text-accent shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                            <Clock className="h-2 w-2" />
                            {block.startTime}–{block.endTime}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Block list table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scheduled Blocks Detail</CardTitle>
          <CardDescription>Click any block to view optimization explanation and approval status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Block ID</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Day</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Activity</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Dept</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Section</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Time</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Duration</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Priority</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Impact</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr
                    key={block.id}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedId(block.id)}
                  >
                    <td className="p-4 font-mono text-xs font-semibold">{block.id}</td>
                    <td className="p-4 text-sm">{DAY_SHORT[block.day]}</td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        {block.coordinated && <Layers className="h-3 w-3 text-accent" />}
                        {block.activity}
                      </div>
                    </td>
                    <td className="p-4"><DepartmentBadge department={block.department} /></td>
                    <td className="p-4"><Badge variant="secondary" className="font-mono text-[10px]">{block.section}</Badge></td>
                    <td className="p-4 font-mono text-xs">{block.startTime}–{block.endTime}</td>
                    <td className="p-4 font-mono text-xs">{block.duration}h</td>
                    <td className="p-4"><PriorityBadge priority={block.priority} /></td>
                    <td className="p-4">
                      <Badge variant="outline" className={cn(
                        block.operationalImpact === 'High' && 'border-destructive/30 text-destructive bg-destructive/5',
                        block.operationalImpact === 'Medium' && 'border-warning/30 text-warning bg-warning/5',
                        block.operationalImpact === 'Low' && 'border-accent/30 text-accent bg-accent/5',
                        block.operationalImpact === 'None' && 'border-border text-muted-foreground',
                      )}>{block.operationalImpact}</Badge>
                    </td>
                    <td className="p-4"><StatusBadge status={block.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Block detail sheet */}
      <Sheet open={!!selectedBlock} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto scrollbar-thin">
          {selectedBlock && <BlockDetail block={selectedBlock} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BlockDetail({ block }: { block: MaintenanceBlock }) {
  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="font-mono">{block.id}</SheetTitle>
        <SheetDescription>{block.activity} — {block.section} • {DAYS[block.day]}</SheetDescription>
      </SheetHeader>

      <div className="flex flex-wrap gap-2">
        <DepartmentBadge department={block.department} />
        <PriorityBadge priority={block.priority} score={block.priorityScore} />
        <StatusBadge status={block.status} />
        {block.coordinated && <Badge className="bg-accent/10 text-accent border-accent/30"><Layers className="h-3 w-3 mr-1" />Coordinated</Badge>}
      </div>

      {/* Optimization explanation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            Optimization Explanation
            <InfoTooltip text="The AI optimizer explains why this block was scheduled at this time and how it relates to other maintenance work." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{block.optimizationExplanation}</p>
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="Block ID" value={block.id} mono />
        <DetailField label="Request ID" value={block.requestId} mono />
        <DetailField label="Asset ID" value={block.assetId} mono />
        <DetailField label="Section" value={block.section} mono />
        <DetailField label="Location" value={block.location} />
        <DetailField label="Day" value={DAYS[block.day]} />
        <DetailField label="Start Time" value={block.startTime} mono />
        <DetailField label="End Time" value={block.endTime} mono />
        <DetailField label="Duration" value={`${block.duration} hours`} />
        <DetailField label="Priority Score" value={String(block.priorityScore)} mono />
        <DetailField label="Operational Impact" value={block.operationalImpact} />
        <DetailField label="Approval Status" value={block.status} />
      </div>

      {/* Train impact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Train className="h-4 w-4 text-warning" />
            Train Operational Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{block.trainImpact}</p>
        </CardContent>
      </Card>

      {/* Coordinated with */}
      {block.coordinated && block.coordinatedWith && block.coordinatedWith.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-accent" />
              Coordinated With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {block.coordinatedWith.map((id) => (
                <Badge key={id} variant="secondary" className="font-mono text-xs">{id}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Actual coordination depends on safety, technical compatibility, resources, and railway rules.
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
        This block requires controller approval before execution. AI recommendations are advisory only.
      </div>
    </div>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border p-2.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className={`text-sm font-medium mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
