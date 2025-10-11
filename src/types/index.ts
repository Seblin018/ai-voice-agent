// Ask Cursor: "Create TypeScript interfaces for our dashboard data"
export interface BusinessData {
  businessName: string;
  periodStartDate: string;
  periodEndDate: string;
  totalCalls: number;
  answeredCalls: number;
  appointmentsBooked: number;
  avgJobValue: number;
  estimatedRevenue: number;
  monthlyCost: number;
  hoursOutsideBusiness: number;
}

export interface Call {
  id: number;
  date: string;
  caller: string;
  duration: string;
  outcome: 'Appointment Booked' | 'Info Request' | 'Hang Up';
  service: string;
  appointment: string;
  notes: string;
}

// Dashboard data interface
export interface DashboardData {
  businessName: string;
  periodStartDate: string;
  periodEndDate: string;
  roi: ROIData;
  stats: StatCard[];
  callLog: CallLogEntry[];
  cta: CTAFeature;
}

// ROI data interface
export interface ROIData {
  revenue: number;
  cost: number;
  roi: number;
  explanation: string;
}

// Stat card interface
export interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
}

// Call log entry interface
export interface CallLogEntry {
  id: number;
  date: string;
  caller: string;
  duration: string;
  outcome: 'Appointment Booked' | 'Info Request' | 'Hang Up';
  service: string;
  appointment: string;
  notes: string;
}

// CTA feature interface
export interface CTAFeature {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}
