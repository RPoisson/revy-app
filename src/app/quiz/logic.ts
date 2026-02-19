//revy-quiz/quz/logic.ts 
import type { ArchetypeId } from "./spaceTags";
import { SPACE_TAGS } from "./spaceTags";

type Answers = Record<string, string[]>;

const SUPPORTED_ARCHETYPES_BY_STYLE: Record<string, ArchetypeId[]> = {
  french_provincial: ["parisian", "provincial"],
  mediterranean_spanish: ["mediterranean", "provincial"],
  cape_cod: ["parisian", "provincial"],
  colonial: ["parisian", "provincial"],
  craftsman: ["provincial", "mediterranean"],
  modern_farmhouse: ["provincial", "parisian"],
  ranch: ["mediterranean", "provincial"],
  midcentury_modern: ["parisian", "mediterranean"],
  contemporary_modern: ["parisian", "mediterranean"],
  tudor_english_cottage: ["parisian", "provincial"],
  victorian: ["parisian"],
};

export function isArchetypeSupported(
  answers: Record<string, string[]>,
  archetype: ArchetypeId
): boolean {
  return getSupportedArchetypesForCurrentExterior(answers).has(archetype);
}

export function getSupportedArchetypesForCurrentExterior(answers: Answers): Set<ArchetypeId> {
  const exterior = answers["home_exterior_style"]?.[0];
  if (!exterior) return new Set<ArchetypeId>(["parisian", "provincial", "mediterranean"]); // before Q1 chosen
  return new Set(SUPPORTED_ARCHETYPES_BY_STYLE[exterior] ?? ["parisian", "provincial", "mediterranean"]);
}

export function shouldShowSpace(spaceId: string, answers: Answers): boolean {
  const supported = getSupportedArchetypesForCurrentExterior(answers);
  const tag = SPACE_TAGS[spaceId];

  // If you ever have missing tag data, default to showing rather than hiding everything
  if (!tag?.archetype) return true;

  // Show if ANY archetype weight exists in the supported set
  return Object.entries(tag.archetype).some(([a, weight]) => {
    return (weight ?? 0) > 0 && supported.has(a as ArchetypeId);
  });
}
