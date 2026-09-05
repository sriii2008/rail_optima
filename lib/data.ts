import type {
  MaintenanceRequest,
  MaintenanceBlock,
  MonthlyActivity,
  AssetInfo,
  AvailabilityTrendPoint,
  SectionAvailability,
  DepartmentWorkload,
  GlossaryTerm,
  Notification,
  Department,
  SourceSystem,
  Severity,
  MaintenanceType,
  Section,
} from './types';

// ============================================================================
// Rail Optimizer — Synthetic / Demo Data
//
// This is a centralized mock data service layer. In production, these
// functions would be replaced with API calls to a Python FastAPI backend.
// The function signatures are designed to mirror REST endpoints so the
// swap is straightforward:
//
//   getMaintenanceRequests()  ->  GET /api/maintenance-requests
//   getWeeklyPlan()           ->  GET /api/weekly-plan
//   getMonthlyPlan()          ->  GET /api/monthly-plan
//   getAssets()               ->  GET /api/assets
//   runOptimization(params)   ->  POST /api/optimize
//
// All data is SYNTHETIC and for prototype demonstration only.
// ============================================================================

const SECTIONS: Section[] = ['SEC-A', 'SEC-B', 'SEC-C', 'SEC-D', 'SEC-E'];

const MAINTENANCE_TYPES_BY_DEPT: Record<Department, MaintenanceType[]> = {
  Engineering: [
    'Track Inspection',
    'Rail Defect Repair',
    'Sleeper Replacement',
    'Track Geometry Maintenance',
    'Point & Crossing Maintenance',
  ],
  'S&T': [
    'Signal Maintenance',
    'Interlocking Maintenance',
    'Communication Equipment Maintenance',
  ],
  Traction: [
    'OHE Inspection',
    'OHE Maintenance',
    'Traction Equipment Maintenance',
  ],
};

const SOURCE_BY_DEPT: Record<Department, SourceSystem> = {
  Engineering: 'TMS',
  'S&T': 'SMMS',
  Traction: 'TDMS',
};

function priorityFromScore(score: number) {
  if (score >= 85) return 'Critical' as const;
  if (score >= 70) return 'High' as const;
  if (score >= 50) return 'Medium' as const;
  return 'Low' as const;
}

