import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilteredTodo } from '@/features/todo/components/filtered-todo';
import { useProjects } from '@/providers/ProjectsProvider';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/upcoming')({
    component: RouteComponent,
})

function RouteComponent() {
    const { localProjects } = useProjects();
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            <Header as="h1">Upcoming</Header>
            <Tabs defaultValue="tomorrow">
                <TabsList>
                    <TabsTrigger value="tomorrow" className="px-2 py-1">Tomorrow</TabsTrigger>
                    <TabsTrigger value="this_week" className="px-2 py-1">This Week</TabsTrigger>
                    <TabsTrigger value="next_week" className="px-2 py-1">Next Week</TabsTrigger>
                    <TabsTrigger value="this_month" className="px-2 py-1">This Month</TabsTrigger>
                </TabsList>
                <TabsContent value="tomorrow">
                    <FilteredTodo
                        projects={localProjects}
                        filter="tomorrow"
                    />
                </TabsContent>
                <TabsContent value="this_week">
                    <FilteredTodo
                        projects={localProjects}
                        filter="this_week"
                    />
                </TabsContent>
                <TabsContent value="next_week">
                    <FilteredTodo
                        projects={localProjects}
                        filter="next_week"
                    />
                </TabsContent>
                <TabsContent value="this_month">
                    <FilteredTodo
                        projects={localProjects}
                        filter="this_month"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
