import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuthComplete.tsx";
import ReportingModal from "@/components/ReportingModal";
import ConsentManagementModal from "@/components/ConsentManagementModal";
import { 
  Users, 
  Heart, 
  ClipboardList, 
  DollarSign,
  TrendingUp,
  Building,
  BarChart3,
  Gift,
  Megaphone,
  Shield,
  Bell,
  Plus,
  AlertTriangle
} from "lucide-react";

export default function CorporateDashboard() {
  const { user, logoutMutation } = useAuth();
  const [showReporting, setShowReporting] = useState(false);
  const [showConsentGovernance, setShowConsentGovernance] = useState(false);

  // Static corporate data to prevent refresh loops
  const metrics = {
    totalEmployees: 1250,
    healthParticipation: 78,
    averageHealthScore: 85,
    costSavings: 125000
  };
  
  const departments = [
    { id: 1, name: 'Engineering', employees: 450, healthScore: 87 },
    { id: 2, name: 'Sales', employees: 200, healthScore: 82 },
    { id: 3, name: 'Marketing', employees: 150, healthScore: 89 }
  ];
  
  const activities = [
    { id: 1, type: 'wellness_program', date: new Date().toISOString(), participants: 234 },
    { id: 2, type: 'health_screening', date: new Date().toISOString(), participants: 456 }
  ];

  const metricsLoading = false;
  const departmentsLoading = false;
  const activitiesLoading = false;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">DurandHealth</span>
              <Badge variant="secondary" className="text-gray-500">Corporate Portal</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                {user.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Corporate Health Dashboard</h1>
          <p className="text-gray-600">
            Monitor employee wellness engagement and program effectiveness across your organization.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? "..." : (metrics?.totalEmployees || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-medical-blue" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-health-green mr-1" />
                <span className="text-sm text-health-green">
                  +{metrics?.employeeGrowth || 0}%
                </span>
                <span className="text-sm text-gray-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? "..." : (metrics?.activeParticipants || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-health-green/10 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-health-green" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-health-green mr-1" />
                <span className="text-sm text-health-green">
                  {metrics?.engagementRate || 0}%
                </span>
                <span className="text-sm text-gray-600 ml-1">engagement rate</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Health Assessments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? "..." : (metrics?.assessmentsCompleted || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-alert-orange/10 rounded-lg flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-alert-orange" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-gray-600">
                  {metrics?.completionRate || 0}% completion rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${metricsLoading ? "..." : (metrics?.costSavings || 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-health-green mr-1" />
                <span className="text-sm text-health-green">
                  +{metrics?.savingsGrowth || 0}%
                </span>
                <span className="text-sm text-gray-600 ml-1">vs last quarter</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Engagement Trends */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employee Engagement Trends</CardTitle>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                </select>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-t from-medical-blue/10 to-transparent rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Engagement trends chart</p>
                    <p className="text-sm">Showing participation rates and health scores</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Department Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {departmentsLoading ? (
                  <div>Loading department data...</div>
                ) : (
                  <div className="space-y-4">
                    {departments?.map((dept: any) => (
                      <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-medical-blue" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{dept.name}</p>
                            <p className="text-sm text-gray-600">{dept.employeeCount} employees</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-health-green">
                            {dept.participationRate}%
                          </p>
                          <p className="text-sm text-gray-600">participation</p>
                        </div>
                      </div>
                    ))}
                    {(!departments || departments.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No department data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setShowReporting(true)}
                  >
                    <BarChart3 className="h-4 w-4 mr-3 text-medical-blue" />
                    Generate Report
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Gift className="h-4 w-4 mr-3 text-health-green" />
                    Manage Incentives
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Megaphone className="h-4 w-4 mr-3 text-alert-orange" />
                    Launch Campaign
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setShowConsentGovernance(true)}
                  >
                    <Shield className="h-4 w-4 mr-3 text-purple-500" />
                    Consent Governance
                  </Button>
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
                  <div className="space-y-3">
                    {activities?.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-health-green/10 rounded-full flex items-center justify-center mt-1">
                          <Plus className="h-3 w-3 text-health-green" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-600">
                            {activity.department} • {new Date(activity.date || activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!activities || activities.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No recent activities</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card className="bg-gradient-to-br from-alert-orange to-red-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <h3 className="font-semibold">System Alerts</h3>
                </div>
                <p className="text-sm text-orange-100 mb-4">
                  {metrics?.consentAlertsCount || 0} employees require consent updates for HIPAA compliance.
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-alert-orange hover:bg-orange-50"
                  onClick={() => setShowConsentGovernance(true)}
                >
                  Review Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReportingModal 
        open={showReporting}
        onClose={() => setShowReporting(false)}
      />
      <ConsentManagementModal 
        open={showConsentGovernance}
        onClose={() => setShowConsentGovernance(false)}
      />
    </div>
  );
}
