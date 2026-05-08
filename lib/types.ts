// Single source of truth for all data shapes in Resonance.
// Every API route, every prompt parser, every component imports from here.

// ============================================================================
// Brief — the user's input creative brief, parsed into structured attributes
// ============================================================================

export type ParsedAttributes = {
  genre: string;
  mood: string[];
  tempo: string;
  targetUseCase: string;
  targetDemographic: string;
};

export type Brief = {
  id: string;
  rawText: string;
  parsedAttributes: ParsedAttributes;
  createdAt: string; // ISO 8601
};

// ============================================================================
// Variant — a single AI-generated track concept derived from the brief
// ============================================================================

export type Variant = {
  id: string;
  briefId: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  description: string; // What a listener would hear, 2-3 sentences
  hook: string; // What makes this variant memorable
  productionNotes: string; // Instrumentation, structure, tempo, key
};

// ============================================================================
// Persona — one synthetic listener on the panel
// ============================================================================

export type Demographics = {
  age: number;
  location: string;
  occupation: string;
};

export type MusicProfile = {
  favoriteGenres: string[];
  listeningContexts: string[]; // "commute", "workout", "background work"
  discoveryHabits: string[]; // "TikTok", "Spotify Discover Weekly"
};

export type Persona = {
  id: string;
  briefId: string;
  name: string; // "Maya, 24, Mexico City"
  demographics: Demographics;
  musicProfile: MusicProfile;
  personalityTraits: string[]; // 3-4 traits relevant to music engagement
};

// ============================================================================
// Reaction — one persona's response to one variant
// Includes inter-persona transmission scores (LPM-inspired feature)
// ============================================================================

export type ReactionScores = {
  saveWorthiness: number; // 1-10
  skipLikelihood: number; // 1-10 (lower is better)
  shareLikelihood: number; // 1-10
  repeatListening: number; // 1-10
};

export type TransmissionScore = {
  toPersonaId: string;
  score: number; // 1-10, likelihood of recommending to this persona
  reasoning: string; // Brief, why this persona would or wouldn't share
};

export type Reaction = {
  id: string;
  variantId: string;
  personaId: string;
  scores: ReactionScores;
  qualitativeReaction: string; // First-person, 2-3 sentences
  flagsRaised: string[]; // Concerns specific to this persona
  transmissionScores: TransmissionScore[]; // To each OTHER persona
};

// ============================================================================
// Synthesis — the final aggregated recommendation
// ============================================================================

export type SegmentWinner = {
  segmentLabel: string; // e.g., "TikTok-discovery listeners"
  variantId: string;
  reasoning: string;
};

export type DivergentReaction = {
  variantId: string;
  insight: string; // Why this variant polarized the panel
  topAdvocate: string; // Persona id with highest score for it
  topDetractor: string; // Persona id with lowest score for it
};

export type Synthesis = {
  briefId: string;
  topVariantOverall: string;
  topVariantPerSegment: SegmentWinner[];
  divergentReactions: DivergentReaction[];
  recommendation: string; // Paragraph-level final synthesis
};

// ============================================================================
// Run — the orchestration container that ties everything together
// ============================================================================

export type RunStatus =
  | 'parsing'
  | 'generating_variants'
  | 'generating_personas'
  | 'reacting'
  | 'synthesizing'
  | 'complete'
  | 'error';

export type Run = {
  id: string;
  briefId: string;
  status: RunStatus;
  errorMessage?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

// ============================================================================
// FullRun — convenience type for the results page (the whole shebang)
// ============================================================================

export type FullRun = {
  run: Run;
  brief: Brief;
  variants: Variant[];
  personas: Persona[];
  reactions: Reaction[];
  synthesis: Synthesis | null;
};
