"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Factory,
  FileBarChart,
  Leaf,
  Lock,
  Moon,
  Network,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ecoSphereApi, type CarbonSummary, type DashboardOverview, type Notification, type Policy } from "@/lib/api";
import { cn } from "@/lib/utils";

const fallbackOverview: DashboardOverview = {
  overall_esg_score: 81.4,
  department_scores: [
    { department: "Administration", score: 84 },
    { department: "Operations", score: 79 },
    { department: "People", score: 86 },
    { department: "Finance", score: 77 },
  ],
  carbon_trend: [
    { month: "Jan", kgco2e: 420 },
    { month: "Feb", kgco2e: 390 },
    { month: "Mar", kgco2e: 360 },
    { month: "Apr", kgco2e: 338 },
    { month: "May", kgco2e: 325 },
    { month: "Jun", kgco2e: 302 },
  ],
  notifications: 4,
  active_challenges: 3,
  leaderboard: [
    { name: "Ava", xp: 950 },
    { name: "Noah", xp: 830 },
    { name: "Liam", xp: 780 },
  ],
};

const fallbackCarbon: CarbonSummary = {
  total_kgco2e: 1280.5,
  scope_1: 320.4,
  scope_2: 410.8,
  scope_3: 549.3,
  target_progress: 74,
};

const fallbackPolicies: Policy[] = [
  { id: "p1", title: "ESG Code of Conduct", version: "v1", status: "active" },
  { id: "p2", title: "Carbon Reporting Standard", version: "v1", status: "active" },
  { id: "p3", title: "Supplier Ethics Review", version: "v2", status: "draft" },
];

const fallbackNotifications: Notification[] = [
  {
    id: "n1",
    type: "policy_reminder",
    message: "Annual ESG policy acknowledgement due in 2 days",
    is_read: false,
  },
  {
    id: "n2",
    type: "compliance",
    message: "Audit evidence pending for Operations",
    is_read: false,
  },
  {
    id: "n3",
    type: "carbon",
    message: "Scope 2 energy upload reviewed by Finance",
    is_read: true,
  },
];

const modules = [
  { id: "dashboard", label: "Dashboard", icon: FileBarChart },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "carbon", label: "Carbon", icon: Leaf },
  { id: "social", label: "CSR", icon: Users },
  { id: "governance", label: "Governance", icon: ShieldCheck },
  { id: "rewards", label: "Rewards", icon: Award },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "settings", label: "Admin", icon: Settings },
];

const csrActivities = [
  { name: "Volunteer hours", owner: "People", progress: 68 },
  { name: "Supplier inclusion review", owner: "Procurement", progress: 54 },
  { name: "Safety training", owner: "Operations", progress: 91 },
];

const complianceIssues = [
  { issue: "Operations evidence gap", owner: "Maya", status: "In review", due: "Jul 18" },
  { issue: "Supplier policy acknowledgement", owner: "Ravi", status: "Open", due: "Jul 20" },
  { issue: "Energy meter reconciliation", owner: "Isha", status: "Blocked", due: "Jul 22" },
];

const reportQueue = [
  { title: "Monthly ESG Board Pack", format: "PDF", status: "Ready" },
  { title: "Carbon Activity Export", format: "CSV", status: "Scheduled" },
  { title: "Audit Evidence Register", format: "XLSX", status: "Draft" },
];

const roleCards = [
  { role: "Admin", email: "admin@ecosphere.local", access: "Users, settings, all modules" },
  { role: "Manager", email: "manager@ecosphere.local", access: "Department workflows and reports" },
  { role: "Employee", email: "employee@ecosphere.local", access: "Action entry and acknowledgements" },
  { role: "Auditor", email: "auditor@ecosphere.local", access: "Governance and evidence review" },
];

