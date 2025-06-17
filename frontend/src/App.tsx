import React from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./hooks/useAuthComplete";
import AuthPage from "./pages/AuthPage";
import PatientDashboard from "./pages/PatientDashboard";
import CorporateDashboard from "./pages/CorporateDashboard";
import { Loader2 } from "lucide-react";

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    console.log("ProtectedRoute - Current user:", user); // Debug log
    console.log("ProtectedRoute - Loading state:", isLoading); // Debug log
    if (!isLoading && !user) {
      console.log("ProtectedRoute - No user, redirecting to /auth"); // Debug log
      setLocation("/auth");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    console.log("ProtectedRoute - Loading..."); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - No user, returning null"); // Debug log
    return null;
  }

  console.log("ProtectedRoute - Rendering protected component"); // Debug log
  return <Component {...rest} />;
};

// Dashboard router component
const DashboardRouter = () => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    console.log("DashboardRouter - Current user:", user); // Debug log
    console.log("DashboardRouter - Loading state:", isLoading); // Debug log
    if (!isLoading && !user) {
      console.log("DashboardRouter - No user, redirecting to /auth"); // Debug log
      setLocation("/auth");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    console.log("DashboardRouter - Loading..."); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    console.log("DashboardRouter - No user, returning null"); // Debug log
    return null;
  }

  console.log("DashboardRouter - User role:", user.role); // Debug log
  switch (user.role) {
    case "patient":
      console.log("DashboardRouter - Rendering PatientDashboard"); // Debug log
      return <PatientDashboard />;
    case "corporate":
    case "hr":
    case "admin":
      console.log("DashboardRouter - Rendering CorporateDashboard"); // Debug log
      return <CorporateDashboard />;
    default:
      console.log("DashboardRouter - Rendering default PatientDashboard"); // Debug log
      return <PatientDashboard />;
  }
};

// Auth guard component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    console.log("AuthGuard - Current user:", user); // Debug log
    console.log("AuthGuard - Loading state:", isLoading); // Debug log
    if (!isLoading && user) {
      console.log("AuthGuard - User exists, redirecting to /dashboard"); // Debug log
      setLocation("/dashboard");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    console.log("AuthGuard - Loading..."); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user) {
    console.log("AuthGuard - User exists, returning null"); // Debug log
    return null;
  }

  console.log("AuthGuard - No user, rendering children"); // Debug log
  return <>{children}</>;
};

// App routes component
function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    console.log("AppRoutes - Loading..."); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  console.log("AppRoutes - Rendering routes"); // Debug log
  return (
    <Switch>
      <Route path="/auth">
        <AuthGuard>
          <AuthPage />
        </AuthGuard>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardRouter} />
      </Route>
      <Route path="/">
        <AuthGuard>
          <AuthPage />
        </AuthGuard>
      </Route>
    </Switch>
  );
}

// Main App component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
