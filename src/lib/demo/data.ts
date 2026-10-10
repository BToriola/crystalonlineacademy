import type {
  Assignment,
  Attendance,
  Availability,
  Badge,
  Conversation,
  Invoice,
  Lead,
  Message,
  Profile,
  ProgressReport,
  Session,
  StarEvent,
  Student,
  Tutor,
  TutorApplication,
} from "@/types/database";

const DAY = 86_400_000;
const now = Date.now();
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();
const atHour = (dayOffset: number, hourUtc: number, minute = 0) => {
  const d = new Date(now + dayOffset * DAY);
  d.setUTCHours(hourUtc, minute, 0, 0);
  return d.toISOString();
};

const profile = (p: Partial<Profile> & Pick<Profile, "id" | "role" | "full_name" | "email">): Profile => ({
  phone: null,
  avatar_url: null,
  timezone: "Europe/London",
  country: "UK",
  created_at: iso(-120 * DAY),
  ...p,
});

export const demoAdmin = profile({
  id: "u-admin",
  role: "admin",
  full_name: "Crystal Adeyemi",
  email: "crystal@crystalonlineacademy.com",
  timezone: "Europe/London",
});

const tutorSeed: Array<[string, string, string[], string[], string, number, string, string]> = [
  ["Ms. Adaeze", "Phonics & early reading specialist", ["Phonics & Reading", "English"], ["EYFS", "KS1"], "B.Ed Early Childhood Education", 7, "Makes reading feel like play. Children leave her sessions asking for 'one more story'.", "adaeze"],
  ["Mr. Tobi", "Maths that finally clicks", ["Maths", "11+ Prep"], ["KS2", "KS3", "Grade 4–8"], "B.Sc Mathematics (First Class)", 6, "Breaks problems into tiny wins. Former maths olympiad coach.", "tobi"],
  ["Ms. Kemi", "GCSE English & creative writing", ["English", "Creative Writing"], ["KS3", "GCSE"], "M.A English Literature", 9, "Turns reluctant writers into confident storytellers with structure and warmth.", "kemi"],
  ["Mr. Ifeanyi", "Physics & Chemistry made visual", ["Physics", "Chemistry", "Science"], ["KS3", "GCSE", "Grade 9–12"], "B.Eng Electrical Engineering", 5, "Uses everyday experiments to make abstract science stick.", "ifeanyi"],
  ["Ms. Halima", "Patient SEN-aware tutor", ["Maths", "English"], ["KS1", "KS2"], "M.Ed Special Education", 8, "Calm, structured and brilliant with neurodivergent learners.", "halima"],
  ["Ms. Bisola", "French & Yoruba", ["French", "Yoruba"], ["KS2", "KS3", "Grade 4–9"], "B.A French (Second Class Upper)", 4, "Bilingual teaching with songs, stories and plenty of speaking practice.", "bisola"],
  ["Mr. Chidi", "Coding for curious kids", ["Coding", "Maths"], ["KS2", "KS3", "Grade 5–10"], "B.Sc Computer Science", 6, "From Scratch to Python, children build real projects they can show off.", "chidi"],
  ["Ms. Ngozi", "Biology & GCSE Science", ["Biology", "Science"], ["KS3", "GCSE", "Grade 9–12"], "B.Sc Biochemistry (First Class)", 7, "Exam-smart revision plans and memorable diagrams.", "ngozi"],
];

export const demoTutors: Tutor[] = tutorSeed.map(([name, headline, subjects, levels, qualification, years, bio, seed], i) => ({
  ...profile({
    id: `u-tutor-${seed}`,
    role: "tutor",
    full_name: name,
    email: `${seed}@crystalonlineacademy.com`,
    timezone: "Africa/Lagos",
    country: "NG",
  }),
  tutor: {
    id: `u-tutor-${seed}`,
    headline,
    bio,
    subjects,
    levels,
    qualification,
    years_experience: years,
    hourly_rate: 18 + (i % 3) * 4,
    rating: [4.9, 5.0, 4.8, 4.9, 5.0, 4.7, 4.9, 4.8][i],
    languages: i === 5 ? ["English", "French", "Yoruba"] : ["English"],
    is_published: true,
    intro_video_url: null,
  },
}));

