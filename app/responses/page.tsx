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

interface ResponseData {
  id: string;
  surveyId: string;
  answers: Record<string, string | string[] | number>;
  submittedAt: string;
}

export default function ResponsesDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  useEffect(() => {
    if (surveyId) {
      const surveys = JSON.parse(localStorage.getItem("surveys") || "[]");
      const found = surveys.find((s: Survey) => s.id === surveyId);
      if (found) {
        setSurvey(found);

        const allResponses = JSON.parse(
          localStorage.getItem("responses") || "[]"
        );
        const surveyResponses = allResponses.filter(
          (r: ResponseData) => r.surveyId === surveyId
        );
        setResponses(surveyResponses);
      } else {
        router.push("/");
      }
    }
  }, [surveyId, router]);

  const handleExportCSV = () => {
    if (!survey) return;

    const headers = [
      "Response ID",
      "Submitted Date",
      ...survey.questions.map((q) => q.text),
    ];

    const rows = responses.map((response) => [
      response.id,
      new Date(response.submittedAt).toLocaleString(),
      ...survey.questions.map((q) => {
        const answer = response.answers[q.id];
        if (Array.isArray(answer)) {
          return answer.join("; ");
        }
        return String(answer || "");
      }),
    ]);

    const csv = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${survey.title}-responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!survey) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            ← Back
          </button>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => router.push(`/analytics?id=${survey.id}`)}
              className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
            >
              📊 <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
            >
              ⬇ <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-gray-600 mb-4">{survey.description}</p>
          )}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-blue-600">{responses.length}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-3xl font-bold text-indigo-600">
                {survey.questions.length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-purple-600">
                {responses.length > 0 ? "100%" : "0%"}
              </p>
            </div>
          </div>
        </div>

        {/* Responses Table */}
        {responses.length > 0 ? (
          <div className="bg-white rounded-lg overflow-hidden shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                All Responses
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Preview
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response, idx) => (
                    <React.Fragment key={response.id}>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(response.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Response #{idx + 1}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() =>
                              setExpandedResponse(
                                expandedResponse === response.id ? null : response.id
                              )
                            }
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {expandedResponse === response.id ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                      {expandedResponse === response.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-6 py-4">
                            <div className="space-y-4">
                              {survey.questions.map((question) => (
                                <div key={question.id}>
                                  <p className="text-sm font-medium text-gray-900">
                                    {question.text}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {formatAnswer(response.answers[question.id])}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600">No responses yet</p>
          </div>
        )}
      </main>
    </div>
  );
}

function formatAnswer(answer: string | string[] | number | undefined): string {
  if (answer === undefined || answer === null) return "Not answered";
  if (Array.isArray(answer)) return answer.join(", ");
  return String(answer);
}

// Import React for Fragment
import React from "react";
