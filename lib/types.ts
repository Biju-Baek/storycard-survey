import { QuestionType } from "@prisma/client";

export interface SurveyWithQuestions {
  id: string;
  title: string;
  description?: string;
  shareToken: string;
  sections: SectionWithQuestions[];
}

export interface SectionWithQuestions {
  id: string;
  title?: string;
  content?: string;
  order: number;
  questions: QuestionWithOptions[];
}

export interface QuestionWithOptions {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  order: number;
  options: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  text: string;
  value: string;
  order: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  createdAt: Date;
}

export interface Answer {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  multipleAnswers?: string[];
}