demoTutors.unshift({
  ...demoAdmin,
  tutor: {
    id: demoAdmin.id,
    headline: "Founder · English & 11+ specialist",
    bio: "Founded Crystal to give diaspora children the warm, structured support she wished she'd had. Still teaches every week.",
    subjects: ["English", "11+ Prep", "Creative Writing"],
    levels: ["KS2", "KS3", "GCSE"],
    qualification: "M.Ed Curriculum & Instruction",
    years_experience: 12,
    hourly_rate: 30,
    rating: 5.0,
    languages: ["English", "Yoruba"],
    is_published: true,
    intro_video_url: null,
  },
});

export const demoTutor = demoTutors.find((t) => t.id === "u-tutor-tobi")!;

export const demoParents: Profile[] = [
  profile({ id: "u-parent-amara", role: "parent", full_name: "Amara Okafor", email: "amara@example.com", timezone: "Europe/London", country: "UK" }),
  profile({ id: "u-parent-david", role: "parent", full_name: "David & Funmi Ade", email: "ade.family@example.com", timezone: "America/Toronto", country: "CA" }),
  profile({ id: "u-parent-zainab", role: "parent", full_name: "Zainab Bello", email: "zainab@example.com", timezone: "America/Vancouver", country: "CA" }),
];

export const demoParent = demoParents[0];

export const demoStudents: Student[] = [
  { id: "s-maya", parent_id: "u-parent-amara", profile_id: "u-student-maya", first_name: "Maya", last_name: "Okafor", curriculum: "uk", year_group: "Year 7 (KS3)", learning_notes: "Visual learner. Loves drawing and basketball.", avatar_seed: "maya", stars: 148, streak_days: 6, created_at: iso(-90 * DAY) },
  { id: "s-tolu", parent_id: "u-parent-amara", profile_id: null, first_name: "Tolu", last_name: "Okafor", curriculum: "uk", year_group: "Year 2 (KS1)", learning_notes: "Building reading confidence. Short attention span — short bursts work best.", avatar_seed: "tolu", stars: 92, streak_days: 3, created_at: iso(-60 * DAY) },
  { id: "s-ella", parent_id: "u-parent-david", profile_id: null, first_name: "Ella", last_name: "Ade", curriculum: "ca", year_group: "Grade 10", learning_notes: "Preparing for provincial science assessment.", avatar_seed: "ella", stars: 210, streak_days: 12, created_at: iso(-150 * DAY) },
  { id: "s-yusuf", parent_id: "u-parent-zainab", profile_id: null, first_name: "Yusuf", last_name: "Bello", curriculum: "ca", year_group: "Grade 5", learning_notes: "Strong at arithmetic, struggles with word problems.", avatar_seed: "yusuf", stars: 64, streak_days: 2, created_at: iso(-30 * DAY) },
];

export const demoStudent = demoStudents[0];
export const demoStudentProfile = profile({
  id: "u-student-maya",
  role: "student",
  full_name: "Maya Okafor",
  email: "maya@example.com",
});

export const demoAssignments: Assignment[] = [
  { id: "a-1", student_id: "s-maya", tutor_id: "u-tutor-tobi", subject: "Maths", status: "active", sessions_per_week: 2, meeting_url: "https://meet.google.com/abc-defg-hij", proposed_meeting_url: null, meeting_url_approved_at: iso(-30 * DAY), started_on: iso(-80 * DAY).slice(0, 10), created_at: iso(-80 * DAY) },
  { id: "a-2", student_id: "s-maya", tutor_id: "u-tutor-kemi", subject: "English", status: "active", sessions_per_week: 1, meeting_url: "https://meet.google.com/klm-nopq-rst", proposed_meeting_url: null, meeting_url_approved_at: iso(-30 * DAY), started_on: iso(-50 * DAY).slice(0, 10), created_at: iso(-50 * DAY) },
  { id: "a-3", student_id: "s-tolu", tutor_id: "u-tutor-adaeze", subject: "Phonics & Reading", status: "active", sessions_per_week: 3, meeting_url: "https://meet.google.com/qrs-tuvw-xyz", proposed_meeting_url: null, meeting_url_approved_at: iso(-30 * DAY), started_on: iso(-55 * DAY).slice(0, 10), created_at: iso(-55 * DAY) },
  { id: "a-4", student_id: "s-ella", tutor_id: "u-tutor-ifeanyi", subject: "Physics", status: "active", sessions_per_week: 2, meeting_url: "https://meet.google.com/uvw-xyza-bcd", proposed_meeting_url: null, meeting_url_approved_at: iso(-30 * DAY), started_on: iso(-140 * DAY).slice(0, 10), created_at: iso(-140 * DAY) },
  { id: "a-6", student_id: "s-ella", tutor_id: "u-admin", subject: "English", status: "active", sessions_per_week: 1, meeting_url: "https://meet.google.com/crs-talq-aaa", proposed_meeting_url: null, meeting_url_approved_at: iso(-30 * DAY), started_on: iso(-40 * DAY).slice(0, 10), created_at: iso(-40 * DAY) },
  { id: "a-5", student_id: "s-yusuf", tutor_id: "u-tutor-tobi", subject: "Maths", status: "active", sessions_per_week: 2, meeting_url: "https://meet.google.com/efg-hijk-lmn", proposed_meeting_url: "https://meet.google.com/new-yusf-mth", meeting_url_approved_at: iso(-30 * DAY), started_on: iso(-28 * DAY).slice(0, 10), created_at: iso(-28 * DAY) },
];

