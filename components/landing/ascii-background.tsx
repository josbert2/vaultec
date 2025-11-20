
"use client";

import { useEffect, useRef } from "react";

export default function AsciiBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        // Characters to use for the effect
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&?";

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        resize();

        const fontSize = 16;
        const spacing = 30; // Gap between characters
        const columns = Math.ceil(window.innerWidth / spacing);
        const rows = Math.ceil(window.innerHeight / spacing);

        // Initialize grid with random characters and opacity
        const grid: { char: string; opacity: number; speed: number }[] = [];
        for (let i = 0; i < columns * rows; i++) {
            grid.push({
                char: chars[Math.floor(Math.random() * chars.length)],
                opacity: Math.random() * 0.5, // Start with lower opacity
                speed: Math.random() * 0.005 + 0.002, // Slower speed for "poco a poco"
            });
        }

        const draw = () => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < grid.length; i++) {
                const cell = grid[i];

                // Update opacity
                cell.opacity += cell.speed;
                if (cell.opacity > 1 || cell.opacity < 0) {
                    cell.speed = -cell.speed;
                }

                // Occasionally change character
                if (Math.random() > 0.995) {
                    cell.char = chars[Math.floor(Math.random() * chars.length)];
                }

                const x = (i % columns) * spacing;
                const y = Math.floor(i / columns) * spacing;

                // Mouse Spotlight Logic
                const dx = x - mouseRef.current.x;
                const dy = y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const spotlightRadius = 300; // Radius of the spotlight

                // Calculate spotlight alpha (1 at center, 0 at edge)
                const spotlightAlpha = Math.max(0, 1 - distance / spotlightRadius);

                // Base gradient (Right to Left) - kept as background ambience
                // Normalize coordinates (0 to 1)
                const normX = x / canvas.width;
                // "Desde la derecha al medio que salga como coseno"
                // Let's make it fade out around the middle (0.3 - 0.4)
                const fadeStart = 0.2;
                const effectiveX = Math.max(0, normX - fadeStart) / (1 - fadeStart);
                // Let's try a strong visibility on the right.
                const gradientAlpha = Math.pow(effectiveX, 0.5) * 0.3; // Reduced base intensity

                // Combine: Mouse spotlight is strong, background is subtle
                // "Mucha opacidad": Boost the base opacity
                const boostedOpacity = Math.min(1, cell.opacity * 1.5);
                const finalAlpha = Math.min(1, (boostedOpacity * gradientAlpha) + (spotlightAlpha * 1.5));

                if (finalAlpha > 0.01) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
                    ctx.fillText(cell.char, x, y);
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
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
