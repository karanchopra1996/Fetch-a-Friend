import Match from '../../components/Match';
import { useRouter } from 'next/router';

export default function MatchPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <div>Loading...</div>;

  return <Match matchId={id as string} />;
}