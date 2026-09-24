// ============================================================
// MahallConnect — Core TypeScript Types
// ============================================================

export type UserRole =
  | 'super_admin' | 'SUPER_ADMIN'
  | 'secretary' | 'SECRETARY'
  | 'treasurer' | 'TREASURER'
  | 'imam' | 'IMAM'
  | 'madrasa_admin' | 'MADRASA_ADMIN'
  | 'welfare_officer' | 'WELFARE_OFFICER'
  | 'committee_member' | 'COMMITTEE_MEMBER'
  | 'family_head' | 'FAMILY_HEAD'
  | 'volunteer' | 'VOLUNTEER'
  | 'member' | 'MEMBER';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  SUPER_ADMIN: 'Super Admin',
  secretary: 'Secretary',
  SECRETARY: 'Secretary',
  treasurer: 'Treasurer',
  TREASURER: 'Treasurer',
  imam: 'Imam',
  IMAM: 'Imam',
  madrasa_admin: 'Madrasa Admin',
  MADRASA_ADMIN: 'Madrasa Admin',
  welfare_officer: 'Welfare Officer',
  WELFARE_OFFICER: 'Welfare Officer',
  committee_member: 'Committee Member',
  COMMITTEE_MEMBER: 'Committee Member',
  family_head: 'Family Head',
  FAMILY_HEAD: 'Family Head',
  volunteer: 'Volunteer',
  VOLUNTEER: 'Volunteer',
  member: 'Member',
  MEMBER: 'Member',
};

export type AccountStatus = 'active' | 'inactive' | 'pending';
export type Gender = 'male' | 'female';
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

// ============================================================
// User
// ============================================================
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  familyId?: string;
  status: AccountStatus;
  lastLogin: string;
  joinedAt: string;
  address?: string;
}

// ============================================================
// Family
// ============================================================
export type Relationship = 'father' | 'mother' | 'son' | 'daughter' | 'grandfather' | 'grandmother' | 'uncle' | 'aunt' | 'other';

export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  relationship: Relationship;
  gender: Gender;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  occupation?: string;
  isHead: boolean;
  userId?: string;
}

export interface Family {
  id: string;
  name: string;
  headId: string;
  members: FamilyMember[];
  address: string;
  ward?: string;
  phone: string;
  email?: string;
  membershipStatus: 'active' | 'inactive';
  joinedAt: string;
  monthlyContribution: number;
}

// ============================================================
// Finance
// ============================================================
export interface Payment {
  id: string;
  familyId: string;
  familyName: string;
  memberId: string;
  memberName: string;
  amount: number;
  month: string; // "2024-01"
  type: 'monthly' | 'donation' | 'zakat' | 'fitrah' | 'rent' | 'other';
  status: PaymentStatus;
  paidAt?: string;
  receiptNo?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'maintenance' | 'salaries' | 'utilities' | 'programs' | 'welfare' | 'education' | 'other';
  amount: number;
  date: string;
  approvedBy: string;
  notes?: string;
}

export interface FinanceSummary {
  totalCollection: number;
  expectedCollection: number;
  pendingPayments: number;
  totalDonations: number;
  totalZakat: number;
  totalExpenses: number;
  balance: number;
  monthlyRevenue: { month: string; amount: number }[];
  expensesByCategory: { category: string; amount: number }[];
}

// ============================================================
// Applications
// ============================================================
export type ApplicationType =
  | 'zakat'
  | 'welfare'
  | 'marriage'
  | 'funeral'
  | 'hajj'
  | 'umrah'
  | 'certificate'
  | 'facility_booking'
  | 'education_aid'
  | 'general_request'
  | 'other';

export interface ApplicationNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Application {
  id: string;
  type: ApplicationType;
  applicantId: string;
  applicantName: string;
  familyId: string;
  title: string;
  description: string;
  status: ApplicationStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: string;
  updatedAt: string;
  assignedTo?: string;
  notes: ApplicationNote[];
  documents: string[];
  amount?: number;
}

