// app/[username]/voteprofile/page.jsx
import VoteProfileClient from "../VoteProfileClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function VoteProfilePage() {
  return <VoteProfileClient />;
}