// LocalStorage helpers alag file me rakhe taki har page par same logic repeat na karna pade.

export function getData(key) {
  try {
    const val = localStorage.getItem(key);
    // JSON parse fail ho ya data na mile to safe null return kar raha hu.
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeData(key) {
  localStorage.removeItem(key);
}

// Simple random-ish id bana raha hu for frontend-only data entries.
export function makeId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

const defaultUsers = [
  {
    id: 1,
    name: "Admin User",
    username: "admin",
    password: "admin123",
    role: "admin",
    points: 500,
    taskDailyRewardDates: [],
    pointsHistory: [
      {
        id: 1,
        points: 500,
        reason: "Initial seed balance",
        createdAt: "2026-04-01T08:00:00.000Z",
      },
    ],
  },
  {
    id: 2,
    name: "Alice",
    username: "alice",
    password: "alice123",
    role: "user",
    points: 120,
    taskDailyRewardDates: [],
    pointsHistory: [
      {
        id: 2,
        points: 40,
        reason: "Joined campus events",
        createdAt: "2026-04-05T09:30:00.000Z",
      },
      {
        id: 3,
        points: 80,
        reason: "Completed task streaks",
        createdAt: "2026-04-11T10:15:00.000Z",
      },
    ],
  },
  {
    id: 3,
    name: "Bob",
    username: "bob",
    password: "bob123",
    role: "user",
    points: 80,
    taskDailyRewardDates: [],
    pointsHistory: [
      {
        id: 4,
        points: 80,
        reason: "Hackathon participation",
        createdAt: "2026-04-09T07:45:00.000Z",
      },
    ],
  },
];

const defaultTasks = [
  {
    id: 1,
    userId: 2,
    title: "Complete Math Assignment",
    priority: "High",
    deadline: "2026-06-10",
    done: false,
    createdAt: "2026-04-12T09:00:00.000Z",
  },
  {
    id: 2,
    userId: 2,
    title: "Read Chapter 5 Physics",
    priority: "Medium",
    deadline: "2026-06-15",
    done: true,
    createdAt: "2026-04-12T10:00:00.000Z",
    completedAt: "2026-04-15T10:30:00.000Z",
  },
  {
    id: 3,
    userId: 2,
    title: "Submit History Essay",
    priority: "High",
    deadline: "2026-06-08",
    done: false,
    createdAt: "2026-04-13T11:00:00.000Z",
  },
];

const defaultEvents = [
  {
    id: 1,
    title: "Annual Science Fair",
    date: "2026-07-10",
    location: "Main Hall",
    venue: "Main Hall",
    desc: "Showcase your science projects.",
    description: "Showcase your science projects.",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 60,
    registrationDeadline: "2026-07-05",
  },
  {
    id: 2,
    title: "AI/ML Workshop",
    date: "2026-06-28",
    location: "Lab 3",
    venue: "Lab 3",
    desc: "Learn machine learning basics.",
    description: "Learn machine learning basics.",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 40,
    registrationDeadline: "2026-06-24",
  },
  {
    id: 3,
    title: "Cultural Fest",
    date: "2026-08-05",
    location: "Open Ground",
    venue: "Open Ground",
    desc: "Annual inter-department fest.",
    description: "Annual inter-department fest.",
    joined: [2],
    registeredUsers: [2],
    waitlistUsers: [],
    seatLimit: 150,
    registrationDeadline: "2026-08-01",
  },
  {
    id: 4,
    title: "Battle of the Bands",
    date: "2026-08-18",
    location: "Campus Auditorium",
    venue: "Campus Auditorium",
    desc: "Music fest night with student bands competing live.",
    description: "Music fest night with student bands competing live.",
    category: "Fest",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 120,
    registrationDeadline: "2026-08-13",
  },
  {
    id: 5,
    title: "Street Dance Showdown",
    date: "2026-09-02",
    location: "Open Amphitheatre",
    venue: "Open Amphitheatre",
    desc: "Inter-department dance battle with solo and group entries.",
    description: "Inter-department dance battle with solo and group entries.",
    category: "Fest",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 90,
    registrationDeadline: "2026-08-29",
  },
  {
    id: 6,
    title: "Campus Food Carnival",
    date: "2026-09-14",
    location: "Central Lawn",
    venue: "Central Lawn",
    desc: "Fest-style food stalls, student clubs, and live performances.",
    description: "Fest-style food stalls, student clubs, and live performances.",
    category: "Fest",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 200,
    registrationDeadline: "2026-09-10",
  },
  {
    id: 7,
    title: "Design Sprint Hackathon",
    date: "2026-10-03",
    location: "Innovation Hub",
    venue: "Innovation Hub",
    desc: "Rapid prototyping hackathon for UX, product, and frontend teams.",
    description: "Rapid prototyping hackathon for UX, product, and frontend teams.",
    category: "Hackathon",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 70,
    registrationDeadline: "2026-09-28",
  },
  {
    id: 8,
    title: "Data Science Challenge",
    date: "2026-10-20",
    location: "Research Block",
    venue: "Research Block",
    desc: "Team challenge focused on analytics, dashboards, and ML insights.",
    description: "Team challenge focused on analytics, dashboards, and ML insights.",
    category: "Hackathon",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 80,
    registrationDeadline: "2026-10-15",
  },
  {
    id: 9,
    title: "Smart City HackFest",
    date: "2026-11-04",
    location: "Technology Center",
    venue: "Technology Center",
    desc: "Build practical civic-tech ideas for transport, safety, and smart campus life.",
    description: "Build practical civic-tech ideas for transport, safety, and smart campus life.",
    category: "Hackathon",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 75,
    registrationDeadline: "2026-10-30",
  },
  {
    id: 10,
    title: "CodeStorm 24",
    date: "2026-11-19",
    location: "Main Computing Lab",
    venue: "Main Computing Lab",
    desc: "A 24-hour coding sprint for app, web, and automation projects.",
    description: "A 24-hour coding sprint for app, web, and automation projects.",
    category: "Hackathon",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 60,
    registrationDeadline: "2026-11-14",
  },
  {
    id: 11,
    title: "EduTech Buildathon",
    date: "2026-12-03",
    location: "Seminar Hall B",
    venue: "Seminar Hall B",
    desc: "Create digital tools that improve learning, revision, and student productivity.",
    description: "Create digital tools that improve learning, revision, and student productivity.",
    category: "Hackathon",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 70,
    registrationDeadline: "2026-11-28",
  },
  {
    id: 12,
    title: "Robotics Innovation Jam",
    date: "2026-12-18",
    location: "Engineering Block",
    venue: "Engineering Block",
    desc: "Prototype robotics and embedded ideas for automation and campus utility.",
    description: "Prototype robotics and embedded ideas for automation and campus utility.",
    category: "Hackathon",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 55,
    registrationDeadline: "2026-12-12",
  },
  {
    id: 13,
    title: "Winter Cultural Night",
    date: "2026-11-08",
    location: "Central Stage",
    venue: "Central Stage",
    desc: "A fest evening of music, poetry, drama, and inter-college performances.",
    description: "A fest evening of music, poetry, drama, and inter-college performances.",
    category: "Fest",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 180,
    registrationDeadline: "2026-11-03",
  },
  {
    id: 14,
    title: "Fashion Walk Fest",
    date: "2026-11-22",
    location: "Auditorium Plaza",
    venue: "Auditorium Plaza",
    desc: "Theme-based fashion showcase and styling competition across departments.",
    description: "Theme-based fashion showcase and styling competition across departments.",
    category: "Fest",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 140,
    registrationDeadline: "2026-11-18",
  },
  {
    id: 15,
    title: "Drama and Theatre Fest",
    date: "2026-12-07",
    location: "Open Air Theatre",
    venue: "Open Air Theatre",
    desc: "Stage acts, skits, and mono performances from student clubs and teams.",
    description: "Stage acts, skits, and mono performances from student clubs and teams.",
    category: "Fest",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 160,
    registrationDeadline: "2026-12-02",
  },
  {
    id: 16,
    title: "Sports and Fun Carnival",
    date: "2026-12-20",
    location: "University Ground",
    venue: "University Ground",
    desc: "A fest day with mini-games, team challenges, sports stalls, and live announcements.",
    description: "A fest day with mini-games, team challenges, sports stalls, and live announcements.",
    category: "Fest",
    joined: [],
    registeredUsers: [],
    waitlistUsers: [],
    seatLimit: 220,
    registrationDeadline: "2026-12-15",
  },
];

function mergeById(existingItems, defaultItems) {
  const existing = Array.isArray(existingItems) ? existingItems : [];
  const seenIds = new Set(existing.map((item) => item.id));
  // Jo default items missing hain sirf unko merge karna hai, existing user data ko touch nahi karna.
  const missingDefaults = defaultItems.filter((item) => !seenIds.has(item.id));
  return [...existing, ...missingDefaults];
}

// First run par initial demo data save hoga; next runs me sirf missing defaults merge honge.
export function seedData() {
  const seeded = getData("seeded");

  if (!seeded) {
    saveData("users", defaultUsers);
    saveData("tasks", defaultTasks);
    saveData("events", defaultEvents);
    saveData("qna", []);
    saveData("notes", []);
    saveData("polls", []);
    saveData("feedback", []);
    saveData("seeded", true);
    return;
  }

  saveData("events", mergeById(getData("events"), defaultEvents));

  saveData("seeded", true);
}