const sessionRow = (
  id: string,
  a: Assignment,
  startsAt: string,
  status: Session["status"],
  extra: Partial<Session> = {},
): Session => ({
  id,
  assignment_id: a.id,
  student_id: a.student_id,
  tutor_id: a.tutor_id,
  subject: a.subject,
  starts_at: startsAt,
  duration_min: 60,
  status,
  meeting_url: a.meeting_url,
  topic: null,
  tutor_notes: null,
  homework: null,
  homework_done: false,
  parent_rating: null,
  parent_feedback: null,
  ...extra,
});

const [a1, a2, a3, a4, a6, a5] = demoAssignments;

export const demoSessions: Session[] = [
  sessionRow("ss-1", a1, atHour(-7, 17), "completed", { topic: "Fractions & decimals review", tutor_notes: "Maya converted between fractions and decimals confidently. Slowed down on recurring decimals.", homework: "Worksheet 4B, questions 1–12", homework_done: true, parent_rating: 5, parent_feedback: "She came out smiling!" }),
  sessionRow("ss-2", a1, atHour(-5, 17), "completed", { topic: "Choosing the right operation", tutor_notes: "Good progress spotting key words. Needs more practice with two-step problems.", homework: "Word problems pack, page 3", homework_done: true, parent_rating: 5 }),
  sessionRow("ss-3", a2, atHour(-3, 18), "completed", { topic: "Persuasive writing: hooks", tutor_notes: "Wrote a brilliant opening paragraph about school uniforms.", homework: "Draft the second paragraph", homework_done: false }),
  sessionRow("ss-4", a1, atHour(-2, 17), "completed", { topic: "Two-step equations", tutor_notes: "Big breakthrough today — solved 8/10 independently.", homework: "Equations practice set 2", homework_done: false }),
  sessionRow("ss-5", a3, atHour(-1, 16), "completed", { topic: "Split digraphs (a_e, i_e)", tutor_notes: "Read 'The Snake Cake' aloud with expression.", homework: "Read pages 4–8 to a grown-up" }),
  sessionRow("ss-6", a1, atHour(0, 17), "scheduled", { topic: "Writing two-step equations" }),
  sessionRow("ss-7", a3, atHour(0, 16), "scheduled", { topic: "Tricky words: said, have, like" }),
  sessionRow("ss-8", a5, atHour(0, 22), "scheduled", { topic: "Multi-step word problems" }),
  sessionRow("ss-9", a4, atHour(1, 23), "scheduled", { topic: "Forces & motion — free body diagrams" }),
  sessionRow("ss-10", a2, atHour(1, 18), "scheduled", { topic: "Persuasive writing: counter-arguments" }),
  sessionRow("ss-11", a1, atHour(2, 17), "scheduled", { topic: "Unit test practice" }),
  sessionRow("ss-12", a5, atHour(2, 22), "scheduled", { topic: "Fractions of amounts" }),
  sessionRow("ss-13", a3, atHour(2, 16), "scheduled", { topic: "Reading comprehension" }),
  sessionRow("ss-14", a4, atHour(-4, 23), "completed", { topic: "Newton's second law", tutor_notes: "Strong algebra, needs to label units consistently.", homework: "Textbook p.112 Q1–6", homework_done: true }),
  sessionRow("ss-15", a5, atHour(-3, 22), "missed", { topic: "Place value review" }),
  sessionRow("ss-16", a6, atHour(-6, 23), "completed", { topic: "Analysing poetry: imagery", tutor_notes: "Ella annotated two poems with real insight.", homework: "Compare the two poems in 300 words", homework_done: true, parent_rating: 5 }),
  sessionRow("ss-17", a6, atHour(1, 0), "scheduled", { topic: "Essay structure: PEEL paragraphs" }),
  sessionRow("ss-18", a2, new Date(Math.floor((now - 20 * 60_000) / 300_000) * 300_000).toISOString(), "scheduled", { topic: "Persuasive writing: rhetorical questions" }),
  sessionRow("ss-19", a4, new Date(Math.ceil((now + 25 * 60_000) / 300_000) * 300_000).toISOString(), "scheduled", { topic: "Momentum & impulse" }),
];

