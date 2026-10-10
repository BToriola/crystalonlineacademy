export type Role = "admin" | "tutor" | "parent" | "student";
export type RegionCode = "UK" | "CA" | "NG" | "OTHER";
export type Curriculum = "uk" | "ca";

export type LeadStatus = "new" | "contacted" | "trial_booked" | "converted" | "closed";
export type ApplicationStatus = "new" | "screening" | "interview" | "demo" | "approved" | "rejected";
export type AssignmentStatus = "active" | "paused" | "ended";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "missed";
export type SkillStatus = "mastered" | "improving" | "needs_support";
export type MilestoneStatus = "done" | "current" | "upcoming";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  timezone: string;
  country: RegionCode;
  created_at: string;
}

export interface TutorProfile {
  id: string;
  headline: string | null;
  bio: string | null;
  subjects: string[];
  levels: string[];
  qualification: string | null;
  years_experience: number;
  hourly_rate: number;
  rating: number;
  languages: string[];
  is_published: boolean;
  intro_video_url: string | null;
}

export type Tutor = Profile & { tutor: TutorProfile };

export interface Lead {
  id: string;
  parent_name: string;
  email: string;
  phone: string | null;
  country: RegionCode;
  timezone: string;
  child_name: string;
  year_group: string;
  subjects: string[];
  goals: string | null;
  preferred_times: string | null;
  heard_from: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
}

export interface TutorApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  timezone: string;
  subjects: string[];
  levels: string[];
  qualification: string;
  degree_class: string | null;
  years_experience: number;
  motivation: string | null;
  cv_url: string | null;
  status: ApplicationStatus;
  assessment_score: number | null;
  notes: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  parent_id: string;
  profile_id: string | null;
  first_name: string;
  last_name: string | null;
  curriculum: Curriculum;
  year_group: string;
  learning_notes: string | null;
  avatar_seed: string;
  stars: number;
  streak_days: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  status: AssignmentStatus;
  sessions_per_week: number;
  meeting_url: string | null;
  proposed_meeting_url: string | null;
  meeting_url_approved_at: string | null;
  started_on: string;
  created_at: string;
}

export interface Session {
  id: string;
  assignment_id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  starts_at: string;
  duration_min: number;
  status: SessionStatus;
  meeting_url: string | null;
  topic: string | null;
  tutor_notes: string | null;
  homework: string | null;
  homework_done: boolean;
  parent_rating: number | null;
  parent_feedback: string | null;
}

export interface Skill {
  name: string;
  status: SkillStatus;
}

export interface Milestone {
  title: string;
  status: MilestoneStatus;
}

export interface ProgressReport {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  period_label: string;
  current_focus: string;
  curriculum_ref: string | null;
  next_assessment: string | null;
  skills: Skill[];
  roadmap: Milestone[];
  recommendation: string;
  attendance_rate: number;
  effort_score: number;
  published_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  parent_id: string;
  tutor_id: string;
  student_id: string | null;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unit_amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  parent_id: string;
  currency: "GBP" | "CAD";
  amount: number;
  status: InvoiceStatus;
  period_label: string;
  due_on: string;
  paid_on: string | null;
  lines: InvoiceLine[];
  created_at: string;
}

export interface Badge {
  key: string;
  title: string;
  description: string;
  emoji: string;
  earned_at: string | null;
}

export interface StarEvent {
  id: string;
  student_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Availability {
  id: string;
  tutor_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

export interface Attendance {
  id: string;
  session_id: string;
  profile_id: string;
  role: Role;
  joined_at: string;
}
