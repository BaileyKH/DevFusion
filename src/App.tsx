import { useState, useEffect } from "react" 
import { Route, Routes, Navigate } from "react-router-dom"

import { supabase } from "./supabaseDB"

import { Nav } from "./components/Nav"
import { Home } from "./pages/Home"
import { Auth } from "./pages/Auth"
import { Dashboard } from "./pages/dashboard/Dashboard"

function App() {

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: {session} } = await supabase.auth.getSession();
      setSession(session)
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [])

  return (
    <div>
      <Nav />
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/auth' element={<Auth />} />
          <Route path='/dashboard' element={session ? <Dashboard /> : <Navigate to='/auth' />} />
        </Routes>
    </div>
  )
}

export default App
