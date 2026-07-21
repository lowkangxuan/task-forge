import { Header } from '@/components/header'
import { FilteredTodo } from '@/features/todo/components/filtered-todo';
import { useProjects } from '@/providers/ProjectsProvider'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/today')({
    component: RouteComponent,
})

function RouteComponent() {
    const { localProjects } = useProjects();
    return (
        <div className="flex flex-col gap-4">
            <Header as="h1">Today</Header>
            <FilteredTodo projects={localProjects} filter="today" />
        </div>
    );
}
