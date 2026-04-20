"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Survey {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [shareModal, setShareModal] = useState<{
    id: string;
    title: string;
    link: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("surveys");
    if (saved) {
      setSurveys(JSON.parse(saved));
    }
  }, []);

  const createNewSurvey = () => {
    router.push("/builder");
  };

  const editSurvey = (id: string) => {
    router.push(`/builder?id=${id}`);
  };

  const takeSurvey = (id: string) => {
    router.push(`/take?id=${id}`);
  };

  const viewResponses = (id: string) => {
    router.push(`/responses?id=${id}`);
  };

  const openShareModal = (id: string, title: string) => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const link = `${baseUrl}/take?id=${id}`;
    setShareModal({ id, title, link });
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (shareModal) {
      navigator.clipboard.writeText(shareModal.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deleteSurvey = (id: string) => {
    const updated = surveys.filter((s) => s.id !== id);
    setSurveys(updated);
    localStorage.setItem("surveys", JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Storycard</h1>
          <p className="text-sm text-gray-600">No login needed • Data saved locally</p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Create surveys people love</h2>
          <p className="text-gray-600 mb-8">
            Beautiful card-based surveys. One question at a time.
          </p>
          <button
            onClick={createNewSurvey}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create New Survey
          </button>
        </div>

        {/* Surveys List */}
        {surveys.length > 0 ? (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Surveys</h3>
            <div className="grid gap-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {survey.title}
                      </h4>
                      {survey.description && (
                        <p className="text-gray-600 mt-1">{survey.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-3">
                        Created {new Date(survey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => takeSurvey(survey.id)}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                      >
                        Take
                      </button>
                      <button
                        onClick={() =>
                          openShareModal(survey.id, survey.title)
                        }
                        className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded hover:bg-cyan-100 text-sm"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => viewResponses(survey.id)}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm"
                      >
                        Responses
                      </button>
                      <button
                        onClick={() => editSurvey(survey.id)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSurvey(survey.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-600 mb-6">No surveys yet. Create your first one!</p>
            <button
              onClick={createNewSurvey}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Create First Survey
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p>Storycard • Create engaging surveys • MVP Version</p>
        </div>
      </footer>

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Share Survey
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              "{shareModal.title}"
            </p>

            <div className="bg-gray-50 p-3 rounded mb-4 break-all">
              <p className="text-xs text-gray-600 mb-1">Share this link:</p>
              <p className="text-sm font-mono text-gray-900">
                {shareModal.link}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
              <button
                onClick={() => setShareModal(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
