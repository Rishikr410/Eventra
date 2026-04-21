import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { buildMergedEvents } from "../utils/eventData";
import "./style/Dashboard.css";

const Dashboard = () => {
  const { user, tasks, events, users, notes } = useApp();
  const navigate = useNavigate();
  const [showPointsBreakdown, setShowPointsBreakdown] = useState(false);

  const now = new Date();
  const currentHour = now.getHours();
  // Time ke basis par simple greeting show kar raha hu for better personal feel.
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  const userTasks = tasks.filter((task) => task.userId === user.id);
  const completedTasks = userTasks.filter((task) => task.done).length;
  const pendingTasks = userTasks.length - completedTasks;
  const completionPercent = userTasks.length
    ? Math.round((completedTasks / userTasks.length) * 100)
    : 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCompletedTasks = userTasks.filter(
    (task) => task.done && task.completedAt && task.completedAt.slice(0, 10) === todayKey,
  ).length;
  const dailyTarget = 15;
  const tasksLeftForCoin = Math.max(dailyTarget - todayCompletedTasks, 0);
  const dailyCoinEarned = (user?.taskDailyRewardDates || []).includes(todayKey);
  // Dashboard me same merged event list use ho taki static aur created events dono dikh jaye.
  const allEvents = useMemo(() => buildMergedEvents(events), [events]);

  const upcomingEvents = [...allEvents]
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const registeredEvents = allEvents.filter((event) =>
    (event.registeredUsers || event.joined || []).includes(user.id),
  );
  const registeredUpcomingEvents = upcomingEvents.filter((event) =>
    (event.registeredUsers || event.joined || []).includes(user.id),
  );

  const spotlightItems = [
    ...registeredUpcomingEvents.map((event) => ({
      id: `event-${event.id}`,
      type: "event",
      title: event.title,
      date: event.date,
      meta: `Registered event - ${event.location || event.venue || "Location TBD"}`,
      actionPath: "/events",
    })),
    ...userTasks
      .filter((task) => !task.done)
      .sort((a, b) => {
        if (a.deadline && b.deadline) {
          return new Date(a.deadline) - new Date(b.deadline);
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return b.id - a.id;
      })
      .map((task) => ({
        id: `task-${task.id}`,
        type: "deadline",
        title: task.title,
        date: task.deadline || new Date(task.id).toISOString(),
        meta: `Not completed - ${task.priority} priority`,
        actionPath: "/tasks",
      })),
  ]
    // Events aur tasks ko ek timeline type flow me combine karke top priorities dikha raha hu.
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const urgentTask =
    [...userTasks]
      .filter((task) => !task.done && task.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0] || null;

  const urgentAlerts = [
    upcomingEvents[0]
      ? {
          id: "next-event",
          title: "Next Event",
          text: `${upcomingEvents[0].title} on ${new Date(
            upcomingEvents[0].date,
          ).toLocaleDateString()}`,
          actionPath: "/events",
        }
      : null,
    urgentTask
      ? {
          id: "nearest-deadline",
          title: "Nearest Deadline",
          text: urgentTask.title,
          actionPath: "/tasks",
        }
      : null,
    pendingTasks > 0
      ? {
          id: "pending-tasks",
          title: "Pending Tasks",
          text: `${pendingTasks} task${pendingTasks > 1 ? "s" : ""} need attention`,
          actionPath: "/tasks",
        }
      : null,
  ].filter(Boolean);

  const topParticipants = [...users]
    .filter((item) => item.role !== "admin")
    .sort((a, b) => (b.points || 0) - (a.points || 0));
  const userRank = topParticipants.findIndex((participant) => participant.id === user?.id) + 1;

  const eventAndDeadlineItems = [
    ...upcomingEvents.slice(0, 4).map((event) => ({
      id: `focus-event-${event.id}`,
      type: "event",
      title: event.title,
      date: event.date,
      meta: event.location || event.venue || "Location TBD",
      description: event.desc || event.description || "Upcoming event",
    })),
    ...userTasks
      .filter((task) => !task.done && task.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 4)
      .map((task) => ({
        id: `focus-deadline-${task.id}`,
        type: "deadline",
        title: task.title,
        date: task.deadline,
        meta: `${task.priority} priority task`,
        description: "Task deadline approaching",
      })),
  ]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const recentNotes = notes
    .filter((note) => note.userId === user.id)
    .slice(-2)
    .reverse();

  const activityFeed = [
    ...upcomingEvents.slice(0, 2).map((event) => ({
      id: `activity-event-${event.id}`,
      type: "event",
      title: event.title,
      meta: `Upcoming event on ${new Date(event.date).toLocaleDateString()}`,
      note: event.location || event.venue || "Location TBD",
    })),
    ...userTasks
      .filter((task) => task.done)
      .slice(-2)
      .reverse()
      .map((task) => ({
        id: `activity-task-${task.id}`,
        type: "done",
        title: task.title,
        meta: "Task completed",
        note: task.completedAt
          ? new Date(task.completedAt).toLocaleDateString()
          : "Recently completed",
      })),
    ...recentNotes.map((note) => ({
      id: `activity-note-${note.id}`,
      type: "task",
      title: note.title,
      meta: "Recent note",
      note: note.category || "General",
    })),
  ].slice(0, 6);

  const points = user?.points || 0;
  const pointsHistory = Array.isArray(user?.pointsHistory) ? user.pointsHistory : [];
  const categorizedPoints = useMemo(() => {
    // Points ko event vs task buckets me split kiya hai so breakdown samajhna easy ho.
    const eventEntries = pointsHistory.filter((entry) => {
      const text = `${entry.reason || ""}`.toLowerCase();
      return text.includes("event") || text.includes("hackathon") || text.includes("registered");
    });

    const taskEntries = pointsHistory.filter((entry) => {
      const text = `${entry.reason || ""}`.toLowerCase();
      return text.includes("task");
    });

    const otherEntries = pointsHistory.filter(
      (entry) => !eventEntries.includes(entry) && !taskEntries.includes(entry),
    );

    return {
      eventEntries,
      taskEntries: [...taskEntries, ...otherEntries],
      eventPoints: eventEntries.reduce((sum, entry) => sum + (entry.points || 0), 0),
      taskPoints: [...taskEntries, ...otherEntries].reduce(
        (sum, entry) => sum + (entry.points || 0),
        0,
      ),
    };
  }, [pointsHistory]);

  return (
    <div className="container-fluid px-3 px-md-4 px-xl-5 py-4 py-md-5">
      <section className="dashboard-command-top mb-4 mb-md-5">
        <div className="dashboard-hero-copy">
          <span className="dashboard-eyebrow">Command Center</span>
          <h1 className="dashboard-title mb-2">
            {greeting}, {user?.name || user?.username}
          </h1>
          <p className="dashboard-subtitle mb-4">
            A single place to track today&apos;s agenda, urgent deadlines,
            upcoming events, and your overall progress.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-points-card dashboard-points-card-button"
          onClick={() => setShowPointsBreakdown(true)}
        >
          <span className="dashboard-points-label">Points Earned</span>
          <div className="dashboard-points-value">{points}</div>
          <div className="dashboard-mini-progress mb-3">
            <div
              className="dashboard-mini-progress-fill"
              style={{ width: `${Math.min(100, Math.round((points / 200) * 100))}%` }}
            ></div>
          </div>
        </button>
      </section>

      <section className="dashboard-command-grid mb-4 mb-md-5">
        <div className="dashboard-command-left">
          <div className="dashboard-panel dashboard-agenda-panel h-100">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
              <div>
                <span className="dashboard-eyebrow mb-2">Today Focus</span>
                <h3 className="dashboard-panel-title mb-0">Spotlight Zone</h3>
              </div>
              <button
                type="button"
                className="dashboard-link-button dashboard-link-button-secondary"
                onClick={() => navigate("/calendar")}
              >
                Full Calendar
              </button>
            </div>

            <div className="dashboard-agenda-list">
              {spotlightItems.length > 0 ? (
                spotlightItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`dashboard-agenda-item dashboard-agenda-item-${item.type}`}
                    onClick={() => navigate(item.actionPath)}
                  >
                    <div>
                      <h4 className="dashboard-agenda-title mb-1">{item.title}</h4>
                      <p className="dashboard-agenda-meta mb-0">{item.meta}</p>
                    </div>
                    <span className="dashboard-agenda-date">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </button>
                ))
              ) : (
                <div className="dashboard-empty-card">
                  No registered upcoming events or pending tasks yet.
                </div>
              )}
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-12 col-xl-6">
              <article className="dashboard-stat-card dashboard-stat-card-blue h-100">
                <span className="dashboard-eyebrow mb-2">Events</span>
                <h3 className="dashboard-panel-title mb-0">Registered Events</h3>
                <div className="dashboard-stat-value">{registeredEvents.length}</div>
                <p className="dashboard-stat-note mb-0">
                  {registeredUpcomingEvents.length} upcoming event
                  {registeredUpcomingEvents.length === 1 ? "" : "s"} on your calendar.
                </p>
              </article>
            </div>

            <div className="col-12 col-xl-6">
              <article className="dashboard-stat-card dashboard-stat-card-amber h-100">
                <div className="d-flex justify-content-between align-items-center gap-3 mb-3 flex-wrap">
                  <div>
                    <span className="dashboard-eyebrow mb-2">Progress</span>
                    <h3 className="dashboard-panel-title mb-0">Task Completion</h3>
                  </div>
                  <span className="dashboard-progress-pill">{completionPercent}% done</span>
                </div>

                <div className="dashboard-progress-track dashboard-progress-track-lg mb-3">
                  <div
                    className="dashboard-progress-fill"
                    style={{ width: `${completionPercent}%` }}
                  ></div>
                </div>

                <div className="dashboard-progress-meta">
                  <span>{completedTasks} completed</span>
                  <span>{pendingTasks} pending</span>
                  <span>
                    {dailyCoinEarned ? "Daily coin earned" : `${tasksLeftForCoin} left for +2 coin`}
                  </span>
                </div>
              </article>
            </div>
          </div>
        </div>

        <div className="dashboard-command-right">
          <div className="dashboard-panel mb-4">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
              <h3 className="dashboard-panel-title mb-0">Urgent Alerts</h3>
              <span className="dashboard-analytics-label">Action Needed</span>
            </div>

            <div className="dashboard-alert-stack">
              {urgentAlerts.length > 0 ? (
                urgentAlerts.map((alert) => (
                  <button
                    type="button"
                    key={alert.id}
                    className="dashboard-alert-row"
                    onClick={() => navigate(alert.actionPath)}
                  >
                    <strong>{alert.title}</strong>
                    <span>{alert.text}</span>
                  </button>
                ))
              ) : (
                <div className="dashboard-empty-card">No urgent alerts.</div>
              )}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <article className="dashboard-stat-card dashboard-stat-card-violet h-100">
                <span className="dashboard-eyebrow mb-2">Rank</span>
                <h3 className="dashboard-panel-title mb-0">Your Position</h3>
                <div className="dashboard-stat-value">
                  {userRank > 0 ? `#${userRank}` : "-"}
                </div>
                <p className="dashboard-stat-note mb-3">{points} points earned so far.</p>

                <div className="dashboard-leader-mini-list">
                  {topParticipants.slice(0, 5).map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`dashboard-leader-row ${
                        participant.id === user?.id ? "dashboard-leader-row-active" : ""
                      }`}
                    >
                      <div className="d-flex align-items-center min-w-0">
                        <div className="dashboard-leader-rank">#{index + 1}</div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-800 text-sm mb-1">
                            {participant.name || participant.username}
                            {participant.id === user?.id ? (
                              <span className="text-orange-600 text-xs ms-1 fw-bold">
                                (You)
                              </span>
                            ) : null}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize mb-0">
                            {participant.role}
                          </p>
                        </div>
                      </div>
                      <div className="dashboard-leader-points">
                        {participant.points || 0} pts
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-panel mb-4 mb-md-5">
        <div className="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
          <div>
            <span className="dashboard-eyebrow mb-2">Connected Priorities</span>
            <h3 className="dashboard-panel-title mb-0">
              Upcoming Events and Deadlines
            </h3>
          </div>
          <button
            type="button"
            className="dashboard-link-button dashboard-link-button-secondary"
            onClick={() => navigate("/calendar")}
          >
            View Planner
          </button>
        </div>

        <div className="row g-3">
          {eventAndDeadlineItems.length > 0 ? (
            eventAndDeadlineItems.map((item) => (
              <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                <article
                  className={`dashboard-event-card dashboard-event-card-${item.type}`}
                >
                  <span className="dashboard-event-badge">
                    {item.type === "deadline" ? "Deadline" : "Upcoming Event"}
                  </span>
                  <h3 className="dashboard-event-title">{item.title}</h3>
                  <p className="dashboard-event-date mb-2">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                  <p className="dashboard-event-location mb-3">{item.meta}</p>
                  <p className="dashboard-event-desc mb-0">{item.description}</p>
                </article>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="dashboard-empty-card">
                No upcoming events or deadlines yet.
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
          <div>
            <span className="dashboard-eyebrow mb-2">Recent Updates</span>
            <h3 className="dashboard-panel-title mb-0">Activity Feed</h3>
          </div>
          <span className="dashboard-analytics-label">Live Overview</span>
        </div>

        <div className="dashboard-timeline">
          {activityFeed.length > 0 ? (
            activityFeed.map((item) => (
              <div className="dashboard-timeline-item" key={item.id}>
                <div className="dashboard-timeline-card">
                  <h4 className="dashboard-timeline-title mb-1">{item.title}</h4>
                  <p className="dashboard-timeline-meta mb-1">{item.meta}</p>
                  <p className="dashboard-timeline-note mb-0">{item.note}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="dashboard-empty-card">
              Activity will appear here as you use the portal.
            </div>
          )}
        </div>
      </section>

      {showPointsBreakdown ? (
        <div
          className="dashboard-points-overlay"
          onClick={() => setShowPointsBreakdown(false)}
        >
          <div
            className="dashboard-points-breakdown-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
              <div>
                <span className="dashboard-eyebrow mb-2">Points Breakdown</span>
                <h3 className="dashboard-panel-title mb-1">How You Earned Points</h3>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowPointsBreakdown(false)}
                aria-label="Close points breakdown"
              />
            </div>

            <div className="dashboard-points-split">
              <section className="dashboard-points-column">
                <div className="dashboard-points-column-head">
                  <span className="dashboard-event-badge">Events</span>
                  <strong>{categorizedPoints.eventPoints} pts</strong>
                </div>
                <div className="dashboard-points-history">
                  {categorizedPoints.eventEntries.length > 0 ? (
                    categorizedPoints.eventEntries
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id} className="dashboard-points-history-item">
                          <div>
                            <h4>{entry.reason}</h4>
                            <p>{new Date(entry.createdAt).toLocaleString()}</p>
                          </div>
                          <span>+{entry.points}</span>
                        </div>
                      ))
                  ) : (
                    <div className="dashboard-empty-card">
                      No event points earned yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="dashboard-points-column">
                <div className="dashboard-points-column-head">
                  <span className="dashboard-event-badge dashboard-event-badge-deadline">
                    Tasks
                  </span>
                  <strong>{categorizedPoints.taskPoints} pts</strong>
                </div>
                <div className="dashboard-points-history">
                  {categorizedPoints.taskEntries.length > 0 ? (
                    categorizedPoints.taskEntries
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id} className="dashboard-points-history-item">
                          <div>
                            <h4>{entry.reason}</h4>
                            <p>{new Date(entry.createdAt).toLocaleString()}</p>
                          </div>
                          <span>+{entry.points}</span>
                        </div>
                      ))
                  ) : (
                    <div className="dashboard-empty-card">
                      No task points earned yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
