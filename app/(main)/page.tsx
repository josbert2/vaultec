"use client";

import { useState } from "react";
import AsciiBackground from "@/components/landing/ascii-background";
import AsciiMatrix from "@/components/landing/ascii-matrix";
import AsciiWave from "@/components/landing/ascii-wave";
import AsciiCube from "@/components/landing/ascii-cube";
import AsciiPattern from "@/components/landing/ascii-pattern";
import AsciiHands from "@/components/landing/ascii-hands";
import AsciiVariantSelector from "@/components/landing/ascii-variant-selector";
import CtaSection from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [variant, setVariant] = useState("pattern");

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      <div className="relative z-10">
        {variant === "spotlight" && <AsciiBackground />}
        {variant === "matrix" && <AsciiMatrix />}
        {variant === "wave" && <AsciiWave />}
        {variant === "cube" && <AsciiCube />}
        {variant === "pattern" && <AsciiPattern />}
        {variant === "hands" && <AsciiHands />}
      </div>
      <div className="relative z-20">
        <AsciiVariantSelector currentVariant={variant} onSelect={setVariant} />
        {/* Navbar */}
        <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-6 md:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
              <Lock className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">Passweird</span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex">
            <Link href="#" className="hover:text-white transition-colors">FEATURES</Link>
            <Link href="#" className="hover:text-white transition-colors">PRICING</Link>
            <Link href="#" className="hover:text-white transition-colors">SECURITY</Link>
            <Link href="#" className="hover:text-white transition-colors">ABOUT</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              / LOGIN
            </Link>
            <Button asChild className="group rounded-none border border-zinc-800 bg-transparent px-6 text-white hover:bg-white hover:text-black">
              <Link href="/register">
                GET STARTED
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 md:px-12">
          <div className="max-w-[90vw]">
            <h1 className="flex flex-col text-6xl font-bold tracking-tighter md:text-8xl lg:text-[10rem] leading-[0.9]">
              <span className="block">SECURE</span>
              <span className="flex items-center gap-4">
                EVERY LOGIN
                <span className="h-16 w-8 animate-pulse bg-white md:h-24 md:w-12 lg:h-32 lg:w-16" />
              </span>
            </h1>

            <div className="mt-12 flex flex-col items-end justify-end gap-8 md:mt-0 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md text-sm text-zinc-400 md:text-base">
                <p>/ / MILITARY-GRADE SECURITY, ZERO EFFORT</p>
                <p className="mt-2">
                  Stop reusing passwords. Start using Passweird.
                  The last password manager you'll ever need.
                </p>
              </div>

              <h2 className="text-right text-6xl font-bold tracking-tighter md:text-8xl lg:text-[10rem] leading-[0.9]">
                IN SECONDS
              </h2>
            </div>

            <div className="mt-16 flex gap-4 md:justify-end">
              <Button asChild size="lg" className="group h-14 rounded-none bg-white px-8 text-black hover:bg-zinc-200">
                <Link href="/register">
                  GET STARTED
                  <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-none border-zinc-800 bg-transparent px-8 text-white hover:bg-white hover:text-black">
                <Link href="#">
                  BOOK A DEMO
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Placed below the hero/ascii area */}
      <div className="relative z-20 border-t border-zinc-800 bg-black">
        <CtaSection />
      </div>

      {/* Footer */}
      <div className="relative z-20 bg-black">
        <Footer />
      </div>
    </main>
  );
}
