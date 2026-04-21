import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import "./style/Profile.css";

const Profile = () => {
  const {
    user,
    setUser,
    users,
    setUsers,
    showToast,
    events,
    tasks,
    qna,
    polls,
  } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    password: "",
  });
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const joinedEvents = useMemo(
    // Profile stats me sirf wahi events count kar raha hu jahan user actually registered hai.
    () =>
      events.filter((event) =>
        (event.registeredUsers || event.joined || []).includes(user.id),
      ),
    [events, user.id],
  );
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.userId === user.id && task.done),
    [tasks, user.id],
  );
  const answeredQuestions = useMemo(
    () =>
      qna.flatMap((question) =>
        question.answers
          .filter((answer) => answer.userId === user.id)
          .map((answer) => ({ ...answer, questionTitle: question.title })),
      ),
    [qna, user.id],
  );
  const createdPolls = useMemo(
    () => polls.filter((poll) => poll.createdBy === user.id),
    [polls, user.id],
  );
  const pointsHistory = Array.isArray(user.pointsHistory) ? [...user.pointsHistory].reverse() : [];

  const toggleEditing = () => {
    // Edit mode open hote hi current user data form me preload kar diya.
    const nextEditing = !isEditing;
    setIsEditing(nextEditing);
    if (nextEditing) {
      setFormData({
        name: user?.name || "",
        username: user?.username || "",
        password: "",
      });
      setChangePassword(false);
      setNewPassword("");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedUser = {
      ...user,
      name: formData.name,
      username: formData.username,
    };

    // Password tabhi update hoga jab user ne change password select kiya ho.
    if (changePassword && newPassword) {
      updatedUser.password = newPassword;
    }

    // Duplicate username avoid karne ke liye save se pehle check laga diya.
    const existing = users.find(
      (u) => u.username === formData.username && u.id !== user.id,
    );
    if (existing) {
      showToast("Username already taken", "error");
      return;
    }

    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    setUsers(updatedUsers);
    setUser(updatedUser);
    setIsEditing(false);
    setChangePassword(false);
    setNewPassword("");
    showToast("Profile updated", "success");
  };

  return (
    <section className="profile-page p-4 p-md-5">
      <div className="profile-shell">
        <div className="profile-hero-card">
          <div className="profile-avatar-circle">
            {(user?.name || user?.username || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="profile-hero-content">
            <h1>{user?.name || "User Profile"}</h1>
            <p>@{user?.username}</p>
            <div className="profile-badge-row">
              <span className="profile-pill profile-pill-soft">
                {user?.role === "admin" ? "Administrator" : "Student"}
              </span>
              <span className="profile-pill profile-pill-strong">
                {user?.points || 0} points
              </span>
            </div>
          </div>

          <button
            onClick={toggleEditing}
            className={`profile-edit-btn ${isEditing ? "cancel" : "edit"}`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form-grid">
            <div className="profile-field">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="profile-input"
              />
            </div>
            <div className="profile-field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="profile-input"
              />
            </div>
            <div className="profile-switch-row">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="profile-checkbox"
              />
              <label htmlFor="changePassword">Change Password</label>
            </div>
            {changePassword && (
              <div className="profile-field full">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="profile-input"
                />
              </div>
            )}
            <button type="submit" className="profile-save-btn">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="profile-info-grid">
            <div className="profile-info-card">
              <span>Name</span>
              <p>{user.name}</p>
            </div>
            <div className="profile-info-card">
              <span>Username</span>
              <p>{user.username}</p>
            </div>
            <div className="profile-info-card">
              <span>Role</span>
              <p className="capitalize">{user.role}</p>
            </div>
            <div className="profile-info-card">
              <span>Points</span>
              <p>{user.points || 0}</p>
            </div>
          </div>
        )}

        <div className="profile-stats-card">
          <h2>Account Statistics</h2>
          <div className="profile-stats-grid">
            <div className="profile-stat-box">
              <div className="value">{completedTasks.length}</div>
              <div className="label">Completed Tasks</div>
            </div>
            <div className="profile-stat-box">
              <div className="value">{joinedEvents.length}</div>
              <div className="label">Joined Events</div>
            </div>
            <div className="profile-stat-box">
              <div className="value">{answeredQuestions.length}</div>
              <div className="label">Answers Posted</div>
            </div>
            <div className="profile-stat-box">
              <div className="value">{createdPolls.length}</div>
              <div className="label">Created Polls</div>
            </div>
          </div>
        </div>

        <div className="profile-main-card">
          <div className="profile-card-header">
            <h2>Activity Profile</h2>
            <p>Your recent participation and contribution summary.</p>
          </div>
          <div className="profile-activity-grid">
            <div className="profile-activity-card">
              <h3>Joined Events</h3>
              {joinedEvents.length ? (
                joinedEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="profile-activity-item">
                    <strong>{event.title}</strong>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p className="profile-empty-text">No joined events yet.</p>
              )}
            </div>

            <div className="profile-activity-card">
              <h3>Completed Tasks</h3>
              {completedTasks.length ? (
                completedTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="profile-activity-item">
                    <strong>{task.title}</strong>
                    <span>
                      {task.completedAt
                        ? new Date(task.completedAt).toLocaleDateString()
                        : "Completed"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="profile-empty-text">No completed tasks yet.</p>
              )}
            </div>

            <div className="profile-activity-card">
              <h3>Answered Questions</h3>
              {answeredQuestions.length ? (
                answeredQuestions.slice(0, 4).map((answer) => (
                  <div key={answer.id} className="profile-activity-item">
                    <strong>{answer.questionTitle}</strong>
                    <span>{answer.content.slice(0, 40)}</span>
                  </div>
                ))
              ) : (
                <p className="profile-empty-text">No Q&A activity yet.</p>
              )}
            </div>

            <div className="profile-activity-card">
              <h3>Created Polls</h3>
              {createdPolls.length ? (
                createdPolls.slice(0, 4).map((poll) => (
                  <div key={poll.id} className="profile-activity-item">
                    <strong>{poll.question}</strong>
                    <span>{poll.options.length} options</span>
                  </div>
                ))
              ) : (
                <p className="profile-empty-text">No polls created yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="profile-main-card">
          <div className="profile-card-header">
            <h2>Earned Points History</h2>
            <p>Track how your points were earned over time.</p>
          </div>
          <div className="profile-history-list">
            {pointsHistory.length ? (
              pointsHistory.map((entry) => (
                <div key={entry.id} className="profile-history-item">
                  <div>
                    <strong>{entry.reason}</strong>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="profile-history-points">+{entry.points}</div>
                </div>
              ))
            ) : (
              <p className="profile-empty-text">No point history available yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
