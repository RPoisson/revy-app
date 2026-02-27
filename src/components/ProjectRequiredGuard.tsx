"use client";

import { useProjects } from "@/context/ProjectContext";
import { getAnswers } from "@/app/quiz/lib/answersStore";
import { ProjectRequiredEmpty } from "./ProjectRequiredEmpty";

/**
 * Renders children only when the user has a current project with quiz answers
 * (i.e. they’ve started the design). Otherwise renders ProjectRequiredEmpty.
 */
export function ProjectRequiredGuard({ children }: { children: React.ReactNode }) {
  const { currentProjectId } = useProjects();

  if (!currentProjectId) {
    return <ProjectRequiredEmpty />;
  }

  const answers = getAnswers(currentProjectId);
  const hasAnswers = Object.keys(answers).length > 0;
  if (!hasAnswers) {
    return <ProjectRequiredEmpty />;
  }

  return <>{children}</>;
}
