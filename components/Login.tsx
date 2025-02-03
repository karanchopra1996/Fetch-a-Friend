import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'https://frontend-take-home-service.fetch.com/auth/login',
        { name, email },
        { withCredentials: true }
      );
      if (response.status === 200) {
        router.push('/search');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Fetch a Friend</title>
      </Head>

      {/* Full-screen background container */}
      <div className="min-h-screen relative">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/asset/images/dogs.jpg')", // Double-check your image path
          }}
        >
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content container */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-bold text-center text-white mb-8 drop-shadow-2xl animate-fade-in">
            Fetch a Friend
            <span className="block text-2xl sm:text-3xl font-normal mt-2">
              Find your perfect canine companion
            </span>
          </h1>

          {/* Login card */}
          <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-3xl">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Welcome Back!
            </h2>

            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />

            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-6 p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />

            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-300 transform hover:scale-[1.02]"
            >
              Let's Find Friends! 🐾
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;