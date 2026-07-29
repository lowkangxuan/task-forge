import { CircleDashed } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../../../components/ui/context-menu";
import { SidebarMenuButton } from "../../../components/ui/multisidebar";
import { Link } from "@tanstack/react-router";

type SidebarProjectButtonProps = {
    id: string;
    name: string;
}

const 

export function SidebarProjectButton({ id, name }: SidebarProjectButtonProps) {
    return (
        <ContextMenu>
            <ContextMenuTrigger render={
                <SidebarMenuButton render={
                    <Link
                        to="/projects/$projectId"
                        activeProps={{ className: "bg-primary" }}
                        params={{ projectId: String(id) }}
                        preload="intent"
                        className="overflow-clip"
                    />
                }>
                    <CircleDashed />
                    <span className="pr-6">{name}</span>
                </SidebarMenuButton>
            } />
            <ContextMenuContent>
                <ContextMenuItem>Profile</ContextMenuItem>
                <ContextMenuItem>Billing</ContextMenuItem>
                <ContextMenuItem>Team</ContextMenuItem>
                <ContextMenuItem>Subscription</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}