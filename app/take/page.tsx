"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Confetti } from "@/app/components/Confetti";

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

interface ResponseData {
  id: string;
  surveyId: string;
  answers: Record<string, string | string[] | number>;
  submittedAt: string;
}

export default function SurveyTaker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [submitted, setSubmitted] = useState(false);

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
  const isLastStep = currentStep === survey.questions.length + 1;
  const totalSteps = survey.questions.length + 1;

  const handleAnswer = (value: string | string[] | number) => {
    if (currentQuestion) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: value,
      });
    }
  };

  const handleNext = () => {
    if (!isOnIntro && currentQuestion?.required && !answers[currentQuestion.id]) {
      alert("This question is required");
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
      submitResponse();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitResponse = () => {
    const response: ResponseData = {
      id: nanoid(),
      surveyId: survey.id,
      answers,
      submittedAt: new Date().toISOString(),
    };

    const responses = JSON.parse(localStorage.getItem("responses") || "[]");
    responses.push(response);
    localStorage.setItem("responses", JSON.stringify(responses));

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
        <Confetti />
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md text-center animate-bounce-in relative z-10">
          <div className="text-6xl sm:text-7xl mb-4 animate-scale-bounce">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Awesome!
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-2">
            Your response has been submitted.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Thanks for taking the time to share your feedback!
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 sm:py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold text-sm sm:text-base"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex flex-col">
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs sm:text-sm font-bold text-gray-700">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-xs sm:text-sm font-bold text-blue-600">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-sm overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        {Math.round(((currentStep + 1) / totalSteps) * 100) === 50 && (
          <p className="text-center mt-3 text-sm font-semibold text-purple-600 animate-bounce">
            🎯 Halfway there! Keep going!
          </p>
        )}
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 flex-1 flex flex-col justify-center animate-fade-in">
          {isOnIntro ? (
            <div className="text-center animate-bounce-in">
              <div className="text-6xl sm:text-7xl mb-6">📋</div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {survey.title}
              </h1>
              {survey.description && (
                <p className="text-base sm:text-lg text-gray-600 mb-8">
                  {survey.description}
                </p>
              )}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-lg font-bold text-blue-600">
                    {survey.questions.length}
                  </span>
                  <span className="text-gray-600 ml-2">
                    question{survey.questions.length !== 1 ? "s" : ""}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-2">Takes about 2-3 minutes</p>
              </div>
              <p className="text-gray-500 text-sm">Ready? Click Next to begin! 🚀</p>
            </div>
          ) : currentQuestion ? (
            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswer={handleAnswer}
            />
          ) : null}
        </div>

        {/* Navigation */}
        <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8 justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1 sm:flex-initial px-3 sm:px-6 py-3 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            ← <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            onClick={handleNext}
            className="flex-1 sm:flex-initial px-3 sm:px-6 py-3 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm sm:text-base font-medium"
          >
            {isLastStep ? "Submit" : <span><span className="hidden sm:inline">Next</span> →</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

interface QuestionRendererProps {
  question: Question;
  answer: string | string[] | number | undefined;
  onAnswer: (value: string | string[] | number) => void;
}

function QuestionRenderer({
  question,
  answer,
  onAnswer,
}: QuestionRendererProps) {
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
        <div className="animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
            {question.text}
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {question.options?.map((option, idx) => (
              <label
                key={option}
                className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all transform duration-200 ${
                  answer === option
                    ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-102"
                } active:scale-95`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div
                  className={`w-5 h-5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    answer === option
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {answer === option && (
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce-in" />
                  )}
                </div>
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => onAnswer(e.target.value)}
                  className="hidden"
                />
                <span className="ml-3 text-sm sm:text-base text-gray-700 font-medium">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      );

    case "MULTIPLE_CHOICE":
      const selectedAnswers = (answer as string[]) || [];
      return (
        <div className="animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
            {question.text}
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {question.options?.map((option, idx) => (
              <label
                key={option}
                className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all transform duration-200 ${
                  selectedAnswers.includes(option)
                    ? "border-purple-500 bg-purple-50 scale-105 shadow-lg"
                    : "border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:scale-102"
                } active:scale-95`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div
                  className={`w-5 h-5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedAnswers.includes(option)
                      ? "border-purple-500 bg-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedAnswers.includes(option) && (
                    <div className="text-white text-sm animate-bounce-in">✓</div>
                  )}
                </div>
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedAnswers.includes(option)}
                  onChange={() => handleMultipleChoice(option)}
                  className="hidden"
                />
                <span className="ml-3 text-sm sm:text-base text-gray-700 font-medium">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      );

    case "SHORT_TEXT":
      return (
        <div className="animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
            {question.text}
          </h2>
          <input
            type="text"
            value={answer || ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Your answer..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base transition-all"
          />
        </div>
      );

    case "LONG_TEXT":
      return (
        <div className="animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
            {question.text}
          </h2>
          <textarea
            value={answer || ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Your answer..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base transition-all resize-none"
          />
        </div>
      );

    case "LINEAR_SCALE":
      return (
        <div className="animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
            {question.text}
          </h2>
          <div className="flex justify-between items-end gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => onAnswer(num)}
                className={`flex-1 py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base transition-all transform duration-200 active:scale-90 ${
                  answer === num
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105 ring-4 ring-blue-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                }`}
                style={{
                  height: answer === num ? `${80 + num * 20}px` : "60px",
                }}
              >
                {num}
              </button>
            ))}
          </div>
          {answer && (
            <p className="text-center mt-6 text-gray-600 animate-slide-up">
              <span className="font-bold text-lg text-blue-600">{answer}</span>
              <span className="text-sm">/5</span>
            </p>
          )}
        </div>
      );

    case "RATING":
      const currentRating = (answer as number) || 0;
      return (
        <div className="animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 sm:mb-10">
            {question.text}
          </h2>
          <div className="flex justify-center gap-3 sm:gap-4 mb-6">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => onAnswer(num)}
                className={`text-4xl sm:text-5xl transition-all duration-200 transform active:scale-75 ${
                  num <= currentRating
                    ? "scale-125 sm:scale-150 drop-shadow-lg"
                    : "opacity-40 hover:opacity-60 hover:scale-110"
                }`}
              >
                {num <= currentRating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          {currentRating > 0 && (
            <div className="text-center animate-bounce-in">
              <p className="text-gray-600 text-sm sm:text-base">
                <span className="font-bold text-lg text-yellow-500">
                  {"⭐".repeat(currentRating)}
                </span>
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {currentRating === 5 && "Perfect!"}
                {currentRating === 4 && "Great!"}
                {currentRating === 3 && "Good!"}
                {currentRating === 2 && "Okay..."}
                {currentRating === 1 && "Not great"}
              </p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
