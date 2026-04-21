import React, { useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import "./style/Admin.css";

const Admin = () => {
  const {
    user,
    users,
    setUsers,
    events,
    setEvents,
    tasks,
    notes,
    qna,
    polls,
    showToast,
    searchQuery,
  } = useApp();
  const [activeTab, setActiveTab] = useState("users");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    desc: "",
    date: "",
    location: "",
    seatLimit: "50",
    registrationDeadline: "",
    category: "Hackathon",
  });
  const eventDateRef = useRef(null);

  if (user.role !== "admin") {
    return (
      <div className="admin-page container-fluid px-3 px-md-4 py-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You need admin privileges to view this page.</p>
      </div>
    );
  }

  const deleteUser = (userId) => {
    // Direct delete se pehle confirm rakh diya so accidental removal na ho.
    if (window.confirm("Delete this user?")) {
      setUsers(users.filter((u) => u.id !== userId));
      showToast("User deleted", "success");
    }
  };

  const deleteEvent = (eventId) => {
    if (window.confirm("Delete this event?")) {
      setEvents(events.filter((event) => event.id !== eventId));
      showToast("Event deleted", "success");
    }
  };

  const handleEventChange = (e) => {
    // Sare event form fields ko ek common handler se update kar raha hu.
    setEventForm({
      ...eventForm,
      [e.target.name]: e.target.value,
    });
  };

  const createEvent = (e) => {
    e.preventDefault();
    // Admin panel se create hua event bhi same event data shape follow karega.
    const newEvent = {
      id: Date.now(),
      ...eventForm,
      venue: eventForm.location,
      description: eventForm.desc,
      joined: [],
      registeredUsers: [],
      waitlistUsers: [],
      seatLimit: Number(eventForm.seatLimit) || 50,
      registrationDeadline: eventForm.registrationDeadline || eventForm.date,
    };

    setEvents([...events, newEvent]);
    showToast("Event created", "success");
    setEventForm({
      title: "",
      desc: "",
      date: "",
      location: "",
      seatLimit: "50",
      registrationDeadline: "",
      category: "Hackathon",
    });
    setShowCreateEvent(false);
  };

  const totalRegisteredUsers = events.reduce(
    (count, event) => count + (event.registeredUsers?.length || event.joined?.length || 0),
    0,
  );
  const totalAvailableSeats = events.reduce(
    (count, event) => count + (Number(event.seatLimit) || 0),
    0,
  );
  const participationRate = totalAvailableSeats
    ? Math.round((totalRegisteredUsers / totalAvailableSeats) * 100)
    : 0;
  const completedTasks = tasks.filter((task) => task.done).length;
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    // Last 7 days ka quick activity snapshot stats section ke liye bana raha hu.
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      key,
      users: users.filter((item) => {
        const history = Array.isArray(item.pointsHistory) ? item.pointsHistory : [];
        return history.some((entry) => (entry.createdAt || "").startsWith(key));
      }).length,
      tasks: tasks.filter(
        (task) => task.completedAt && task.completedAt.startsWith(key),
      ).length,
    };
  });
  const topUsers = [...users]
    .filter((item) => item.role !== "admin")
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 5);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  // Simple search by name
  const visibleUsers = normalizedQuery
    ? users.filter((member) =>
        (member.name || "").toLowerCase().includes(normalizedQuery),
      )
    : users;
  // Simple search by title
  const visibleEvents = normalizedQuery
    ? events.filter((event) =>
        (event.title || "").toLowerCase().includes(normalizedQuery),
      )
    : events;

  return (
    <div className="admin-page container-fluid px-3 px-md-4 px-xl-5 py-4 py-md-5">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 mb-md-5">Admin Panel</h1>

      <div className="mb-4 mb-md-5">
        <nav className="d-flex gap-2 gap-md-3 flex-wrap">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Users ({visibleUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded ${activeTab === "events" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Events ({visibleEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 rounded ${activeTab === "stats" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {activeTab === "users" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Username</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Points</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((member) => (
                  <tr key={member.id} className="border-b">
                    <td className="py-2">{member.name}</td>
                    <td className="py-2">{member.username}</td>
                    <td className="py-2 capitalize">{member.role}</td>
                    <td className="py-2">{member.points || 0}</td>
                    <td className="py-2">
                      {member.id !== user.id && (
                        <button
                          onClick={() => deleteUser(member.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "events" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <h2 className="text-xl font-semibold">Event Management</h2>
            <button
              onClick={() => setShowCreateEvent(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Event / Fest / Hackathon
            </button>
          </div>

          {showCreateEvent && (
            <form onSubmit={createEvent} className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={eventForm.category}
                    onChange={handleEventChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Fest">Fest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      ref={eventDateRef}
                      type="date"
                      name="date"
                      value={eventForm.date}
                      onChange={handleEventChange}
                      required
                      className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-blue-600"
                      onClick={() =>
                        eventDateRef.current?.showPicker?.() ||
                        eventDateRef.current?.click()
                      }
                    >
                      Date
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={eventForm.location}
                    onChange={handleEventChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Seat Limit
                  </label>
                  <input
                    type="number"
                    name="seatLimit"
                    min="1"
                    value={eventForm.seatLimit}
                    onChange={handleEventChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={eventForm.registrationDeadline}
                    onChange={handleEventChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="desc"
                    value={eventForm.desc}
                    onChange={handleEventChange}
                    required
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-4 flex-wrap">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateEvent(false);
                    setEventForm({
                      title: "",
                      desc: "",
                      date: "",
                      location: "",
                      seatLimit: "50",
                      registrationDeadline: "",
                      category: "Hackathon",
                    });
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {visibleEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.desc || event.description}</p>
                    <p className="text-sm text-gray-500">
                      Category: {event.category || "Hackathon"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Location: {event.location || event.venue}
                    </p>
                    <p className="text-sm text-gray-500">
                      Joined: {event.registeredUsers?.length || event.joined?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      Seats: {event.registeredUsers?.length || event.joined?.length || 0} / {event.seatLimit || 50}
                    </p>
                    <p className="text-sm text-gray-500">
                      Deadline: {new Date(event.registrationDeadline || event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">{events.length}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded">
              <div className="text-2xl font-bold text-indigo-600">{notes.length}</div>
              <div className="text-sm text-gray-600">Total Notes</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded">
              <div className="text-2xl font-bold text-pink-600">{qna.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">{participationRate}%</div>
              <div className="text-sm text-gray-600">Event Participation</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded">
              <div className="text-2xl font-bold text-emerald-600">{completionRate}%</div>
              <div className="text-sm text-gray-600">Task Completion</div>
            </div>
            <div className="text-center p-4 bg-sky-50 rounded">
              <div className="text-2xl font-bold text-sky-600">{polls.length}</div>
              <div className="text-sm text-gray-600">Total Polls</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-3">Top Users</h3>
              <div className="space-y-3">
                {topUsers.map((member, index) => (
                  <div
                    key={member.id}
                    className="d-flex justify-content-between align-items-center bg-white border rounded p-3"
                  >
                    <div>
                      <div className="font-semibold">#{index + 1} {member.name}</div>
                      <div className="text-sm text-gray-500">@{member.username}</div>
                    </div>
                    <div className="font-bold text-orange-600">{member.points || 0} pts</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-3">Daily / Weekly Growth</h3>
              <div className="space-y-3">
                {last7Days.map((day) => (
                  <div
                    key={day.key}
                    className="d-flex justify-content-between align-items-center bg-white border rounded p-3"
                  >
                    <div className="font-semibold">{day.label}</div>
                    <div className="text-sm text-gray-500">
                      Active users: {day.users} | Completed tasks: {day.tasks}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
