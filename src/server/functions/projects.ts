import { createServerFn } from "@tanstack/react-start"
import { db } from '@/db/drizzle';
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "@/lib/auth-middleware";
import * as z from "zod";
import { findManyProjects, findProjectById, insertProject, removeProject } from "../repositories/projects.server";


const defaultProjectInput = z.object({
    name: z.string(),
    description: z.string(),
})

export const verifyProjectOwnership = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const query = await findProjectById({
            userId: context.user.id,
            projectId: data.projectId,
        });
        return query !== null;
    });

export const createNewProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(defaultProjectInput)
    .handler(async ({ context, data }) => {
        const project = await insertProject({
            userId: context.user.id,
            ...data,
        })
        return project;
    });

export const getUserProjects = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        const userProjects = await findManyProjects(context.user.id);
        return userProjects;
    });

export const getProjectById = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const { projectId } = data;
        const project = await findProjectById({
            userId: context.user.id,
            projectId: projectId,
        });

        return project ?? null;
    });

export const updateProjectName = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator((data: { projectId: string, name: string }) => data)
    .handler(async ({ data }) => {
        await db.update(projects).set({ name: data.name }).where(eq(projects.id, data.projectId));
    })

export const deleteProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ context, data }) => {
        await removeProject({
            userId: context.user.id,
            projectId: data.projectId,
        })
    });

export const duplicateProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const { projectId } = data;
        const projectToDupe = await findProjectById({
            userId: context.user.id,
            projectId: projectId,
        })

        if (!projectToDupe) return undefined;

        const similarNames = await db.query.projects.findMany({
            where: (projects, { like }) => like(projects.name, `${projectToDupe.name}%`),
        })
        const nextSuffix = similarNames.length;
        const todos = projectToDupe.todos;

        await insertProject({
            userId: context.user.id,
            name: `${projectToDupe.name}_${nextSuffix}`,
            description: `${projectToDupe.description}`,
        });

        
    })