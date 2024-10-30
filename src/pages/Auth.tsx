import { useState } from "react";
import { supabase } from "../supabaseDB";

export const Auth = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async () => {
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) alert(error.message);
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) alert(error.message)
        }
    }

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
            className="mb-4 p-2 border border-gray-300 rounded"
          />
          <button onClick={handleAuth} className="px-4 py-2 bg-blue-600 text-white rounded">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-blue-500">
            {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
          </button>
        </div>
      );

}