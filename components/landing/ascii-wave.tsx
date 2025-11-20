"use client";

import { useEffect, useRef } from "react";

export default function AsciiWave() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const chars = ".:-=+*#%@";

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        const fontSize = 16;
        const spacing = 20;
        const columns = Math.ceil(window.innerWidth / spacing);
        const rows = Math.ceil(window.innerHeight / spacing);

        const draw = () => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            time += 0.05;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < columns; x++) {
                    // Calculate wave offset
                    const wave = Math.sin(x * 0.1 + time) + Math.cos(y * 0.1 + time);

                    // Map wave to character index
                    const charIndex = Math.floor(((wave + 2) / 4) * chars.length);
                    const char = chars[Math.max(0, Math.min(chars.length - 1, charIndex))];

                    // Opacity based on wave height
                    const alpha = (wave + 2) / 4;

                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                    ctx.fillText(char, x * spacing, y * spacing);
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 h-full w-full bg-black"
        />
    );
}
