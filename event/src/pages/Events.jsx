import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import EventCard from "../components/events/EventCard";
import EventModal from "../components/events/EventModal";
import { buildMergedEvents } from "../utils/eventData";
import "./style/Events.css";

const EventsPage = () => {
  const { user, events, setEvents, showToast, addPoints, searchQuery } = useApp();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("All");
  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "Hackathon",
    date: "",
    venue: "",
    description: "",
    rules: "",
    seatLimit: "50",
    registrationDeadline: "",
  });

  const allEvents = useMemo(() => {
    // Static aur admin-created events ko ek hi list me merge karke use kar raha hu.
    return buildMergedEvents(Array.isArray(events) ? events : []);
  }, [events]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return allEvents.filter((event) => {
      const matchesCategory = filter === "All" || event.category === filter;
      // Simple search by title
      const matchesSearch = !normalizedQuery
        || event.title.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [allEvents, filter, searchQuery]);

  const isRegistered = (event) => {
    if (!event || !user) {
      return false;
    }
    return event.registeredUsers.includes(user.id);
  };

  const isWaitlisted = (event) => {
    if (!event || !user) return false;
    return event.waitlistUsers?.includes(user.id);
  };

  const handleCreateEvent = (event) => {
    event.preventDefault();

    // Form values trim kiye taki extra spaces ki wajah se dirty data save na ho.
    const title = newEvent.title.trim();
    const venue = newEvent.venue.trim();
    const description = newEvent.description.trim();
    const rules = newEvent.rules.trim();
    const seatLimit = Number(newEvent.seatLimit);

    if (!title || !newEvent.date || !venue || !description) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (!seatLimit || seatLimit < 1) {
      showToast("Seat limit should be at least 1", "error");
      return;
    }

    const created = {
      id: Date.now(),
      title,
      category: newEvent.category,
      date: newEvent.date,
      venue,
      location: venue,
      description,
      desc: description,
      rules: rules || "Follow event guidelines and be respectful.",
      registeredUsers: [],
      waitlistUsers: [],
      joined: [],
      seatLimit,
      registrationDeadline: newEvent.registrationDeadline || newEvent.date,
    };

    setEvents([created, ...(Array.isArray(events) ? events : [])]);
    setNewEvent({
      title: "",
      category: "Hackathon",
      date: "",
      venue: "",
      description: "",
      rules: "",
      seatLimit: "50",
      registrationDeadline: "",
    });
    showToast("Event created", "success");
  };

  const handleRegister = (eventToRegister) => {
    const targetEvent = eventToRegister || selectedEvent;
    if (!targetEvent || !user) {
      if (!user) showToast("Please login to register", "error");
      return;
    }

    if (targetEvent.registeredUsers.includes(user.id)) {
      showToast("Already Registered", "info");
      return;
    }

    if (targetEvent.waitlistUsers?.includes(user.id)) {
      showToast("You are already on the waitlist", "info");
      return;
    }

    if (new Date(targetEvent.registrationDeadline) < new Date()) {
      showToast("Registration deadline has passed", "error");
      return;
    }

    const updated = allEvents.map((event) => {
      if (event.id !== targetEvent.id) {
        return event;
      }

      // Seat available ho to direct register, warna waitlist me bhej do.
      const hasSeats = event.registeredUsers.length < event.seatLimit;
      const nextRegisteredUsers = hasSeats
        ? [...event.registeredUsers, user.id]
        : event.registeredUsers;
      const nextWaitlistUsers = hasSeats
        ? event.waitlistUsers
        : [...event.waitlistUsers, user.id];

      return {
        ...event,
        registeredUsers: nextRegisteredUsers,
        waitlistUsers: nextWaitlistUsers,
      };
    });

    // Purane data shape me `joined` use hua tha, isliye usko bhi yaha sync rakha hai.
    setEvents(
      updated.map((event) => ({
        ...event,
        joined: event.registeredUsers,
        location: event.venue,
        desc: event.description,
        seatLimit: event.seatLimit,
        registrationDeadline: event.registrationDeadline,
      })),
    );

    if (selectedEvent && selectedEvent.id === targetEvent.id) {
      const freshSelected = updated.find((event) => event.id === targetEvent.id) || null;
      setSelectedEvent(freshSelected);
    }
    const wasRegistered = updated.find((event) => event.id === targetEvent.id);
    if (wasRegistered?.registeredUsers.includes(user.id)) {
      addPoints(10, `Registered for ${targetEvent.title}`);
      showToast("Registered successfully", "success");
    } else {
      showToast("Event is full. Added to waitlist", "info");
    }
  };

  return (
    <section className="events-page p-4 p-md-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="h3 fw-bold mb-0">Events</h1>
        <span className="badge text-bg-light border">{filteredEvents.length} Events</span>
      </div>

      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {["All", "Hackathon", "Fest"].map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${filter === cat ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {user?.role === "admin" && (
        <form
          onSubmit={handleCreateEvent}
          className="bg-white border border-gray-200 rounded-4 p-4 shadow-sm mb-4"
        >
          <h2 className="h5 fw-semibold mb-3">Create Event (Admin)</h2>
          <div className="row g-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={newEvent.category}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Fest">Fest</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Venue"
                value={newEvent.venue}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, venue: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Rules (optional)"
                value={newEvent.rules}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, rules: e.target.value }))
                }
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                min="1"
                className="form-control"
                placeholder="Seat Limit"
                value={newEvent.seatLimit}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, seatLimit: e.target.value }))
                }
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={newEvent.registrationDeadline}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    registrationDeadline: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-12">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                Create Event
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="row g-4">
        {filteredEvents.map((event) => (
          <div className="col-12 col-md-6 col-xl-4" key={event.id}>
            <EventCard
              event={event}
              isRegistered={isRegistered(event)}
              isWaitlisted={isWaitlisted(event)}
              onMoreInfo={setSelectedEvent}
            />
          </div>
        ))}
      </div>

      <EventModal
        event={selectedEvent}
        isRegistered={isRegistered(selectedEvent)}
        isWaitlisted={isWaitlisted(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onRegister={() => handleRegister(selectedEvent)}
      />
    </section>
  );
};

export default EventsPage;
