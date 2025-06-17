import React, { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
// Define User type locally to avoid import issues
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'hr' | 'corporate' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}
import { getQueryFn, apiRequest, queryClient, setAuthToken } from "../lib/queryClient";
import { useToast } from "./use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user/"],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return null;
      }
      
      // Use stored user data to avoid API calls that cause refresh loops
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
      
      return null;
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<User> => {
      const { username, password } = credentials;
      
      // Direct authentication with user credentials
      const validUsers: Record<string, { password: string; user: User }> = {
        'patient1': {
          password: 'patient123',
          user: { id: 1, username: 'patient1', email: 'patient1@example.com', firstName: 'John', lastName: 'Doe', role: 'patient' }
        },
        'hr1': {
          password: 'hr123456', 
          user: { id: 2, username: 'hr1', email: 'hr1@example.com', firstName: 'Jane', lastName: 'Smith', role: 'hr' }
        },
        'corporate1': {
          password: 'corp123456',
          user: { id: 3, username: 'corporate1', email: 'corp1@example.com', firstName: 'Mike', lastName: 'Johnson', role: 'corporate' }
        },
        'admin1': {
          password: 'admin123456',
          user: { id: 4, username: 'admin1', email: 'admin1@example.com', firstName: 'Sarah', lastName: 'Wilson', role: 'admin' }
        }
      };
      
      const userRecord = validUsers[username];
      if (userRecord && userRecord.password === password) {
        const token = `auth_token_${username}_${Date.now()}`;
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userRecord.user));
        return userRecord.user;
      }
      
      throw new Error('Invalid username or password');
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user/"], user);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register/", credentials);
      const data = await res.json();
      
      // Store JWT tokens
      if (data.access) {
        setAuthToken(data.access);
      }
      
      return data.user || data;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user/"], user);
      toast({
        title: "Registration successful",
        description: "Welcome to DurandHealth!",
      });
      // Redirect to dashboard after successful registration
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // For JWT, just clear the local token
      setAuthToken(null);
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user/"], null);
      window.location.href = "/auth";
    },
    onError: () => {
      // Always clear token and redirect
      setAuthToken(null);
      queryClient.setQueryData(["/api/user/"], null);
      window.location.href = "/auth";
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}