import { Header } from '@/components/header'
import type { ProjectWithTodo } from '@/db/schema';
import { TodoRow } from '@/features/project/components/todo-row';
import { useProjects } from '@/providers/ProjectsProvider'
import { createFileRoute } from '@tanstack/react-router'
import { isToday } from 'date-fns';
import * as z from "zod";

export const Route = createFileRoute('/_appLayout/today/')({
    validateSearch: z.object({ p: z.string().optional() }),
    component: RouteComponent,
})

function filterTodayTodos(projects: ProjectWithTodo[]) {
    return projects.flatMap((project) => project.todos.filter((todo) => !!todo.dueDate && isToday(todo.dueDate)))
}

function RouteComponent() {
    const { localProjects } = useProjects();
    const filteredTodos = filterTodayTodos(localProjects);
    return (
        <div className="flex flex-col gap-4">
            <Header as="h1">Today</Header>
            <div className="flex flex-col">
                {filteredTodos.map((todo) => {
                    return (
                        <TodoRow key={todo.id} todo={todo} path="." />
                    );
                })}
            </div>
        </div>
    )
}
