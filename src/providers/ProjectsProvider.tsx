import type { ProjectWithTodo } from "@/db/schema";
import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

interface ProjectsContextInterface {
    localProjects: ProjectWithTodo[],
    updateLocalProjects: Dispatch<SetStateAction<ProjectWithTodo[]>>,
}

interface ProjectsProviderProps {
    children: ReactNode,
    initialProjects: ProjectWithTodo[],
}

const ProjectsContext = createContext<ProjectsContextInterface | undefined>(undefined);

export function ProjectsProvider({ children, initialProjects }: ProjectsProviderProps) {
    const [localProjects, setLocalProjects] = useState<ProjectWithTodo[]>(initialProjects);
    useEffect(() => {
        setLocalProjects(initialProjects);
    }, [initialProjects])

    return (
        <ProjectsContext value={{ localProjects, updateLocalProjects: setLocalProjects }}>
            {children}
        </ProjectsContext>
    )
}

export function useProjects() {
    const context = useContext(ProjectsContext);

    if (!context) {
        throw new Error("useProjects must be used inside a ProjectsProvider");
    }

    return context;
}