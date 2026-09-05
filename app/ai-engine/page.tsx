'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import {
  ShieldAlert,
  Train,
  Timer,
  Wrench,
  History,
  Brain,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  PriorityBadge,
  DepartmentBadge,
  PrototypeNotice,
  InfoTooltip,
} from '@/components/shared';
import { SectionHeader } from '@/components/stat-card';
import { getMaintenanceRequests } from '@/lib/data';

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
  fontSize: '12px',
  color: 'hsl(var(--popover-foreground))',
};

const FACTORS = [
  {
    name: 'Safety Impact',
    weight: 35,
    icon: ShieldAlert,
    color: 'hsl(0, 72%, 51%)',
    description: 'Risk to passenger and staff safety if maintenance is delayed. This is the highest-weighted factor because safety is the paramount concern in railway operations.',
    example: 'A rail defect on a high-speed mainline has a very high safety impact because failure could lead to derailment.',
  },
  {
    name: 'Operational Impact',
    weight: 25,
    icon: Train,
    color: 'hsl(38, 92%, 50%)',
    description: 'Effect on train services, including delays, cancellations, and route disruptions. Higher impact on busy corridors increases the priority.',
    example: 'Maintenance on a busy mainline section during peak hours has higher operational impact than work on a low-traffic branch line.',
  },
  {
    name: 'Urgency / Deadline',
    weight: 20,
    icon: Timer,
    color: 'hsl(199, 89%, 48%)',
    description: 'How soon the maintenance must be performed. Requests with imminent deadlines receive higher urgency scores.',
    example: 'A request due in 2 days scores higher on urgency than one due in 3 weeks.',
  },
  {
    name: 'Asset Criticality',
    weight: 15,
    icon: Wrench,
    color: 'hsl(142, 71%, 45%)',
    description: 'Importance of the asset to overall railway operations. Mainline tracks, critical signals, and key substations are more critical than secondary assets.',
    example: 'A signal controlling a busy junction is more critical than a signal on a seldom-used siding.',
  },
  {
    name: 'Failure History',
    weight: 5,
    icon: History,
    color: 'hsl(280, 60%, 55%)',
    description: 'Past failure patterns for the asset type. Assets with frequent historical failures receive a slightly elevated priority.',
    example: 'A signal cabin with 3 failures in the past year scores higher than one with no failures.',
  },
];

const EXAMPLE_SCORE = 88;

export default function AIPriorityEnginePage() {
  const requests = getMaintenanceRequests();
  const exampleRequest = requests.find((r) => r.priorityScore >= 85 && r.priorityCategory === 'Critical') || requests[0];

  const radialData = [{ name: 'Priority Score', value: exampleRequest.priorityScore, fill: 'hsl(0, 72%, 51%)' }];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Priority Engine"
        description="How maintenance priority scores are calculated — explained for railway operations teams"
      />

      <PrototypeNotice />

      {/* How it works */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-accent" />
            How the Priority Engine Works
          </CardTitle>
          <CardDescription>
            Every maintenance request receives a priority score from 0 to 100. The score combines five factors, each weighted by its importance to railway operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {FACTORS.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-lg border border-border p-4 space-y-2 relative">
                  <div className="absolute top-3 right-3 text-xs font-mono text-muted-foreground/40">#{i + 1}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: `${f.color}15` }}>
                      <Icon className="h-4 w-4" style={{ color: f.color }} />
                    </div>
                    <span className="text-sm font-semibold">{f.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: f.color }}>{f.weight}%</span>
                    <span className="text-xs text-muted-foreground">weight</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  <Separator className="my-1" />
                  <p className="text-[11px] text-muted-foreground/80 italic">{f.example}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weight visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Factor Weights</CardTitle>
          <CardDescription>How much each factor contributes to the final priority score</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={FACTORS.map((f) => ({ name: f.name, weight: f.weight, fill: f.color }))} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} width={130} />
              <RTooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Worked example */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Worked Example</CardTitle>
            <CardDescription>
              How a specific maintenance request is scored — <span className="font-mono font-semibold">{exampleRequest.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <DepartmentBadge department={exampleRequest.department} />
              <Badge variant="secondary" className="font-mono text-[10px]">{exampleRequest.section}</Badge>
              <span className="text-sm text-muted-foreground">{exampleRequest.maintenanceType}</span>
            </div>

            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart innerRadius="60%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={8} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: '36px', fontWeight: 'bold' }}>
                    {exampleRequest.priorityScore}
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Priority Category:</span>
                <PriorityBadge priority={exampleRequest.priorityCategory} />
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Safety Impact', value: exampleRequest.factors.safetyImpact, weight: 35 },
                { label: 'Operational Impact', value: exampleRequest.factors.operationalImpact, weight: 25 },
                { label: 'Urgency / Deadline', value: exampleRequest.factors.urgency, weight: 20 },
                { label: 'Asset Criticality', value: exampleRequest.factors.assetCriticality, weight: 15 },
                { label: 'Failure History', value: exampleRequest.factors.failureHistory, weight: 5 },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="text-xs w-32 shrink-0 text-muted-foreground">{f.label}</span>
                  <Progress value={f.value} className="h-2 flex-1" />
                  <span className="text-xs font-mono w-10 text-right">{f.value}</span>
                  <span className="text-xs text-muted-foreground/60 w-8 text-right">×{f.weight}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Priority Categories</CardTitle>
            <CardDescription>How scores map to priority labels and recommended actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { category: 'Critical', range: '85–100', color: 'destructive', action: 'Must be scheduled at the earliest possible block window. Safety risk is imminent.', count: requests.filter((r) => r.priorityCategory === 'Critical').length },
              { category: 'High', range: '70–84', color: 'warning', action: 'Should be scheduled in the next available block window. Significant operational or safety impact.', count: requests.filter((r) => r.priorityCategory === 'High').length },
              { category: 'Medium', range: '50–69', color: 'accent', action: 'Schedule within the normal maintenance planning cycle. Moderate impact with reasonable deadline.', count: requests.filter((r) => r.priorityCategory === 'Medium').length },
              { category: 'Low', range: '0–49', color: 'success', action: 'Can be deferred to the next planning period. Low impact and flexible deadline.', count: requests.filter((r) => r.priorityCategory === 'Low').length },
            ].map((cat) => (
              <div key={cat.category} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={cat.category as 'Critical' | 'High' | 'Medium' | 'Low'} />
                    <span className="text-xs font-mono text-muted-foreground">Score {cat.range}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{cat.count} requests</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{cat.action}</p>
              </div>
            ))}

            <Separator />

            <div className="flex items-start gap-2 rounded-md bg-accent/5 border border-accent/20 p-3">
              <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Important:</span> The AI Priority Engine provides recommendations only. Controllers review and approve all priority assignments before they are acted upon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score explanation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reason for Priority</CardTitle>
          <CardDescription>Plain-language explanation generated for each request</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{exampleRequest.id} — {exampleRequest.maintenanceType}</p>
                <p className="text-sm text-muted-foreground mt-1">{exampleRequest.reason}</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <InfoTooltip text="The priority reason explains why the AI assigned this category, making it understandable for controllers who may not be AI experts." />
                  <span className="text-muted-foreground">Each request includes a human-readable explanation of its priority assignment</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
