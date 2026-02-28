// src/app/agents/index.ts
// Rêvy multi-agent architecture — PM Agent + Creative Director.
// When LangGraph is added, these nodes can be invoked from the graph.

export { runProjectManagerAudit } from "./projectManagerAgent";
export { runProjectManagerSelection } from "./projectManagerSelection";
export { buildCreativeDirectorInput } from "./buildCreativeDirectorInput";
export { runCreativeDirector } from "./creativeDirectorAgent";
export {
  SCOPE_ROOM_IDS,
  MOODBOARD_ROOM_IDS,
  SCOPE_TO_MOODBOARD_ROOM,
  getMoodboardLayoutIdForBathroom,
  BATHROOM_SCOPE_ROOM_IDS,
} from "./rooms";
export type { ScopeRoomId, MoodboardRoomId } from "./rooms";
export {
  bathroomConfigKey,
  bathroomNamesKey,
  roomNamesKey,
  BATHROOM_ROOM_IDS,
  COUNTABLE_OPTION_IDS,
  ROOM_OPTION_LABELS,
  type BathroomConfigId,
} from "@/app/quiz/scope/questions";
export type {
  ProjectMetadata,
  ProjectManagerAgentOutput,
  ProposedMaterial,
  RoomDimensions,
  CreativeDirectorInput,
  CreativeDirectorOutput,
  ProductCandidate,
  PairingRule,
  ProjectManagerSelectionOutput,
  SelectedProduct,
  MoodboardVariationId,
  MoodboardElementTarget,
  UserAdjustmentRequest,
  MoodboardVariation,
  RoomMoodboardSet,
} from "./projectManagerAgent.types";
