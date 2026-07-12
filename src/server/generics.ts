import { authMiddleware } from "@/lib/auth-middleware";
import { createServerFn } from "@tanstack/react-start";

export const deleteMainProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator((data: { projectId: string }) => data)
    .handler(async ({ data }) => {
        
    });