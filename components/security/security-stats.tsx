import { Shield, AlertTriangle, Info } from "lucide-react";

interface SecurityStatsProps {
  totalPasswords: number;
  strongPasswords: number;
  weakPasswords: number;
  duplicates: number;
  oldPasswords: number;
}

const SecurityStats = ({
  totalPasswords,
  strongPasswords,
  weakPasswords,
  duplicates,
  oldPasswords,
}: SecurityStatsProps) => {
  const stats = [
    {
      label: "Total Passwords",
      value: totalPasswords,
      icon: Shield,
      color: "text-foreground",
    },
    {
      label: "Strong Passwords",
      value: strongPasswords,
      icon: Shield,
      color: "text-green-500",
    },
    {
      label: "Weak Passwords",
      value: weakPasswords,
      icon: AlertTriangle,
      color: weakPasswords > 0 ? "text-red-500" : "text-muted-foreground",
    },
    {
      label: "Duplicate Passwords",
      value: duplicates,
      icon: AlertTriangle,
      color: duplicates > 0 ? "text-orange-500" : "text-muted-foreground",
    },
    {
      label: "Old Passwords",
      value: oldPasswords,
      icon: Info,
      color: oldPasswords > 0 ? "text-blue-500" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-none border border-border bg-card p-6 transition-colors hover:border-muted-foreground/20"
        >
          <stat.icon className={`h-8 w-8 ${stat.color}`} />
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityStats;
