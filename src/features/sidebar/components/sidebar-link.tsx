import { cn } from "@/lib/utils";
import { createLink } from "@tanstack/react-router";
import type { AnchorHTMLAttributes } from "react";

const RouterLink = createLink(
    ({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
            {...props}
            className={cn(
                className,
                "data-[status=active]:bg-primary",
                "data-[status=active]:hover:bg-primary",
                "data-[status=active]:text-primary-foreground",
            )}
        />
    ),
);

export const SidebarLink = RouterLink;