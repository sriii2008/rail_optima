import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import type {
  Department,
  PriorityCategory,
  RequestStatus,
  Severity,
  BlockStatus,
} from '@/lib/types';

export function DepartmentBadge({ department, className }: { department: Department; className?: string }) {
  const styles: Record<Department, string> = {
    Engineering: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
    'S&T': 'bg-chart-2/10 text-chart-2 border-chart-2/30',
    Traction: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
  };
  const labels: Record<Department, string> = {
    Engineering: 'Engineering',
    'S&T': 'S&T',
    Traction: 'Traction',
  };
  return (
    <Badge variant="outline" className={cn('font-medium', styles[department], className)}>
      {labels[department]}
    </Badge>
  );
}

export function PriorityBadge({ priority, score, className }: { priority: PriorityCategory; score?: number; className?: string }) {
  const styles: Record<PriorityCategory, string> = {
    Critical: 'bg-destructive/10 text-destructive border-destructive/30',
    High: 'bg-warning/10 text-warning border-warning/30',
    Medium: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
    Low: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Badge variant="outline" className={cn('font-medium', styles[priority])}>
        {priority}
      </Badge>
      {score !== undefined && (
        <span className="text-xs font-mono font-semibold text-muted-foreground">{score}</span>
      )}
    </span>
  );
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const styles: Record<Severity, string> = {
    Critical: 'bg-destructive text-destructive-foreground border-transparent',
    High: 'bg-warning text-warning-foreground border-transparent',
    Medium: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
    Low: 'bg-muted text-muted-foreground border-border',
  };
  return (
    <Badge variant="outline" className={cn('font-medium', styles[severity], className)}>
      {severity}
    </Badge>
  );
}

export function StatusBadge({ status, className }: { status: RequestStatus | BlockStatus; className?: string }) {
  const styles: Record<string, string> = {
    'Pending Review': 'bg-warning/10 text-warning border-warning/30',
    Approved: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
    Scheduled: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
    Completed: 'bg-success/10 text-success border-success/30',
    Rejected: 'bg-destructive/10 text-destructive border-destructive/30',
  };
  return (
    <Badge variant="outline" className={cn('font-medium', styles[status] || 'bg-muted text-muted-foreground', className)}>
      {status}
    </Badge>
  );
}

export function SourceSystemBadge({ source, className }: { source: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn('font-mono text-[10px] font-semibold', className)}>
      {source}
    </Badge>
  );
}

export function InfoTooltip({ text, className }: { text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={cn('inline-flex items-center', className)} tabIndex={-1}>
          <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export function DepartmentDot({ department, className }: { department: Department; className?: string }) {
  const colors: Record<Department, string> = {
    Engineering: 'bg-chart-1',
    'S&T': 'bg-chart-2',
    Traction: 'bg-chart-3',
  };
  return <span className={cn('inline-block h-2.5 w-2.5 rounded-full', colors[department], className)} />;
}

export function PrototypeNotice({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-md border border-warning/20 bg-warning/5 px-3 py-2 text-xs', className)}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning animate-pulse-soft" />
      <span className="text-muted-foreground">
        <span className="font-semibold text-warning-foreground">Prototype Simulation</span> — Results are based on synthetic data and are for demonstration only.
      </span>
    </div>
  );
}
