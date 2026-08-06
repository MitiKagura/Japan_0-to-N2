export type Difficulty = 'easy' | 'medium' | 'hard';
export type LessonLanguage = 'c' | 'cpp' | 'csharp' | 'python' | 'java' | 'rust' | 'x86asm' | 'japanese' | 'plaintext';

export interface InlineQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  hint?: string;
}
export interface CodeTask {
  instruction: string;
  starter: string;
  expected: string;
  expectedCheck?: 'contains' | 'equals';
  hint: string;
  solution: string;
}
export interface LessonStage {
  id: string;
  title: string;
  theory: string;
  code?: string;
  language?: LessonLanguage;
  question?: InlineQuestion;
  codeTask?: CodeTask;
}
export interface FinalQuiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
export interface FinalTask {
  title: string;
  difficulty: Difficulty;
  description: string;
  hints: string[];
  solution: string;
}
export interface Lesson {
  id: string;
  title: string;
  shortDesc: string;
  estimatedMinutes: number;
  stages: LessonStage[];
  finalQuiz: FinalQuiz[];
  finalTasks: FinalTask[];
}
export interface Course {
  id: string;
  title: string;
  shortName: string;
  description: string;
  icon: string;
  color: 'sakura' | 'light' | 'deep';
  level?: string;
  lessons: Lesson[];
}

// Кана
export interface KanaChar {
  kana: string;
  romaji: string;
  type: 'gojuuon' | 'dakuon' | 'handakuon' | 'yoon';
  strokes: number;
  strokeOrder: string[];
  example?: string;
}
export interface KanjiChar {
  char: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  strokes: number;
  jlpt: 'N5' | 'N4' | 'N3' | 'N2';
  examples: { word: string; reading: string; meaning: string }[];
  strokeOrder: string[];
  radicals?: string;
}
