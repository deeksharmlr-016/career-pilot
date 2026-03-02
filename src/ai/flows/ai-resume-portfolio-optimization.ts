'use server';
/**
 * @fileOverview An AI agent to help job seekers generate and optimize resume and portfolio content.
 *
 * - optimizeResumePortfolio - A function that handles the resume and portfolio optimization process.
 * - OptimizeResumePortfolioInput - The input type for the optimizeResumePortfolio function.
 * - OptimizeResumePortfolioOutput - The return type for the optimizeResumePortfolio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeResumePortfolioInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description for which to optimize the resume and portfolio.'),
  targetPost: z
    .string()
    .optional()
    .describe('The specific job title or post being applied for.'),
  profileData: z
    .any()
    .optional()
    .describe('Comprehensive structured profile data including education, experience, etc.'),
  currentResume: z
    .string()
    .optional()
    .describe('The user\'s current resume content (optional, provide if optimizing existing content).'),
  currentPortfolioDescription: z
    .string()
    .optional()
    .describe('A description of the user\'s current portfolio or projects (optional, provide if optimizing existing content).'),
});
export type OptimizeResumePortfolioInput = z.infer<
  typeof OptimizeResumePortfolioInputSchema
>;

const OptimizeResumePortfolioOutputSchema = z.object({
  optimizedResumeContent: z
    .string()
    .describe('The optimized resume content in structured Markdown format.'),
  portfolioSuggestions: z
    .string()
    .describe(
      'Actionable suggestions for optimizing the user\'s portfolio.'
    ),
});
export type OptimizeResumePortfolioOutput = z.infer<
  typeof OptimizeResumePortfolioOutputSchema
>;

export async function optimizeResumePortfolio(
  input: OptimizeResumePortfolioInput
): Promise<OptimizeResumePortfolioOutput> {
  return optimizeResumePortfolioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeResumePortfolioPrompt',
  input: {schema: OptimizeResumePortfolioInputSchema},
  output: {schema: OptimizeResumePortfolioOutputSchema},
  prompt: `You are an expert career coach and ATS-optimization specialist. Your goal is to generate a professional, industry-standard resume tailored to a specific job description.

REQUIRED FORMATTING RULES:
1. Use Markdown for structure.
2. Use '#' for the Name at the top.
3. Use '##' for Section Headings (e.g., ## PROFESSIONAL SUMMARY).
4. Use '###' for Job Titles and Degrees.
5. Use bullet points (-) for responsibilities and achievements.
6. Ensure consistent spacing between sections.

SECTIONS TO INCLUDE (IN ORDER):
1. CONTACT INFORMATION (Name, Email, Phone, LinkedIn, Portfolio)
2. PROFESSIONAL SUMMARY (3-4 sentences packed with high-value keywords from the JD)
3. TECHNICAL SKILLS (Categorized list)
4. WORK EXPERIENCE (Company, Title, Dates, and 3-5 bulleted accomplishments using the STAR method)
5. PROJECTS (Relevant projects with technical details)
6. EDUCATION (Degree, Institution, Graduation Date, GPA if applicable)
7. CERTIFICATIONS & ACHIEVEMENTS (Relevant honors or industry certs)

Job Description:
{{{jobDescription}}}

{{#if targetPost}}
Target Role/Post: {{{targetPost}}}
{{/if}}

{{#if profileData}}
Detailed Profile Information:
{{{profileData}}}
{{/if}}

{{#if currentResume}}
Old Resume Content to Optimize:
{{{currentResume}}}
{{/if}}

{{#if currentPortfolioDescription}}
Current Portfolio/Projects Context:
{{{currentPortfolioDescription}}}
{{/if}}

Generate the resume content now, ensuring it is highly professional, clean, and perfectly aligned with the provided Job Description.`,
});

const optimizeResumePortfolioFlow = ai.defineFlow(
  {
    name: 'optimizeResumePortfolioFlow',
    inputSchema: OptimizeResumePortfolioInputSchema,
    outputSchema: OptimizeResumePortfolioOutputSchema,
  },
  async (input) => {
    // Stringify the profile data to ensure the prompt receives it as text
    const processedInput = {
      ...input,
      profileData: input.profileData ? JSON.stringify(input.profileData, null, 2) : undefined
    };
    const {output} = await prompt(processedInput);
    return output!;
  }
);
