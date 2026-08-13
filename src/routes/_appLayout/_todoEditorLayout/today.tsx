import { Header } from '@/components/header'
import { todayTodoQueryOptions } from '@/features/todo/api/todo-queries';
import { FilteredTodo } from '@/features/todo/components/filtered-todo';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/_todoEditorLayout/today')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(
            todayTodoQueryOptions(),
        );
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data: todos } = useSuspenseQuery(todayTodoQueryOptions());

    return (
        <div className="flex flex-col gap-4">
            <Header as="h1">Today</Header>
            <FilteredTodo todos={todos} filter="today" />
        </div>
    );
}
