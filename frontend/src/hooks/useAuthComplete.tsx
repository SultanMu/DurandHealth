import React, { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useLocation } from "wouter";

// Define the User type
type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "hr" | "corporate" | "admin";
  createdAt: string;
  updatedAt: string;
};

// Define the AuthContext type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginMutation: ReturnType<typeof useMutation<User, Error, { username: string; password: string }>>;
  registerMutation: ReturnType<typeof useMutation<User, Error, {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }>>;
  logoutMutation: ReturnType<typeof useMutation<boolean, Error, void>>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Valid users for testing
const validUsers: Record<string, User> = {
  patient1: {
    id: "1",
    username: "patient1",
    email: "patient1@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "patient",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  hr1: {
    id: "2",
    username: "hr1",
    email: "hr1@example.com",
    firstName: "Jane",
    lastName: "Smith",
    role: "hr",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  corporate1: {
    id: "3",
    username: "corporate1",
    email: "corporate1@example.com",
    firstName: "Mike",
    lastName: "Johnson",
    role: "corporate",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  admin1: {
    id: "4",
    username: "admin1",
    email: "admin1@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Initialize auth state
  useEffect(() => {
    console.log("AuthProvider - Initializing auth state"); // Debug log
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("currentUser");
    
    if (token && storedUser) {
      console.log("AuthProvider - Found stored user and token"); // Debug log
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        console.log("AuthProvider - Successfully parsed user:", parsedUser); // Debug log
        
        // Verify token with backend
        fetch('/api/user/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).then(response => {
          if (response.ok) {
            setUser(parsedUser);
          } else {
            console.log("AuthProvider - Token invalid, clearing storage"); // Debug log
            localStorage.removeItem("authToken");
            localStorage.removeItem("currentUser");
          }
        }).catch(error => {
          console.error("AuthProvider - Error verifying token:", error); // Debug log
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
        });
      } catch (error) {
        console.error("AuthProvider - Error parsing stored user:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
      }
    } else {
      console.log("AuthProvider - No stored user or token found"); // Debug log
    }
    setIsLoading(false);
  }, []);

  // Define the LoginData type
  type LoginData = {
    username: string;
    password: string;
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      console.log('Attempting login with:', credentials);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.access);
      toast.success('Login successful');
      setLocation("/dashboard");
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  });

  // Register mutation
  const registerMutation = useMutation<User, Error, {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }>({
    mutationFn: async (userData) => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if username already exists
      if (validUsers[userData.username]) {
        throw new Error("Username already exists");
      }

      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        role: "patient",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store auth token and user data
      localStorage.setItem("authToken", "mock-jwt-token");
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      return newUser;
    },
    onSuccess: (data) => {
      setUser(data);
      toast.success(`Welcome, ${data.firstName}!`);
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<boolean, Error, void>({
    mutationFn: async () => {
      console.log("Logout - Starting logout process"); // Debug log
      
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch('/api/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      return true;
    },
    onSuccess: () => {
      console.log("Logout - Success, clearing user state and storage"); // Debug log
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      queryClient.clear();
      // Delete all cookies
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
      }
      console.log("Logout - Redirecting to /auth"); // Debug log
      setLocation("/auth");
    },
  });

  const value = {
    user,
    isLoading,
    loginMutation,
    registerMutation,
    logoutMutation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}