export const demoReports: ProgressReport[] = [
  {
    id: "r-1",
    student_id: "s-maya",
    tutor_id: "u-tutor-tobi",
    subject: "Maths",
    period_label: "Autumn term · Weeks 1–6",
    current_focus: "Multi-step word problems",
    curriculum_ref: "KS3 Algebra — forming & solving equations",
    next_assessment: "Class assessment in 1 week",
    skills: [
      { name: "Fractions & decimals", status: "mastered" },
      { name: "Choosing the operation", status: "improving" },
      { name: "Translating words into equations", status: "needs_support" },
      { name: "Showing working clearly", status: "improving" },
    ],
    roadmap: [
      { title: "Fractions & decimals review", status: "done" },
      { title: "Choosing the operation", status: "done" },
      { title: "Writing two-step equations", status: "current" },
      { title: "Unit test practice", status: "upcoming" },
    ],
    recommendation:
      "Maya is close to mastering this unit. Ten minutes of the word-problem pack on non-tutoring days will make a real difference before her assessment.",
    attendance_rate: 100,
    effort_score: 5,
    published_at: iso(-1 * DAY),
    created_at: iso(-2 * DAY),
  },
  {
    id: "r-2",
    student_id: "s-tolu",
    tutor_id: "u-tutor-adaeze",
    subject: "Phonics & Reading",
    period_label: "Autumn term · Weeks 1–6",
    current_focus: "Phase 5 phonics: split digraphs",
    curriculum_ref: "KS1 Phonics — Phase 5",
    next_assessment: "Phonics screening check practice",
    skills: [
      { name: "Blending CVC words", status: "mastered" },
      { name: "Split digraphs", status: "improving" },
      { name: "Tricky words", status: "needs_support" },
    ],
    roadmap: [
      { title: "Phase 4 consolidation", status: "done" },
      { title: "Split digraphs", status: "current" },
      { title: "Alternative spellings", status: "upcoming" },
      { title: "Screening check practice", status: "upcoming" },
    ],
    recommendation: "Read together for 10 minutes each evening and let Tolu point to the 'magic e' words.",
    attendance_rate: 95,
    effort_score: 4,
    published_at: iso(-3 * DAY),
    created_at: iso(-4 * DAY),
  },
  {
    id: "r-3",
    student_id: "s-ella",
    tutor_id: "u-tutor-ifeanyi",
    subject: "Physics",
    period_label: "Fall term · Month 2",
    current_focus: "Forces and Newton's laws",
    curriculum_ref: "Ontario SNC2D — Physics: Motion",
    next_assessment: "Unit test in 2 weeks",
    skills: [
      { name: "Kinematics equations", status: "mastered" },
      { name: "Free body diagrams", status: "improving" },
      { name: "Units & significant figures", status: "needs_support" },
    ],
    roadmap: [
      { title: "Kinematics", status: "done" },
      { title: "Newton's laws", status: "current" },
      { title: "Energy & work", status: "upcoming" },
    ],
    recommendation: "Ella should keep a units checklist next to her when practising.",
    attendance_rate: 100,
    effort_score: 5,
    published_at: iso(-6 * DAY),
    created_at: iso(-7 * DAY),
  },
];

