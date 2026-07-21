import { cn } from "@/lib/utils";
import { createLink } from "@tanstack/react-router";
import type { AnchorHTMLAttributes } from "react";

const RouterLink = createLink(
    ({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
            {...props}
            className={cn(className)}
        />
    ),
);

export const TodoLink: typeof RouterLink = (props) => {
    return (
        <RouterLink
            className=""
            {...props}
        />
    );
};