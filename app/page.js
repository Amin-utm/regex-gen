'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-2xl text-center bg-white p-10 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Regex Generator
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Generate regular expressions from simple form rules.
        </p>
        <button
          onClick={() => router.push('/builder')}
          className="inline-block px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow hover:bg-blue-700 transition"
        >
          Start Generating
        </button>
      </div>
    </div>
  );
}
