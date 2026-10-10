import type { Testimonial } from "@/types/database";

export const highlights = [
  "Early Years to GCSE & Grade 12",
  "UK National Curriculum",
  "Canadian provincial curricula",
  "Fully vetted, degree-qualified tutors",
  "Personal learning plan",
  "Same tutor, every week",
  "Monthly progress reports",
  "Lessons in your time zone",
] as const;

export const parentWorries = [
  "Is tutoring actually making a difference?",
  "Does the tutor understand what my child's school is teaching?",
  "Are they spending time on the right topics?",
  "How do I stay in the loop without hovering?",
  "What if the tutor just isn't the right fit?",
] as const;

export const pillars = [
  {
    title: "One tutor who really knows your child",
    body: "No rotating strangers. Your child learns with the same person each week, so trust (and momentum) builds.",
    tone: "leaf",
  },
  {
    title: "Calm, clear updates for parents",
    body: "Session notes after every lesson, a monthly report, and a direct line to the tutor. No chasing.",
    tone: "cream",
  },
  {
    title: "A plan built around them",
    body: "We map your child's goals to their school curriculum and adjust the plan as they grow.",
    tone: "primary",
  },
] as const;

export const vettingSteps = [
  {
    title: "Strong degree, right subject",
    body: "Only first or upper-second class graduates, teaching the subjects they studied.",
  },
  {
    title: "Character assessment",
    body: "Psychometric screening for patience, judgement, empathy and integrity.",
  },
  {
    title: "Interview & live demo lesson",
    body: "Every tutor teaches a real mini-lesson to our academic team before joining.",
  },
  {
    title: "Crystal training & safeguarding",
    body: "Child safety, UK & Canadian curricula, online classroom craft and teaching across time zones.",
  },
] as const;

export const processSteps = [
  {
    title: "Tell us about your child",
    body: "Share their year group, where they're stuck and what success looks like for your family.",
    tone: "coral",
  },
  {
    title: "Meet your perfect match",
    body: "We pair your child with a tutor who suits their personality and learning style — not just the subject.",
    tone: "leaf",
  },
  {
    title: "Get a personal plan",
    body: "Your tutor maps a clear roadmap aligned to the curriculum, reviewed every month.",
    tone: "blush",
  },
  {
    title: "Stay in the loop",
    body: "Session notes, homework, progress reports and direct messaging — all in your parent portal.",
    tone: "sun",
  },
] as const;

export const differentiators = [
  {
    title: "The whole child, not just the grade",
    body: "Confidence, curiosity and wellbeing matter as much as marks. Our tutors notice the person in front of them.",
  },
  {
    title: "Belief comes first",
    body: "Children rise to the expectations of adults who believe in them. Every session starts there.",
  },
  {
    title: "Room to go further",
    body: "Once the gaps are closed we keep going: stretch work, competitions, 11+ and beyond.",
  },
] as const;

export const testimonials: Testimonial[] = [
  {
    quote:
      "Our son went from dreading maths to asking for extra questions. The weekly notes mean I finally know what's going on, even from work.",
    name: "Adaobi N.",
    detail: "Parent of a Year 6 pupil · Manchester",
  },
  {
    quote:
      "Finding a tutor who understood both the Ontario curriculum and our culture felt impossible. Crystal matched us in four days.",
    name: "The Adebayo family",
    detail: "Grade 4 & Grade 8 · Toronto",
  },
  {
    quote:
      "Ms. Kemi helped my daughter jump two grades in English Language before her GCSEs. Calm, organised and genuinely kind.",
    name: "Dr. Funke O.",
    detail: "Parent of a Year 11 pupil · London",
  },
  {
    quote:
      "The progress reports are brilliant — we can see exactly which skills are mastered and what's next.",
    name: "Kwame & Efua",
    detail: "Parents of a Year 2 pupil · Birmingham",
  },
  {
    quote:
      "Scheduling across time zones is seamless. Lessons just appear in our local time and the tutor is never late.",
    name: "Zainab B.",
    detail: "Parent of a Grade 5 pupil · Vancouver",
  },
];

export type PricingPlan = {
  name: string;
  description: string;
  sessionsPerWeek: number;
  minutes: number;
  price: { GBP: number; CAD: number };
  featured?: boolean;
  features: string[];
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    description: "A steady weekly boost in one subject.",
    sessionsPerWeek: 1,
    minutes: 60,
    price: { GBP: 120, CAD: 210 },
    features: ["4 × 60-min sessions a month", "One dedicated tutor", "Session notes & homework", "Monthly progress report"],
  },
  {
    name: "Steady",
    description: "Our most popular plan for real momentum.",
    sessionsPerWeek: 2,
    minutes: 60,
    price: { GBP: 220, CAD: 385 },
    featured: true,
    features: [
      "8 × 60-min sessions a month",
      "Personal learning roadmap",
      "Session notes & homework",
      "Monthly progress report + parent call",
      "Rewards & badges for your child",
    ],
  },
  {
    name: "Intensive",
    description: "Exam years, 11+ and catch-up sprints.",
    sessionsPerWeek: 3,
    minutes: 60,
    price: { GBP: 315, CAD: 550 },
    features: [
      "12 × 60-min sessions a month",
      "Exam-aligned revision plan",
      "Past-paper practice & marking",
      "Fortnightly progress reports",
      "Priority tutor matching",
    ],
  },
];

export const faqs = [
  {
    q: "How does the free trial work?",
    a: "Tell us about your child and we'll match them with a tutor for a free 30-minute trial lesson. If it's a good fit, you choose a plan. No card needed to book.",
  },
  {
    q: "Where are your tutors based?",
    a: "Our tutors are graduates based mainly in Nigeria and across West Africa, trained in the UK National Curriculum and Canadian provincial curricula. Many share the cultural background of the families we serve.",
  },
  {
    q: "Which curricula do you cover?",
    a: "UK: EYFS, KS1–KS4, SATs, 11+ and GCSE. Canada: Pre-K to Grade 12, aligned to provincial expectations (Ontario, Alberta, BC and more).",
  },
  {
    q: "What happens in a lesson?",
    a: "Lessons are live, one-to-one video sessions on Google Meet or Zoom with an interactive whiteboard. Your tutor follows your child's plan and shares notes and homework afterwards.",
  },
  {
    q: "How do time zones work?",
    a: "Everything in your portal is shown in your local time — whether you're in London, Toronto or Vancouver. Tutors see the same lesson in their own time.",
  },
  {
    q: "What if the tutor isn't the right fit?",
    a: "Just tell us. We'll rematch your child with a new tutor at no extra cost, usually within a week.",
  },
  {
    q: "How is my child kept safe?",
    a: "Every tutor is identity-checked, referenced and trained in safeguarding. Lessons happen on approved platforms and parents can drop in at any time.",
  },
  {
    q: "How do payments work?",
    a: "Plans are billed monthly in GBP or CAD. You can pause or cancel with 14 days' notice.",
  },
] as const;

export const stats = [
  { value: 98, suffix: "%", label: "of parents see progress in the first term" },
  { value: 40, suffix: "+", label: "vetted tutors across 14 subjects" },
  { value: 4.9, suffix: "/5", label: "average session rating", decimals: 1 },
  { value: 72, suffix: "h", label: "average time to match a tutor" },
] as const;
