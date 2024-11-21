import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseDB";

import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate('/dashboard'); 
      } else {
        setIsCheckingSession(false); 
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async () => {
    setAuthenticating(true);
    setError('')

    if (isSignUp) {
      // Check for existing usernames to prevent duplicates
      const { data: existingUsernames, error: usernameError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username);

      if (usernameError) {
        setError('Error checking username availability.');
        setAuthenticating(false);
        return;
      }

      if (existingUsernames && existingUsernames.length > 0) {
        setError('Username already exists. Please choose another one.');
        setAuthenticating(false);
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
        setModalOpen(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Incorrect Username or Password, please try again.")
      }
    }

    setAuthenticating(false);
  };

  const handleSignUpRedirect = () => {
    setModalOpen(false);
    navigate('/')
  }

  if (isCheckingSession) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-lightAccent">{isSignUp ? 'Create an account' : 'Sign in to your account'}</h2>
        {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-6">
          <div>
            <Label htmlFor="email" className="block text-sm/6 font-medium text-lightAccent">
              Email address
            </Label>
            <div className="mt-2">
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="border-darkAccent/65 text-lightAccent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="block text-sm/6 font-medium text-lightAccent">
                Password
              </Label>
            </div>
            <div className="mt-2">
              <Input
                id="password"
                name="password"
                type="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="border-darkAccent/65 text-lightAccent"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="username" className="block text-sm/6 font-medium text-lightAccent">
                  Username
                </Label>
              </div>
              <div className="mt-2">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-darkAccent/65 text-lightAccent"
                />
              </div>
            </div>
          )}

          <div>
            <Button
              onClick={handleAuth}
              disabled={authenticating}
              className="flex w-full justify-center rounded-md bg-primAccent px-3 py-1.5 text-sm/6 font-semibold text-lightAccent shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primAccent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>
        </div>

        <p onClick={() => setIsSignUp(!isSignUp)} className="mt-10 text-center text-sm/6 text-darkAccent hover:text-primAccent cursor-pointer transition duration-200">
          {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
        </p>
      </div>
      {modalOpen && 
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="bg-primDark">
            <CardHeader>
              <CardTitle className="text-lightAccent/85">Success!</CardTitle>
              <CardDescription className="text-lightAccent/60">Thank you for signing up with DevFusion!</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please check your email to verify your new account. Happy Collaborating!</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSignUpRedirect}>Close</Button>
            </CardFooter>
          </Card>
        </div>
      }
    </div>
  );
};
