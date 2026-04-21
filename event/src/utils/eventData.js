const fallbackEvents = [
  {
    id: 101,
    title: "BuildSprint Campus Hack",
    category: "Hackathon",
    date: "2026-06-12",
    venue: "Innovation Lab",
    description: "24-hour team hackathon to build campus-impact products.",
    rules: "Teams of 2-4. Original work only. Final demo mandatory.",
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 40,
    registrationDeadline: "2026-06-08",
  },
  {
    id: 102,
    title: "Spring Cultural Fest",
    category: "Fest",
    date: "2026-05-20",
    venue: "Open Amphitheatre",
    description: "Music, dance, and drama performances across departments.",
    rules: "Entry with student ID. Follow venue timing and stage rules.",
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 120,
    registrationDeadline: "2026-05-16",
  },
  {
    id: 104,
    title: "Battle of the Bands",
    category: "Fest",
    date: "2026-08-10",
    venue: "Campus Auditorium",
    description: "Annual music competition where college bands face off.",
    rules: "15 minutes per band. Bring your own instruments. Pre-registration required.",
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 30,
    registrationDeadline: "2026-08-05",
  },
  {
    id: 103,
    title: "Inter-College Basketball",
    category: "Fest",
    date: "2026-07-15",
    venue: "Main Indoor Stadium",
    description: "Annual inter-college basketball tournament.",
    rules: "Teams of 5. Standard rules apply.",
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 50,
    registrationDeadline: "2026-07-10",
  },
  {
    id: 105,
    title: "Athletics Meet 2026",
    category: "Fest",
    date: "2026-09-05",
    venue: "University Sports Track",
    description: "Track and field events including sprints, relays, and long jump.",
    rules: "Proper sports attire mandatory. Maximum 3 events per student.",
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 80,
    registrationDeadline: "2026-09-01",
  },
];

export function normalizeEvent(event) {
  // Different event shapes ko ek common format me la raha hu so UI simple rahe.
  const registeredUsers = Array.isArray(event.registeredUsers)
    ? event.registeredUsers
    : Array.isArray(event.joined)
      ? event.joined
      : [];
  const waitlistUsers = Array.isArray(event.waitlistUsers) ? event.waitlistUsers : [];

  let category = event.category;
  if (!category) {
    // Category missing ho to title/description ke text se basic guess kar raha hu.
    const text = `${event.title || ""} ${event.description || event.desc || ""}`.toLowerCase();
    if (
      text.includes("fest") ||
      text.includes("cultural") ||
      text.includes("music") ||
      text.includes("dance")
    ) {
      category = "Fest";
    } else {
      category = "Hackathon";
    }
  }

  return {
    id: event.id,
    title: event.title,
    category,
    date: event.date,
    venue: event.venue || event.location || "TBD",
    location: event.location || event.venue || "TBD",
    description: event.description || event.desc || "No description available.",
    desc: event.desc || event.description || "No description available.",
    rules: event.rules || "Follow event guidelines and be respectful.",
    registeredUsers,
    waitlistUsers,
    seatLimit: Number(event.seatLimit) > 0 ? Number(event.seatLimit) : 50,
    registrationDeadline: event.registrationDeadline || event.date,
    joined: registeredUsers,
  };
}

export function buildMergedEvents(stateEvents = []) {
  const eventMap = new Map();

  // Fallback events base layer hai, uske upar saved/custom events overwrite kar denge.
  fallbackEvents.forEach((event) => {
    eventMap.set(event.id, event);
  });

  stateEvents.forEach((event) => {
    eventMap.set(event.id, {
      ...eventMap.get(event.id),
      ...event,
    });
  });

  return Array.from(eventMap.values()).map(normalizeEvent);
}
