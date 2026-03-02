'use server';
/**
 * @fileOverview An AI agent for providing career path recommendations and skill gap analysis.
 *
 * - aiCareerFitAnalysis - A function that handles the AI career fit analysis process.
 * - AICareerFitAnalysisInput - The input type for the aiCareerFitAnalysis function.
 * - AICareerFitAnalysisOutput - The return type for the aiCareerFitAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AICareerFitAnalysisInputSchema = z.object({
  userSkills: z
    .array(z.string())
    .describe("A list of the user's current skills and proficiencies."),
  userExperience: z
    .string()
    .describe("A detailed description of the user's work experience and background."),
  interests: z
    .array(z.string())
    .optional()
    .describe('Optional areas of interest or target industries the user is curious about.'),
});
export type AICareerFitAnalysisInput = z.infer<typeof AICareerFitAnalysisInputSchema>;

const AICareerFitAnalysisOutputSchema = z.object({
  recommendedRoles: z.array(z.object({
    role: z.string().describe('The name of the suggested job role.'),
    matchScore: z.number().min(0).max(100).describe('A score representing the alignment (0-100).'),
    reasoning: z.string().describe('Why this role fits the user profile.'),
  })).describe('Top career options recommended for the user.'),
  skillGapAnalysis: z
    .array(
      z.object({
        role: z.string().describe('The role this gap analysis refers to.'),
        skill: z.string().describe('The name of the missing or deficient skill.'),
        gap: z.string().describe('A description of the gap or what is missing.'),
        recommendation: z.string().describe('A specific recommendation to bridge this gap.'),
      })
    )
    .describe('An analysis of the skill gaps for the recommended roles.'),
});
export type AICareerFitAnalysisOutput = z.infer<typeof AICareerFitAnalysisOutputSchema>;

export async function aiCareerFitAnalysis(
  input: AICareerFitAnalysisInput
): Promise<AICareerFitAnalysisOutput> {
  return aiCareerFitAnalysisFlow(input);
}

const aiCareerFitAnalysisPrompt = ai.definePrompt({
  name: 'aiCareerFitAnalysisPrompt',
  input: { schema: AICareerFitAnalysisInputSchema },
  output: { schema: AICareerFitAnalysisOutputSchema },
  prompt: `You are an expert career consultant. Your task is to analyze a user's current profile and suggest the best-fitting career paths, then identify the gaps for those paths.

User Profile:
Skills: {{#each userSkills}}- {{{this}}}
{{/each}}
Experience: {{{userExperience}}}
{{#if interests}}
Interests/Target Areas: {{#each interests}}- {{{this}}}
{{/each}}
{{/if}}

Tasks:
1. Identify 3-5 high-potential career roles that align with the user's current background.
2. For each recommended role, provide a match score (0-100) and a brief reasoning.
3. For the top 2-3 recommendations, provide a specific skill gap analysis identifying what the user needs to learn or achieve to be competitive for those roles.
4. For each gap, provide a concrete, actionable recommendation.

Provide the output in JSON format matching the specified output schema.`,
});

const aiCareerFitAnalysisFlow = ai.defineFlow(
  {
    name: 'aiCareerFitAnalysisFlow',
    inputSchema: AICareerFitAnalysisInputSchema,
    outputSchema: AICareerFitAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await aiCareerFitAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to generate career fit analysis.');
    }
    return output;
  }
);
