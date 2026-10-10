import {
  BadgeCheckIcon,
  BookOpenCheckIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  ChartLineIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  HandshakeIcon,
  HomeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  RadioIcon,
  ReceiptIcon,
  SettingsIcon,
  SparklesIcon,
  TrophyIcon,
  UserPlusIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/database";

/** Section roots are matched exactly so child pages don't highlight them. */
export const sectionRoots = ["/admin", "/tutor", "/parent", "/learner"];

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const dashboardNav: Record<Role, NavGroup[]> = {
  admin: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
        { title: "Live classes", href: "/admin/live", icon: RadioIcon },
      ],
    },
    {
      label: "Pipeline",
      items: [
        { title: "Trial requests", href: "/admin/leads", icon: InboxIcon },
        { title: "Tutor applications", href: "/admin/applications", icon: UserPlusIcon },
      ],
    },
    {
      label: "Academy",
      items: [
        { title: "Tutors", href: "/admin/tutors", icon: GraduationCapIcon },
        { title: "Families", href: "/admin/families", icon: UsersIcon },
        { title: "Matches", href: "/admin/matches", icon: HandshakeIcon },
        { title: "Sessions", href: "/admin/sessions", icon: CalendarDaysIcon },
        { title: "Invoices", href: "/admin/invoices", icon: ReceiptIcon },
      ],
    },
    {
      label: "My teaching",
      items: [
        { title: "Today", href: "/tutor", icon: HomeIcon },
        { title: "Schedule", href: "/tutor/schedule", icon: CalendarClockIcon },
        { title: "My students", href: "/tutor/students", icon: GraduationCapIcon },
        { title: "Progress reports", href: "/tutor/reports", icon: ChartLineIcon },
        { title: "Messages", href: "/messages", icon: MessageCircleIcon },
        { title: "Availability", href: "/tutor/availability", icon: CalendarClockIcon },
      ],
    },
  ],
  tutor: [
    {
      label: "Teaching",
      items: [
        { title: "Today", href: "/tutor", icon: HomeIcon },
        { title: "Schedule", href: "/tutor/schedule", icon: CalendarDaysIcon },
        { title: "My students", href: "/tutor/students", icon: UsersIcon },
        { title: "Progress reports", href: "/tutor/reports", icon: ChartLineIcon },
      ],
    },
    {
      label: "Me",
      items: [
        { title: "Messages", href: "/messages", icon: MessageCircleIcon },
        { title: "Availability", href: "/tutor/availability", icon: CalendarClockIcon },
        { title: "Earnings", href: "/tutor/earnings", icon: WalletIcon },
      ],
    },
  ],
  parent: [
    {
      label: "Family",
      items: [
        { title: "Home", href: "/parent", icon: HomeIcon },
        { title: "My children", href: "/parent/children", icon: UsersIcon },
        { title: "Sessions", href: "/parent/sessions", icon: CalendarDaysIcon },
        { title: "Progress reports", href: "/parent/reports", icon: ChartLineIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Messages", href: "/messages", icon: MessageCircleIcon },
        { title: "Billing", href: "/parent/billing", icon: ReceiptIcon },
      ],
    },
  ],
  student: [
    {
      label: "My learning",
      items: [
        { title: "My space", href: "/learner", icon: SparklesIcon },
        { title: "Homework", href: "/learner/homework", icon: BookOpenCheckIcon },
        { title: "Badges", href: "/learner/badges", icon: TrophyIcon },
      ],
    },
  ],
};

export const settingsNavItem: NavItem = { title: "Settings", href: "/settings", icon: SettingsIcon };
export const verifiedIcon = BadgeCheckIcon;
export const reportsIcon = ClipboardListIcon;
