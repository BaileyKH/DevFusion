import { useState, useEffect, createContext } from "react" 
import { Route, Routes, Navigate } from "react-router-dom"

import { supabase } from "./supabaseDB"

import { Nav } from "./components/Nav"
import { Home } from "./pages/Home"
import { Auth } from "./pages/Auth"
import { Dashboard } from "./pages/dashboard/Dashboard"
import { ProjectDashboard } from "./pages/dashboard/ProjectDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import { Chat } from "./components/Chat"
import { Tasks } from "./components/Tasks"
import { ChangeLog } from "./components/ChangeLog"
import { NewContribs } from "./components/NewContribs"

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
      }
      setLoading(false); 
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
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
            <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDashboard/></ProtectedRoute>} >
              <Route index element={<Chat />} />
              <Route path='tasks' element={<Tasks />} />
              <Route path='changelog' element={<ChangeLog/>} />
              <Route path='add' element={<NewContribs />} />
            </Route>
          </Routes>
      </div>
    </UserContext.Provider>
  )
}

export default App
