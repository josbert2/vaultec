"use client";

import { useEffect, useRef } from "react";

export default function AsciiPattern() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        const spacing = 40;
        const columns = Math.ceil(window.innerWidth / spacing);
        const rows = Math.ceil(window.innerHeight / spacing);

        const chars = "0123456789ABCDEF"; // Hex chars for "hash" feel

        // Track glitch state for each cell
        const grid: {
            glitchTime: number;
            char: string;
        }[] = Array(columns * rows).fill(null).map(() => ({
            glitchTime: 0,
            char: "."
        }));

        const draw = () => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = "10px monospace";

            time += 0.02;

            // Count active glitches
            let activeGlitches = 0;
            for (const cell of grid) {
                if (cell.glitchTime > 0) activeGlitches++;
            }

            for (let i = 0; i < grid.length; i++) {
                const xIndex = i % columns;
                const yIndex = Math.floor(i / columns);
                const cell = grid[i];

                // Randomly trigger glitch, but respect max limit
                if (cell.glitchTime <= 0 && activeGlitches < 3 && Math.random() > 0.9995) {
                    cell.glitchTime = 60; // Duration in frames
                    cell.char = chars[Math.floor(Math.random() * chars.length)];
                    activeGlitches++; // Increment local count to prevent burst in same frame
                }

                if (cell.glitchTime > 0) {
                    cell.glitchTime--;
                    // Glitch appearance
                    // "Opaca las letras no siempre": Vary opacity based on life or random
                    // Fade out as it ends
                    const fade = cell.glitchTime / 60;
                    const alpha = 0.5 + (fade * 0.5); // Range 0.5 to 1.0

                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.font = "12px monospace";
                    ctx.fillText(cell.char, xIndex * spacing, yIndex * spacing);

                    // Revert font for next chars
                    ctx.font = "10px monospace";
                } else {
                    // Normal dot appearance
                    // Create a subtle wave pattern for opacity
                    const opacity = (Math.sin(xIndex * 0.2 + time) * Math.cos(yIndex * 0.2 + time) + 1) / 2;
                    const alpha = opacity * 0.3 + 0.05;

                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.fillText(".", xIndex * spacing, yIndex * spacing);
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