// ============================================================
// Events
// ============================================================
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  category: 'religious' | 'community' | 'education' | 'welfare' | 'sports' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  maxParticipants?: number;
  registeredCount: number;
  organizerId: string;
  volunteersNeeded?: number;
  image?: string;
}

// ============================================================
// Announcements
// ============================================================
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'mosque' | 'welfare' | 'madrasa' | 'urgent';
  publishedAt: string;
  publishedBy: string;
  isActive: boolean;
}

// ============================================================
// Mosque
// ============================================================
export interface PrayerTime {
  name: string;
  adhan: string;
  iqamah: string;
}

export interface PrayerSchedule {
  date: string;
  fajr: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
  jumu_ah?: string;
}

export interface MosqueProgram {
  id: string;
  title: string;
  description: string;
  dayOfWeek?: string;
  time: string;
  teacher?: string;
  category: 'quran' | 'hadith' | 'fiqh' | 'tafsir' | 'other';
  isActive: boolean;
}

// ============================================================
// Madrasa
// ============================================================
export interface Madrasa {
  _id: string;
  id?: string;
  name: string;
  code: string;
  regNumber?: string;
  board: string;
  location: string;
  establishedYear?: number;
  sadarUsthad: string;
  phone: string;
  email?: string;
  timings?: string;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  studentCount?: number;
  usthadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MadrasaStudent {
  _id?: string;
  id?: string;
  admissionNumber?: string;
  name: string;
  madrasaId?: any;
  familyId?: any;
  familyName?: string;
  dateOfBirth: string;
  gender: Gender;
  enrolledAt?: string;
  guardianName: string;
  guardianPhone: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
}

export interface MadrasaTeacher {
  _id?: string;
  id?: string;
  madrasaId?: any;
  name: string;
  designation?: string;
  qualification: string;
  subjects?: string[];
  subject?: string;
  phone: string;
  email?: string;
  joiningDate?: string;
  joinedAt?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============================================================
// Assets & Property
// ============================================================
export type AssetType = 'building' | 'land' | 'equipment' | 'vehicle' | 'other';
export type AssetStatus = 'active' | 'maintenance' | 'disposed';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  location: string;
  purchasedAt?: string;
  value: number;
  status: AssetStatus;
  isRental: boolean;
  monthlyRent?: number;
  tenantName?: string;
  maintenanceNotes?: string;
}

// ============================================================
// Committee
// ============================================================
export interface CommitteeMember {
  id: string;
  userId: string;
  name: string;
  position: string;
  phone: string;
  email?: string;
  termStart: string;
  termEnd: string;
  isActive: boolean;
  avatar?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda: string[];
  attendees: string[];
  minutes?: string;
  decisions: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

// ============================================================
// Volunteers
// ============================================================
export type VolunteerCategory = 'general' | 'emergency' | 'welfare' | 'event' | 'blood_donation' | 'education';

export interface Volunteer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  categories: VolunteerCategory[];
  bloodGroup?: string;
  availability: 'available' | 'busy' | 'unavailable';
  totalHours: number;
  joinedAt: string;
  skills?: string[];
}

// ============================================================
// Hajj & Umrah
// ============================================================
export interface HajjRegistration {
  id: string;
  applicantId: string;
  applicantName: string;
  familyId: string;
  type: 'hajj' | 'umrah';
  year: string;
  status: ApplicationStatus;
  groupId?: string;
  submittedAt: string;
  notes?: string;
}

// ============================================================
// Ramadan
// ============================================================
export interface RamadanTimetable {
  date: string;
  suhoorEnd: string;
  fajr: string;
  iftar: string;
  maghrib: string;
}

export interface IftarProgram {
  id: string;
  date: string;
  venue: string;
  sponsor?: string;
  expectedCount: number;
  status: 'planned' | 'completed';
}

// ============================================================
// Dashboard Stats
// ============================================================
export interface DashboardStats {
  totalMembers: number;
  totalFamilies: number;
  monthlyCollection: number;
  pendingPayments: number;
  welfareCases: number;
  madrasaStudents: number;
  upcomingEvents: number;
  pendingApplications: number;
  recentDeaths: number;
  activeVolunteers: number;
}
