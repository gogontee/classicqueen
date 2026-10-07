import LiveVoteChart from '@/components/live-chart/LiveVoteChart';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Live Vote Chart — Classic Queen International',
  description: 'Watch votes come in live, ranking our candidates in real time.',
};

export const dynamic = 'force-dynamic';

export default async function LiveChartPage() {
  const supabase = await createClient();

  const { data: candidates } = await supabase
    .from('candidates')
    .select('id, username, full_name, country, photo, vote_count')
    .eq('status', 'Approved')
    .order('vote_count', { ascending: false });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#4B382A] via-[#1a0d02] to-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-16">
        <LiveVoteChart initialCandidates={candidates ?? []} />
      </div>
    </main>
  );
}