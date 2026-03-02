# CareerPilot Technical Architecture

## 1. Stack Overview
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **Database/Auth**: Firebase (Firestore & Authentication)
- **AI Framework**: Genkit (Google Generative AI)
- **LLM**: Gemini 2.0 Flash

## 2. Core Features

### AI Career Discovery (Analysis)
- **Flow**: `ai-career-fit-analysis.ts`
- **Logic**: Analyzes `userSkills` and `userExperience` against target `interests`.
- **Output**: Ranked roles with `matchScore` and specific `skillGaps`.

### Interactive Roadmap Architect
- **Flow**: `ai-personalized-roadmap-generation.ts`
- **Logic**: Uses a "Flat Schema" pattern to generate tasks, ensuring compatibility with LLM nesting limits.
- **Complexity Management**: AI returns a flat list of tasks with `phaseTitle`. The Server Action transforms this into a structured `phases[tasks[]]` hierarchy for the UI.

### Professional Resume Architect
- **Engine**: Template-based generation for instant, consistent results.
- **Logic**: Maps structured profile data (Experience, Education, Projects) to a polished, ATS-friendly Markdown/PDF layout.
- **Optimization**: Zero-latency client-side rendering with dedicated print-css support.

### Unified Command Center
- **Logic**: Aggregate progress calculation across all active user roadmaps.
- **State**: Real-time synchronization between the Dashboard and individual Roadmap completion status.

## 3. Data Persistence Strategy
- **Authenticated**: Firestore collections:
  - `/users/{uid}`: Profile data.
  - `/users/{uid}/analyses/{id}`: History of discoveries.
  - `/users/{uid}/roadmaps/{id}`: Active plans and progress tracking.
- **Guest**: `localStorage` mirrors the Firestore structure, allowing for a frictionless "try-before-you-buy" experience and seamless data migration on sign-in.

## 4. Environment Requirements
- `GEMINI_API_KEY`: For Genkit AI operations.
- `NEXT_PUBLIC_FIREBASE_CONFIG`: For client-side SDK initialization.
