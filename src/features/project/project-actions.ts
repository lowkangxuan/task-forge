import { Copy, ExternalLink, Link, Trash } from "lucide-react";

export const PROJECT_HEADER_ACTIONS = [
    [
        {
            action: "duplicate" as const,
            label: "Duplicate",
            icon: Copy,
        },
        {
            action: "delete" as const,
            label: "Delete",
            icon: Trash,
        },
    ]
];

export const PROJECT_SIDEBAR_ACTIONS = [
    [
        {
            action: "copy_link" as const,
            label: "Copy Link",
            icon: Link,
        },
        {
            action: "new_tab" as const,
            label: "Open in new tab",
            icon: ExternalLink,
        },
        {
            action: "duplicate" as const,
            label: "Duplicate",
            icon: Copy,
        },

    ],
    [
        {
            action: "delete" as const,
            label: "Delete",
            icon: Trash,
        },
    ]
];

export type ProjectHeaderActions = typeof PROJECT_HEADER_ACTIONS[number][number]["action"];
export type ProjectSidebarActions = typeof PROJECT_SIDEBAR_ACTIONS[number][number]["action"];