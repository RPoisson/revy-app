// src/app/agents/index.ts
// Rêvy multi-agent architecture — PM Agent export.
// When LangGraph is added, this node can be invoked from the graph.

export { runProjectManagerAudit } from "./projectManagerAgent";
export { runProjectManagerSelection } from "./projectManagerSelection";
export type {
  ProjectMetadata,
  ProjectManagerAgentOutput,
  ProposedMaterial,
  RoomDimensions,
  CreativeDirectorOutput,
  ProductCandidate,
  PairingRule,
  ProjectManagerSelectionOutput,
  SelectedProduct,
} from "./projectManagerAgent.types";
