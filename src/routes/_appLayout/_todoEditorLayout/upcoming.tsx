import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { upcomingTodoQueryOptions } from '@/features/todo/api/todo-queries';
import { FilteredTodo } from '@/features/todo/components/filtered-todo';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/_todoEditorLayout/upcoming')({
    loader: ({ context }) => {
        context.queryClient.prefetchQuery(upcomingTodoQueryOptions());
    },
    component: RouteComponent,
})



function RouteComponent() {
    const { data: todos } = useSuspenseQuery(upcomingTodoQueryOptions());

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            <Header as="h1">Upcoming</Header>
            <Tabs defaultValue="tomorrow">
                <TabsList>
                    <TabsTrigger value="tomorrow" className="px-2 py-1">Tomorrow</TabsTrigger>
                    <TabsTrigger value="this_week" className="px-2 py-1">This Week</TabsTrigger>
                    <TabsTrigger value="next_week" className="px-2 py-1">Next Week</TabsTrigger>
                    <TabsTrigger value="this_month" className="px-2 py-1">Later</TabsTrigger>
                </TabsList>
                <TabsContent value="tomorrow">
                    <FilteredTodo
                        todos={todos}
                        filter="tomorrow"
                    />
                </TabsContent>
                <TabsContent value="this_week">
                    <FilteredTodo
                        todos={todos}
                        filter="later_week"
                    />
                </TabsContent>
                <TabsContent value="next_week">
                    <FilteredTodo
                        todos={todos}
                        filter="next_week"
                    />
                </TabsContent>
                <TabsContent value="this_month">
                    <FilteredTodo
                        todos={todos}
                        filter="later"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
