import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { SimulationSession } from '@/types/user';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session: SimulationSession | null = await getServerSession(authOptions);

  if (session?.role === 'Student') {
    redirect('/student');
  } else if (session?.role === 'Instructor') {
    redirect('/instructor');
  } else if (session?.role === 'Admin') {
    redirect('/admin');
  } else {
    redirect('/login');
  }
}
