import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseDB";

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (isSignUp) {

      const { data: existingUsernames, error: usernameError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username);

      if (usernameError) {
        alert('Error checking username availability.');
        return;
      }

      if (existingUsernames && existingUsernames.length > 0) {
        alert('Username already exists. Please choose another one.');
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username, 
          },
        },
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Sign-up successful! Please check your email to confirm your account.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-3xl mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      {isSignUp && (
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded"
        />
      )}
      <button onClick={handleAuth} className="px-4 py-2 bg-blue-600 text-white rounded">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </button>
      <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-blue-500">
        {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
      </button>
    </div>
  );
};