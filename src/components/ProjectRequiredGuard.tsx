"use client";

import { useProjects } from "@/context/ProjectContext";
import { getAnswers } from "@/app/quiz/lib/answersStore";
import { ProjectRequiredEmpty } from "./ProjectRequiredEmpty";

/**
 * Renders children only when the user has a current project with quiz answers
 * (i.e. they’ve started the design). Otherwise renders ProjectRequiredEmpty.
 */
export function ProjectRequiredGuard({
  children,
  emptyVariant,
}: {
  children: React.ReactNode;
  emptyVariant?: "plan" | "designs";
}) {
  const { currentProjectId } = useProjects();

  if (!currentProjectId) {
    return <ProjectRequiredEmpty variant={emptyVariant} />;
  }

  const answers = getAnswers(currentProjectId);
  const hasAnswers = Object.keys(answers).length > 0;
  if (!hasAnswers) {
    return <ProjectRequiredEmpty variant={emptyVariant} />;
  }

  return <>{children}</>;
}
