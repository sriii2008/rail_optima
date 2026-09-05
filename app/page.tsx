'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Line,
  Legend,
} from 'recharts';
import {
  ClipboardList,
  AlertTriangle,
  CalendarClock,
  Gauge,
  CheckCircle2,
  Train,
  Timer,
  ArrowRight,
  Layers,
  Shield,
  Database,
  Brain,
  CalendarRange,
  MonitorCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard, SectionHeader } from '@/components/stat-card';
import { DepartmentBadge, PriorityBadge, DepartmentDot, PrototypeNotice } from '@/components/shared';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  getDashboardStats,
  getRequestsByDepartment,
  getPriorityDistribution,
  getAvailabilityTrend,
  getBlockUtilization,
  getTodaysPriority,
  getUpcomingCoordinatedBlocks,
} from '@/lib/data';

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
  fontSize: '12px',
  color: 'hsl(var(--popover-foreground))',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DashboardPage() {
  const stats = getDashboardStats();
  const byDept = getRequestsByDepartment();
  const byPriority = getPriorityDistribution();
  const trend = getAvailabilityTrend();
  const utilization = getBlockUtilization();
  const todaysPriority = getTodaysPriority();
  const upcomingBlocks = getUpcomingCoordinatedBlocks();

  return (
    <div className="space-y-6">
      {/* Prototype notice */}
      <PrototypeNotice />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total Requests" value={stats.totalRequests} icon={ClipboardList} accent="accent" trend={{ value: '+3 this week', direction: 'up' }} />
        <StatCard label="Critical" value={stats.criticalRequests} icon={AlertTriangle} accent="destructive" subtitle="Requires immediate review" />
        <StatCard label="Upcoming Blocks" value={stats.upcomingBlocks} icon={CalendarClock} accent="warning" />
        <StatCard label="Availability" value={`${stats.overallAvailability}%`} icon={Gauge} accent="success" trend={{ value: 'Prototype Sim', direction: 'neutral' }} />
        <StatCard label="Coordinated" value={stats.coordinatedBlocks} icon={Layers} accent="accent" subtitle="Blocks this week" />
        <StatCard label="Completion" value={`${stats.completionRate}%`} icon={CheckCircle2} accent="success" />
        <StatCard label="Train Impact" value={`${stats.trainImpactHours}h`} icon={Train} accent="warning" subtitle="Estimated disruption" />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Requests by department */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Maintenance Requests by Department</CardTitle>
            <CardDescription>Distribution across Engineering, S&amp;T, and Traction</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDept} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} width={80} />
                <RTooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
                  {byDept.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority distribution */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Priority Distribution</CardTitle>
            <CardDescription>Maintenance requests by AI-assigned priority category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={byPriority} dataKey="count" nameKey="priority" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {byPriority.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {byPriority.map((p) => (
                  <div key={p.priority} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                      <span className="text-muted-foreground">{p.priority}</span>
                    </div>
                    <span className="font-semibold tabular-nums">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset availability trend */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Asset Availability Trend</CardTitle>
            <CardDescription>Prototype Simulation — weekly availability by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradEng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTrc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="%" />
                <RTooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="engineering" stroke="hsl(199, 89%, 48%)" strokeWidth={2} fill="url(#gradEng)" name="Engineering" />
                <Area type="monotone" dataKey="snt" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#gradSnt)" name="S&T" />
                <Area type="monotone" dataKey="traction" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fill="url(#gradTrc)" name="Traction" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-1">
              <div className="flex items-center gap-1.5 text-xs"><DepartmentDot department="Engineering" /> <span className="text-muted-foreground">Engineering</span></div>
              <div className="flex items-center gap-1.5 text-xs"><DepartmentDot department="S&T" /> <span className="text-muted-foreground">S&amp;T</span></div>
              <div className="flex items-center gap-1.5 text-xs"><DepartmentDot department="Traction" /> <span className="text-muted-foreground">Traction</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: Block utilization + Maintenance downtime */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly Block Utilization</CardTitle>
            <CardDescription>Number of maintenance blocks and total hours per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={utilization} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="blocks" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} barSize={32} name="Blocks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Maintenance Downtime</CardTitle>
            <CardDescription>Total maintenance hours per day (Prototype Simulation)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={utilization} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="h" />
                <RTooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="hours" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} barSize={32} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's priority + Upcoming blocks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today&apos;s Priority Queue</CardTitle>
            <CardDescription>Highest-priority maintenance requests awaiting review</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Request ID</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Dept</TableHead>
                  <TableHead className="pr-6 text-right">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysPriority.map((req) => (
                  <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="pl-6 font-mono text-xs font-medium">{req.id}</TableCell>
                    <TableCell className="text-sm">{req.maintenanceType}</TableCell>
                    <TableCell><DepartmentBadge department={req.department} /></TableCell>
                    <TableCell className="pr-6"><PriorityBadge priority={req.priorityCategory} score={req.priorityScore} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Coordinated Blocks</CardTitle>
            <CardDescription>Maintenance blocks combining multiple departments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Block ID</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="pr-6">Depts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingBlocks.map((block) => (
                  <TableRow key={block.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="pl-6 font-mono text-xs font-medium">{block.id}</TableCell>
                    <TableCell className="text-sm">{DAYS[block.day]}</TableCell>
                    <TableCell className="text-sm font-mono">{block.startTime}–{block.endTime}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-mono text-[10px]">{block.section}</Badge></TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center gap-1.5">
                        <DepartmentDot department={block.department} />
                        {(block.coordinatedWith || []).slice(0, 2).map((id, i) => (
                          <DepartmentDot key={i} department={i === 0 ? 'S&T' : 'Traction'} />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* System flow visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">System Integration Flow</CardTitle>
          <CardDescription>How data flows from existing railway systems through the AI optimization layer to controller review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-stretch lg:justify-between">
            {/* Source systems */}
            <div className="flex flex-col gap-2 w-full lg:w-auto">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Existing Systems</span>
              <div className="grid grid-cols-5 gap-2 lg:flex lg:flex-col">
                {[
                  { name: 'TMS', desc: 'Track' },
                  { name: 'SMMS', desc: 'Signal' },
                  { name: 'TDMS', desc: 'Traction' },
                  { name: 'BDMS', desc: 'Block' },
                  { name: 'COA', desc: 'Control' },
                ].map((sys) => (
                  <div key={sys.name} className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 lg:px-3 lg:py-2">
                    <Database className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold">{sys.name}</span>
                      <span className="text-[10px] text-muted-foreground hidden lg:block">{sys.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FlowArrow />

            {/* ETL */}
            <FlowStep icon={Database} title="ETL" subtitle="Data Integration" />
            <FlowArrow />
            <FlowStep icon={Brain} title="AI Priority" subtitle="Scoring Engine" />
            <FlowArrow />
            <FlowStep icon={CalendarRange} title="Optimizer" subtitle="Scheduling" />
            <FlowArrow />
            <FlowStep icon={MonitorCheck} title="Controller" subtitle="Review & Approve" highlight />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-success" />
            <span>AI recommendations are advisory only. Final approval remains with authorized railway personnel.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center lg:flex-col">
      <ArrowRight className="h-4 w-4 text-muted-foreground/50 lg:rotate-0" />
    </div>
  );
}

function FlowStep({
  icon: Icon,
  title,
  subtitle,
  highlight,
}: {
  icon: typeof Brain;
  title: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg border px-4 py-3 text-center min-w-[110px] ${
        highlight
          ? 'border-accent/40 bg-accent/10'
          : 'border-border bg-card'
      }`}
    >
      <Icon className={`h-5 w-5 ${highlight ? 'text-accent' : 'text-muted-foreground'}`} />
      <span className="text-xs font-semibold">{title}</span>
      <span className="text-[10px] text-muted-foreground">{subtitle}</span>
    </div>
  );
}
