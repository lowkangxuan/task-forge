import { cva, type VariantProps } from "class-variance-authority";
import { Input } from "./input";
import { cn } from "@/lib/utils";

const customInputVariants = cva(
    "h-auto",
    {
        variants: {
            variant: {
                default: "",
                ghost: "bg-transparent p-0 border-none outline-none font-bold placeholder:text-muted-foreground field-sizing-content focus-visible:ring-0"
            },
            size: {
                default: "md:text-sm",
                sm: "md:text-xs",
                lg: "md:text-lg",
                xl: "md:text-xl",
                "2xl": "md:text-2xl",
                "3xl": "md:text-3xl",
                "4xl": "md:text-4xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        }
    }
)

export function CustomInput({
    className,
    variant,
    size,
    ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof customInputVariants>) {
    return (
        <Input
            className={cn(customInputVariants({ variant, size, className }))}
            {...props}
        />
    )
}