import type { ProjectWithTodo } from "@/db/schema";
import { addWeeks, isSameWeek, isToday, isTomorrow } from "date-fns";
import { TodoRow } from "./todo-row";

type filter = "today" | "tomorrow" | "next week";

type FilteredTodoProps = {
    projects: ProjectWithTodo[];
    filter: filter;
}

function filterCheck(date: Date, filter: filter) {
    switch (filter) {
        case "today":
            return isToday(date);
        
        case "tomorrow":
            return isTomorrow(date);

        case "next week":
            const nextWeekDate = addWeeks(new Date(), 1);
            return isSameWeek(date, nextWeekDate);

        default:
            break;
    }
}

function filterTodos({ projects, filter }: FilteredTodoProps) {
    return projects.flatMap((project) => project.todos.filter((todo) => !!todo.dueDate && filterCheck(todo.dueDate, filter)));
}

export function FilteredTodo(props: FilteredTodoProps) {
    const todos = filterTodos(props);

    return (
        <div className="flex flex-col gap-1 flex-1 scroll-fade overflow-y-auto min-h-0">
            {todos.map(todo => (
                <TodoRow key={todo.id} todo={todo} path="." />
            ))}
        </div>
    )
}