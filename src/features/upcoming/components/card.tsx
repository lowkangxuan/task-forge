import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

type CardProps = {
    title?: string;
}

export function Card({children, className, title = "Title", ...props}: React.ComponentProps<"div"> & CardProps) {
    return (
        <div className={cn("flex flex-col p-4 border rounded-md gap-2 min-h-0 overflow-auto", className)} {...props}>
            <Header as="h3">{title}</Header>
            {children}
        </div>
    )
}