export default function HomePage() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [overview, setOverview] = useState(fallbackOverview);
  const [carbon, setCarbon] = useState(fallbackCarbon);
  const [policies, setPolicies] = useState(fallbackPolicies);
  const [notifications, setNotifications] = useState(fallbackNotifications);
  const [apiState, setApiState] = useState<"live" | "demo">("demo");

  useEffect(() => {
    Promise.all([
      ecoSphereApi.dashboard(),
      ecoSphereApi.carbon(),
      ecoSphereApi.policies(),
      ecoSphereApi.notifications(),
    ])
      .then(([dashboardData, carbonData, policyData, notificationData]) => {
        setOverview(dashboardData);
        setCarbon(carbonData);
        setPolicies(policyData);
        setNotifications(notificationData);
        setApiState("live");
      })
      .catch(() => setApiState("demo"));
  }, []);

  const carbonBreakdown = useMemo(
    () => [
      { name: "Scope 1", value: carbon.scope_1, color: "#0f8b6f" },
      { name: "Scope 2", value: carbon.scope_2, color: "#3b82f6" },
      { name: "Scope 3", value: carbon.scope_3, color: "#d97706" },
    ],
    [carbon],
  );

  return (
    <main className={cn("min-h-screen bg-background text-foreground", darkMode && "dark")}>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
          <div className="flex h-16 items-center gap-3 border-b px-5">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Network className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">EcoSphere</p>
              <p className="mt-1 text-xs text-muted-foreground">ESG ERP Suite</p>
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {modules.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                  activeModule === item.id && "bg-secondary text-foreground",
                )}
                onClick={() => setActiveModule(item.id)}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
              <div>
                <h1 className="text-xl font-semibold tracking-normal">EcoSphere ESG Management Platform</h1>
                <p className="text-sm text-muted-foreground">Local-first ESG operations with JWT auth, RBAC, and PostgreSQL.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("rounded-md border px-2.5 py-1 text-xs", apiState === "live" ? "text-primary" : "text-muted-foreground")}>
                  {apiState === "live" ? "API live" : "Demo data"}
                </span>
                <Button variant="outline" size="icon" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle dark mode">
                  {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
              {modules.map((item) => (
                <Button
                  key={item.id}
                  variant={activeModule === item.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveModule(item.id)}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </header>

          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-6">
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric title="ESG score" value={`${overview.overall_esg_score}%`} detail="Across environmental, social, governance" icon={Sparkles} />
                <Metric title="Carbon logged" value={`${carbon.total_kgco2e.toLocaleString()} kg`} detail={`${carbon.target_progress}% target progress`} icon={Factory} />
                <Metric title="Active challenges" value={overview.active_challenges.toString()} detail="Team participation programs" icon={Award} />
                <Metric title="Unread alerts" value={notifications.filter((item) => !item.is_read).length.toString()} detail="Policy, audit, and carbon tasks" icon={Bell} />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                <Panel title="Carbon Tracking" action="New entry">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overview.carbon_trend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="kgco2e" stroke="#0f8b6f" fill="#0f8b6f33" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Scope Breakdown" action="Evidence">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={carbonBreakdown} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                          {carbonBreakdown.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Department Performance" action="Departments">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overview.department_scores}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="department" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Governance Workflow" action="Review">
                  <div className="space-y-3">
                    {complianceIssues.map((item) => (
                      <div key={item.issue} className="grid grid-cols-[1fr_auto] gap-3 rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{item.issue}</p>
                          <p className="text-xs text-muted-foreground">Owner: {item.owner} · Due {item.due}</p>
                        </div>
                        <span className="h-fit rounded-md bg-secondary px-2 py-1 text-xs">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <Panel title="CSR Activities">
                  <div className="space-y-4">
                    {csrActivities.map((item) => (
                      <ProgressRow key={item.name} label={item.name} meta={item.owner} value={item.progress} />
                    ))}
                  </div>
                </Panel>

                <Panel title="Rewards">
                  <div className="space-y-3">
                    {overview.leaderboard.map((person, index) => (
                      <div key={person.name} className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-md bg-accent text-sm font-semibold">{index + 1}</span>
                          <span className="text-sm font-medium">{person.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{person.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Reports">
                  <div className="space-y-3">
                    {reportQueue.map((report) => (
                      <div key={report.title} className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{report.title}</p>
                          <span className="text-xs text-muted-foreground">{report.format}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{report.status}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </section>

            <aside className="space-y-4">
              <Panel title="Login Shell">
                <div className="space-y-3">
                  <Input defaultValue="admin@ecosphere.local" aria-label="Email" />
                  <Input defaultValue="admin123" type="password" aria-label="Password" />
                  <Button className="w-full">
                    <Lock className="size-4" />
                    Sign in locally
                  </Button>
                  <p className="text-xs text-muted-foreground">JWT-backed local auth is wired on the backend. Demo credentials are seeded for admin, manager, employee, and auditor roles.</p>
                </div>
              </Panel>

              <Panel title="Notifications">
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-md border p-3">
                      <CheckCircle2 className={cn("mt-0.5 size-4", item.is_read ? "text-muted-foreground" : "text-primary")} />
                      <p className="text-sm">{item.message}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Policies">
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">{policy.title}</p>
                        <p className="text-xs text-muted-foreground">{policy.version}</p>
                      </div>
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs capitalize">{policy.status}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Admin RBAC">
                <div className="space-y-3">
                  {roleCards.map((role) => (
                    <div key={role.role} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{role.role}</p>
                      <p className="text-xs text-muted-foreground">{role.email}</p>
                      <p className="mt-2 text-xs">{role.access}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
  return (
    <section className="rounded-md border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action ? (
          <Button variant="ghost" size="sm">
            {action}
            <ChevronRight className="size-4" />
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ProgressRow({ label, meta, value }: { label: string; meta: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
