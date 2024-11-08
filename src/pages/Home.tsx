import { useNavigate } from 'react-router-dom';

export const Home= () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-bold mb-4 text-lightAccent">Welcome to <span className='text-primAccent'>Devfusion</span></h1>
      <p className="text-lg text-lightAccent mb-8">
        Collaborate with your team in real-time and manage your projects with ease.
      </p>
      <button
        onClick={() => navigate('/auth')}
        className="px-6 py-3 bg-primAccent hover:bg-red-950 text-white rounded-lg shadow-md transition duration-300"
      >
        Get Started
      </button>
    </div>
  );
};