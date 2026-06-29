import { createServerFn } from "@tanstack/react-start"
import { db } from '@/db/drizzle';
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserProjects = createServerFn({ method: "GET" })
    .inputValidator((data: { userId: string}) => data)
    .handler(async ({ data }) => {
        const userProjects = await db.select().from(projects).where(eq(projects.userId, data.userId));
        return userProjects;
    })