'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  DepartmentBadge,
  PriorityBadge,
  SeverityBadge,
  StatusBadge,
  SourceSystemBadge,
  InfoTooltip,
} from '@/components/shared';
import { SectionHeader } from '@/components/stat-card';
import { getMaintenanceRequests } from '@/lib/data';
import type { MaintenanceRequest } from '@/lib/types';

const PAGE_SIZE = 8;

type SortField = 'priorityScore' | 'deadline' | 'requiredDuration' | 'requestId';
type SortDir = 'asc' | 'desc';

export default function MaintenanceRequestsPage() {
  const allRequests = getMaintenanceRequests();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('priorityScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = allRequests.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.id.toLowerCase().includes(q) &&
          !r.assetId.toLowerCase().includes(q) &&
          !r.location.toLowerCase().includes(q) &&
          !r.maintenanceType.toLowerCase().includes(q)
        )
          return false;
      }
      if (deptFilter !== 'all' && r.department !== deptFilter) return false;
      if (priorityFilter !== 'all' && r.priorityCategory !== priorityFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'priorityScore':
          cmp = a.priorityScore - b.priorityScore;
          break;
        case 'deadline':
          cmp = a.deadline.localeCompare(b.deadline);
          break;
        case 'requiredDuration':
          cmp = a.requiredDuration - b.requiredDuration;
          break;
        case 'requestId':
          cmp = a.id.localeCompare(b.id);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [allRequests, search, deptFilter, priorityFilter, statusFilter, severityFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const selectedRequest = selectedId ? allRequests.find((r) => r.id === selectedId) : null;

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function resetFilters() {
    setSearch('');
    setDeptFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
    setSeverityFilter('all');
    setPage(0);
  }

  const hasFilters = search || deptFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' || severityFilter !== 'all';

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Maintenance Requests"
        description="Unified view of all maintenance requests from TMS, SMMS, and TDMS systems"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by request ID, asset, location, or activity..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="S&T">S&amp;T</SelectItem>
                  <SelectItem value="Traction">Traction</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9">
                  <X className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{pageData.length}</span> of{' '}
          <span className="font-semibold text-foreground">{filtered.length}</span> requests
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Sorted by</span>
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priorityScore">Priority Score</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="requiredDuration">Duration</SelectItem>
              <SelectItem value="requestId">Request ID</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}>
            {sortDir === 'desc' ? '↓ Desc' : '↑ Asc'}
          </Button>
        </div>
      </div>

      {/* Data table */}
      <Card>
        <CardContent className="p-0">
          {pageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">No requests found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 cursor-pointer select-none" onClick={() => handleSort('requestId')}>
                    Request ID {sortField === 'requestId' && (sortDir === 'desc' ? '↓' : '↑')}
                  </TableHead>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('priorityScore')}>
                    Priority {sortField === 'priorityScore' && (sortDir === 'desc' ? '↓' : '↑')}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('requiredDuration')}>
                    Duration {sortField === 'requiredDuration' && (sortDir === 'desc' ? '↓' : '↑')}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('deadline')}>
                    Deadline {sortField === 'deadline' && (sortDir === 'desc' ? '↓' : '↑')}
                  </TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((req) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(req.id)}
                  >
                    <TableCell className="pl-6 font-mono text-xs font-semibold">{req.id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{req.assetId}</TableCell>
                    <TableCell><DepartmentBadge department={req.department} /></TableCell>
                    <TableCell><SourceSystemBadge source={req.sourceSystem} /></TableCell>
                    <TableCell><Badge variant="secondary" className="font-mono text-[10px]">{req.section}</Badge></TableCell>
                    <TableCell className="text-sm">{req.maintenanceType}</TableCell>
                    <TableCell><SeverityBadge severity={req.severity} /></TableCell>
                    <TableCell><PriorityBadge priority={req.priorityCategory} score={req.priorityScore} /></TableCell>
                    <TableCell className="text-sm font-mono">{req.requiredDuration}h</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{req.deadline}</TableCell>
                    <TableCell className="pr-6"><StatusBadge status={req.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail sheet */}
      <Sheet open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto scrollbar-thin">
          {selectedRequest && <RequestDetail request={selectedRequest} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RequestDetail({ request }: { request: MaintenanceRequest }) {
  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="font-mono">{request.id}</SheetTitle>
        <SheetDescription>{request.maintenanceType} — {request.location}</SheetDescription>
      </SheetHeader>

      <div className="flex flex-wrap gap-2">
        <DepartmentBadge department={request.department} />
        <SourceSystemBadge source={request.sourceSystem} />
        <SeverityBadge severity={request.severity} />
        <StatusBadge status={request.status} />
      </div>

      <p className="text-sm text-muted-foreground">{request.description}</p>

      {/* Priority score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            AI Priority Score
            <InfoTooltip text="A 0-100 score calculated by the AI Priority Engine combining safety, operational impact, urgency, asset criticality, and failure history." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <PriorityBadge priority={request.priorityCategory} />
            <span className="text-2xl font-bold tabular-nums">{request.priorityScore}</span>
          </div>
          <Progress value={request.priorityScore} className="h-2" />
          <p className="text-xs text-muted-foreground">{request.reason}</p>
        </CardContent>
      </Card>

      {/* Factor breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Scoring Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {[
            { label: 'Safety Impact', value: request.factors.safetyImpact, weight: '35%' },
            { label: 'Operational Impact', value: request.factors.operationalImpact, weight: '25%' },
            { label: 'Urgency / Deadline', value: request.factors.urgency, weight: '20%' },
            { label: 'Asset Criticality', value: request.factors.assetCriticality, weight: '15%' },
            { label: 'Failure History', value: request.factors.failureHistory, weight: '5%' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="text-xs w-32 shrink-0 text-muted-foreground">{f.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${f.value}%` }} />
              </div>
              <span className="text-xs font-mono w-8 text-right">{f.value}</span>
              <span className="text-xs text-muted-foreground/60 w-8">{f.weight}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="Asset ID" value={request.assetId} mono />
        <DetailField label="Section" value={request.section} mono />
        <DetailField label="Location" value={request.location} />
        <DetailField label="Maintenance Type" value={request.maintenanceType} />
        <DetailField label="Required Duration" value={`${request.requiredDuration} hours`} />
        <DetailField label="Deadline" value={request.deadline} mono />
        <DetailField label="Created" value={request.createdAt} mono />
        <DetailField label="Source System" value={request.sourceSystem} mono />
      </div>

      <Separator />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        This request is part of the Rail Optimizer prototype. All data is synthetic.
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
