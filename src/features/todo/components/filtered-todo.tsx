import type { Todo } from "@/db/schema";
import { TodoRow } from "./todo-row";
import { filterCheck, FILTERS, type Filter } from "../filters";

type FilteredTodoProps = {
    todos: Todo[];
    filter: Filter;
}

function filterTodos({ todos, filter }: FilteredTodoProps) {
    return todos.filter((todo) => !todo.isCompleted && !!todo.dueDate && filterCheck(todo.dueDate, filter));
}

export function FilteredTodo(props: FilteredTodoProps) {
    const todos = filterTodos(props);

    if (todos.length === 0) {
        return (
            <div className="flex-1 content-center text-center text-lg font-semibold text-accent-foreground/50 capitalize">
                <span>No pending tasks for {FILTERS[props.filter].empty}</span>
            </div>
        )
    } else {
        return (
            <div className="flex flex-col gap-1 flex-1 scroll-fade overflow-y-auto min-h-0">
                {todos.map(todo => (
                    <TodoRow key={todo.id} todo={todo} path="." />
                ))}
            </div>
        )
    }

}