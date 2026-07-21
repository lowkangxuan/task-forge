import { Header } from '@/components/header';
import { FilteredTodo } from '@/features/todo/components/filtered-todo';
import { Card } from '@/features/upcoming/components/card';
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
            <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-4 overflow-hidden">
                <Card className="col-span-2" title="Today">
                    <FilteredTodo
                        projects={localProjects}
                        filter="today"
                    />
                </Card>

                <Card title="Tomorrow">
                    <FilteredTodo
                        projects={localProjects}
                        filter="tomorrow"
                    />
                </Card>

                <Card title="Next Week">
                    <FilteredTodo
                        projects={localProjects}
                        filter="next week"
                    />
                </Card>
            </div>
        </div>
    );
}
