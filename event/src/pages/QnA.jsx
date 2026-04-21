import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import "./style/QnA.css";

const QnA = () => {
  const { user, users, qna, setQna, showToast, searchQuery } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [answeringQuestion, setAnsweringQuestion] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editedAnswerContent, setEditedAnswerContent] = useState("");
  const askedByUser = qna.filter((question) => question.userId === user.id).length;
  const answersByUser = qna.reduce(
    (count, question) =>
      count + question.answers.filter((answer) => answer.userId === user.id).length,
    0,
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleQuestions = normalizedQuery
    ? qna.filter((question) =>
        `${question.title} ${question.content} ${question.answers
          .map((answer) => answer.content)
          .join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : qna;
  // Simple section coin logic alag se calculate kiya hai taki contribution clearly dikhe.
  const sectionCoins = askedByUser * 3 + answersByUser * 5;

  const handleChange = (e) => {
    // Ask question form ke inputs ko ek hi handler se manage kar raha hu.
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    // Har new question ke saath createdAt aur empty answers array store kar raha hu.
    const newQuestion = {
      id: Date.now(),
      userId: user.id,
      title: formData.title,
      content: formData.content,
      createdAt: new Date().toISOString(),
      answers: [],
    };
    setQna([...qna, newQuestion]);
    showToast("Question posted", "success");
    setShowForm(false);
    setFormData({ title: "", content: "" });
  };

  const handleSubmitAnswer = (questionId) => {
    if (!answerContent.trim()) return;
    // Answer ke andar upvote aur edit tracking fields start se hi rakh diye.
    const updated = qna.map((q) =>
      q.id === questionId
        ? {
            ...q,
            answers: [
              ...q.answers,
              {
                id: Date.now(),
                userId: user.id,
                content: answerContent,
                upvotes: 0,
                upvotedBy: [],
                editHistory: [],
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : q,
    );
    setQna(updated);
    showToast("Answer posted", "success");
    setAnsweringQuestion(null);
    setAnswerContent("");
  };

  const handleEditAnswer = (questionId, answerId) => {
    if (!editedAnswerContent.trim()) return;

    // Answer edit karne par old edit history lose na ho, isliye append kar raha hu.
    const updated = qna.map((question) =>
      question.id === questionId
        ? {
            ...question,
            answers: question.answers.map((answer) =>
              answer.id === answerId
                ? {
                    ...answer,
                    content: editedAnswerContent,
                    editHistory: [
                      ...(Array.isArray(answer.editHistory) ? answer.editHistory : []),
                      {
                        id: Date.now(),
                        editedAt: new Date().toISOString(),
                        summary: "Answer content updated",
                      },
                    ],
                  }
                : answer,
            ),
          }
        : question,
    );

    setQna(updated);
    setEditingAnswer(null);
    setEditedAnswerContent("");
    showToast("Answer updated", "success");
  };

  const handleUpvote = (questionId, answerId) => {
    const question = qna.find((q) => q.id === questionId);
    const answer = question?.answers.find((a) => a.id === answerId);

    // Same user same answer ko dubara upvote na kar sake.
    if (answer?.upvotedBy?.includes(user.id)) {
      showToast("You already upvoted this answer", "info");
      return;
    }

    const updated = qna.map((q) =>
      q.id === questionId
        ? {
            ...q,
            answers: q.answers.map((a) =>
              a.id === answerId
                ? {
                    ...a,
                    upvotes: a.upvotes + 1,
                    upvotedBy: [...(a.upvotedBy || []), user.id],
                  }
                : a,
            ),
          }
        : q,
    );
    setQna(updated);
    showToast("Upvoted", "success");
  };

  return (
    <div className="qna-page p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Q&A Forum</h1>
          <p className="text-sm text-gray-600 mt-1">
            Coins earned in this section: {sectionCoins}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Ask Question
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-3">Ask a Question</h2>
            <form onSubmit={handleSubmitQuestion} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: "", content: "" });
                  }}
                  className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {visibleQuestions.map((question) => (
          <div
            key={question.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {question.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{question.content}</p>
                <div className="text-xs text-gray-500">
                  Asked by{" "}
                  {users.find((u) => u.id === question.userId)?.name || "Unknown"}
                </div>
              </div>
              <button
                onClick={() =>
                  setAnsweringQuestion(
                    answeringQuestion === question.id ? null : question.id,
                  )
                }
                className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {answeringQuestion === question.id ? "Cancel" : "Answer"}
              </button>
            </div>

            {answeringQuestion === question.id && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Write your answer..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleSubmitAnswer(question.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 text-sm">
                  Answers ({question.answers.length})
                </h4>
              </div>

              <div className="space-y-2">
                {[...question.answers]
                  .sort((a, b) => b.upvotes - a.upvotes || b.id - a.id)
                  .map((answer) => {
                    const alreadyUpvoted = answer.upvotedBy?.includes(user.id);
                    const isOwner = answer.userId === user.id;

                    return (
                      <div
                        key={answer.id}
                        className="bg-gray-50 rounded-md p-3 border-l-2 border-blue-200"
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <p className="text-gray-700 text-sm mb-2 flex-grow-1">
                            {answer.content}
                          </p>
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-xs text-gray-500">
                            By{" "}
                            {users.find((u) => u.id === answer.userId)?.name ||
                              "Unknown"}
                          </span>
                          <div className="d-flex gap-2 flex-wrap">
                            {isOwner ? (
                              <button
                                onClick={() => {
                                  setEditingAnswer(
                                    editingAnswer === answer.id ? null : answer.id,
                                  );
                                  setEditedAnswerContent(answer.content);
                                }}
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Edit
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleUpvote(question.id, answer.id)}
                              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-xs btn btn-sm btn-light"
                              disabled={alreadyUpvoted}
                            >
                              Upvote {answer.upvotes}
                            </button>
                          </div>
                        </div>

                        {editingAnswer === answer.id ? (
                          <div className="mt-3">
                            <textarea
                              value={editedAnswerContent}
                              onChange={(e) => setEditedAnswerContent(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <div className="d-flex gap-2 justify-content-end mt-2">
                              <button
                                onClick={() => handleEditAnswer(question.id, answer.id)}
                                className="btn btn-sm btn-success"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingAnswer(null)}
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {answer.editHistory?.length ? (
                          <div className="text-xs text-gray-400 mt-2">
                            Edited {answer.editHistory.length} time(s). Last edit:{" "}
                            {new Date(
                              answer.editHistory[answer.editHistory.length - 1].editedAt,
                            ).toLocaleString()}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                {question.answers.length === 0 && (
                  <p className="text-gray-400 text-sm italic text-center py-2">
                    No answers yet
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {visibleQuestions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">?</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {normalizedQuery ? "No matching questions" : "No questions yet"}
            </h3>
            <p className="text-gray-600 text-sm">
              {normalizedQuery
                ? `Try a different search for "${searchQuery}".`
                : "Be the first to ask a question!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QnA;
