// src/app/candidates/page.jsx
import CandidatesView from "@/components/CandidatesView";
import SponsorsSection from "@/components/Home/SponsorsSection";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CandidatesPage() {
  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("status", "Approved")
    .order("vote_count", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
        <p className="text-red-600 font-medium">
          Failed to load candidates: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="relative sm:bg-gradient-to-b sm:from-neutral-50 sm:to-neutral-100">
      {/* Mobile-only background image with black overlay */}
      <div
        className="sm:hidden fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/background2.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0, 0, 0, 0.8)" }}
        />
      </div>

      {/* Content sits above the background */}
      <div className="relative z-10">
        {/* Header */}
        <header className="relative py-7 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-400/90 sm:text-yellow-700/80 font-semibold">
            Vote your Queen
          </p>

          <h1 className="mt-2 text-4xl sm:text-5xl font-bold bg-[linear-gradient(135deg,#f5d76e,#c9a227,#9A7B4F,#c9a227,#f5d76e)] sm:bg-[linear-gradient(135deg,#2E1503,#6b4423,#9A7B4F,#c9a227,#f5d76e,#9A7B4F)] bg-clip-text text-transparent">
            Classic Queen International
          </h1>

          <p className="mt-1 text-lg font-medium text-white/85 sm:text-neutral-600">
            Candidates 2026
          </p>
        </header>

        {/* Candidates */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          {candidates?.length === 0 ? (
            <p className="text-center text-white/70 sm:text-neutral-500">
              No approved candidates yet. Check back soon.
            </p>
          ) : (
            <CandidatesView candidates={candidates} />
          )}
        </section>

        {/* Sponsors scroll */}
        <SponsorsSection />
      </div>
    </main>
  );
}