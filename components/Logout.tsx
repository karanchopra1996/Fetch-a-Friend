// Logout.tsx

import React from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(
        'https://frontend-take-home-service.fetch.com/auth/logout',
        {},
        { withCredentials: true }
      );
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600"
    >
      Logout
    </button>
  );
}

export default Logout;