export const demoConversations: Conversation[] = [
  { id: "c-1", parent_id: "u-parent-amara", tutor_id: "u-tutor-tobi", student_id: "s-maya", last_message_at: iso(-2 * 3_600_000) },
  { id: "c-2", parent_id: "u-parent-amara", tutor_id: "u-tutor-adaeze", student_id: "s-tolu", last_message_at: iso(-1 * DAY) },
  { id: "c-4", parent_id: "u-parent-david", tutor_id: "u-admin", student_id: "s-ella", last_message_at: iso(-5 * 3_600_000) },
  { id: "c-3", parent_id: "u-parent-zainab", tutor_id: "u-tutor-tobi", student_id: "s-yusuf", last_message_at: iso(-3 * DAY) },
];

export const demoMessages: Message[] = [
  { id: "m-1", conversation_id: "c-1", sender_id: "u-parent-amara", body: "Hi Mr. Tobi! Maya mentioned she has a maths assessment next week. Anything we should focus on at home?", read_at: iso(-5 * 3_600_000), created_at: iso(-6 * 3_600_000) },
  { id: "m-2", conversation_id: "c-1", sender_id: "u-tutor-tobi", body: "Good afternoon! Yes — word problems. I've added a short practice pack to her homework. 10 minutes a day is perfect.", read_at: iso(-3 * 3_600_000), created_at: iso(-4 * 3_600_000) },
  { id: "m-3", conversation_id: "c-1", sender_id: "u-parent-amara", body: "Perfect, thank you. She really enjoys your sessions 😊", read_at: null, created_at: iso(-2 * 3_600_000) },
  { id: "m-4", conversation_id: "c-2", sender_id: "u-tutor-adaeze", body: "Tolu read a whole page without help today! Please give him a big high five from me 🙌", read_at: iso(-20 * 3_600_000), created_at: iso(-1 * DAY) },
  { id: "m-6", conversation_id: "c-4", sender_id: "u-parent-david", body: "Thanks Ms. Crystal — Ella said the poetry lesson was her favourite yet!", read_at: null, created_at: iso(-5 * 3_600_000) },
  { id: "m-5", conversation_id: "c-3", sender_id: "u-parent-zainab", body: "Sorry Yusuf missed Tuesday — he was unwell. Can we make it up this week?", read_at: iso(-2 * DAY), created_at: iso(-3 * DAY) },
];

export const demoInvoices: Invoice[] = [
  { id: "i-1", created_at: iso(-3 * DAY), number: "COA-2026-0142", parent_id: "u-parent-amara", currency: "GBP", amount: 432, status: "sent", period_label: "October 2026", due_on: iso(5 * DAY).slice(0, 10), paid_on: null, lines: [{ description: "Maths — Maya (8 × 60 min)", quantity: 8, unit_amount: 27 }, { description: "English — Maya (4 × 60 min)", quantity: 4, unit_amount: 27 }, { description: "Phonics — Tolu (12 × 30 min)", quantity: 12, unit_amount: 9 }] },
  { id: "i-2", created_at: iso(-33 * DAY), number: "COA-2026-0118", parent_id: "u-parent-amara", currency: "GBP", amount: 405, status: "paid", period_label: "September 2026", due_on: iso(-25 * DAY).slice(0, 10), paid_on: iso(-27 * DAY).slice(0, 10), lines: [{ description: "Tutoring — September", quantity: 15, unit_amount: 27 }] },
  { id: "i-3", created_at: iso(-12 * DAY), number: "COA-2026-0139", parent_id: "u-parent-david", currency: "CAD", amount: 384, status: "overdue", period_label: "October 2026", due_on: iso(-2 * DAY).slice(0, 10), paid_on: null, lines: [{ description: "Physics — Ella (8 × 60 min)", quantity: 8, unit_amount: 48 }] },
  { id: "i-4", created_at: iso(-10 * DAY), number: "COA-2026-0140", parent_id: "u-parent-zainab", currency: "CAD", amount: 336, status: "paid", period_label: "October 2026", due_on: iso(3 * DAY).slice(0, 10), paid_on: iso(-1 * DAY).slice(0, 10), lines: [{ description: "Maths — Yusuf (8 × 60 min)", quantity: 8, unit_amount: 42 }] },
];

