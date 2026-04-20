"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

export default function SurveyPreview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<
    Record<string, string | string[] | number>
  >({});

  useEffect(() => {
    if (surveyId) {
      const surveys = JSON.parse(localStorage.getItem("surveys") || "[]");
      const found = surveys.find((s: Survey) => s.id === surveyId);
      if (found) {
        setSurvey(found);
      } else {
        router.push("/");
      }
    }
  }, [surveyId, router]);

  if (!survey) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50" />;
  }

  const isOnIntro = currentStep === 0;
  const currentQuestion = !isOnIntro ? survey.questions[currentStep - 1] : null;
  const totalSteps = survey.questions.length + 1;

  const handleAnswer = (value: string | string[] | number) => {
    if (currentQuestion) {
      setPreviewAnswers({
        ...previewAnswers,
        [currentQuestion.id]: value,
      });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow">
          <div>
            <p className="text-xs text-gray-600 font-medium">PREVIEW MODE</p>
            <p className="text-sm text-gray-700">
              This is how your survey looks to respondents
            </p>
          </div>
          <button
            onClick={() => router.push(`/builder?id=${survey.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            ← Back to Edit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {isOnIntro ? (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {survey.title}
              </h1>
              {survey.description && (
                <p className="text-lg text-gray-600 mb-8">
                  {survey.description}
                </p>
              )}
              <p className="text-gray-500 mb-8">
                {survey.questions.length} question{survey.questions.length !== 1 ? "s" : ""}
              </p>
            </div>
          ) : currentQuestion ? (
            <QuestionPreview
              question={currentQuestion}
              answer={previewAnswers[currentQuestion.id]}
              onAnswer={handleAnswer}
            />
          ) : null}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === totalSteps - 1}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {currentStep === totalSteps - 1 ? "End Preview" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface QuestionPreviewProps {
  question: Question;
  answer: string | string[] | number | undefined;
  onAnswer: (value: string | string[] | number) => void;
}

function QuestionPreview({
  question,
  answer,
  onAnswer,
}: QuestionPreviewProps) {
  const handleMultipleChoice = (option: string) => {
    const current = (answer as string[]) || [];
    if (current.includes(option)) {
      onAnswer(current.filter((o) => o !== option));
    } else {
      onAnswer([...current, option]);
    }
  };

  switch (question.type) {
    case "SINGLE_CHOICE":
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {question.text}
          </h2>
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => onAnswer(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "MULTIPLE_CHOICE":
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {question.text}
          </h2>
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={((answer as string[]) || []).includes(option)}
                  onChange={() => handleMultipleChoice(option)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "SHORT_TEXT":
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {question.text}
          </h2>
          <input
            type="text"
            value={answer || ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Your answer..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 outline-none"
          />
        </div>
      );

    case "LONG_TEXT":
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {question.text}
          </h2>
          <textarea
            value={answer || ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Your answer..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 outline-none"
          />
        </div>
      );

    case "LINEAR_SCALE":
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {question.text}
          </h2>
          <div className="flex justify-between items-end gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => onAnswer(num)}
                className={`flex-1 py-4 rounded-lg font-semibold transition-all ${
                  answer === num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      );

    case "RATING":
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {question.text}
          </h2>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => onAnswer(num)}
                className={`text-4xl transition-transform ${
                  answer === num ? "scale-125" : "opacity-50 hover:opacity-75"
                }`}
              >
                {num <= (answer as number || 0) ? "⭐" : "☆"}
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
