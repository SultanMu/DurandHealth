import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function Landing() {
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Auto-redirect to login page after 3 seconds
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="flex justify-center items-center mb-8 animate-pulse">
          <img src="/logo.webp" alt="DurandHealth Logo" className="h-16 w-auto filter invert" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fade-in">
          DurandHealth
        </h1>
        <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay">
          Comprehensive Healthcare Management System
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto animate-fade-in-delay-2">
          Streamline patient care, manage appointments, track health assessments, 
          and provide corporate wellness solutions all in one platform.
        </p>
        <div className="animate-fade-in-delay-3">
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 mb-4"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
          <p className="text-sm text-gray-400">
            Redirecting automatically in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}