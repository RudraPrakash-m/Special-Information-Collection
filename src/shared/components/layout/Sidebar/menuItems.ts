import {
    ClipboardList,
    LayoutDashboard,
    FilePlus,
    ShieldCheck,
    Globe,
    Building2,
    Upload,
    CheckSquare,
    BarChart3,
    Database,
    FolderKanban,
    type LucideIcon,
} from "lucide-react";
import { ROLES } from "@/shared/ssb/roles";

export interface MenuItem {
    icon?: LucideIcon;
    label: string;
    path?: string;
    submenu?: MenuItem[];
}

export const ALL_MENU_ITEMS: MenuItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    {
        label: "Manage Information Collection",
        icon: FolderKanban,
        submenu: [
            { label: "Create Collection", icon: FilePlus, path: "/information-collection/create-collection" },
            { label: "Manage Collections", icon: ClipboardList, path: "/information-collection/manage-collections" },
            { label: "Validation Rules", icon: ShieldCheck, path: "/information-collection/validation-rules" },
            { label: "Dedicated Interface", icon: Globe, path: "/information-collection/dedicated-interface" },
            { label: "My Collections", icon: Building2, path: "/information-collection/my-collections" },
            { label: "Offline Upload", icon: Upload, path: "/information-collection/offline-upload" },
            { label: "Verify Submissions", icon: CheckSquare, path: "/information-collection/verify-submissions" },
            { label: "Monitoring", icon: BarChart3, path: "/information-collection/monitoring" },
            { label: "Collected Data", icon: Database, path: "/information-collection/collected-data" },
        ],
    },
];

/** Role name → menu labels it may see. */
export const ROLE_MENU_MAP: Record<string, string[]> = Object.fromEntries(
    ROLES.map((r) => [r.label, ALL_MENU_ITEMS.map((item) => item.label)]),
);

/** Menu items for the given role (defaults to all configured menu items). */
export const getMenuItemsForRole = (_role?: string): MenuItem[] => {
    return ALL_MENU_ITEMS;
};

/** Default menu items for initial render or fallback */
export const MENU_ITEMS: MenuItem[] = getMenuItemsForRole();

export interface MenuLeaf {
    label: string;
    path: string;
    icon?: LucideIcon;
    trail: string[];
}

/** Every clickable page in the menu for the current role. */
export const flattenMenu = (items?: MenuItem[], trail: string[] = [], icon?: LucideIcon): MenuLeaf[] => {
    const list = items ?? getMenuItemsForRole();
    return list.flatMap((item) => {
        const itemIcon = item.icon ?? icon;
        if (item.submenu?.length) return flattenMenu(item.submenu, [...trail, item.label], itemIcon);
        return item.path ? [{ label: item.label, path: item.path, icon: itemIcon, trail }] : [];
    });
};
