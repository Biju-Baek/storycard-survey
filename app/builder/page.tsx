"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "LINEAR_SCALE"
  | "RATING";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export default function Builder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

  useEffect(() => {
    if (surveyId) {
      const surveys = JSON.parse(localStorage.getItem("surveys") || "[]");
      const existing = surveys.find((s: Survey) => s.id === surveyId);
      if (existing) {
        setSurvey(existing);
      } else {
        setSurvey(createNewSurvey());
      }
    } else {
      setSurvey(createNewSurvey());
    }
  }, [surveyId]);

  const createNewSurvey = (): Survey => ({
    id: nanoid(),
    title: "New Survey",
    description: "",
    questions: [],
    createdAt: new Date().toISOString(),
  });

  const addQuestion = (type: QuestionType) => {
    if (!survey) return;
    const newQuestion: Question = {
      id: nanoid(),
      text: "Question",
      type,
      required: false,
      options:
        type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE"
          ? ["Option 1", "Option 2"]
          : undefined,
    };
    setSurvey({ ...survey, questions: [...survey.questions, newQuestion] });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    if (!survey) return;
    setSurvey({
      ...survey,
      questions: survey.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = (id: string) => {
    if (!survey) return;
    setSurvey({
      ...survey,
      questions: survey.questions.filter((q) => q.id !== id),
    });
  };

  const saveSurvey = () => {
    if (!survey) return;
    const surveys = JSON.parse(localStorage.getItem("surveys") || "[]");
    const index = surveys.findIndex((s: Survey) => s.id === survey.id);
    if (index >= 0) {
      surveys[index] = survey;
    } else {
      surveys.push(survey);
    }
    localStorage.setItem("surveys", JSON.stringify(surveys));
    router.push("/");
  };

  if (!survey) return <div className="min-h-screen bg-gray-50" />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div className="flex gap-3">
            {survey.questions.length > 0 && (
              <button
                onClick={() => router.push(`/preview?id=${survey.id}`)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                👁️ Preview
              </button>
            )}
            <button
              onClick={saveSurvey}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Save & Publish
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Survey Header */}
        <div className="bg-white rounded-lg p-8 mb-8">
          {editingTitle ? (
            <input
              type="text"
              value={survey.title}
              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              autoFocus
              className="text-3xl font-bold w-full border-b-2 border-blue-600 mb-4"
            />
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              className="text-3xl font-bold mb-4 cursor-pointer hover:text-blue-600"
            >
              {survey.title}
            </h1>
          )}

          {editingDesc ? (
            <textarea
              value={survey.description}
              onChange={(e) =>
                setSurvey({ ...survey, description: e.target.value })
              }
              onBlur={() => setEditingDesc(false)}
              autoFocus
              className="w-full border-b-2 border-blue-600 text-gray-600"
              rows={2}
            />
          ) : (
            <p
              onClick={() => setEditingDesc(true)}
              className="text-gray-600 cursor-pointer hover:text-blue-600"
            >
              {survey.description || "Click to add description"}
            </p>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {survey.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index + 1}
              onUpdate={(updates) => updateQuestion(question.id, updates)}
              onDelete={() => deleteQuestion(question.id)}
            />
          ))}
        </div>

        {/* Add Question */}
        <div className="mt-8 p-6 bg-white rounded-lg">
          <p className="font-semibold text-gray-900 mb-4">Add Question</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { type: "SINGLE_CHOICE" as const, label: "Single Choice" },
              { type: "MULTIPLE_CHOICE" as const, label: "Multiple Choice" },
              { type: "SHORT_TEXT" as const, label: "Short Text" },
              { type: "LONG_TEXT" as const, label: "Long Text" },
              { type: "LINEAR_SCALE" as const, label: "Linear Scale" },
              { type: "RATING" as const, label: "Rating" },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => addQuestion(item.type)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

function QuestionCard({
  question,
  index,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-600">
            Question {index}
          </label>
          <input
            type="text"
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full text-lg font-semibold border-b-2 border-gray-300 focus:border-blue-600 outline-none mt-2"
          />
        </div>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 ml-4"
        >
          Delete
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">Type: {question.type}</div>

      {/* Options for choice questions */}
      {(question.type === "SINGLE_CHOICE" ||
        question.type === "MULTIPLE_CHOICE") && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Options:</p>
          {question.options?.map((option, i) => (
            <input
              key={i}
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...(question.options || [])];
                newOptions[i] = e.target.value;
                onUpdate({ options: newOptions });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder={`Option ${i + 1}`}
            />
          ))}
          <button
            onClick={() => {
              const newOptions = [...(question.options || [])];
              newOptions.push(`Option ${newOptions.length + 1}`);
              onUpdate({ options: newOptions });
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Option
          </button>
        </div>
      )}

      {/* Required checkbox */}
      <div className="mt-4 flex items-center">
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="w-4 h-4"
        />
        <label className="ml-2 text-sm text-gray-600">Required</label>
      </div>
    </div>
  );
}
