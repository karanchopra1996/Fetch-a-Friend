import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

const Match = ({ matchId }: { matchId: string }) => {
  const [dog, setDog] = useState<Dog | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await axios.post(
          'https://frontend-take-home-service.fetch.com/dogs',
          [matchId],
          { withCredentials: true }
        );
        setDog(response.data[0]);
      } catch (error) {
        console.error('Failed to fetch match:', error);
      }
    };
    fetchMatch();
  }, [matchId]);

  if (!dog) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Match</h1>
      <div className="border p-4 rounded">
        <img src={dog.img} alt={dog.name} className="w-full h-48 object-cover mb-2" />
        <h2 className="text-xl font-semibold">{dog.name}</h2>
        <p>Breed: {dog.breed}</p>
        <p>Age: {dog.age}</p>
        <p>Zip Code: {dog.zip_code}</p>
      </div>
      <button
        onClick={() => router.push('/search')}
        className="mt-4 bg-blue-500 text-white p-2 rounded"
      >
        Back to Search
      </button>
    </div>
  );
};

export default Match; 