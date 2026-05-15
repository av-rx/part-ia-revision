import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    module: z.string(),
    moduleTitle: z.string(),
    topic: z.string(),
    topicSlug: z.string(),
    title: z.string(),
    order: z.number(),
    paper: z.string(),
    sourcePath: z.string().optional(),
    isSupplement: z.boolean().default(false),
    isExcalidraw: z.boolean().default(false),
  }),
});

const supplements = defineCollection({
  type: 'content',
  schema: z.object({
    module: z.string(),
    title: z.string(),
    summary: z.string(),
    sources: z.array(z.string()).default([]),
    order: z.number().default(99),
  }),
});

const cheatsheets = defineCollection({
  type: 'content',
  schema: z.object({
    module: z.string(),
    title: z.string(),
    paper: z.string(),
    updated: z.string().optional(),
  }),
});

const flashcards = defineCollection({
  type: 'data',
  schema: z.object({
    module: z.string(),
    title: z.string(),
    cards: z.array(
      z.object({
        id: z.string(),
        front: z.string(),
        back: z.string(),
        topic: z.string().optional(),
        sourceDeck: z.string().optional(),
        tags: z.array(z.string()).default([]),
      }),
    ),
  }),
});

const quizzes = defineCollection({
  type: 'data',
  schema: z.object({
    module: z.string(),
    title: z.string(),
    questions: z.array(
      z.object({
        id: z.string(),
        topic: z.string().optional(),
        kind: z.enum(['mcq', 'short', 'truefalse']),
        prompt: z.string(),
        options: z.array(z.string()).optional(),
        answer: z.union([z.string(), z.number(), z.array(z.string())]),
        explanation: z.string().optional(),
      }),
    ),
  }),
});

const codeExercises = defineCollection({
  type: 'data',
  schema: z.object({
    module: z.string(),
    title: z.string(),
    language: z.enum(['ocaml', 'java']),
    exercises: z.array(
      z.object({
        id: z.string(),
        topic: z.string(),
        title: z.string(),
        kind: z.enum(['trace', 'code', 'mcq']),
        prompt: z.string(),
        codeSnippet: z.string().optional(),
        options: z.array(z.string()).optional(),
        answer: z.string().optional(),
        hints: z.array(z.string()).default([]),
        explanation: z.string(),
        solutionCode: z.string().optional(),
      }),
    ),
  }),
});

export const collections = { notes, supplements, cheatsheets, flashcards, quizzes, 'code-exercises': codeExercises };