function severityFromScore(score: number): Severity {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

function daysFromNow(days: number): string {
  const d = new Date(2026, 8, 7); // base date: Sep 7, 2026 (Monday)
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// -- Maintenance Requests ----------------------------------------------------

const REQUEST_SEED: Array<{
  prefix: SourceSystem;
  dept: Department;
  type: MaintenanceType;
  section: Section;
  location: string;
  assetId: string;
  score: number;
  duration: number;
  deadlineDays: number;
  status: MaintenanceRequest['status'];
  desc: string;
}> = [
  // TMS — Engineering
  { prefix: 'TMS', dept: 'Engineering', type: 'Track Inspection', section: 'SEC-A', location: 'KM 42.5–48.0', assetId: 'ENG-TRK-A01', score: 88, duration: 2, deadlineDays: 3, status: 'Pending Review', desc: 'Routine track geometry inspection on mainline corridor SEC-A. Rail surface showing early signs of wear.' },
  { prefix: 'TMS', dept: 'Engineering', type: 'Rail Defect Repair', section: 'SEC-B', location: 'KM 15.2', assetId: 'ENG-TRK-B03', score: 92, duration: 3, deadlineDays: 2, status: 'Pending Review', desc: 'Detected transverse rail defect via ultrasonic testing. Requires immediate remediation to prevent potential failure.' },
  { prefix: 'TMS', dept: 'Engineering', type: 'Sleeper Replacement', section: 'SEC-C', location: 'KM 8.0–12.0', assetId: 'ENG-TRK-C02', score: 65, duration: 4, deadlineDays: 14, status: 'Approved', desc: 'Batch replacement of 120 degraded concrete sleepers on SEC-C corridor.' },
  { prefix: 'TMS', dept: 'Engineering', type: 'Track Geometry Maintenance', section: 'SEC-A', location: 'KM 42.5–48.0', assetId: 'ENG-TRK-A01', score: 74, duration: 2, deadlineDays: 5, status: 'Scheduled', desc: 'Tamping and ballast regulation to restore track geometry parameters on high-speed section.' },
  { prefix: 'TMS', dept: 'Engineering', type: 'Point & Crossing Maintenance', section: 'SEC-D', location: 'Station North Junction', assetId: 'ENG-PX-D01', score: 79, duration: 1.5, deadlineDays: 7, status: 'Pending Review', desc: 'Routine inspection and lubrication of point machine mechanism at North Junction crossover.' },
  { prefix: 'TMS', dept: 'Engineering', type: 'Track Inspection', section: 'SEC-E', location: 'KM 60.0–67.0', assetId: 'ENG-TRK-E01', score: 52, duration: 2, deadlineDays: 21, status: 'Pending Review', desc: 'Scheduled visual and ultrasonic track inspection on branch line SEC-E.' },
  // SMMS — S&T
  { prefix: 'SMMS', dept: 'S&T', type: 'Signal Maintenance', section: 'SEC-A', location: 'Signal Cabin A-3', assetId: 'SNT-SIG-A03', score: 81, duration: 1, deadlineDays: 4, status: 'Pending Review', desc: 'Signal lamp replacement and relay testing at A-3 cabin. Approaching signal aspect failure threshold.' },
  { prefix: 'SMMS', dept: 'S&T', type: 'Interlocking Maintenance', section: 'SEC-B', location: 'Station Central Yard', assetId: 'SNT-INT-B01', score: 73, duration: 1.5, deadlineDays: 10, status: 'Approved', desc: 'Periodic interlocking logic verification and panel testing at Central Yard.' },
  { prefix: 'SMMS', dept: 'S&T', type: 'Communication Equipment Maintenance', section: 'SEC-C', location: 'KM 10.0 Telecom Hut', assetId: 'SNT-COM-C02', score: 58, duration: 1, deadlineDays: 18, status: 'Pending Review', desc: 'VHF radio base station calibration and antenna inspection at SEC-C telecom hut.' },
  { prefix: 'SMMS', dept: 'S&T', type: 'Signal Maintenance', section: 'SEC-A', location: 'Signal Cabin A-7', assetId: 'SNT-SIG-A07', score: 90, duration: 1, deadlineDays: 1, status: 'Pending Review', desc: 'Critical signal cable insulation failure detected at A-7. Requires urgent maintenance to maintain safe signalling operations.' },
  { prefix: 'SMMS', dept: 'S&T', type: 'Interlocking Maintenance', section: 'SEC-D', location: 'North Junction', assetId: 'SNT-INT-D01', score: 67, duration: 2, deadlineDays: 12, status: 'Scheduled', desc: 'Route interlocking system upgrade and relay contact cleaning at North Junction.' },
  // TDMS — Traction
  { prefix: 'TDMS', dept: 'Traction', type: 'OHE Inspection', section: 'SEC-A', location: 'KM 42.5–48.0', assetId: 'TRC-OHE-A01', score: 84, duration: 2, deadlineDays: 3, status: 'Pending Review', desc: 'OHE contact wire wear measurement and stagger inspection on electrified mainline SEC-A.' },
  { prefix: 'TDMS', dept: 'Traction', type: 'OHE Maintenance', section: 'SEC-A', location: 'KM 45.0', assetId: 'TRC-OHE-A02', score: 86, duration: 2, deadlineDays: 4, status: 'Pending Review', desc: 'OHE bracket arm adjustment and tensioning regulator maintenance. Wear exceeds maintenance threshold.' },
  { prefix: 'TDMS', dept: 'Traction', type: 'Traction Equipment Maintenance', section: 'SEC-C', location: 'Substation C-2', assetId: 'TRC-SS-C02', score: 77, duration: 2, deadlineDays: 8, status: 'Approved', desc: 'Traction transformer cooling system inspection and oil sampling at substation C-2.' },
  { prefix: 'TDMS', dept: 'Traction', type: 'OHE Inspection', section: 'SEC-B', location: 'KM 18.0–22.0', assetId: 'TRC-OHE-B01', score: 61, duration: 1.5, deadlineDays: 16, status: 'Pending Review', desc: 'Routine OHE visual inspection and insulator cleaning on SEC-B electrified section.' },
  { prefix: 'TDMS', dept: 'Traction', type: 'Traction Equipment Maintenance', section: 'SEC-E', location: 'Substation E-1', assetId: 'TRC-SS-E01', score: 55, duration: 2, deadlineDays: 20, status: 'Completed', desc: 'Protective relay calibration and breaker timing test at substation E-1.' },
  // BDMS — Block requests
  { prefix: 'BDMS', dept: 'Engineering', type: 'Track Geometry Maintenance', section: 'SEC-B', location: 'KM 15.2', assetId: 'ENG-TRK-B03', score: 71, duration: 3, deadlineDays: 2, status: 'Pending Review', desc: 'Block request for rail defect remediation. Requires traffic block on SEC-B mainline.' },
  { prefix: 'BDMS', dept: 'S&T', type: 'Signal Maintenance', section: 'SEC-D', location: 'North Junction', assetId: 'SNT-INT-D01', score: 64, duration: 2, deadlineDays: 12, status: 'Approved', desc: 'Block disconnection request for interlocking maintenance at North Junction.' },
];

function buildRequest(seed: typeof REQUEST_SEED[0], idx: number): MaintenanceRequest {
  const num = String(idx + 1).padStart(3, '0');
  const id = `${seed.prefix}-${num}`;
  const safetyImpact = Math.round(seed.score * 0.35 + (idx % 5) * 2);
  const operationalImpact = Math.round(seed.score * 0.25 + (idx % 3) * 4);
  const urgency = Math.round((100 - seed.deadlineDays * 4) * 0.2);
  const assetCriticality = Math.round(seed.score * 0.15);
  const failureHistory = Math.round((seed.score * 0.05) + (idx % 7));
  const totalScore = Math.min(
    99,
    Math.max(
      30,
      Math.round(
        safetyImpact * (35 / 100) +
        operationalImpact * (25 / 100) +
        urgency * (20 / 100) +
        assetCriticality * (15 / 100) +
        failureHistory * (5 / 100)
      )
    )
  );

  const reasons: Record<string, string> = {
    Critical: 'Immediate safety risk with high operational impact. Deadline is imminent. Must be prioritized before all other categories.',
    High: 'Significant safety or operational impact. Urgent deadline. Should be scheduled at the earliest available block window.',
    Medium: 'Moderate impact with reasonable deadline window. Schedule within normal maintenance planning cycle.',
    Low: 'Low impact with flexible deadline. Can be deferred to next planning period without operational risk.',
  };
  const cat = priorityFromScore(totalScore);

  return {
    id,
    assetId: seed.assetId,
    department: seed.dept,
    sourceSystem: seed.prefix === 'BDMS' ? 'BDMS' : SOURCE_BY_DEPT[seed.dept],
    section: seed.section,
    location: seed.location,
    maintenanceType: seed.type,
    severity: severityFromScore(seed.score),
    priorityScore: totalScore,
    priorityCategory: cat,
    requiredDuration: seed.duration,
    deadline: daysFromNow(seed.deadlineDays),
    status: seed.status,
    description: seed.desc,
    createdAt: daysFromNow(-5 + (idx % 6)),
    factors: {
      safetyImpact: Math.min(100, safetyImpact),
      operationalImpact: Math.min(100, operationalImpact),
      urgency: Math.min(100, urgency),
      assetCriticality: Math.min(100, assetCriticality),
      failureHistory: Math.min(100, failureHistory),
    },
    reason: reasons[cat],
  };
}

let _requests: MaintenanceRequest[] | null = null;

export function getMaintenanceRequests(): MaintenanceRequest[] {
  if (_requests) return _requests;
  _requests = REQUEST_SEED.map(buildRequest);
  return _requests;
}

export function getRequestById(id: string): MaintenanceRequest | undefined {
  return getMaintenanceRequests().find((r) => r.id === id);
}

// -- Weekly Plan / Maintenance Blocks ----------------------------------------

let _weeklyBlocks: MaintenanceBlock[] | null = null;

export function getWeeklyPlan(): MaintenanceBlock[] {
  if (_weeklyBlocks) return _weeklyBlocks;

  const reqs = getMaintenanceRequests();
  const scheduled = reqs.filter((r) => r.status === 'Pending Review' || r.status === 'Approved' || r.status === 'Scheduled');

  // Define a realistic block schedule across 7 days
  const blockLayout: Array<{
    reqIdx: number;
    day: number;
    start: string;
    end: string;
    coordinated: boolean;
    coordinatedWith?: string[];
    impact: MaintenanceBlock['operationalImpact'];
    status: MaintenanceBlock['status'];
  }> = [
    // Day 0 (Monday) — Coordinated block on SEC-A
    { reqIdx: 0, day: 0, start: '10:00', end: '12:00', coordinated: true, coordinatedWith: ['SNT-SIG-A07', 'TRC-OHE-A01'], impact: 'High', status: 'Pending Review' },
    { reqIdx: 9, day: 0, start: '10:00', end: '11:00', coordinated: true, coordinatedWith: ['TMS-001', 'TRC-OHE-A01'], impact: 'High', status: 'Pending Review' },
    { reqIdx: 11, day: 0, start: '10:00', end: '12:00', coordinated: true, coordinatedWith: ['TMS-001', 'SMMS-004'], impact: 'High', status: 'Pending Review' },
    // Day 1 (Tuesday) — SEC-B rail defect
    { reqIdx: 1, day: 1, start: '02:00', end: '05:00', coordinated: false, impact: 'Medium', status: 'Pending Review' },
    { reqIdx: 16, day: 1, start: '02:00', end: '05:00', coordinated: false, impact: 'Medium', status: 'Pending Review' },
    // Day 2 (Wednesday) — SEC-C sleeper replacement
    { reqIdx: 2, day: 2, start: '01:00', end: '05:00', coordinated: false, impact: 'Medium', status: 'Approved' },
    // Day 2 (Wednesday) — SEC-C OHE + S&T coordination
    { reqIdx: 8, day: 2, start: '01:00', end: '02:00', coordinated: true, coordinatedWith: ['TMS-003'], impact: 'Low', status: 'Approved' },
    // Day 3 (Thursday) — SEC-A track geometry
    { reqIdx: 3, day: 3, start: '11:00', end: '13:00', coordinated: false, impact: 'Medium', status: 'Scheduled' },
    // Day 3 (Thursday) — SEC-D point & crossing
    { reqIdx: 4, day: 3, start: '14:00', end: '15:30', coordinated: false, impact: 'Low', status: 'Pending Review' },
    { reqIdx: 10, day: 3, start: '14:00', end: '16:00', coordinated: true, coordinatedWith: ['TMS-005'], impact: 'Low', status: 'Pending Review' },
    // Day 4 (Friday) — SEC-A OHE maintenance
    { reqIdx: 12, day: 4, start: '09:00', end: '11:00', coordinated: false, impact: 'High', status: 'Pending Review' },
    // Day 4 (Friday) — SEC-C traction substation
    { reqIdx: 13, day: 4, start: '12:00', end: '14:00', coordinated: false, impact: 'Medium', status: 'Approved' },
    // Day 5 (Saturday) — SEC-B interlocking
    { reqIdx: 7, day: 5, start: '08:00', end: '09:30', coordinated: false, impact: 'Low', status: 'Approved' },
    // Day 5 (Saturday) — SEC-B OHE inspection
    { reqIdx: 14, day: 5, start: '08:00', end: '09:30', coordinated: true, coordinatedWith: ['SMMS-002'], impact: 'Low', status: 'Pending Review' },
    // Day 6 (Sunday) — SEC-E track inspection
    { reqIdx: 5, day: 6, start: '06:00', end: '08:00', coordinated: false, impact: 'None', status: 'Pending Review' },
  ];

  _weeklyBlocks = blockLayout.map((b, i) => {
    const req = reqs[b.reqIdx];
    const [sh, sm] = b.start.split(':').map(Number);
    const [eh, em] = b.end.split(':').map(Number);
    const duration = eh - sh + (em - sm) / 60;
    const id = `BLK-${String(i + 1).padStart(3, '0')}`;

    const explanations: Record<string, string> = {
      coordinated: `High-priority ${req.department} maintenance was scheduled during a lower-impact operational window. Compatible work from ${b.coordinatedWith?.length || 0} other department(s) was grouped into the same block to reduce repeated infrastructure downtime. Actual coordination depends on safety, technical compatibility, resources, and railway rules.`,
      standalone: `${req.department} maintenance scheduled in the earliest available block window that minimizes train operational impact. Duration optimized to match the required maintenance activity while respecting the deadline of ${req.deadline}.`,
    };

    return {
      id,
      requestId: req.id,
      activity: req.maintenanceType,
      department: req.department,
      section: req.section,
      location: req.location,
      day: b.day,
      startTime: b.start,
      endTime: b.end,
      duration,
      priority: req.priorityCategory,
      priorityScore: req.priorityScore,
      operationalImpact: b.impact,
      status: b.status,
      coordinated: b.coordinated,
      coordinatedWith: b.coordinatedWith,
      trainImpact:
        b.impact === 'High'
          ? '3–5 trains affected, 15–30 min delay'
          : b.impact === 'Medium'
          ? '1–2 trains affected, up to 15 min delay'
          : b.impact === 'Low'
          ? 'Minimal impact, 1 train with <10 min delay'
          : 'No train services affected',
      optimizationExplanation: b.coordinated ? explanations.coordinated : explanations.standalone,
      assetId: req.assetId,
    };
  });

  return _weeklyBlocks;
}

export function getBlockById(id: string): MaintenanceBlock | undefined {
  return getWeeklyPlan().find((b) => b.id === id);
}

// -- Monthly Plan ------------------------------------------------------------

let _monthlyActivities: MonthlyActivity[] | null = null;

export function getMonthlyPlan(): MonthlyActivity[] {
  if (_monthlyActivities) return _monthlyActivities;

  const reqs = getMaintenanceRequests();
  const activities: MonthlyActivity[] = [];

  // Spread the weekly plan across the month of September 2026
  const monthSchedules: Array<{ day: number; reqIdx: number; coordinated: boolean }> = [
    { day: 7, reqIdx: 0, coordinated: true },
    { day: 7, reqIdx: 9, coordinated: true },
    { day: 7, reqIdx: 11, coordinated: true },
    { day: 8, reqIdx: 1, coordinated: false },
    { day: 9, reqIdx: 2, coordinated: false },
    { day: 9, reqIdx: 8, coordinated: true },
    { day: 10, reqIdx: 3, coordinated: false },
    { day: 10, reqIdx: 4, coordinated: false },
    { day: 10, reqIdx: 10, coordinated: true },
    { day: 11, reqIdx: 12, coordinated: false },
    { day: 11, reqIdx: 13, coordinated: false },
    { day: 12, reqIdx: 7, coordinated: false },
    { day: 12, reqIdx: 14, coordinated: true },
    { day: 13, reqIdx: 5, coordinated: false },
    // Week 3
    { day: 14, reqIdx: 0, coordinated: true },
    { day: 15, reqIdx: 6, coordinated: false },
    { day: 16, reqIdx: 15, coordinated: false },
    { day: 17, reqIdx: 17, coordinated: false },
    { day: 18, reqIdx: 1, coordinated: false },
    { day: 19, reqIdx: 3, coordinated: false },
    { day: 20, reqIdx: 4, coordinated: false },
    // Week 4
    { day: 21, reqIdx: 11, coordinated: true },
    { day: 22, reqIdx: 13, coordinated: false },
    { day: 23, reqIdx: 9, coordinated: false },
    { day: 24, reqIdx: 2, coordinated: false },
    { day: 25, reqIdx: 12, coordinated: false },
    { day: 26, reqIdx: 7, coordinated: false },
    { day: 27, reqIdx: 14, coordinated: true },
    // End of month
    { day: 28, reqIdx: 0, coordinated: true },
    { day: 29, reqIdx: 5, coordinated: false },
    { day: 30, reqIdx: 16, coordinated: false },
  ];

  _monthlyActivities = monthSchedules.map((s, i) => {
    const req = reqs[s.reqIdx];
    const date = new Date(2026, 8, s.day).toISOString().split('T')[0];
    return {
      id: `MON-${String(i + 1).padStart(3, '0')}`,
      date,
      activity: req.maintenanceType,
      department: req.department,
      section: req.section,
      priority: req.priorityCategory,
      status: s.day < 10 ? 'Completed' : s.day < 14 ? 'Scheduled' : 'Pending Review',
      duration: req.requiredDuration,
      coordinated: s.coordinated,
    };
  });

  return _monthlyActivities;
}

// -- Assets & Availability ---------------------------------------------------

let _assets: AssetInfo[] | null = null;

export function getAssets(): AssetInfo[] {
  if (_assets) return _assets;
  _assets = [
    { id: 'ENG-TRK-A01', name: 'Track Mainline SEC-A', department: 'Engineering', section: 'SEC-A', availability: 96.2, downtime: 6.7, status: 'Under Maintenance', type: 'Track Infrastructure' },
    { id: 'ENG-TRK-B03', name: 'Track Mainline SEC-B', department: 'Engineering', section: 'SEC-B', availability: 92.8, downtime: 12.3, status: 'Restricted', type: 'Track Infrastructure' },
    { id: 'ENG-TRK-C02', name: 'Track Branch SEC-C', department: 'Engineering', section: 'SEC-C', availability: 98.1, downtime: 3.3, status: 'Available', type: 'Track Infrastructure' },
    { id: 'ENG-TRK-E01', name: 'Track Branch SEC-E', department: 'Engineering', section: 'SEC-E', availability: 99.0, downtime: 1.7, status: 'Available', type: 'Track Infrastructure' },
    { id: 'ENG-PX-D01', name: 'Points North Junction', department: 'Engineering', section: 'SEC-D', availability: 94.5, downtime: 9.8, status: 'Available', type: 'Point & Crossing' },
    { id: 'SNT-SIG-A03', name: 'Signal Cabin A-3', department: 'S&T', section: 'SEC-A', availability: 95.1, downtime: 7.8, status: 'Available', type: 'Signalling' },
    { id: 'SNT-SIG-A07', name: 'Signal Cabin A-7', department: 'S&T', section: 'SEC-A', availability: 87.3, downtime: 19.4, status: 'Under Maintenance', type: 'Signalling' },
    { id: 'SNT-INT-B01', name: 'Interlocking Central Yard', department: 'S&T', section: 'SEC-B', availability: 97.2, downtime: 4.6, status: 'Available', type: 'Interlocking' },
    { id: 'SNT-INT-D01', name: 'Interlocking North Junction', department: 'S&T', section: 'SEC-D', availability: 93.6, downtime: 11.1, status: 'Restricted', type: 'Interlocking' },
    { id: 'SNT-COM-C02', name: 'Telecom Hut SEC-C', department: 'S&T', section: 'SEC-C', availability: 98.7, downtime: 2.3, status: 'Available', type: 'Communication' },
    { id: 'TRC-OHE-A01', name: 'OHE Mainline SEC-A', department: 'Traction', section: 'SEC-A', availability: 94.8, downtime: 8.5, status: 'Under Maintenance', type: 'Overhead Equipment' },
    { id: 'TRC-OHE-A02', name: 'OHE Bracket SEC-A', department: 'Traction', section: 'SEC-A', availability: 90.1, downtime: 16.2, status: 'Under Maintenance', type: 'Overhead Equipment' },
    { id: 'TRC-OHE-B01', name: 'OHE Mainline SEC-B', department: 'Traction', section: 'SEC-B', availability: 96.9, downtime: 5.4, status: 'Available', type: 'Overhead Equipment' },
    { id: 'TRC-SS-C02', name: 'Traction Substation C-2', department: 'Traction', section: 'SEC-C', availability: 95.7, downtime: 7.1, status: 'Available', type: 'Traction Substation' },
    { id: 'TRC-SS-E01', name: 'Traction Substation E-1', department: 'Traction', section: 'SEC-E', availability: 99.2, downtime: 1.1, status: 'Available', type: 'Traction Substation' },
  ];
  return _assets;
}

let _availabilityTrend: AvailabilityTrendPoint[] | null = null;

export function getAvailabilityTrend(): AvailabilityTrendPoint[] {
  if (_availabilityTrend) return _availabilityTrend;
  const days = ['Sep 1', 'Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Sep 6', 'Sep 7'];
  _availabilityTrend = days.map((d, i) => {
    const engineering = 92 + Math.sin(i * 0.8) * 4 + i * 0.3;
    const snt = 88 + Math.cos(i * 0.6) * 5 + i * 0.4;
    const traction = 90 + Math.sin(i * 0.5 + 1) * 4 + i * 0.5;
    const overall = (engineering + snt + traction) / 3;
    return {
      date: d,
      engineering: Math.round(engineering * 10) / 10,
      snt: Math.round(snt * 10) / 10,
      traction: Math.round(traction * 10) / 10,
      overall: Math.round(overall * 10) / 10,
    };
  });
  return _availabilityTrend;
}

let _sectionAvailability: SectionAvailability[] | null = null;

export function getSectionAvailability(): SectionAvailability[] {
  if (_sectionAvailability) return _sectionAvailability;
  _sectionAvailability = [
    { section: 'SEC-A', availability: 93.4, downtime: 15.2 },
    { section: 'SEC-B', availability: 95.1, downtime: 11.8 },
    { section: 'SEC-C', availability: 97.8, downtime: 4.2 },
    { section: 'SEC-D', availability: 94.0, downtime: 9.6 },
    { section: 'SEC-E', availability: 98.5, downtime: 2.1 },
  ];
  return _sectionAvailability;
}

export function getDepartmentWorkloads(): DepartmentWorkload[] {
  const reqs = getMaintenanceRequests();
  const depts: Department[] = ['Engineering', 'S&T', 'Traction'];
  return depts.map((d) => {
    const deptReqs = reqs.filter((r) => r.department === d);
    return {
      department: d,
      activeRequests: deptReqs.filter((r) => r.status === 'Pending Review' || r.status === 'Approved').length,
      pendingRequests: deptReqs.filter((r) => r.status === 'Pending Review').length,
      completedThisWeek: deptReqs.filter((r) => r.status === 'Completed').length,
      hoursScheduled: deptReqs.filter((r) => r.status !== 'Completed').reduce((s, r) => s + r.requiredDuration, 0),
    };
  });
}

// -- Notifications -----------------------------------------------------------

let _notifications: Notification[] | null = null;

export function getNotifications(): Notification[] {
  if (_notifications) return _notifications;
  _notifications = [
    { id: 'N1', title: 'Critical: Signal Cable Failure', message: 'SMMS-004 — Signal cable insulation failure at Cabin A-7 requires immediate attention.', time: '12 min ago', type: 'warning', read: false },
    { id: 'N2', title: 'Coordinated Block Pending Review', message: 'BLK-001 — Coordinated maintenance block on SEC-A (Mon 10:00–12:00) awaits controller approval.', time: '35 min ago', type: 'info', read: false },
    { id: 'N3', title: 'Rail Defect Repair Approved', message: 'TMS-002 — Rail defect repair on SEC-B has been approved for Tuesday 02:00 block.', time: '1 hour ago', type: 'success', read: false },
    { id: 'N4', title: 'OHE Maintenance Deadline', message: 'TDMS-002 — OHE bracket maintenance on SEC-A deadline approaching in 4 days.', time: '2 hours ago', type: 'warning', read: true },
    { id: 'N5', title: 'Weekly Plan Generated', message: 'Optimized weekly plan for Sep 7–13 has been generated with 13 blocks and 5 coordinated blocks.', time: '3 hours ago', type: 'info', read: true },
  ];
  return _notifications;
}

// -- Glossary ----------------------------------------------------------------

export function getGlossaryTerms(): GlossaryTerm[] {
  return [
    { term: 'Block', abbreviation: 'Maintenance Block', definition: 'A scheduled time window during which a section of railway track is taken out of service so that maintenance work can be performed safely. During a block, train movements are restricted or suspended on that section.' },
    { term: 'Asset Availability', definition: 'The percentage of planned operating time during which an asset (track, signal, OHE, etc.) remains available for train operations. Higher availability means less downtime and better service reliability.' },
    { term: 'Priority Score', definition: 'A numerical score (0–100) calculated by the AI Priority Engine that ranks maintenance requests by urgency and importance. The score combines safety impact, operational impact, deadline urgency, asset criticality, and historical failure patterns.' },
    { term: 'Track Management System', abbreviation: 'TMS', definition: 'The existing system used by the Engineering department to manage track infrastructure, inspections, defects, and maintenance activities.' },
    { term: 'Signal & Telecommunication Maintenance Management System', abbreviation: 'SMMS', definition: 'The existing system used by the Signal & Telecommunication (S&T) department to manage signalling, interlocking, and communication equipment maintenance.' },
    { term: 'Traction Distribution Management System', abbreviation: 'TDMS', definition: 'The existing system used by the Traction Distribution department to manage overhead equipment (OHE), traction substations, and related electrical infrastructure.' },
    { term: 'Block & Disconnection Management System', abbreviation: 'BDMS', definition: 'The system that manages the process of requesting, approving, and executing track blocks and power disconnections for maintenance work.' },
    { term: 'Control Office Application', abbreviation: 'COA', definition: 'The application used by railway controllers to monitor and manage train operations, track status, and coordinate real-time operational decisions.' },
    { term: 'Coordinated Block', definition: 'A single maintenance block window in which compatible work from multiple departments (Engineering, S&T, Traction) is grouped together. This reduces the total number of blocks needed and minimizes repeated infrastructure downtime. Coordination is subject to safety, technical compatibility, resources, and railway rules.' },
    { term: 'OHE', abbreviation: 'Overhead Equipment', definition: 'The overhead wire system that supplies electrical power to electric trains. Includes contact wires, catenary wires, bracket arms, and tensioning equipment.' },
    { term: 'Point & Crossing', abbreviation: 'P&C', definition: 'Track components that enable trains to move from one track to another, including switches (points) and crossings. Critical for junction and station operations.' },
    { term: 'Interlocking', definition: 'A safety system that prevents conflicting train movements by ensuring that signals and points (switches) are set in a compatible sequence before a route is cleared.' },
  ];
}

// -- Dashboard Aggregates ----------------------------------------------------

export function getDashboardStats() {
  const reqs = getMaintenanceRequests();
  const blocks = getWeeklyPlan();

  return {
    totalRequests: reqs.length,
    criticalRequests: reqs.filter((r) => r.priorityCategory === 'Critical').length,
    upcomingBlocks: blocks.length,
    coordinatedBlocks: blocks.filter((b) => b.coordinated).length,
    pendingReview: reqs.filter((r) => r.status === 'Pending Review').length,
    completed: reqs.filter((r) => r.status === 'Completed').length,
    maintenanceHours: blocks.reduce((s, b) => s + b.duration, 0),
    completionRate: Math.round((reqs.filter((r) => r.status === 'Completed').length / reqs.length) * 100),
    overallAvailability: Math.round(
      getAssets().reduce((s, a) => s + a.availability, 0) / getAssets().length * 10
    ) / 10,
    avoidedConflicts: 7,
    trainImpactHours: Math.round(blocks.reduce((s, b) => s + b.duration * (b.operationalImpact === 'High' ? 1 : b.operationalImpact === 'Medium' ? 0.5 : 0.1), 0) * 10) / 10,
  };
}

export function getRequestsByDepartment() {
  const reqs = getMaintenanceRequests();
  return [
    { department: 'Engineering', count: reqs.filter((r) => r.department === 'Engineering').length, fill: 'hsl(199, 89%, 48%)' },
    { department: 'S&T', count: reqs.filter((r) => r.department === 'S&T').length, fill: 'hsl(142, 71%, 45%)' },
    { department: 'Traction', count: reqs.filter((r) => r.department === 'Traction').length, fill: 'hsl(38, 92%, 50%)' },
  ];
}

export function getPriorityDistribution() {
  const reqs = getMaintenanceRequests();
  return [
    { priority: 'Critical', count: reqs.filter((r) => r.priorityCategory === 'Critical').length, fill: 'hsl(0, 72%, 51%)' },
    { priority: 'High', count: reqs.filter((r) => r.priorityCategory === 'High').length, fill: 'hsl(38, 92%, 50%)' },
    { priority: 'Medium', count: reqs.filter((r) => r.priorityCategory === 'Medium').length, fill: 'hsl(199, 89%, 48%)' },
    { priority: 'Low', count: reqs.filter((r) => r.priorityCategory === 'Low').length, fill: 'hsl(142, 71%, 45%)' },
  ];
}

export function getBlockUtilization() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const blocks = getWeeklyPlan();
  return days.map((day, i) => {
    const dayBlocks = blocks.filter((b) => b.day === i);
    const hours = dayBlocks.reduce((s, b) => s + b.duration, 0);
    return { day, blocks: dayBlocks.length, hours };
  });
}

export function getTodaysPriority() {
  const reqs = getMaintenanceRequests();
  return reqs
    .filter((r) => r.status === 'Pending Review')
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);
}

