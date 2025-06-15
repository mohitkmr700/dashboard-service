import { BarChart, Users, FileText, Mail, Activity, Clock, ArrowUpRight } from "lucide-react";

const stats = [
  {
    name: "Total Users",
    value: "2,543",
    icon: Users,
    change: "+12.5%",
  },
  {
    name: "Analytics",
    value: "45.2%",
    icon: BarChart,
    change: "+4.3%",
  },
  {
    name: "Documents",
    value: "1,234",
    icon: FileText,
    change: "+8.2%",
  },
  {
    name: "Messages",
    value: "89",
    icon: Mail,
    change: "+2.1%",
  },
];

const recentActivities = [
  {
    id: 1,
    title: "New user registration",
    time: "2 hours ago",
    icon: Users,
  },
  {
    id: 2,
    title: "Document updated",
    time: "4 hours ago",
    icon: FileText,
  },
  {
    id: 3,
    title: "Analytics report generated",
    time: "6 hours ago",
    icon: BarChart,
  },
];

const quickActions = [
  {
    title: "Create New Document",
    icon: FileText,
    variant: "primary",
  },
  {
    title: "View Reports",
    icon: BarChart,
    variant: "secondary",
  },
  {
    title: "Check Messages",
    icon: Mail,
    variant: "secondary",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stat.value}</p>
              </div>
              <div className="rounded-full bg-muted p-3">
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 dark:text-green-400">{stat.change}</span>
              <span className="text-sm text-muted-foreground"> from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="rounded-full bg-muted p-2">
                  <activity.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-4 grid gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                className={`flex items-center justify-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium ${
                  action.variant === "primary"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <action.icon className="h-4 w-4" />
                <span>{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 