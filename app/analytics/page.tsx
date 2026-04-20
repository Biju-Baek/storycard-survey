"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

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

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
];

export default function AnalyticsDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);

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

  if (!survey || responses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600">
              No responses yet. Analytics will appear here.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {survey.title} - Analytics
        </h1>
        <p className="text-gray-600 mb-8">
          {responses.length} response{responses.length !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {survey.questions.map((question) => (
            <QuestionAnalytics
              key={question.id}
              question={question}
              responses={responses}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

interface QuestionAnalyticsProps {
  question: Question;
  responses: ResponseData[];
}

function QuestionAnalytics({
  question,
  responses,
}: QuestionAnalyticsProps) {
  const answers = responses.map((r) => r.answers[question.id]).filter(Boolean);
  const answeredCount = answers.length;
  const notAnsweredCount = responses.length - answeredCount;

  if (question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") {
    const counts: Record<string, number> = {};
    question.options?.forEach((opt) => {
      counts[opt] = 0;
    });

    answers.forEach((answer) => {
      if (question.type === "MULTIPLE_CHOICE" && Array.isArray(answer)) {
        answer.forEach((opt) => {
          counts[opt] = (counts[opt] || 0) + 1;
        });
      } else if (typeof answer === "string") {
        counts[answer] = (counts[answer] || 0) + 1;
      }
    });

    const data = Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value / responses.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);

    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.text}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name}</span>
              <span className="text-gray-900 font-medium">
                {item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "LINEAR_SCALE") {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    answers.forEach((answer) => {
      if (typeof answer === "number") {
        counts[answer] = (counts[answer] || 0) + 1;
      }
    });

    const data = Object.entries(counts)
      .map(([scale, count]) => ({
        scale: parseInt(scale),
        count,
      }))
      .sort((a, b) => a.scale - b.scale);

    const average = (
      Object.entries(counts).reduce((sum, [scale, count]) => {
        return sum + parseInt(scale) * count;
      }, 0) / answeredCount
    ).toFixed(2);

    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.text}
        </h3>
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">Average Score</p>
          <p className="text-2xl font-bold text-blue-600">{average} / 5</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="scale" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {data.map((item) => (
            <div key={item.scale} className="text-center">
              <p className="text-sm font-medium text-gray-900">{item.scale}</p>
              <p className="text-lg font-bold text-blue-600">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "RATING") {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    answers.forEach((answer) => {
      if (typeof answer === "number") {
        counts[answer] = (counts[answer] || 0) + 1;
      }
    });

    const data = [
      { name: "1 Star", value: counts[1] },
      { name: "2 Stars", value: counts[2] },
      { name: "3 Stars", value: counts[3] },
      { name: "4 Stars", value: counts[4] },
      { name: "5 Stars", value: counts[5] },
    ].filter((d) => d.value > 0);

    const average = (
      Object.entries(counts).reduce((sum, [scale, count]) => {
        return sum + parseInt(scale) * count;
      }, 0) / answeredCount
    ).toFixed(2);

    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.text}
        </h3>
        <div className="mb-4 p-3 bg-yellow-50 rounded">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-600">{average} / 5 ⭐</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // TEXT questions - show summary stats
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {question.text}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Responded</span>
          <span className="font-medium text-gray-900">{answeredCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Skipped</span>
          <span className="font-medium text-gray-900">{notAnsweredCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Response Rate</span>
          <span className="font-medium text-gray-900">
            {((answeredCount / responses.length) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      {question.type === "SHORT_TEXT" || question.type === "LONG_TEXT" ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Sample Responses:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {answers.slice(0, 5).map((answer, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                "{answer}"
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
