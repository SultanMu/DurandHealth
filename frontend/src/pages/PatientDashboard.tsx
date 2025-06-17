import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuthComplete.tsx";
import HealthAssessmentModal from "@/components/HealthAssessmentModal";
import AppointmentBookingModal from "@/components/AppointmentBookingModal";
import ConsentManagementModal from "@/components/ConsentManagementModal";
import AICarePlanModal from "@/components/AICarePlanModal";
import HealthRemindersModal from "@/components/HealthRemindersModal";
import VirtualAssistantModal from "@/components/VirtualAssistantModal";
import HealthTrendsChart from "@/components/HealthTrendsChart";
import HealthReportGenerator from "@/components/HealthReportGenerator";
import { apiRequest } from "@/lib/queryClient";
import { 
  ClipboardList, 
  Calendar, 
  Shield, 
  PillBottle, 
  Heart, 
  TrendingUp, 
  Clock,
  Bot,
  Bell,
  Brain,
  Target,
  Activity,
  Loader2
} from "lucide-react";

export default function PatientDashboard() {
  const { user, logoutMutation } = useAuth();
  console.log("PatientDashboard - Current user:", user); // Debug log
  const [showHealthAssessment, setShowHealthAssessment] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [showConsentManagement, setShowConsentManagement] = useState(false);
  const [showAICarePlan, setShowAICarePlan] = useState(false);
  const [showHealthReminders, setShowHealthReminders] = useState(false);
  const [showVirtualAssistant, setShowVirtualAssistant] = useState(false);

  // Fetch appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/appointments/");
      const data = await response.json();
      console.log("Fetched appointments data:", data); // Debug log
      return data;
    },
  });

  // Static demo data to prevent refresh loops
  const healthAssessments = [
    {
      id: 1,
      height: 175,
      weight: 70,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      createdAt: new Date().toISOString()
    }
  ];
  
  const appointments = appointmentsData?.results || [];
  console.log("Processed appointments:", appointments); // Debug log
  
  const healthGoals = [
    {
      id: 1,
      goalType: 'weight_loss',
      description: 'Lose 5kg in 3 months',
      targetValue: 65,
      currentValue: 70,
      progress: 0
    }
  ];

  const assessmentsLoading = false;
  const goalsLoading = false;

  const healthActivities = [
    {
      id: 1,
      activityType: 'exercise',
      description: 'Morning jog',
      value: 30,
      unit: 'minutes',
      recordedAt: new Date().toISOString()
    }
  ];
  const activitiesLoading = false;

  const latestAssessment = Array.isArray(healthAssessments) ? healthAssessments[0] : null;
  const upcomingAppointments = Array.isArray(appointments) ? appointments.filter((apt: any) => {
    console.log("Checking appointment:", apt); // Debug log
    const appointmentDate = new Date(apt.date);
    const now = new Date();
    console.log("Current time:", now); // Debug log
    console.log("Appointment time:", appointmentDate); // Debug log
    const isValid = appointmentDate > now && apt.status === "scheduled";
    console.log("Is appointment valid?", isValid); // Debug log
    return isValid;
  }) : [];
  console.log("All appointments:", appointments); // Debug log
  console.log("Filtered upcoming appointments:", upcomingAppointments); // Debug log

  const handleLogout = () => {
    console.log("PatientDashboard - Logging out"); // Debug log
    logoutMutation.mutate();
  };

  if (!user) {
    console.log("PatientDashboard - No user, showing loading state"); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  console.log("PatientDashboard - Rendering dashboard for user:", user); // Debug log
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">DurandHealth</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="group transform transition-all duration-200 hover:scale-110 hover:bg-blue-50 hover:shadow-md">
                <Bell className="h-4 w-4 group-hover:text-blue-600 transition-colors duration-200" />
              </Button>
              <div className="flex items-center space-x-2">
                {user.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-blue-200 transition-all duration-300 cursor-pointer transform hover:scale-110"
                  />
                )}
                <span className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                  {user.firstName} {user.lastName}
                </span>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="group transform transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:shadow-md">
                  <span className="group-hover:text-red-600 transition-colors duration-200">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your health journey and upcoming activities.
          </p>
        </div>

        {/* Quick Actions - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card 
            className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-blue-50/30 hover:from-blue-50 hover:to-blue-100/50"
            onClick={() => setShowHealthAssessment(true)}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-medical-blue/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-medical-blue/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-200">
                <ClipboardList className="h-6 w-6 text-medical-blue group-hover:text-blue-600 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-800 transition-colors duration-300">Health Assessment</h3>
              <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">Complete your risk evaluation</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-100 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-green-50/30 hover:from-green-50 hover:to-green-100/50"
            onClick={() => setShowAppointmentBooking(true)}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-health-green/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-health-green/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-200">
                <Calendar className="h-6 w-6 text-health-green group-hover:text-green-600 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-800 transition-colors duration-300">Book Appointment</h3>
              <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-300">Schedule healthcare services</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-purple-50/30 hover:from-purple-50 hover:to-purple-100/50"
            onClick={() => setShowAICarePlan(true)}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-200">
                <Brain className="h-6 w-6 text-purple-500 group-hover:text-purple-600 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-800 transition-colors duration-300">AI Care Plan</h3>
              <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors duration-300">Get personalized recommendations</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-blue-50/30 hover:from-blue-50 hover:to-blue-100/50"
            onClick={() => setShowVirtualAssistant(true)}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-200">
                <Bot className="h-6 w-6 text-blue-500 group-hover:text-blue-600 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-800 transition-colors duration-300">Virtual Assistant</h3>
              <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">Chat with health AI</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-orange-50/30 hover:from-orange-50 hover:to-orange-100/50"
            onClick={() => setShowHealthReminders(true)}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-200">
                <Bell className="h-6 w-6 text-orange-500 group-hover:text-orange-600 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-800 transition-colors duration-300">Health Reminders</h3>
              <p className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors duration-300">Manage medication & health alerts</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-100 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-red-50/30 hover:from-red-50 hover:to-red-100/50"
            onClick={() => setShowConsentManagement(true)}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-alert-orange/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-alert-orange/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-200">
                <Shield className="h-6 w-6 text-alert-orange group-hover:text-red-600 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-red-800 transition-colors duration-300">Privacy Consents</h3>
              <p className="text-sm text-gray-600 group-hover:text-red-600 transition-colors duration-300">Manage HIPAA data permissions</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-100 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-green-50/30 hover:from-green-50 hover:to-green-100/50">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-200">
                <Target className="h-6 w-6 text-green-500 group-hover:text-green-600 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-800 transition-colors duration-300">Health Goals</h3>
              <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-300">Track wellness objectives</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-indigo-50/30 hover:from-indigo-50 hover:to-indigo-100/50">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-200">
                <Activity className="h-6 w-6 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-800 transition-colors duration-300">Health Activities</h3>
              <p className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors duration-300">Log daily health metrics</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="group text-center p-4 bg-medical-blue/5 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-medical-blue/10 hover:-translate-y-1">
                    <div className="text-2xl font-bold text-medical-blue group-hover:text-blue-700 transition-colors duration-300 group-hover:scale-110 transform">
                      {latestAssessment?.riskScore || 0}
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">Health Score</div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2 overflow-hidden">
                      <div 
                        className="bg-medical-blue h-2 rounded-full transition-all duration-500 group-hover:bg-blue-600"
                        style={{ width: `${Math.min((latestAssessment?.riskScore || 0), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="group text-center p-4 bg-health-green/5 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-health-green/10 hover:-translate-y-1">
                    <div className="text-2xl font-bold text-health-green group-hover:text-green-700 transition-colors duration-300 group-hover:scale-110 transform">
                      {Array.isArray(healthGoals) ? healthGoals.filter((goal: any) => goal.status === 'completed').length : 0}
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-300">Goals Completed</div>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2 overflow-hidden">
                      <div 
                        className="bg-health-green h-2 rounded-full transition-all duration-500 group-hover:bg-green-600"
                        style={{ width: `${Array.isArray(healthGoals) ? Math.min((healthGoals.filter((goal: any) => goal.status === 'completed').length / Math.max(healthGoals.length, 1)) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="group text-center p-4 bg-alert-orange/5 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-alert-orange/10 hover:-translate-y-1">
                    <div className="text-2xl font-bold text-alert-orange group-hover:text-orange-700 transition-colors duration-300 group-hover:scale-110 transform">
                      {Array.isArray(healthActivities) ? healthActivities.length : 0}
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors duration-300">Activities Logged</div>
                    <div className="w-full bg-orange-200 rounded-full h-2 mt-2 overflow-hidden">
                      <div 
                        className="bg-alert-orange h-2 rounded-full transition-all duration-500 group-hover:bg-orange-600"
                        style={{ width: `${Math.min((Array.isArray(healthActivities) ? healthActivities.length : 0) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Bot className="h-5 w-5 text-medical-blue mr-2" />
                    AI Health Recommendations
                  </h3>
                  <div className="space-y-3">
                    {latestAssessment && (
                      <div className="group flex items-start space-x-3 p-3 bg-blue-50 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-102 hover:shadow-md hover:bg-blue-100/70 hover:-translate-y-0.5">
                        <TrendingUp className="h-5 w-5 text-medical-blue mt-1 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                        <div>
                          <p className="text-sm text-gray-800 group-hover:text-blue-800 transition-colors duration-300">
                            Based on your recent assessment, consider scheduling a preventive screening.
                          </p>
                          <Button 
                            variant="link" 
                            className="text-xs text-medical-blue p-0 h-auto group-hover:text-blue-700 transition-colors duration-300 hover:scale-105"
                            onClick={() => setShowAppointmentBooking(true)}
                          >
                            Schedule Now
                          </Button>
                        </div>
                      </div>
                    )}
                    {Array.isArray(healthGoals) && healthGoals.length > 0 && (
                      <div className="group flex items-start space-x-3 p-3 bg-green-50 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-102 hover:shadow-md hover:bg-green-100/70 hover:-translate-y-0.5">
                        <Heart className="h-5 w-5 text-health-green mt-1 group-hover:text-green-600 group-hover:scale-110 transition-all duration-300" />
                        <div>
                          <p className="text-sm text-gray-800 group-hover:text-green-800 transition-colors duration-300">
                            Great progress on your health goals! Keep up the excellent work.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div>Loading activities...</div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(healthActivities) ? healthActivities.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="group flex items-center space-x-4 p-3 rounded-lg cursor-pointer transform transition-all duration-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:scale-102 hover:shadow-md hover:-translate-y-0.5">
                        <div className="w-10 h-10 bg-health-green/10 rounded-full flex items-center justify-center group-hover:bg-health-green/20 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                          <Clock className="h-5 w-5 text-health-green group-hover:text-green-600 transition-colors duration-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-green-800 transition-colors duration-300">{activity.description}</p>
                          <p className="text-xs text-gray-600 group-hover:text-green-600 transition-colors duration-300">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    )) : null}
                    {(!Array.isArray(healthActivities) || healthActivities.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No recent activities</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div>Loading appointments...</div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="group border-l-4 border-medical-blue pl-4 py-2 cursor-pointer transform transition-all duration-300 hover:border-blue-600 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent hover:scale-102 hover:-translate-y-0.5 hover:shadow-md rounded-r-lg">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-800 transition-colors duration-300">{appointment.appointmentType}</p>
                        <p className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                          {new Date(appointment.date).toLocaleDateString()} at{' '}
                          {new Date(appointment.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {appointment.provider && (
                          <p className="text-xs text-medical-blue group-hover:text-blue-700 transition-colors duration-300">{appointment.provider}</p>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
                          <Calendar className="h-3 w-3 text-blue-500 inline" />
                        </div>
                      </div>
                    ))}
                    {upcomingAppointments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                    )}
                    <Button 
                      variant="link" 
                      className="w-full text-medical-blue group transform transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:shadow-md rounded-lg py-2"
                      onClick={() => setShowAppointmentBooking(true)}
                    >
                      <span className="group-hover:text-blue-700 transition-colors duration-300">Book New Appointment</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Current Health Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {goalsLoading ? (
                  <div>Loading goals...</div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(healthGoals) ? healthGoals.slice(0, 3).map((goal: any) => (
                      <div key={goal.id} className="group cursor-pointer transform transition-all duration-300 hover:scale-102 hover:bg-gradient-to-r hover:from-green-50/30 hover:to-blue-50/30 p-3 rounded-lg hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900 group-hover:text-green-800 transition-colors duration-300">{goal.goalType}</span>
                          <span className="text-xs text-gray-600 group-hover:text-green-600 transition-colors duration-300 group-hover:scale-110 transform">
                            {Math.round((goal.current / goal.target) * 100)}%
                          </span>
                        </div>
                        <div className="relative overflow-hidden rounded-full h-2 bg-gray-200 group-hover:bg-gray-300 transition-colors duration-300">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-700 group-hover:from-green-500 group-hover:to-blue-600 group-hover:shadow-lg"
                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          >
                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse group-hover:animate-none"></div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                          <Target className="h-3 w-3 text-green-500 inline mr-1" />
                          <span className="text-xs text-green-600">Click to view details</span>
                        </div>
                      </div>
                    )) : null}
                    {(!Array.isArray(healthGoals) || healthGoals.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No active goals</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Virtual Assistant */}
            <Card className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 hover:from-purple-600 hover:to-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Bot className="h-6 w-6 mr-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                  <h3 className="font-semibold group-hover:text-purple-100 transition-colors duration-300">Health Assistant</h3>
                </div>
                <p className="text-sm text-purple-100 mb-4 group-hover:text-white transition-colors duration-300">
                  Get personalized health insights and reminders.
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-purple-600 hover:bg-purple-50 group-hover:scale-105 group-hover:shadow-lg transform transition-all duration-300"
                  onClick={() => setShowVirtualAssistant(true)}
                >
                  Ask a Question
                </Button>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            {/* Health Trends Visualization */}
            <HealthTrendsChart 
              data={Array.isArray(healthAssessments) ? healthAssessments.map((assessment: any) => ({
                date: assessment.createdAt,
                weight: assessment.weight,
                bloodPressureSystolic: assessment.bloodPressureSystolic,
                bloodPressureDiastolic: assessment.bloodPressureDiastolic,
                heartRate: assessment.heartRate,
                stressLevel: assessment.stressLevel,
                sleepHours: assessment.sleepHours
              })) : []}
            />

            {/* Health Report Generator */}
            <HealthReportGenerator />
          </div>
        </div>
      </div>

      {/* Modals */}
      <HealthAssessmentModal 
        open={showHealthAssessment}
        onClose={() => setShowHealthAssessment(false)}
      />
      <AppointmentBookingModal 
        open={showAppointmentBooking}
        onClose={() => setShowAppointmentBooking(false)}
      />
      <ConsentManagementModal 
        open={showConsentManagement}
        onClose={() => setShowConsentManagement(false)}
      />
      <AICarePlanModal 
        open={showAICarePlan}
        onClose={() => setShowAICarePlan(false)}
      />
      <HealthRemindersModal 
        open={showHealthReminders}
        onClose={() => setShowHealthReminders(false)}
      />
      <VirtualAssistantModal 
        open={showVirtualAssistant}
        onClose={() => setShowVirtualAssistant(false)}
        onBookAppointment={() => {
          setShowVirtualAssistant(false);
          setShowAppointmentBooking(true);
        }}
        onSetReminder={() => {
          setShowVirtualAssistant(false);
          setShowHealthReminders(true);
        }}
        onHealthAssessment={() => {
          setShowVirtualAssistant(false);
          setShowHealthAssessment(true);
        }}
        onViewCarePlan={() => {
          setShowVirtualAssistant(false);
          setShowAICarePlan(true);
        }}
      />
    </div>
  );
}
