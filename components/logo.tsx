import React from "react";

interface LogoProps {
    className?: string;
    size?: number;
}

export function Logo({ className, size = 51 }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="-8 -8 96 96"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect
                x="0"
                y="0"
                width="80"
                height="80"
                rx="16"
                ry="16"
                fill="none"
                stroke="#b9b9b9"
                strokeWidth="4"
            ></rect>
            <circle
                cx="40"
                cy="36"
                r="10"
                fill="none"
                stroke="#b9b9b9"
                strokeWidth="3"
            ></circle>
            <path
                d="M22 28 L40 60 L58 28"
                fill="none"
                stroke="#b9b9b9"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            ></path>
        </svg>
    );
}
