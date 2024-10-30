import { useNavigate } from 'react-router-dom';

export const Home= () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-bold mb-4">Welcome to Devfusion</h1>
      <p className="text-lg mb-8">
        Collaborate with your team in real-time and manage your projects with ease.
      </p>
      <button
        onClick={() => navigate('/auth')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        Get Started
      </button>
    </div>
  );
};