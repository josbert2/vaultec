"use client";

interface SecurityScoreCircleProps {
  score: number;
}

const SecurityScoreCircle = ({ score }: SecurityScoreCircleProps) => {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative h-48 w-48">
      <svg className="h-full w-full -rotate-90 transform">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tighter text-foreground">
          {score}
        </span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // green
  if (score >= 60) return "#3b82f6"; // blue
  if (score >= 40) return "#f59e0b"; // orange
  return "#ef4444"; // red
}

export default SecurityScoreCircle;