export function getUpcomingCoordinatedBlocks() {
  const blocks = getWeeklyPlan();
  return blocks.filter((b) => b.coordinated).slice(0, 5);
}

// -- Optimization Simulation (What-If) --------------------------------------

export interface OptimizationInput {
  engineeringDuration: number;
  sntDuration: number;
  tractionDuration: number;
  blockWindowStart: number; // hour
  blockWindowEnd: number; // hour
  priority: 'High' | 'Medium';
  constraints: string[];
}

export interface OptimizationResult {
  currentPlan: {
    blocks: Array<{ department: Department; start: string; end: string; duration: number; conflicts: string[] }>;
    totalBlocks: number;
    totalDuration: number;
    conflicts: number;
    operationalImpact: string;
    completionRate: number;
  };
  optimizedPlan: {
    blocks: Array<{ department: Department; start: string; end: string; duration: number; conflicts: string[] }>;
    totalBlocks: number;
    totalDuration: number;
    conflicts: number;
    operationalImpact: string;
    completionRate: number;
  };
  explanation: string;
}

export function runOptimization(input: OptimizationInput): OptimizationResult {
  const windowStart = input.blockWindowStart;
  const windowEnd = input.blockWindowEnd;
  const windowSize = windowEnd - windowStart;

  const eng = input.engineeringDuration;
  const snt = input.sntDuration;
  const trc = input.tractionDuration;
  const totalSequential = eng + snt + trc;

  // Current plan: sequential blocks on different days/windows
  const currentBlocks = [
    { department: 'Engineering' as Department, start: `${String(windowStart).padStart(2, '0')}:00`, end: `${String(windowStart + eng).padStart(2, '0')}:00`, duration: eng, conflicts: ['Train delay 25 min'] },
    { department: 'S&T' as Department, start: `${String(windowStart).padStart(2, '0')}:00`, end: `${String(windowStart + snt).padStart(2, '0')}:00`, duration: snt, conflicts: ['Train delay 15 min'] },
    { department: 'Traction' as Department, start: `${String(windowStart).padStart(2, '0')}:00`, end: `${String(windowStart + trc).padStart(2, '0')}:00`, duration: trc, conflicts: ['Train delay 20 min'] },
  ];

  // Optimized plan: coordinate into fewer blocks when possible
  const canCoordinate = totalSequential <= windowSize;
  const maxSingle = Math.max(eng, snt, trc);
  const optimizedDuration = canCoordinate ? totalSequential : Math.max(totalSequential, maxSingle * 2);

  let optimizedBlocks: OptimizationResult['optimizedPlan']['blocks'];
  let explanation: string;

  if (canCoordinate) {
    // All work fits in one coordinated block
    const coordEnd = windowStart + totalSequential;
    optimizedBlocks = [
      { department: 'Engineering' as Department, start: `${String(windowStart).padStart(2, '0')}:00`, end: `${String(windowStart + eng).padStart(2, '0')}:00`, duration: eng, conflicts: [] },
      { department: 'S&T' as Department, start: `${String(windowStart + eng).padStart(2, '0')}:00`, end: `${String(windowStart + eng + snt).padStart(2, '0')}:00`, duration: snt, conflicts: [] },
      { department: 'Traction' as Department, start: `${String(windowStart + eng + snt).padStart(2, '0')}:00`, end: `${String(coordEnd).padStart(2, '0')}:00`, duration: trc, conflicts: [] },
    ];
    explanation = `All three department activities (${eng}h Engineering + ${snt}h S&T + ${trc}h Traction = ${totalSequential}h total) fit within the ${windowSize}h block window. The optimizer coordinated them into a single sequential block window, reducing infrastructure downtime from ${totalSequential}h across 3 separate blocks to ${totalSequential}h in 1 coordinated block. This eliminates ${currentBlocks.length - 1} separate track block events. Actual coordination depends on safety, technical compatibility, resources, and railway rules.`;
  } else {
    // Need to split — but still can reduce blocks
    const firstBatch = windowSize;
    const remaining = totalSequential - firstBatch;
    optimizedBlocks = [
      { department: 'Engineering' as Department, start: `${String(windowStart).padStart(2, '0')}:00`, end: `${String(windowStart + Math.min(eng, firstBatch)).padStart(2, '0')}:00`, duration: Math.min(eng, firstBatch), conflicts: [] },
      { department: 'S&T' as Department, start: `${String(windowStart + Math.min(eng, firstBatch)).padStart(2, '0')}:00`, end: `${String(windowStart + Math.min(eng + snt, firstBatch)).padStart(2, '0')}:00`, duration: Math.min(snt, firstBatch - Math.min(eng, firstBatch)), conflicts: [] },
    ];
    explanation = `The total maintenance duration (${totalSequential}h) exceeds the available block window (${windowSize}h). The optimizer scheduled compatible work into the first window and deferred the remainder. Partial coordination still reduces downtime. Actual coordination depends on safety, technical compatibility, resources, and railway rules.`;
  }

  return {
    currentPlan: {
      blocks: currentBlocks,
      totalBlocks: 3,
      totalDuration: totalSequential,
      conflicts: 3,
      operationalImpact: 'High — 3 separate block windows, 3 train service disruptions',
      completionRate: 100,
    },
    optimizedPlan: {
      blocks: optimizedBlocks,
      totalBlocks: canCoordinate ? 1 : 2,
      totalDuration: optimizedDuration,
      conflicts: 0,
      operationalImpact: canCoordinate ? 'Low — 1 coordinated block window, 1 disruption' : 'Medium — 2 block windows, 2 disruptions',
      completionRate: 100,
    },
    explanation,
  };
}