export const demoLeads: Lead[] = [
  { id: "l-1", parent_name: "Grace Mensah", email: "grace@example.com", phone: "+44 7700 900123", country: "UK", timezone: "Europe/London", child_name: "Kofi", year_group: "Year 5 (KS2)", subjects: ["Maths", "11+ Prep"], goals: "Preparing for 11+ in Kent next September.", preferred_times: "Weekdays after 5pm", heard_from: "Instagram", status: "new", notes: null, created_at: iso(-4 * 3_600_000) },
  { id: "l-2", parent_name: "Ibrahim Yusuf", email: "ibrahim@example.com", phone: null, country: "CA", timezone: "America/Edmonton", child_name: "Aisha", year_group: "Grade 8", subjects: ["Science", "Maths"], goals: "Confidence before high school.", preferred_times: "Saturday mornings", heard_from: "Friend / referral", status: "contacted", notes: "Called — prefers female tutor.", created_at: iso(-1 * DAY) },
  { id: "l-3", parent_name: "Sophie Clarke", email: "sophie@example.com", phone: "+44 7700 900456", country: "UK", timezone: "Europe/London", child_name: "Harry", year_group: "Reception (EYFS)", subjects: ["Phonics & Reading"], goals: "Getting ready for Year 1 phonics.", preferred_times: "After nursery, 4pm", heard_from: "Google", status: "trial_booked", notes: "Trial with Ms. Adaeze on Thursday.", created_at: iso(-3 * DAY) },
  { id: "l-4", parent_name: "Chinwe Obi", email: "chinwe@example.com", phone: null, country: "CA", timezone: "America/Toronto", child_name: "Daniel", year_group: "Grade 11", subjects: ["Chemistry"], goals: "Improve grade from 68% to 80%+.", preferred_times: "Evenings", heard_from: "WhatsApp group", status: "converted", notes: null, created_at: iso(-9 * DAY) },
  { id: "l-5", parent_name: "Ruth Alade", email: "ruth@example.com", phone: null, country: "UK", timezone: "Europe/London", child_name: "Esther", year_group: "Year 10 (GCSE)", subjects: ["English", "Biology"], goals: null, preferred_times: null, heard_from: "Facebook", status: "new", notes: null, created_at: iso(-2 * DAY) },
];

export const demoApplications: TutorApplication[] = [
  { id: "ap-1", full_name: "Oluwaseun Bankole", email: "seun@example.com", phone: "+234 803 000 0000", country: "Nigeria", timezone: "Africa/Lagos", subjects: ["Maths", "Physics"], levels: ["KS3", "GCSE"], qualification: "B.Sc Physics", degree_class: "First Class", years_experience: 4, motivation: "I love seeing the moment a concept clicks.", cv_url: null, status: "new", assessment_score: null, notes: null, created_at: iso(-6 * 3_600_000) },
  { id: "ap-2", full_name: "Mariam Danjuma", email: "mariam@example.com", phone: null, country: "Nigeria", timezone: "Africa/Lagos", subjects: ["English", "Creative Writing"], levels: ["KS2", "KS3"], qualification: "B.A English", degree_class: "Second Class Upper", years_experience: 3, motivation: "Reading changed my life; I want to pass that on.", cv_url: null, status: "screening", assessment_score: 82, notes: "Strong psychometric score.", created_at: iso(-2 * DAY) },
  { id: "ap-3", full_name: "Emeka Nwosu", email: "emeka@example.com", phone: null, country: "Ghana", timezone: "Africa/Accra", subjects: ["Coding"], levels: ["KS2", "KS3"], qualification: "B.Sc Computer Science", degree_class: "Second Class Upper", years_experience: 2, motivation: null, cv_url: null, status: "interview", assessment_score: 76, notes: "Interview booked Fri 2pm.", created_at: iso(-5 * DAY) },
  { id: "ap-4", full_name: "Funmilayo Ojo", email: "funmi@example.com", phone: null, country: "Nigeria", timezone: "Africa/Lagos", subjects: ["Phonics & Reading"], levels: ["EYFS", "KS1"], qualification: "B.Ed Primary Education", degree_class: "First Class", years_experience: 6, motivation: null, cv_url: null, status: "demo", assessment_score: 91, notes: "Demo lesson scheduled.", created_at: iso(-8 * DAY) },
  { id: "ap-5", full_name: "Peter Okon", email: "peter@example.com", phone: null, country: "Nigeria", timezone: "Africa/Lagos", subjects: ["Chemistry"], levels: ["GCSE"], qualification: "B.Sc Chemistry", degree_class: "Third Class", years_experience: 1, motivation: null, cv_url: null, status: "rejected", assessment_score: 48, notes: "Did not meet degree requirement.", created_at: iso(-12 * DAY) },
];

