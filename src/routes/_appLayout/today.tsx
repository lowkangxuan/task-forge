import { Header } from '@/components/header'
import { todayTodoQueryOptions } from '@/features/todo/api/todo-queries';
import { TodoRow } from '@/features/todo/components/todo-row';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/today')({
    loader: ({ context }) => {
        context.queryClient.prefetchQuery(
            todayTodoQueryOptions(),
        );
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data: todos } = useSuspenseQuery(todayTodoQueryOptions());
    console.log(todos);
    return (
        <div className="flex flex-col gap-4">
            <Header as="h1">Today</Header>
            {/* <FilteredTodo projects={localProjects} filter="today" /> */}
            <div className="flex flex-col gap-1 flex-1 scroll-fade overflow-y-auto min-h-0">
                {todos.map((todo) => {
                    return (
                        <TodoRow
                            key={todo.id}
                            todo={todo}
                            path="."
                        />
                    )
                })}
            </div>
        </div>
    );
}
