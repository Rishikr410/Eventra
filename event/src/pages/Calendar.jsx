import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import "./style/Calendar.css";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date) {
  // Calendar lookup ke liye consistent YYYY-MM-DD key bana raha hu.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date) {
  const next = new Date(date);
  // Week view Sunday se start ho isliye current day jitna offset minus kiya.
  next.setDate(next.getDate() - next.getDay());
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function sameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function Calendar() {
  const { user, tasks, events } = useApp();
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const userTasks = tasks.filter((task) => task.userId === user.id && task.deadline);

  const calendarItems = useMemo(() => {
    // Events aur task deadlines ko ek common structure me convert karke calendar me use kar raha hu.
    const eventItems = events.map((event) => ({
      id: `event-${event.id}`,
      type: "event",
      title: event.title,
      date: event.date,
      detail: event.location || event.venue || "Location TBD",
      description: event.desc || event.description || "No description available.",
    }));

    const taskItems = userTasks.map((task) => ({
      id: `task-${task.id}`,
      type: "deadline",
      title: task.title,
      date: task.deadline,
      detail: `Priority: ${task.priority}`,
      description: task.done ? "Completed task" : "Task deadline",
    }));

    return [...eventItems, ...taskItems].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [events, userTasks]);

  const itemsByDate = useMemo(() => {
    // Date wise grouping se selected day aur calendar preview dono easy ho jate hain.
    return calendarItems.reduce((acc, item) => {
      const key = item.date;
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});
  }, [calendarItems]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());

    // Month grid complete dikhane ke liye previous/next month ke filler days bhi add kiye.
    const days = [];
    for (let day = new Date(gridStart); day <= gridEnd; day = addDays(day, 1)) {
      days.push(new Date(day));
    }
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [currentDate]);

  const selectedItems = itemsByDate[toDateKey(selectedDate)] || [];
  const upcomingCount = calendarItems.filter(
    (item) => new Date(item.date) >= new Date(new Date().toDateString()),
  ).length;

  const handlePrev = () => {
    setCurrentDate((prev) =>
      viewMode === "month"
        ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        : addDays(prev, -7),
    );
  };

  const handleNext = () => {
    setCurrentDate((prev) =>
      viewMode === "month"
        ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        : addDays(prev, 7),
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const renderItemsPreview = (date, compact = false) => {
    const items = itemsByDate[toDateKey(date)] || [];
    const visible = compact ? items.slice(0, 2) : items;

    // Month view me compact preview aur week view me full preview use ho raha hai.
    return (
      <div className="calendar-item-stack">
        {visible.map((item) => (
          <span
            key={item.id}
            className={`calendar-item-pill calendar-item-pill-${item.type}`}
          >
            {item.title}
          </span>
        ))}
        {compact && items.length > visible.length ? (
          <span className="calendar-item-more">+{items.length - visible.length} more</span>
        ) : null}
      </div>
    );
  };

  return (
    <section className="calendar-page p-4 p-md-5">
      <div className="calendar-shell">
        <div className="calendar-header">
          <div>
            <span className="calendar-eyebrow">Unified Planner</span>
            <h1 className="calendar-title mb-2">Event Calendar View</h1>
            <p className="calendar-copy mb-0">
              Track events and your task deadlines together in one schedule.
            </p>
          </div>

          <div className="calendar-summary-card">
            <span className="calendar-summary-label">Scheduled Items</span>
            <strong>{upcomingCount}</strong>
            <p className="mb-0">
              Includes upcoming events and your deadlines.
            </p>
          </div>
        </div>

        <div className="calendar-toolbar">
          <div className="calendar-nav-group">
            <button type="button" className="calendar-toolbar-btn" onClick={handlePrev}>
              Prev
            </button>
            <button type="button" className="calendar-toolbar-btn" onClick={handleToday}>
              Today
            </button>
            <button type="button" className="calendar-toolbar-btn" onClick={handleNext}>
              Next
            </button>
          </div>

          <h2 className="calendar-current-label mb-0">
            {viewMode === "month"
              ? currentDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })
              : `${weekDays[0].toLocaleDateString()} - ${weekDays[6].toLocaleDateString()}`}
          </h2>

          <div className="calendar-view-toggle">
            <button
              type="button"
              className={`calendar-toggle-btn ${viewMode === "month" ? "active" : ""}`}
              onClick={() => setViewMode("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={`calendar-toggle-btn ${viewMode === "week" ? "active" : ""}`}
              onClick={() => setViewMode("week")}
            >
              Week
            </button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="calendar-board">
              {viewMode === "month" ? (
                <>
                  <div className="calendar-weekdays">
                    {dayNames.map((day) => (
                      <div key={day} className="calendar-weekday">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="calendar-month-grid">
                    {monthDays.map((date) => {
                      const key = toDateKey(date);
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isSelected = sameDay(date, selectedDate);
                      const isToday = sameDay(date, new Date());

                      return (
                        <button
                          type="button"
                          key={key}
                          className={`calendar-day-card ${
                            isCurrentMonth ? "" : "calendar-day-card-muted"
                          } ${isSelected ? "calendar-day-card-selected" : ""} ${
                            isToday ? "calendar-day-card-today" : ""
                          }`}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="calendar-day-top">
                            <span className="calendar-day-number">{date.getDate()}</span>
                            <span className="calendar-day-count">
                              {(itemsByDate[key] || []).length}
                            </span>
                          </div>
                          {renderItemsPreview(date, true)}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="calendar-week-list">
                  {weekDays.map((date) => {
                    const key = toDateKey(date);
                    const items = itemsByDate[key] || [];
                    const isSelected = sameDay(date, selectedDate);
                    const isToday = sameDay(date, new Date());

                    return (
                      <button
                        type="button"
                        key={key}
                        className={`calendar-week-card ${
                          isSelected ? "calendar-week-card-selected" : ""
                        } ${isToday ? "calendar-week-card-today" : ""}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="calendar-week-head">
                          <div>
                            <span className="calendar-week-name">
                              {dayNames[date.getDay()]}
                            </span>
                            <strong>{date.toLocaleDateString()}</strong>
                          </div>
                          <span className="calendar-week-count">{items.length} items</span>
                        </div>
                        {renderItemsPreview(date)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="calendar-agenda-card">
              <span className="calendar-eyebrow">Selected Day</span>
              <h3 className="calendar-agenda-title">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>

              <div className="calendar-legend">
                <span className="calendar-legend-item">
                  <span className="calendar-legend-dot calendar-legend-dot-event"></span>
                  Events
                </span>
                <span className="calendar-legend-item">
                  <span className="calendar-legend-dot calendar-legend-dot-deadline"></span>
                  Deadlines
                </span>
              </div>

              <div className="calendar-agenda-list">
                {selectedItems.length > 0 ? (
                  selectedItems.map((item) => (
                    <article
                      key={item.id}
                      className={`calendar-agenda-item calendar-agenda-item-${item.type}`}
                    >
                      <div className="calendar-agenda-badge">
                        {item.type === "deadline" ? "Task" : "Event"}
                      </div>
                      <h4 className="calendar-agenda-item-title">{item.title}</h4>
                      <p className="calendar-agenda-item-detail mb-1">{item.detail}</p>
                      <p className="calendar-agenda-item-copy mb-0">{item.description}</p>
                    </article>
                  ))
                ) : (
                  <div className="calendar-empty-state">
                    Nothing scheduled for this day yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Calendar;