export const badgeCatalog: Omit<Badge, "earned_at">[] = [
  { key: "first-session", title: "First Steps", description: "Completed your first session", emoji: "🚀" },
  { key: "streak-5", title: "On a Roll", description: "5-day learning streak", emoji: "🔥" },
  { key: "homework-hero", title: "Homework Hero", description: "Finished 10 homework tasks", emoji: "🦸" },
  { key: "star-100", title: "Star Collector", description: "Earned 100 stars", emoji: "⭐" },
  { key: "bookworm", title: "Bookworm", description: "Read 5 books with your tutor", emoji: "📚" },
  { key: "math-wizard", title: "Number Wizard", description: "Mastered a maths unit", emoji: "🧙" },
  { key: "curious", title: "Big Question", description: "Asked a brilliant question", emoji: "💡" },
  { key: "perfect-month", title: "Perfect Month", description: "No missed sessions for a month", emoji: "🏆" },
];

export const demoBadges: Record<string, Badge[]> = {
  "s-maya": badgeCatalog.map((b, i) => ({ ...b, earned_at: i < 5 ? iso(-(20 - i * 3) * DAY) : null })),
};

export const demoStarEvents: StarEvent[] = [
  { id: "st-1", student_id: "s-maya", amount: 5, reason: "Solved 8/10 equations on your own!", created_at: iso(-2 * DAY) },
  { id: "st-2", student_id: "s-maya", amount: 3, reason: "Homework done early", created_at: iso(-4 * DAY) },
  { id: "st-3", student_id: "s-maya", amount: 4, reason: "Amazing persuasive hook", created_at: iso(-3 * DAY) },
  { id: "st-4", student_id: "s-maya", amount: 2, reason: "Great focus all session", created_at: iso(-7 * DAY) },
];

export const demoAvailability: Availability[] = [1, 2, 3, 4, 5].flatMap((weekday) => [
  { id: `av-${weekday}-a`, tutor_id: "u-tutor-tobi", weekday, start_time: "16:00", end_time: "20:00" },
  ...(weekday % 2 ? [{ id: `av-${weekday}-b`, tutor_id: "u-tutor-tobi", weekday, start_time: "21:00", end_time: "23:30" }] : []),
]).concat([{ id: "av-6-a", tutor_id: "u-tutor-tobi", weekday: 6, start_time: "09:00", end_time: "13:00" }]);

const joinAt = (session: Session, minutesAfterStart: number) =>
  new Date(new Date(session.starts_at).getTime() + minutesAfterStart * 60_000).toISOString();

const attendanceOverrides: Record<string, [tutorMin: number | null, familyMin: number | null]> = {
  "ss-5": [9, 2],
  "ss-15": [0, null],
  "ss-18": [7, 1],
};

export const demoAttendance: Attendance[] = demoSessions
  .filter((s) => s.status !== "cancelled" && new Date(s.starts_at).getTime() <= now)
  .flatMap((session) => {
    const [tutorMin, familyMin] = attendanceOverrides[session.id] ?? [-2, 1];
    const parentId = demoStudents.find((st) => st.id === session.student_id)?.parent_id ?? "u-parent-amara";
    const rows: Attendance[] = [];
    if (tutorMin !== null) rows.push({ id: `at-${session.id}-t`, session_id: session.id, profile_id: session.tutor_id, role: "tutor", joined_at: joinAt(session, tutorMin) });
    if (familyMin !== null) rows.push({ id: `at-${session.id}-f`, session_id: session.id, profile_id: parentId, role: "parent", joined_at: joinAt(session, familyMin) });
    return rows;
  });

export const allDemoProfiles: Profile[] = [...demoTutors, ...demoParents, demoStudentProfile];
