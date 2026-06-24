import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { auth } from "./auth";

export const authMiddleware = createMiddleware().server(
    async ({ request, next}) => {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            throw (redirect({ to: "/signin" }));
        };

        const response = await next();
        return response;
})