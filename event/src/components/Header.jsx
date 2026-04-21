import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const rewardCourses = [
  {
    id: 1,
    title: "React Frontend Mastery",
    provider: "Eventra Learning",
    coinsNeeded: 20,
    discount: "15% off",
  },
  {
    id: 2,
    title: "Data Structures Crash Program",
    provider: "Campus Coding Lab",
    coinsNeeded: 35,
    discount: "25% off",
  },
  {
    id: 3,
    title: "UI/UX Design Sprint",
    provider: "Creative Skills Hub",
    coinsNeeded: 50,
    discount: "40% off",
  },
];

const Header = () => {
  const {
    user,
    logout,
    darkMode,
    setDarkMode,
    tasks,
    events,
    searchQuery,
    setSearchQuery,
  } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoPanel, setInfoPanel] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const points = user?.points || 0;

  useEffect(() => {
    function handleOutsideClick(event) {
      // Outside click par open dropdowns close ho jaye taki header clean behave kare.
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setInfoPanel(null);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
    setInfoPanel(null);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setInfoPanel(null);
    setNotificationsOpen(false);
    navigate("/login");
  };

  const upcomingEventNotifications = events
    // Header bell me nearest events ko quick reminder ke form me dikha raha hu.
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2)
    .map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      note: `Upcoming event on ${new Date(event.date).toLocaleDateString()}`,
      path: "/events",
    }));

  const deadlineNotifications = tasks
    // User specific pending deadlines ko bhi same notification flow me merge kiya.
    .filter((task) => task.userId === user?.id && !task.done && task.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 2)
    .map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      note: `Deadline on ${new Date(task.deadline).toLocaleDateString()}`,
      path: "/tasks",
    }));

  const notifications = [
    ...upcomingEventNotifications,
    ...deadlineNotifications,
  ]
    .sort((a, b) => a.note.localeCompare(b.note))
    .slice(0, 4);

  const rewardOptions = useMemo(
    () =>
      rewardCourses.map((course) => ({
        ...course,
        // Coins enough honge tabhi redeem button active feel karega.
        canRedeem: points >= course.coinsNeeded,
      })),
    [points],
  );

  return (
    <>
      <header className="header-glass px-3 py-2">
        <div className="header-shell d-flex align-items-center justify-content-between gap-3">
          <ul className="nav header-nav gap-2 mb-0">
            <li>
              <button
                className="nav-link header-link btn btn-link p-0"
                onClick={() => goTo("/dashboard")}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className="nav-link header-link btn btn-link p-0"
                onClick={() => goTo("/calendar")}
              >
                Calendar
              </button>
            </li>
            <li>
              <button
                className="nav-link header-link btn btn-link p-0"
                onClick={() => goTo("/qna")}
              >
                Q&A
              </button>
            </li>
            <li>
              <button
                className="nav-link header-link btn btn-link p-0"
                onClick={() => goTo("/notes")}
              >
                Notes
              </button>
            </li>
            <li>
              <button
                className="nav-link header-link btn btn-link p-0"
                onClick={() => goTo("/poll")}
              >
                Poll
              </button>
            </li>
          </ul>

          <div className="header-actions d-flex align-items-center gap-2 ms-auto">
            <input
              type="search"
              placeholder="Search..."
              className="form-control search-box-small"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            <button
              type="button"
              className="btn btn-light border-0 rounded-pill px-3 header-reward-trigger"
              onClick={() => setRewardsOpen(true)}
            >
              Redeem
            </button>

            <div className="position-relative" ref={notificationsRef}>
              <button
                type="button"
                className="btn btn-light position-relative border-0 rounded-circle d-inline-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px" }}
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Open notifications"
              >
                <span className="small">!</span>
                {notifications.length > 0 ? (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.length}
                  </span>
                ) : null}
              </button>

              {notificationsOpen ? (
                <div className="dropdown-menu dropdown-menu-end show shadow-sm p-2 user-menu-dropdown">
                  <div className="dropdown-item-text fw-bold">
                    Notifications
                  </div>
                  <div className="dropdown-item-text small text-muted">
                    Upcoming events and deadlines
                  </div>
                  <hr className="dropdown-divider" />
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className="dropdown-item"
                        onClick={() => {
                          goTo(notification.path);
                          setNotificationsOpen(false);
                        }}
                      >
                        <div className="fw-semibold">{notification.title}</div>
                        <div className="small text-muted">
                          {notification.note}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="dropdown-item-text small text-muted">
                      No alerts right now.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="dropdown position-relative" ref={menuRef}>
              <button
                type="button"
                className="btn p-0 border-0 bg-transparent"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label="Open user menu"
              >
                <img
                  src="https://github.com/mdo.png"
                  alt="user"
                  width="50"
                  height="50"
                  className="rounded-circle cursor-pointer header-profile-avatar"
                />
              </button>

              <ul
                className={`dropdown-menu dropdown-menu-end shadow-sm user-menu-dropdown ${menuOpen ? "show" : ""}`}
              >
                <li className="dropdown-item-text fw-bold">
                  {user?.name || "User"}
                </li>
                <li className="dropdown-item-text text-muted small">
                  {user?.role === "admin" ? "Administrator" : "Student"}
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => goTo("/profile")}
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() =>
                      setInfoPanel((current) =>
                        current === "settings" ? null : "settings",
                      )
                    }
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() =>
                      setInfoPanel((current) =>
                        current === "faqs" ? null : "faqs",
                      )
                    }
                  >
                    FAQs
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() =>
                      setInfoPanel((current) =>
                        current === "report" ? null : "report",
                      )
                    }
                  >
                    Report Issue
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setDarkMode((current) => !current);
                      setMenuOpen(false);
                    }}
                  >
                    {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  </button>
                </li>
                {infoPanel === "settings" ? (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li className="dropdown-item-text user-menu-panel-title">
                      Settings
                    </li>
                    <li className="dropdown-item-text user-menu-panel-text">
                      About App
                    </li>
                    <li className="dropdown-item-text user-menu-panel-text">
                      Data Reset
                    </li>
                    <li className="dropdown-item-text user-menu-panel-text">
                      Notification Settings
                    </li>
                    <li className="dropdown-item-text user-menu-panel-note">
                      Available in future updates.
                    </li>
                  </>
                ) : null}
                {infoPanel === "faqs" ? (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li className="dropdown-item-text user-menu-panel-title">
                      FAQs
                    </li>
                    <li className="dropdown-item-text user-menu-panel-text">
                      How to add tasks?
                    </li>
                    <li className="dropdown-item-text user-menu-panel-text">
                      How to join events?
                    </li>
                    <li className="dropdown-item-text user-menu-panel-text">
                      How to reset password?
                    </li>
                    <li className="dropdown-item-text user-menu-panel-text">
                      How to earn points?
                    </li>
                  </>
                ) : null}
                {infoPanel === "report" ? (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li className="dropdown-item-text user-menu-panel-title">
                      Report Issue
                    </li>
                    <li className="dropdown-item-text user-menu-panel-note">
                      Issue reporting will be available in future updates.
                    </li>
                  </>
                ) : null}
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {rewardsOpen ? (
        <div
          className="footer-rewards-overlay"
          onClick={() => setRewardsOpen(false)}
        >
          <div
            className="footer-rewards-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
              <div>
                <span className="footer-section-title">Redeem Coins</span>
                <h3 className="footer-rewards-title mb-1">Course Discounts</h3>
                <p className="footer-meta mb-0">
                  Demo redemption panel based on your current coins: {points}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setRewardsOpen(false)}
                aria-label="Close rewards panel"
              />
            </div>

            <div className="footer-rewards-list">
              {rewardOptions.map((course) => (
                <article key={course.id} className="footer-reward-option">
                  <div>
                    <h4>{course.title}</h4>
                    <p className="mb-1">{course.provider}</p>
                    <span className="footer-reward-tag">
                      {course.discount} • {course.coinsNeeded} coins
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`footer-reward-action ${
                      course.canRedeem
                        ? "footer-reward-action-active"
                        : "footer-reward-action-disabled"
                    }`}
                  >
                    {course.canRedeem ? "Redeem" : "Not Enough Coins"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Header;
