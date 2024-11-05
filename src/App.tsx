import { useState, useEffect, createContext, Suspense, lazy } from "react"; 
import { Route, Routes } from "react-router-dom";

import { supabase } from "./supabaseDB";

import { Nav } from "./components/Nav";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { ProjectDashboard } from "./pages/dashboard/ProjectDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { NewContribs } from "./components/NewContribs";

const Chat = lazy(() => import("./components/Chat"));
const Tasks = lazy(() => import("./components/Tasks"));
const ChangeLog = lazy(() => import("./components/ChangeLog"));

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
        console.error("Error fetching session:", error);
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
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<div>Loading Dashboard...</div>}>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <Suspense fallback={<div>Loading Project Dashboard...</div>}>
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<div>Loading Chat...</div>}>
                  <Chat />
                </Suspense>
              }
            />
            <Route
              path="tasks"
              element={
                <Suspense fallback={<div>Loading Tasks...</div>}>
                  <Tasks />
                </Suspense>
              }
            />
            <Route
              path="changelog"
              element={
                <Suspense fallback={<div>Loading Change Log...</div>}>
                  <ChangeLog />
                </Suspense>
              }
            />
            <Route path="add" element={<NewContribs />} />
          </Route>
        </Routes>
      </div>
    </UserContext.Provider>
  );
}

export default App;


