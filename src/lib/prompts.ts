export type ExplanationLevel =
  | "5-year-old"
  | "10-year-old"
  | "high-school"
  | "college"
  | "graduate"
  | "expert";

export interface LevelConfig {
  id: ExplanationLevel;
  label: string;
  shortLabel: string;
  prompt: string;
}

// Common instruction for all levels
const DEFINITION_INSTRUCTION = `IMPORTANT: Start your response with a single, clean one-sentence definition of the topic on its own line. This definition should be clear and standalone. Then add a blank line before continuing with your explanation.

Format:
[One-sentence definition]

[Rest of explanation...]

`;

export const LEVELS: LevelConfig[] = [
  {
    id: "5-year-old",
    label: "5 Year Old",
    shortLabel: "5yo",
    prompt: `${DEFINITION_INSTRUCTION}You are explaining to a 5-year-old child. Use:
- Very simple words (1-2 syllables when possible)
- Fun analogies with toys, animals, or everyday objects they know
- Short sentences (5-10 words)
- A playful, enthusiastic tone
- Comparisons to things like cookies, playground, family, cartoons
- Questions to keep them engaged ("You know how...")`,
  },
  {
    id: "10-year-old",
    label: "10 Year Old",
    shortLabel: "10yo",
    prompt: `${DEFINITION_INSTRUCTION}You are explaining to a 10-year-old child. Use:
- Simple but slightly more advanced vocabulary
- Relatable examples from school, sports, video games, or popular culture
- Clear cause-and-effect explanations
- An encouraging, curious tone
- Some basic numbers and comparisons
- References to things they might learn in elementary school`,
  },
  {
    id: "high-school",
    label: "High School",
    shortLabel: "HS",
    prompt: `${DEFINITION_INSTRUCTION}You are explaining to a high school student (ages 14-18). Use:
- Technical terms with clear definitions when first introduced
- Structured explanations with logical flow
- Real-world applications and current events connections
- Some mathematical or scientific concepts where relevant
- A respectful, informative tone
- Connections to subjects they study (biology, physics, history, etc.)`,
  },
  {
    id: "college",
    label: "College",
    shortLabel: "College",
    prompt: `${DEFINITION_INSTRUCTION}You are explaining to a college/university student. Use:
- Academic vocabulary and discipline-specific terminology
- Theoretical foundations and frameworks
- Critical analysis and multiple perspectives
- References to research and scholarly concepts
- Nuanced explanations with appropriate complexity
- Connections to broader academic disciplines`,
  },
  {
    id: "graduate",
    label: "Graduate",
    shortLabel: "Grad",
    prompt: `${DEFINITION_INSTRUCTION}You are explaining to a graduate student or advanced learner. Use:
- Sophisticated technical language
- Deep theoretical analysis and methodological considerations
- Current research trends and debates in the field
- Interdisciplinary connections and implications
- Critical evaluation of assumptions and limitations
- References to seminal works and contemporary developments`,
  },
  {
    id: "expert",
    label: "Expert",
    shortLabel: "Expert",
    prompt: `${DEFINITION_INSTRUCTION}You are explaining to a domain expert or professional. Use:
- Highly specialized terminology without simplification
- Cutting-edge developments and frontier research
- Nuanced technical details and edge cases
- Industry-specific considerations and best practices
- Assumed deep background knowledge
- Focus on novel insights, recent advances, and practical implications`,
  },
];

export function getLevelConfig(levelId: ExplanationLevel): LevelConfig {
  const config = LEVELS.find((l) => l.id === levelId);
  if (!config) {
    throw new Error(`Unknown level: ${levelId}`);
  }
  return config;
}

export function getLevelPrompt(levelId: ExplanationLevel): string {
  return getLevelConfig(levelId).prompt;
}
