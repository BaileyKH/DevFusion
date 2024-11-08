import { useState, useEffect, createContext, Suspense, lazy } from "react"; 
import { Route, Routes } from "react-router-dom";

import { supabase } from "./supabaseDB";

import { Nav } from "./components/Nav";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { NewContribs } from "./components/NewContribs";
import { GithubRedirect } from "./components/GithubRedirect";
import { LoadingSkely } from "./components/LoadingSkely";

const Chat = lazy(() => import("./components/Chat"));
const Tasks = lazy(() => import("./components/Tasks"));
const ChangeLog = lazy(() => import("./components/ChangeLog"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"))
const ProjectDashboard = lazy(() => import("./pages/dashboard/ProjectDashboard"))

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
        if (session) {
          const { data: userProfile, error: userError } = await supabase
            .from('users')
            .select('username, email, avatar_url, display_color')
            .eq('id', session.user.id)
            .single();
  
          if (userError) {
            console.error('Error fetching user profile:', userError);
          } else {
            setUser({ ...session.user, ...userProfile });
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchSession();
  
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchSession();
        } else {
          setUser(null);
        }
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
          <Route path="/github/success" element={<GithubRedirect />} />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<LoadingSkely />}>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <Suspense fallback={<LoadingSkely />}>
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LoadingSkely />}>
                  <Chat />
                </Suspense>
              }
            />
            <Route
              path="tasks"
              element={
                <Suspense fallback={<LoadingSkely />}>
                  <Tasks />
                </Suspense>
              }
            />
            <Route
              path="changelog"
              element={
                <Suspense fallback={<LoadingSkely />}>
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


