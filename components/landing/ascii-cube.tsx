"use client";

import { useEffect, useRef } from "react";

export default function AsciiCube() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let angleX = 0;
        let angleY = 0;
        let angleZ = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        // Cube vertices
        const size = 150;
        const points: { x: number; y: number; z: number }[] = [];

        // Create a grid of points on the cube faces
        const density = 10; // Number of points per edge
        const step = (size * 2) / density;

        for (let x = -size; x <= size; x += step) {
            for (let y = -size; y <= size; y += step) {
                for (let z = -size; z <= size; z += step) {
                    // Only add points on the surface
                    if (Math.abs(x) === size || Math.abs(y) === size || Math.abs(z) === size) {
                        points.push({ x, y, z });
                    }
                }
            }
        }

        const chars = "+*:.";

        const project = (x: number, y: number, z: number) => {
            const scale = 600 / (600 + z);
            return {
                x: x * scale + canvas.width / 2,
                y: y * scale + canvas.height / 2,
                scale,
            };
        };

        const rotateX = (x: number, y: number, z: number, angle: number) => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                x,
                y: y * cos - z * sin,
                z: y * sin + z * cos,
            };
        };

        const rotateY = (x: number, y: number, z: number, angle: number) => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                x: x * cos + z * sin,
                y,
                z: -x * sin + z * cos,
            };
        };

        const rotateZ = (x: number, y: number, z: number, angle: number) => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                x: x * cos - y * sin,
                y: x * sin + y * cos,
                z,
            };
        };

        const draw = () => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            angleX += 0.005;
            angleY += 0.005;
            angleZ += 0.002;

            ctx.font = "12px monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

            points.forEach((point) => {
                let { x, y, z } = point;

                // Rotate
                let r = rotateX(x, y, z, angleX);
                r = rotateY(r.x, r.y, r.z, angleY);
                r = rotateZ(r.x, r.y, r.z, angleZ);

                // Project
                const p = project(r.x, r.y, r.z);

                // Draw only if in front
                // Simple z-sorting or culling isn't strictly necessary for this effect, 
                // but let's vary the char based on depth

                const charIndex = Math.floor(((r.z + size) / (size * 2)) * chars.length);
                const char = chars[Math.max(0, Math.min(chars.length - 1, charIndex))];

                ctx.globalAlpha = (r.z + size * 2) / (size * 3); // Fade out back points
                ctx.fillText(char, p.x, p.y);
            });

            ctx.globalAlpha = 1;
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
