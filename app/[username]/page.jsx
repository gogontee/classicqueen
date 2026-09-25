// src/app/[username]/page.jsx
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CandidateDetail from "@/components/CandidateDetail";
import SponsorsScroll from "@/components/SponsorsScroll";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CandidateDetailPage({ params }) {
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("username", params.username)
    .single();

  if (error || !candidate) {
    notFound();
  }

  return (
    <>
      <CandidateDetail candidate={candidate} />
      <SponsorsScroll />
    </>
  );
}