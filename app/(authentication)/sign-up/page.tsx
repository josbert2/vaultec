import { getCurrentUser } from "@/actions/user-action";
import SignUpForm from "@/components/forms/signup-form";
import AsciiPattern from "@/components/landing/ascii-pattern";
import { Lock } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up | Passweird",
  description: "Password manager. built using nextjs",
};

const SignUpPage = async () => {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      {/* Background */}
      <AsciiPattern />

      {/* Navbar - Same as landing */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <Lock className="h-4 w-4 text-black" />
          </div>
          <span className="text-xl font-medium">Passweird</span>
        </Link>
        <Link
          href="/sign-in"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          Already have an account?
        </Link>
      </nav>

      {/* Content - Centered like hero section */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-medium tracking-tight md:text-6xl">
              Get started
            </h1>
            <p className="text-lg text-zinc-400">
              Create your account and start protecting your digital life
            </p>
          </div>

          {/* Form */}
          <div className="relative rounded-lg border border-zinc-800 bg-black/50 p-8 backdrop-blur-sm">
            <SignUpForm />
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignUpPage;
