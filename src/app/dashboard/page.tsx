'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [clickCount, setClickCount] = useState(0);

  const handleButtonClick = () => {
    console.log('Button clicked!');
    setClickCount((prevCount) => prevCount + 1);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Sales Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to your AI-Powered Sales Intelligence platform.
        </p>
        <div className="p-6 border rounded-lg shadow-md bg-white">
          <p className="mb-4">This is a sample interactive button to demonstrate functionality.</p>
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Click me
          </button>
          <p className="mt-4">
            Button has been clicked {clickCount} time(s).
          </p>
        </div>
      </div>
    </main>
  );
}