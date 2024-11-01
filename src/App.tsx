import { useState, useEffect, createContext } from "react" 
import { Route, Routes, Navigate } from "react-router-dom"

import { supabase } from "./supabaseDB"

import { Nav } from "./components/Nav"
import { Home } from "./pages/Home"
import { Auth } from "./pages/Auth"
import { Dashboard } from "./pages/dashboard/Dashboard"
import { ProjectDashboard } from "./pages/dashboard/ProjectDashboard"

export const UserContext = createContext<any>(null);

function App() {

  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        console.log('Session fetched:', session);
      }
      setLoading(false); 
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        console.log('Auth state changed:', session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <UserContext.Provider value={user}>
      <div>
        <Nav />
          <Routes>
            <Route path='/' element={<Home />}/>
            <Route path='/auth' element={<Auth />} />
            <Route path='/dashboard' element={session ? <Dashboard /> : <Navigate to='/auth' />} />
            <Route path="/projects/:projectId" element={session ? <ProjectDashboard /> : <Navigate to='/auth' />} />
          </Routes>
      </div>
    </UserContext.Provider>
  )
}

export default App
