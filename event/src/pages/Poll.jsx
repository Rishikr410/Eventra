import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import "./style/Poll.css";

const initialPolls = [
  {
    id: 1,
    question: "Which event format should we prioritize next month?",
    eventFilter: "All",
    options: ["Hackathon", "Fest", "Workshop"],
    votes: [12, 8, 5],
    userVotes: {},
  },
  {
    id: 2,
    question: "Best slot for Fest activities?",
    eventFilter: "Fest",
    options: ["Morning", "Afternoon", "Evening"],
    votes: [4, 7, 14],
    userVotes: {},
  },
];

const Poll = () => {
  const { user, polls, setPolls, showToast } = useApp();
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const pollList = useMemo(
    // Agar user-created polls nahi hain to initial demo polls show kar raha hu.
    () => (Array.isArray(polls) && polls.length > 0 ? polls : initialPolls),
    [polls],
  );

  const addOptionField = () => {
    // Poll options ko max 5 tak hi allow kiya hai UI simple rakhne ke liye.
    if (newOptions.length >= 5) return;
    setNewOptions((prev) => [...prev, ""]);
  };

  const updateOptionField = (index, value) => {
    setNewOptions((prev) =>
      prev.map((option, i) => (i === index ? value : option)),
    );
  };

  const removeOptionField = (index) => {
    if (newOptions.length <= 2) return;
    setNewOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const createPoll = (event) => {
    event.preventDefault();

    const cleanQuestion = newQuestion.trim();
    const cleanOptions = newOptions.map((o) => o.trim()).filter(Boolean);

    if (!cleanQuestion) {
      showToast("Question is required", "error");
      return;
    }

    if (cleanOptions.length < 2) {
      showToast("Add at least 2 options", "error");
      return;
    }

    // Same option repeat na ho isliye lowercase unique check use kiya.
    const uniqueOptions = [...new Set(cleanOptions.map((o) => o.toLowerCase()))];
    if (uniqueOptions.length !== cleanOptions.length) {
      showToast("Options must be unique", "error");
      return;
    }

    const newPoll = {
      id: Date.now(),
      question: cleanQuestion,
      eventFilter: "All",
      options: cleanOptions,
      votes: cleanOptions.map(() => 0),
      userVotes: {},
      createdBy: user.id,
    };

    setPolls((prev) => [newPoll, ...prev]);
    setNewQuestion("");
    setNewOptions(["", ""]);
    showToast("Poll created", "success");
  };

  const vote = (pollId, optionIndex) => {
    if (!user) return;

    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;

        // Ek user ek hi poll me sirf ek baar vote kar sake.
        const votedOption = poll.userVotes?.[user.id];
        if (votedOption !== undefined) {
          showToast("You already voted in this poll", "info");
          return poll;
        }

        const nextVotes = poll.votes.map((count, i) =>
          i === optionIndex ? count + 1 : count,
        );

        return {
          ...poll,
          votes: nextVotes,
          userVotes: { ...(poll.userVotes || {}), [user.id]: optionIndex },
        };
      }),
    );
  };

  return (
    <section className="poll-page p-4 p-md-5">
      <div className="mx-auto" style={{ maxWidth: "920px" }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h1 className="h3 fw-bold mb-0">Event Polls</h1>
          <span className="badge text-bg-light border">
            {pollList.length} Polls
          </span>
        </div>

        {user?.role === "admin" && (
          <form
            onSubmit={createPoll}
            className="bg-white border border-gray-200 rounded-4 p-4 shadow-sm mb-4"
          >
            <h2 className="h5 fw-semibold mb-3">Create Poll (Admin)</h2>

            <div className="mb-3">
              <label className="form-label">Question</label>
              <input
                type="text"
                className="form-control"
                value={newQuestion}
                onChange={(event) => setNewQuestion(event.target.value)}
                placeholder="Enter poll question..."
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Options</label>
              <div className="d-grid gap-2">
                {newOptions.map((option, index) => (
                  <div key={index} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      value={option}
                      onChange={(event) =>
                        updateOptionField(index, event.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeOptionField(index)}
                      disabled={newOptions.length <= 2}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mt-2"
                onClick={addOptionField}
                disabled={newOptions.length >= 5}
              >
                Add Option
              </button>
            </div>

            <button type="submit" className="btn btn-primary">
              Create Poll
            </button>
          </form>
        )}

        <div className="d-grid gap-3">
          {pollList.map((poll) => {
            const totalVotes = poll.votes.reduce((sum, value) => sum + value, 0);
            const votedOption = poll.userVotes?.[user?.id];

            return (
              <article
                key={poll.id}
                className="bg-white border border-gray-200 rounded-4 p-4 shadow-sm"
              >
                <div className="mb-3">
                  <h2 className="h5 fw-semibold mb-0">{poll.question}</h2>
                </div>

                <div className="d-grid gap-2">
                  {poll.options.map((option, index) => {
                    const voteCount = poll.votes[index];
                    const percentage =
                      totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                    const isSelected = votedOption === index;

                    return (
                      <button
                        type="button"
                        key={option}
                        className={`btn text-start d-flex justify-content-between align-items-center ${
                          isSelected ? "btn-primary" : "btn-outline-primary"
                        }`}
                        onClick={() => vote(poll.id, index)}
                        disabled={votedOption !== undefined}
                      >
                        <span>
                          {option} {isSelected ? "(Your vote)" : ""}
                        </span>
                        <span className="small">
                          {voteCount} votes ({percentage}%)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}

          {pollList.length === 0 && (
            <p className="text-center text-secondary py-4">No polls available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Poll;
