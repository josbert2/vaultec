import { analyzeUserPasswords } from "@/actions/security-audit-action";
import Header from "@/components/header";
import SecurityScoreCircle from "@/components/security/security-score-circle";
import SecurityIssuesList from "@/components/security/security-issues-list";
import SecurityStats from "@/components/security/security-stats";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";

const SecurityAuditPage = async () => {
  const analysis = await analyzeUserPasswords();

  return (
    <>
      <Header
        title="Security Audit"
        description="Comprehensive analysis of your password security."
        className="mt-6"
      />

      <div className="space-y-8">
        {/* Score Overview */}
        <div className="flex flex-col items-center justify-center space-y-4 rounded-none border border-border bg-card p-8 md:p-12">
          <SecurityScoreCircle score={analysis.overallScore} />
          <div className="text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {getScoreLabel(analysis.overallScore)}
            </h3>
            <p className="text-muted-foreground">
              {getScoreDescription(analysis.overallScore)}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <SecurityStats
          totalPasswords={analysis.totalPasswords}
          strongPasswords={analysis.strongPasswords}
          weakPasswords={analysis.weakPasswords}
          duplicates={analysis.duplicates}
          oldPasswords={analysis.oldPasswords}
        />

        {/* Issues List */}
        {analysis.issues.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Security Issues
            </h2>
            <SecurityIssuesList issues={analysis.issues} />
          </div>
        ) : (
          <Alert className="rounded-none border-border bg-card">
            <Shield className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">
              No Issues Found
            </AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Your passwords are in great shape! Keep up the good work.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
};

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent Security";
  if (score >= 60) return "Good Security";
  if (score >= 40) return "Fair Security";
  return "Poor Security";
}

function getScoreDescription(score: number): string {
  if (score >= 80)
    return "Your passwords are well-protected. Keep it up!";
  if (score >= 60)
    return "Your security is decent, but there's room for improvement.";
  if (score >= 40)
    return "Several security issues detected. Please review them.";
  return "Critical security issues found. Take action immediately.";
}

export default SecurityAuditPage;
