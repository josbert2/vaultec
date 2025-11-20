import { SecurityIssue } from "@/actions/security-audit-action";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import Link from "next/link";

interface SecurityIssuesListProps {
  issues: SecurityIssue[];
}

const SecurityIssuesList = ({ issues }: SecurityIssuesListProps) => {
  return (
    <div className="space-y-2">
      {issues.map((issue) => (
        <Link
          key={issue.id}
          href={`/dashboard?search=${encodeURIComponent(issue.websiteName)}`}
          className="group block rounded-none border border-border bg-card p-4 transition-colors hover:border-muted-foreground/20"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {issue.severity === "critical" && (
                <AlertCircle className="h-6 w-6 text-red-500" />
              )}
              {issue.severity === "warning" && (
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              )}
              {issue.severity === "info" && (
                <Info className="h-6 w-6 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold capitalize text-foreground">
                  {issue.websiteName}
                </h3>
                <span
                  className={`rounded-none px-2 py-0.5 text-xs font-medium uppercase ${getSeverityBadgeColor(issue.severity)}`}
                >
                  {issue.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {issue.message}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-muted-foreground group-hover:text-foreground">
                View →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

function getSeverityBadgeColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-500";
    case "warning":
      return "bg-orange-500/10 text-orange-500";
    case "info":
      return "bg-blue-500/10 text-blue-500";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default SecurityIssuesList;
