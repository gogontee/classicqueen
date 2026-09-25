import { createClient } from "@/utils/supabase/server";

// Site URL — used as the base for all OG image and URL references.
// In production, NEXT_PUBLIC_SITE_URL should be https://yourdomain.com
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function generateMetadata({ params }) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("candidates")
    .select("full_name, country, photo, vote_count")
    .eq("username", params.username)
    .eq("status", "Approved")
    .maybeSingle();

  if (!data) {
    return { title: "Candidate Not Found" };
  }

  const title = `Vote for ${data.full_name} — Classic Queen International 2026`;
  const description = `Representing ${data.country}. Cast your vote to support ${data.full_name} in the Classic Queen International 2026 pageant.`;

  // The page URL users land on when they click the shared link
  const pageUrl = `${SITE_URL}/${params.username}/voteprofile`;

  // The generated image card (vertical 900x1200)
  const ogImageUrl = `${SITE_URL}/api/vote-card/${params.username}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,          // ← click-through destination
      siteName: "Classic Queen International 2026",
      images: [
        {
          url: ogImageUrl,
          width: 900,
          height: 1200,
          alt: `Vote for ${data.full_name}`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function VoteProfileLayout({ children }) {
  return children;
}