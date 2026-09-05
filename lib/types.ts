// ============================================================================
// Rail Optimizer — Type Definitions
// Centralized types shared across the application. When a Python FastAPI
// backend is connected, these types mirror the API response schemas.
// ============================================================================

export type Department = 'Engineering' | 'S&T' | 'Traction';

export type SourceSystem = 'TMS' | 'SMMS' | 'TDMS' | 'BDMS' | 'COA';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type PriorityCategory = 'Critical' | 'High' | 'Medium' | 'Low';

export type RequestStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Scheduled'
  | 'Completed'
  | 'Rejected';

export type MaintenanceType =
  // Engineering
  | 'Track Inspection'
  | 'Rail Defect Repair'
  | 'Sleeper Replacement'
  | 'Track Geometry Maintenance'
  | 'Point & Crossing Maintenance'
  // S&T
  | 'Signal Maintenance'
  | 'Interlocking Maintenance'
  | 'Communication Equipment Maintenance'
  // Traction
  | 'OHE Inspection'
  | 'OHE Maintenance'
  | 'Traction Equipment Maintenance';

export type Section = 'SEC-A' | 'SEC-B' | 'SEC-C' | 'SEC-D' | 'SEC-E';

export type BlockStatus = 'Pending Review' | 'Approved' | 'Completed';

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  department: Department;
  sourceSystem: SourceSystem;
  section: Section;
  location: string;
  maintenanceType: MaintenanceType;
  severity: Severity;
  priorityScore: number;
  priorityCategory: PriorityCategory;
  requiredDuration: number; // hours
  deadline: string; // ISO date
  status: RequestStatus;
  description: string;
  createdAt: string; // ISO date
  // AI scoring breakdown
  factors: {
    safetyImpact: number;
    operationalImpact: number;
    urgency: number;
    assetCriticality: number;
    failureHistory: number;
  };
  reason: string;
}

export interface MaintenanceBlock {
  id: string;
  requestId: string;
  activity: string;
  department: Department;
  section: Section;
  location: string;
  day: number; // 0-6 (Mon-Sun)
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  duration: number; // hours
  priority: PriorityCategory;
  priorityScore: number;
  operationalImpact: 'None' | 'Low' | 'Medium' | 'High';
  status: BlockStatus;
  coordinated: boolean;
  coordinatedWith?: string[];
  trainImpact: string;
  optimizationExplanation: string;
  assetId: string;
}

export interface MonthlyActivity {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  activity: string;
  department: Department;
  section: Section;
  priority: PriorityCategory;
  status: RequestStatus;
  duration: number;
  coordinated: boolean;
}

export interface AssetInfo {
  id: string;
  name: string;
  department: Department;
  section: Section;
  availability: number; // percentage
  downtime: number; // hours this week
  status: 'Available' | 'Under Maintenance' | 'Restricted';
  type: string;
}

export interface AvailabilityTrendPoint {
  date: string;
  engineering: number;
  snt: number;
  traction: number;
  overall: number;
}

export interface SectionAvailability {
  section: Section;
  availability: number;
  downtime: number;
}

export interface DepartmentWorkload {
  department: Department;
  activeRequests: number;
  pendingRequests: number;
  completedThisWeek: number;
  hoursScheduled: number;
}

export interface GlossaryTerm {
  term: string;
  abbreviation?: string;
  definition: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}
