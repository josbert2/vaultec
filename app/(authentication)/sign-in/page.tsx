import { getCurrentUser } from "@/actions/user-action";
import SignInForm from "@/components/forms/signin-form";
import AsciiPattern from "@/components/landing/ascii-pattern";
import { Logo } from "@/components/logo";
import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In | Passweird",
  description: "Password manager. built using nextjs",
};

const SignInPage = async () => {
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
          <Logo size={51} />
          <span className="text-xl font-medium ml-2">Vaultec</span>
        </Link>
        <Link
          href="/sign-up"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          Don&apos;t have an account?
        </Link>
      </nav>

      {/* Content - Centered like hero section */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-medium tracking-tight md:text-6xl">
              Welcome back
            </h1>
            <p className="text-lg text-zinc-400">
              Sign in to continue protecting your digital life
            </p>
          </div>

          {/* Form */}
          <div className="relative rounded-lg border border-zinc-800 bg-black/50 p-8 backdrop-blur-sm">
            <SignInForm />
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignInPage;
