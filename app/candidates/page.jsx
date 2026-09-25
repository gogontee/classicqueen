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
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      {/* Header */}
<header className="relative py-7 px-6 text-center">
  <p className="text-xs uppercase tracking-[0.35em] text-yellow-700/80 font-semibold">
    Vote your Queen
  </p>

  <h1 className="mt-2 text-4xl sm:text-5xl font-bold bg-[linear-gradient(135deg,#2E1503,#6b4423,#9A7B4F,#c9a227,#f5d76e,#9A7B4F)] bg-clip-text text-transparent">
    Classic Queen International
  </h1>

  <p className="mt-1 text-lg font-medium text-neutral-600">
    Candidates 2026
  </p>
</header>

      {/* Candidates */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        {candidates?.length === 0 ? (
          <p className="text-center text-neutral-500">
            No approved candidates yet. Check back soon.
          </p>
        ) : (
          <CandidatesView candidates={candidates} />
        )}
      </section>

      {/* Sponsors scroll */}
      <SponsorsSection />
    </main>
  );
}