// -- Department Coordination Conflicts ---------------------------------------

export interface CoordinationConflict {
  section: Section;
  activities: Array<{
    department: Department;
    activity: string;
    requestId: string;
    start: string;
    end: string;
    duration: number;
  }>;
  potentialCoordinatedBlock: {
    start: string;
    end: string;
    totalDuration: number;
    savings: number;
  };
  compatible: boolean;
}

export function getCoordinationConflicts(): CoordinationConflict[] {
  return [
    {
      section: 'SEC-A',
      activities: [
        { department: 'Engineering', activity: 'Track Inspection', requestId: 'TMS-001', start: '10:00', end: '12:00', duration: 2 },
        { department: 'S&T', activity: 'Signal Maintenance', requestId: 'SMMS-004', start: '11:00', end: '12:00', duration: 1 },
        { department: 'Traction', activity: 'OHE Inspection', requestId: 'TDMS-001', start: '10:30', end: '12:30', duration: 2 },
      ],
      potentialCoordinatedBlock: {
        start: '10:00',
        end: '12:30',
        totalDuration: 2.5,
        savings: 2.5,
      },
      compatible: true,
    },
    {
      section: 'SEC-B',
      activities: [
        { department: 'Engineering', activity: 'Rail Defect Repair', requestId: 'TMS-002', start: '02:00', end: '05:00', duration: 3 },
        { department: 'S&T', activity: 'Interlocking Maintenance', requestId: 'SMMS-002', start: '03:00', end: '04:30', duration: 1.5 },
      ],
      potentialCoordinatedBlock: {
        start: '02:00',
        end: '05:00',
        totalDuration: 3,
        savings: 1.5,
      },
      compatible: true,
    },
    {
      section: 'SEC-D',
      activities: [
        { department: 'Engineering', activity: 'Point & Crossing Maint.', requestId: 'TMS-005', start: '14:00', end: '15:30', duration: 1.5 },
        { department: 'S&T', activity: 'Interlocking Maintenance', requestId: 'SMMS-005', start: '14:00', end: '16:00', duration: 2 },
      ],
      potentialCoordinatedBlock: {
        start: '14:00',
        end: '16:00',
        totalDuration: 2,
        savings: 1.5,
      },
      compatible: true,
    },
    {
      section: 'SEC-C',
      activities: [
        { department: 'Engineering', activity: 'Sleeper Replacement', requestId: 'TMS-003', start: '01:00', end: '05:00', duration: 4 },
        { department: 'S&T', activity: 'Comm. Equipment Maint.', requestId: 'SMMS-003', start: '01:00', end: '02:00', duration: 1 },
      ],
      potentialCoordinatedBlock: {
        start: '01:00',
        end: '05:00',
        totalDuration: 4,
        savings: 1,
      },
      compatible: true,
    },
  ];
}
