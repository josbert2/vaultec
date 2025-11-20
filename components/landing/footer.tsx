"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Disc, Send } from "lucide-react";

export default function Footer() {
    const sections = [
        {
            title: "QUICK LINKS",
            links: [
                { label: "Home page", href: "/" },
                { label: "Download", href: "#" },
                { label: "Pricing", href: "#" },
                { label: "How it works", href: "#" },
                { label: "Families", href: "#" },
                { label: "Compare Passweird", href: "#" },
            ],
        },
        {
            title: "SOCIAL MEDIA",
            links: [
                { label: "Telegram", href: "#" },
                { label: "Discord", href: "#" },
                { label: "X (Twitter)", href: "#" },
                { label: "Instagram", href: "#" },
            ],
        },
        {
            title: "RESOURCES",
            links: [
                { label: "Support center", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Community", href: "#" },
                { label: "My account", href: "/dashboard" },
            ],
        },
        {
            title: "TRUST",
            links: [
                { label: "Trust center", href: "#" },
                { label: "Security", href: "#" },
                { label: "Privacy", href: "#" },
                { label: "Legal center", href: "#" },
                { label: "Compliance", href: "#" },
            ],
        },
        {
            title: "COMPANY",
            links: [
                { label: "About us", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Newsroom", href: "#" },
                { label: "Contact", href: "#" },
            ],
        },
        {
            title: "GET PASSWEIRD",
            links: [
                { label: "MacOS", href: "#" },
                { label: "Windows", href: "#" },
                { label: "Linux", href: "#" },
                { label: "ChromeOS", href: "#" },
                { label: "iOS", href: "#" },
                { label: "Android", href: "#" },
            ],
        },
    ];

    return (
        <footer className="w-full border-t border-zinc-800 bg-black text-zinc-400">
            {/* Main Grid */}
            <div className="grid grid-cols-2 divide-x divide-zinc-800 border-b border-zinc-800 md:grid-cols-3 lg:grid-cols-6">
                {sections.map((section) => (
                    <div key={section.title} className="flex flex-col p-8">
                        <h3 className="mb-6 text-xs font-medium tracking-widest text-white">
                            / {section.title}
                        </h3>
                        <ul className="space-y-3 text-sm">
                            {section.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col items-center justify-between gap-4 p-8 text-xs md:flex-row">
                <div className="flex items-center gap-2">
                    {/* Simple Logo Placeholder */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-bold">
                        P
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-8 md:justify-end">
                    <Link href="#" className="hover:text-white">
                        Brand Kit
                    </Link>
                    <Link href="#" className="hover:text-white">
                        Terms of Use
                    </Link>
                    <Link href="#" className="hover:text-white">
                        Privacy & Policy
                    </Link>
                    <span>© 2025 Passweird</span>
                </div>
            </div>
        </footer>
    );
}
