import { todoQueryOptions } from '@/features/todo/api/todo-queries';
import { TodoDialog } from '@/features/todo/components/dialog-editor/todo-dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import * as z from "zod";

const searchSchema = z.object({
    todo: z.string().optional(),
})

export const Route = createFileRoute('/_appLayout/_todoEditorLayout')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

function RouteComponent() {
    const { session, queryClient} = Route.useRouteContext();
    const navigate = useNavigate();
    const { todo: todoId } = Route.useSearch();
    const { data: todo, isLoading } = useQuery(todoQueryOptions(queryClient, todoId));

    useEffect(() => {
        if (!isLoading && todoId && !todo) {
            navigate({
                to: ".",
                search: (prev) => ({
                    ...prev,
                    todo: undefined,
                }),
                replace: true,
            });
        }
    }, [todoId, todo, isLoading]);

    return (
        <>
            <Outlet />
            {todo ? <TodoDialog userId={session!.user.id} todo={todo} /> : null}
        </>
    )
}
