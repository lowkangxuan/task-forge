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

export const SidebarLink: typeof RouterLink = (props) => (
    <RouterLink
        className="hover:bg-black"
        activeProps={{ className: "bg-primary"}}
        {...props}
    />
);