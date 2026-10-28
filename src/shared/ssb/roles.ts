/* SSB Portal roles and the pages each role may open (from SSB_Portal.html ROLE_NAV). */

export type RoleKey = "admin" | "candidate" | "district" | "centre" | "exam" | "expert" | "scrutiny";

export type PageKey =
    | "dashboard"
    | "advertisements"
    | "applications"
    | "profile"
    | "admitcard"
    | "results"
    | "centres"
    | "centre-audit"
    | "attendance"
    | "challenges"
    | "integration"
    | "audit"
    | "settings";

/** Header role names, in the order they are listed. The first one is the default (Candidate). */
export const ROLES: { key: RoleKey; label: string; description: string }[] = [
    { key: "candidate", label: "Candidate / Student", description: "Apply for posts, download admit cards and view results" },
    { key: "admin", label: "SSB Administrator", description: "Advertisements, centres, challenges, settings and audit logs" },
    { key: "district", label: "District / Zone Superintendent", description: "Propose centres and review centre audits for the zone" },
    { key: "centre", label: "Centre Superintendent", description: "Complete the centre audit and mark exam-day attendance" },
    { key: "exam", label: "Examination Authority", description: "Exam configuration, applications and attendance" },
    { key: "expert", label: "Subject Expert", description: "Review answer key challenges and recommend revisions" },
    { key: "scrutiny", label: "Scrutiny / Verification Officer", description: "Verify candidate documents and centre audits" },
];

export const ROLE_NAV: Record<RoleKey, PageKey[]> = {
    admin: ["dashboard", "advertisements", "applications", "centres", "centre-audit", "attendance", "challenges", "audit", "settings", "integration"],
    candidate: ["dashboard", "advertisements", "applications", "profile", "admitcard", "results", "challenges"],
    district: ["dashboard", "advertisements", "applications", "centres", "centre-audit", "attendance", "audit"],
    centre: ["dashboard", "applications", "centre-audit", "attendance"],
    exam: ["dashboard", "advertisements", "applications", "attendance", "settings"],
    expert: ["dashboard", "applications", "challenges"],
    scrutiny: ["dashboard", "applications", "centre-audit", "audit"],
};

/** Route of each page (detail pages live under their list page). */
export const PAGE_PATH: Record<PageKey, string> = {
    dashboard: "/dashboard",
    advertisements: "/advertisements",
    applications: "/applications",
    profile: "/profile",
    admitcard: "/admit-card",
    results: "/results",
    centres: "/centres",
    "centre-audit": "/centre-audit",
    attendance: "/attendance",
    challenges: "/challenges",
    integration: "/hims-integration",
    audit: "/audit-logs",
    settings: "/settings",
};

export const roleKeyOf = (label: string): RoleKey => ROLES.find((r) => r.label === label)?.key ?? "candidate";
export const canOpen = (roleLabel: string, page: PageKey) => ROLE_NAV[roleKeyOf(roleLabel)].includes(page);
