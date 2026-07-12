import { cva, type VariantProps } from "class-variance-authority";
import { Input } from "./input";
import { cn } from "@/lib/utils";

const customInputVariants = cva(
    "",
    {
        variants: {
            variant: {
                default: "",
                ghost: "bg-transparent border-none outline-none font-bold placeholder:text-muted-foreground field-sizing-content focus-visible:ring-0"
            },
            size: {
                default: "",

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
    value,
    variant,
    size,
    ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof customInputVariants>) {
    return (
        <Input
            value={value}
            className={cn(customInputVariants({ variant, size, className}))}
            {...props}
        />
    )
}