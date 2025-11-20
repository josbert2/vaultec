"use client";

import { useEffect, useRef } from "react";

export default function AsciiHands() {
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

        // Particle system
        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            life: number;
            maxLife: number;
            fingerIndex: number; // 0-4 for 5 fingers
            side: "left" | "right";
        }

        const particles: Particle[] = [];
        const maxParticles = 600; // Reduced from 2000 for performance

        const createParticle = (side: "left" | "right"): Particle => {
            const fingerIndex = Math.floor(Math.random() * 5);
            const ySpread = canvas.height * 0.3; // Arm width at edge
            const centerY = canvas.height / 2;

            // Spawn at edges
            const x = side === "left" ? 0 : canvas.width;
            // Spread y based on "arm" width
            const y = centerY + (Math.random() - 0.5) * ySpread;

            return {
                x,
                y,
                vx: (side === "left" ? 1 : -1) * (Math.random() * 2 + 1),
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 1.5 + 0.5,
                life: 0,
                maxLife: Math.random() * 100 + 100,
                fingerIndex,
                side,
            };
        };

        const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size * 0.866, y + size * 0.5);
            ctx.lineTo(x - size * 0.866, y + size * 0.5);
            ctx.closePath();
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();

            // Glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = "white";
            ctx.fill();
            ctx.shadowBlur = 0;
        };

        const draw = () => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.01;

            // Draw Central Logo (Triangle)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Pulsing glow
            const pulse = Math.sin(time * 2) * 0.2 + 1;
            drawTriangle(ctx, centerX, centerY, 30 * pulse);

            // Manage particles
            if (particles.length < maxParticles) {
                particles.push(createParticle("left"));
                particles.push(createParticle("right"));
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.life++;

                // Target positions for "fingers"
                // Define finger tips relative to center
                const fingerSpread = 40;
                const handGap = 80; // Distance from center

                // Finger offsets Y: -2, -1, 0, 1, 2 * spread
                const fingerYOffset = (p.fingerIndex - 2) * 15;

                const targetX = p.side === "left"
                    ? centerX - handGap - (Math.abs(p.fingerIndex - 2) * 10) // Middle finger sticks out more
                    : centerX + handGap + (Math.abs(p.fingerIndex - 2) * 10);

                const targetY = centerY + fingerYOffset;

                // Move towards target
                const dx = targetX - p.x;
                const dy = targetY - p.y;

                // Ease towards target
                p.x += dx * 0.02;
                p.y += dy * 0.02;

                // Add some noise - REDUCED for "no parallax" / stability feel
                // p.x += (Math.random() - 0.5) * 0.5;
                // p.y += (Math.random() - 0.5) * 0.5;

                // Draw
                const alpha = Math.max(0, 1 - (p.life / p.maxLife));
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

                // Render as small ASCII chars or dots
                if (Math.random() > 0.5) {
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                } else {
                    ctx.font = "10px monospace";
                    ctx.fillText(".", p.x, p.y);
                }
                // Reset if dead or close to target
                const distToTarget = Math.sqrt(dx * dx + dy * dy);
                if (p.life > p.maxLife || distToTarget < 5) {
                    particles[i] = createParticle(p.side);
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
