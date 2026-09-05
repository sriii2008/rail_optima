'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import {
  Gauge,
  Wrench,
  Signal,
  Zap,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DepartmentBadge,
  DepartmentDot,
  PrototypeNotice,
  InfoTooltip,
} from '@/components/shared';
import { StatCard, SectionHeader } from '@/components/stat-card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  getAssets,
  getAvailabilityTrend,
  getSectionAvailability,
} from '@/lib/data';

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
  fontSize: '12px',
  color: 'hsl(var(--popover-foreground))',
};

export default function AssetAvailabilityPage() {
  const assets = getAssets();
  const trend = getAvailabilityTrend();
  const sectionAvail = getSectionAvailability();

  const overallAvail = Math.round((assets.reduce((s, a) => s + a.availability, 0) / assets.length) * 10) / 10;
  const engAvail = Math.round((assets.filter((a) => a.department === 'Engineering').reduce((s, a) => s + a.availability, 0) / assets.filter((a) => a.department === 'Engineering').length) * 10) / 10;
  const sntAvail = Math.round((assets.filter((a) => a.department === 'S&T').reduce((s, a) => s + a.availability, 0) / assets.filter((a) => a.department === 'S&T').length) * 10) / 10;
  const trcAvail = Math.round((assets.filter((a) => a.department === 'Traction').reduce((s, a) => s + a.availability, 0) / assets.filter((a) => a.department === 'Traction').length) * 10) / 10;

  const downtimeData = [
    { name: 'Engineering', hours: assets.filter((a) => a.department === 'Engineering').reduce((s, a) => s + a.downtime, 0), fill: 'hsl(199, 89%, 48%)' },
    { name: 'S&T', hours: assets.filter((a) => a.department === 'S&T').reduce((s, a) => s + a.downtime, 0), fill: 'hsl(142, 71%, 45%)' },
    { name: 'Traction', hours: assets.filter((a) => a.department === 'Traction').reduce((s, a) => s + a.downtime, 0), fill: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Asset Availability"
        description="Operational availability metrics for railway infrastructure assets"
      />

      {/* Definition banner */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <InfoTooltip text="Asset Availability = (Available Time / Planned Operating Time) × 100. It measures how often an asset is ready for train operations." />
            <div>
              <p className="text-sm font-semibold">What is Asset Availability?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Asset Availability represents the percentage of planned operating time during which the asset remains available for train operations.
                Higher availability means less downtime and more reliable service.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PrototypeNotice />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
        <StatCard label="Overall Availability" value={`${overallAvail}%`} icon={Gauge} accent="success" subtitle="All departments" />
        <StatCard label="Engineering" value={`${engAvail}%`} icon={Wrench} accent="accent" subtitle="Track assets" />
        <StatCard label="S&T" value={`${sntAvail}%`} icon={Signal} accent="default" subtitle="Signal & telecom" />
        <StatCard label="Traction" value={`${trcAvail}%`} icon={Zap} accent="warning" subtitle="OHE & substations" />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Availability trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Availability Trend
              <InfoTooltip text="Daily asset availability percentage by department over the past week (Prototype Simulation)." />
            </CardTitle>
            <CardDescription>Daily availability percentage — Prototype Simulation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="%" />
                <RTooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="engineering" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 3 }} name="Engineering" />
                <Line type="monotone" dataKey="snt" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} name="S&T" />
                <Line type="monotone" dataKey="traction" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="Traction" />
                <Line type="monotone" dataKey="overall" stroke="hsl(var(--foreground))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Overall" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-1 text-xs">
              <div className="flex items-center gap-1.5"><DepartmentDot department="Engineering" /> <span className="text-muted-foreground">Engineering</span></div>
              <div className="flex items-center gap-1.5"><DepartmentDot department="S&T" /> <span className="text-muted-foreground">S&amp;T</span></div>
              <div className="flex items-center gap-1.5"><DepartmentDot department="Traction" /> <span className="text-muted-foreground">Traction</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-foreground/40" /> <span className="text-muted-foreground">Overall</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance downtime by department */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Maintenance Downtime by Department
              <InfoTooltip text="Total hours of downtime per department this week due to maintenance activities." />
            </CardTitle>
            <CardDescription>Total downtime hours this week — Prototype Simulation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={downtimeData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="h" />
                <RTooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={40}>
                  {downtimeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Availability by section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Availability by Section</CardTitle>
            <CardDescription>Asset availability percentage across corridor sections</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sectionAvail} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[80, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="%" />
                <YAxis dataKey="section" type="category" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={60} />
                <RTooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="availability" radius={[0, 4, 4, 0]} barSize={24} fill="hsl(199, 89%, 48%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Availability by department (bar comparison) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Availability by Department</CardTitle>
            <CardDescription>Current availability percentage per department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { dept: 'Engineering' as const, avail: engAvail, color: 'hsl(199, 89%, 48%)' },
              { dept: 'S&T' as const, avail: sntAvail, color: 'hsl(142, 71%, 45%)' },
              { dept: 'Traction' as const, avail: trcAvail, color: 'hsl(38, 92%, 50%)' },
            ].map((d) => (
              <div key={d.dept} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DepartmentDot department={d.dept} />
                    <span className="text-sm font-medium">{d.dept}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{d.avail}%</span>
                </div>
                <Progress value={d.avail} className="h-2.5" />
              </div>
            ))}
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <span className="font-semibold">Prototype Simulation</span> — These availability values are simulated for demonstration. No real-world improvement percentages are claimed.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Asset Registry</CardTitle>
          <CardDescription>Detailed availability status for all tracked railway assets</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Asset ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Downtime</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((a) => (
                <TableRow key={a.id} className="hover:bg-muted/50">
                  <TableCell className="pl-6 font-mono text-xs font-semibold">{a.id}</TableCell>
                  <TableCell className="text-sm">{a.name}</TableCell>
                  <TableCell><DepartmentBadge department={a.department} /></TableCell>
                  <TableCell><Badge variant="secondary" className="font-mono text-[10px]">{a.section}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${a.availability >= 95 ? 'bg-success' : a.availability >= 90 ? 'bg-warning' : 'bg-destructive'}`}
                          style={{ width: `${a.availability}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold tabular-nums">{a.availability}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{a.downtime}h</TableCell>
                  <TableCell className="pr-6">
                    <Badge variant="outline" className={
                      a.status === 'Available' ? 'border-success/30 text-success bg-success/5' :
                      a.status === 'Under Maintenance' ? 'border-warning/30 text-warning bg-warning/5' :
                      'border-destructive/30 text-destructive bg-destructive/5'
                    }>
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
