import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy, Ellipsis, Trash } from "lucide-react";

const actions = [
    [
        {
            label: "Duplicate",
            icon: Copy,
        },
        {
            label: "Delete",
            icon: Trash,
        },
    ]
]

export function ProjectActions() {
    return (
        <Popover>
            <PopoverTrigger render={
                <Button variant="ghost" size="icon-lg">
                    <Ellipsis />
                </Button>
            } />
            <PopoverContent align="end" className="w-56 overflow-hidden rounded-lg p-0">
                <div className="flex flex-col">
                    {actions.map((section, index) => (
                        <div key={index} className="flex flex-col p-2 gap-1 border-b last:border-none">
                            {section.map((item, index) => (
                                <Button key={index} variant="ghost" className="justify-start text-sm font-normal gap-2">
                                    <item.icon /> <span>{item.label}</span>
                                </Button>
                            ))}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}