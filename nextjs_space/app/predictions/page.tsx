import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { PredictionsClient } from './_components/predictions-client';

export default async function PredictionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <PredictionsClient />;
}
