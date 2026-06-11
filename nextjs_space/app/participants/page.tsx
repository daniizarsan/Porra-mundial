import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { ParticipantsClient } from './_components/participants-client';

export default async function ParticipantsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <ParticipantsClient />;
}
