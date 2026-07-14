import { cva, type VariantProps } from "class-variance-authority";
import { Input } from "./input";
import { cn } from "@/lib/utils";

const customInputVariants = cva(
    "",
    {
        variants: {
            variant: {
                default: "",
                ghost: "bg-transparent px-0 border-none outline-none font-bold placeholder:text-muted-foreground field-sizing-content focus-visible:ring-0"
            },
            size: {
                default: "h-7 md:text-sm",
                sm: "h-8 md:text-xs",
                lg: "h-10 md:text-lg",
                xl: "h-12 md:text-xl",
                "2xl": "h-12 md:text-2xl",
                "3xl": "h-12 md:text-3xl",
                "4xl": "h-12 md:text-4xl",
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