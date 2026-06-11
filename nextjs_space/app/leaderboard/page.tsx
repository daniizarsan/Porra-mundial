import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { LeaderboardClient } from './_components/leaderboard-client';

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <LeaderboardClient />;
}
