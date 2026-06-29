import { createMiddleware } from "@tanstack/react-start";
import { getSessionFn } from "./auth-session";

export const authMiddleware = createMiddleware().server(
    async ({ next}) => {
        const session = await getSessionFn();

        if (!session) {
            throw new Error("Unauthorized!");
        };

        return next({ context: session });
})