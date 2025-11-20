"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function CtaSection() {
    return (
        <section className="relative flex w-full flex-col items-center justify-center bg-black py-32 text-white">
            {/* Top labels */}
            <div className="mb-12 flex w-full max-w-6xl items-center justify-between px-6 text-xs font-medium tracking-widest text-zinc-500">
                <span>[05/05]</span>
                <span className="absolute left-1/2 -translate-x-1/2">PRICING</span>
                <span></span> {/* Spacer for alignment if needed, or just empty */}
            </div>

            {/* Main Heading */}
            <h2 className="mb-12 max-w-4xl text-center text-5xl font-medium leading-tight tracking-tight md:text-7xl">
                START PROTECTING YOUR
                <br />
                DIGITAL LIFE TODAY
            </h2>

            {/* Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/dashboard">
                    <Button
                        size="lg"
                        className="h-14 min-w-[200px] rounded-none bg-white px-8 text-base font-semibold text-black hover:bg-zinc-200"
                    >
                        GET STARTED
                        <ArrowUpRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>

                <Button
                    variant="outline"
                    size="lg"
                    className="h-14 min-w-[200px] rounded-none border-zinc-800 bg-transparent px-8 text-base font-semibold text-white hover:bg-zinc-900 hover:text-white"
                >
                    BOOK A DEMO
                </Button>
            </div>
        </section>
    );
}
