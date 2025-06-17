import React from "react";
import { Router, Route, Switch, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/useAuthComplete";
import { Toaster } from "./components/ui/toaster";
import { Loader2 } from "lucide-react";

// Import pages
import AuthPage from "./pages/AuthPage";
import PatientDashboard from "./pages/PatientDashboard";
import CorporateDashboard from "./pages/CorporateDashboard";
import Landing from "./pages/Landing";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || timeoutReached) {
    return <Redirect to="/auth" />;
  }

  return <>{children}</>;
}

// Dashboard Router based on user role
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Route based on user role
  switch (user.role) {
    case "patient":
      return <PatientDashboard />;
    case "hr":
    case "corporate":
    case "admin":
      return <CorporateDashboard />;
    default:
      return <PatientDashboard />;
  }
}

// Auth Guard - redirect authenticated users away from auth page
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 2000); // 2 second timeout for auth check
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user && !isLoading) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Router>
      <Switch>
        <Route path="/auth">
          <AuthGuard>
            <AuthPage />
          </AuthGuard>
        </Route>
        
        <Route path="/dashboard">
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        </Route>
        
        <Route path="/">
          {user ? (
            <Redirect to="/dashboard" />
          ) : (
            <Redirect to="/auth" />
          )}
        </Route>
        
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
