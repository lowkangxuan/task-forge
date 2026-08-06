import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Todo } from "@/db/schema";

export function EditorDialog({todo}: {todo: Todo}) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{todo.name || "New Task"}</DialogTitle>
                <DialogDescription>
                    View or edit the task details.
                </DialogDescription>
            </DialogHeader>
            {/* Task form */}
        </DialogContent>
    )
}