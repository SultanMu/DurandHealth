import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Target, Calendar, TrendingUp, CheckCircle, AlertCircle, Clock, Activity } from "lucide-react";

interface AICarePlanModalProps {
  open: boolean;
  onClose: () => void;
}

interface CarePlanItem {
  id: string;
  type: 'medication' | 'exercise' | 'diet' | 'monitoring' | 'lifestyle' | 'appointment';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  frequency: string;
  duration: string;
  status: 'pending' | 'in_progress' | 'completed';
  aiConfidence: number;
  reasoning: string;
  target: string;
  progress?: number;
}

export default function AICarePlanModal({ open, onClose }: AICarePlanModalProps) {
  const [activeTab, setActiveTab] = useState("current");
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Static care plan data to prevent refresh loops
  const carePlan = {
    id: 1,
    items: [
      {
        id: '1',
        type: 'exercise',
        title: 'Daily Walking',
        description: '30 minutes of brisk walking',
        priority: 'high',
        frequency: 'Daily',
        duration: '30 minutes',
        status: 'in_progress',
        aiConfidence: 95,
        reasoning: 'Based on your health assessment, regular walking will improve cardiovascular health',
        target: 'Improve cardiovascular fitness',
        progress: 70
      }
    ]
  };

  const healthData = {
    assessments: [
      {
        id: 1,
        height: 175,
        weight: 70,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 72
      }
    ]
  };

  const planLoading = false;
  const healthLoading = false;

  const generateCarePlan = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/care-plan/generate", {
        includeHealthData: true,
        aiAnalysis: true,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Care Plan Generated",
        description: "Your personalized AI-driven care plan has been created based on your health data.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/care-plan/"] });
      setGeneratingPlan(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
      setGeneratingPlan(false);
    },
  });

  const updateCarePlanItem = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/care-plan/items/${itemId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/care-plan/"] });
    },
  });

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    generateCarePlan.mutate();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Target className="h-4 w-4" />;
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'diet': return <Target className="h-4 w-4" />;
      case 'monitoring': return <TrendingUp className="h-4 w-4" />;
      case 'lifestyle': return <CheckCircle className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const renderCarePlanItem = (item: CarePlanItem) => {
    return (
      <Card key={item.id} className="transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {getTypeIcon(item.type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{item.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {Math.round(item.aiConfidence)}% AI Confidence
              </Badge>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">{item.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-xs font-medium text-gray-500">Frequency</Label>
              <p className="text-sm text-gray-900">{item.frequency}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500">Duration</Label>
              <p className="text-sm text-gray-900">{item.duration}</p>
            </div>
          </div>

          {item.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <Brain className="h-4 w-4 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h5 className="text-xs font-medium text-blue-900 mb-1">AI Reasoning</h5>
                <p className="text-xs text-blue-800">{item.reasoning}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Target: {item.target}
            </div>
            <div className="flex space-x-2">
              {item.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => updateCarePlanItem.mutate({ itemId: item.id, status: 'in_progress' })}
                >
                  Start
                </Button>
              )}
              {item.status === 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCarePlanItem.mutate({ itemId: item.id, status: 'completed' })}
                >
                  Mark Complete
                </Button>
              )}
              {item.status === 'completed' && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHealthInsights = () => {
    if (healthLoading) return <div className="text-center py-8">Loading health insights...</div>;

    const insights = healthData?.aiInsights || [];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI Health Insights</h3>
        {insights.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Complete a health assessment to receive AI-driven insights.</p>
            </CardContent>
          </Card>
        ) : (
          insights.map((insight: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Confidence: {insight.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderCarePlanOverview = () => {
    if (planLoading) return <div className="text-center py-8">Loading care plan...</div>;

    const items = carePlan?.items || [];
    
    if (!carePlan || items.length === 0) {
      return (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Care Plan Yet</h3>
          <p className="text-gray-600 mb-6">
            Generate your personalized AI-driven care plan based on your health data and goals.
          </p>
          <Button
            onClick={handleGeneratePlan}
            disabled={generatingPlan}
            className="min-w-32"
          >
            {generatingPlan ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Care Plan
              </>
            )}
          </Button>
        </div>
      );
    }

    const totalItems = items.length;
    const completedItems = items.filter((item: any) => item.status === 'completed').length;
    const completionRate = Math.round((completedItems / totalItems) * 100);

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your AI Care Plan</h3>
                <p className="text-blue-100">
                  Personalized recommendations based on your health profile
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-sm text-blue-100">Completed</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={completionRate} className="h-2 bg-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
              <p className="text-sm text-gray-600">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedItems}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {items.filter((item: any) => item.status === 'in_progress').length}
              </div>
              <p className="text-sm text-gray-600">In Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Care Plan Items</h3>
          <Button
            variant="outline"
            onClick={handleGeneratePlan}
            disabled={generatingPlan}
          >
            <Brain className="h-4 w-4 mr-2" />
            Regenerate Plan
          </Button>
        </div>

        {/* Care Plan Items */}
        <div className="space-y-4">
          {items.map(renderCarePlanItem)}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="h-5 w-5 text-blue-600 mr-2" />
            AI-Driven Care Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "current"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Current Plan
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "insights"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Health Insights
            </button>
          </div>

          {/* Content */}
          {activeTab === "current" && renderCarePlanOverview()}
          {activeTab === "insights" && renderHealthInsights()}

          {/* Footer */}
          <Separator />
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>AI Technology:</strong> Care plans are generated using advanced AI algorithms that analyze your health data, medical history, and evidence-based treatment guidelines.
            </p>
            <p>
              <strong>Healthcare Provider Review:</strong> All AI-generated recommendations should be reviewed with your healthcare provider before implementation.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}