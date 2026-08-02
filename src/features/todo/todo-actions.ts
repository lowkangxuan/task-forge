import { Copy, Trash } from "lucide-react";

export const TODO_ACTIONS = [
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
]

export type TodoActions = typeof TODO_ACTIONS[number][number]["action"];