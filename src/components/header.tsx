import React from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const variantStyles: Record<HeadingLevel, string> = {
    h1: "text-4xl font-bold",
    h2: "text-3xl font-bold",
    h3: "text-2xl font-semibold",
    h4: "text-xl font-semibold",
    h5: "text-lg font-medium",
    h6: "text-base font-medium",
};

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: HeadingLevel;
    children: React.ReactNode;
}

export function Header({
    as: Component = "h1",
    children,
    className,
    ...props
}: HeadingProps) {
    return (
        <Component
            {...props}
            className={cn(variantStyles[Component], className)}
        >
            {children}
        </Component>
    );
}