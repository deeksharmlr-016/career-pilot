'use server';
/**
 * @fileOverview Generates a structured, task-level career roadmap.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RoadmapTaskSchema = z.object({
  id: z.string().describe('A unique slug for the task.'),
  description: z.string().describe('Detailed description of the task.'),
  type: z.enum(['learning', 'practice', 'project']).describe('Category of the task.'),
  resources: z.array(z.string()).describe('Specific links or book titles.'),
});

const RoadmapPhaseSchema = z.object({
  title: z.string().describe('Phase name (e.g., Foundations, Advanced, Capstone).'),
  tasks: z.array(RoadmapTaskSchema),
});

const PersonalizedRoadmapInputSchema = z.object({
  careerGoal: z.string(),
  userSkills: z.array(z.string()),
  userExperience: z.string(),
  skillGaps: z.array(z.string()),
  learningSpeed: z.enum(['slow', 'medium', 'fast']),
});
export type PersonalizedRoadmapInput = z.infer<typeof PersonalizedRoadmapInputSchema>;

const PersonalizedRoadmapOutputSchema = z.object({
  phases: z.array(RoadmapPhaseSchema),
});
export type PersonalizedRoadmapOutput = z.infer<typeof PersonalizedRoadmapOutputSchema>;

// Internal flat schema to avoid nesting depth errors in Gemini (max 3 levels)
const FlatTaskOutputSchema = z.object({
  phaseTitle: z.string().describe('The title of the phase this task belongs to (e.g., Phase 1: Foundations).'),
  id: z.string().describe('A unique slug for the task.'),
  description: z.string().describe('Detailed description of the task.'),
  type: z.enum(['learning', 'practice', 'project']).describe('Category of the task.'),
  resources: z.array(z.string()).describe('Specific links or book titles.'),
});

const FlatRoadmapOutputSchema = z.object({
  tasks: z.array(FlatTaskOutputSchema),
});

export async function generatePersonalizedRoadmap(
  input: PersonalizedRoadmapInput
): Promise<PersonalizedRoadmapOutput> {
  return personalizedRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRoadmapPrompt',
  input: { schema: PersonalizedRoadmapInputSchema },
  output: { schema: FlatRoadmapOutputSchema },
  prompt: `You are an expert career architect. Generate a rigorous, structured roadmap for a user aiming for: {{{careerGoal}}}.

Context:
- Current Skills: {{#each userSkills}}{{{this}}}, {{/each}}
- Experience: {{{userExperience}}}
- Gaps: {{#each skillGaps}}{{{this}}}, {{/each}}
- Speed: {{{learningSpeed}}}

Generate a flat list of tasks. Each task MUST include a "phaseTitle" identifying which section of the roadmap it belongs to. 
Ensure you group tasks into 3-5 distinct Phases consistently.

For each Phase, ensure there is:
1. Learning Tasks (Theory/Reading)
2. Practice Tasks (Exercises/Labs)
3. Applied Projects (Build a real-world deliverable)

Ensure every task is actionable and includes specific resources. Provide a unique 'id' for each task.`,
});

const personalizedRoadmapFlow = ai.defineFlow(
  {
    name: 'personalizedRoadmapFlow',
    inputSchema: PersonalizedRoadmapInputSchema,
    outputSchema: PersonalizedRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.tasks) throw new Error('Failed to generate roadmap');

    // Group the flat tasks back into the nested structure the UI expects
    const phasesMap = new Map<string, any[]>();
    
    output.tasks.forEach((task) => {
      const { phaseTitle, ...taskData } = task;
      if (!phasesMap.has(phaseTitle)) {
        phasesMap.set(phaseTitle, []);
      }
      phasesMap.get(phaseTitle)!.push(taskData);
    });

    const phases = Array.from(phasesMap.entries()).map(([title, tasks]) => ({
      title,
      tasks,
    }));

    return { phases };
  }
);
