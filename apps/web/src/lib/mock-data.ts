export const MOCK_EXPENSES = [
  {
    id: "exp-1",
    title: "Groceries (Trader Joe's)",
    amount: "145.20",
    date: new Date().toISOString(),
    payer: { firstName: "Demo User", lastName: "Mode" },
    category: { name: "Groceries", color: "#10b981", icon: "shopping-cart" },
    splits: [
      { user: { firstName: "Demo User" }, amount: "72.60" },
      { user: { firstName: "Roommate 1" }, amount: "72.60" }
    ]
  },
  {
    id: "exp-2",
    title: "Internet Bill (Xfinity)",
    amount: "80.00",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    payer: { firstName: "Roommate 1", lastName: "Tester" },
    category: { name: "Utilities", color: "#3b82f6", icon: "wifi" },
    splits: [
      { user: { firstName: "Demo User" }, amount: "40.00" },
      { user: { firstName: "Roommate 1" }, amount: "40.00" }
    ]
  },
  {
    id: "exp-3",
    title: "Uber Home from Party",
    amount: "24.50",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    payer: { firstName: "Demo User", lastName: "Mode" },
    category: { name: "Transport", color: "#f59e0b", icon: "car" },
    splits: [
      { user: { firstName: "Demo User" }, amount: "12.25" },
      { user: { firstName: "Roommate 1" }, amount: "12.25" }
    ]
  }
];

export const MOCK_SETTLEMENTS = [
  {
    id: "set-1",
    user: { firstName: "Roommate 1", lastName: "Tester", id: "user-2" },
    balance: "-27.65",
  },
  {
    id: "set-2",
    user: { firstName: "Demo User", lastName: "Mode", id: "user-1" },
    balance: "27.65",
  }
];

export const MOCK_CHORES = [
  {
    id: "chore-1",
    title: "Take out the trash",
    description: "Recycling goes out on Tuesday night",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    isCompleted: false,
    assignee: { firstName: "Demo User" },
  },
  {
    id: "chore-2",
    title: "Clean the kitchen counters",
    description: "Wipe down with Clorox after cooking",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    isCompleted: true,
    assignee: { firstName: "Roommate 1" },
  }
];

export const MOCK_ANALYTICS = {
  totalSpent: 249.70,
  yourShare: 124.85,
  monthlyTrend: [
    { date: "Jan", amount: 200 },
    { date: "Feb", amount: 180 },
    { date: "Mar", amount: 250 },
    { date: "Apr", amount: 249.70 }
  ],
  categoryBreakdown: [
    { name: "Groceries", value: 145.20, color: "#10b981" },
    { name: "Utilities", value: 80.00, color: "#3b82f6" },
    { name: "Transport", value: 24.50, color: "#f59e0b" }
  ]
};

export const MOCK_BILLS = [];
export const MOCK_PAYMENTS = [];
export const MOCK_APARTMENTS = [
  {
    id: "apt-demo",
    name: "Demo Apartment",
    currency: "USD",
    members: [
      { user: { id: "user-1", firstName: "Demo User" } },
      { user: { id: "user-2", firstName: "Roommate 1" } }
    ]
  }
];
