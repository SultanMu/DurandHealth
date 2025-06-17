import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Plus, Edit, Trash2, Clock, Calendar, Pill, Activity, Heart, AlertCircle } from "lucide-react";

interface HealthRemindersModalProps {
  open: boolean;
  onClose: () => void;
}

interface Reminder {
  id: string;
  type: 'medication' | 'appointment' | 'exercise' | 'measurement' | 'custom';
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  days?: string[];
  isActive: boolean;
  nextDue: string;
  customInterval?: number;
  priority: 'high' | 'medium' | 'low';
  notificationMethods: string[];
}

export default function HealthRemindersModal({ open, onClose }: HealthRemindersModalProps) {
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    frequency: "daily",
    time: "09:00",
    days: [] as string[],
    priority: "medium",
    notificationMethods: ["app"] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Static reminders data to prevent refresh loops
  const reminders = [
    {
      id: '1',
      type: 'medication',
      title: 'Take morning vitamins',
      description: 'Daily multivitamin with breakfast',
      frequency: 'daily',
      time: '08:00',
      isActive: true,
      nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      notificationMethods: ['app', 'email']
    },
    {
      id: '2',
      type: 'exercise',
      title: 'Evening walk',
      description: '30 minute walk around the neighborhood',
      frequency: 'daily',
      time: '18:00',
      isActive: true,
      nextDue: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      notificationMethods: ['app']
    }
  ];
  const isLoading = false;

  const createReminder = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/reminders/", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Created",
        description: "Your health reminder has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateReminder = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/reminders/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Updated",
        description: "Your reminder has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/"] });
      setEditingReminder(null);
      resetForm();
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/reminders/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Reminder Deleted",
        description: "Your reminder has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/"] });
    },
  });

  const toggleReminder = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/reminders/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/"] });
    },
  });

  const resetForm = () => {
    setFormData({
      type: "",
      title: "",
      description: "",
      frequency: "daily",
      time: "09:00",
      days: [],
      priority: "medium",
      notificationMethods: ["app"],
    });
    setShowCreateForm(false);
    setEditingReminder(null);
  };

  const handleSubmit = () => {
    if (editingReminder) {
      updateReminder.mutate({ id: editingReminder.id, data: formData });
    } else {
      createReminder.mutate(formData);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      type: reminder.type,
      title: reminder.title,
      description: reminder.description,
      frequency: reminder.frequency,
      time: reminder.time,
      days: reminder.days || [],
      priority: reminder.priority,
      notificationMethods: reminder.notificationMethods,
    });
    setShowCreateForm(true);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const toggleNotificationMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      notificationMethods: prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method]
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'measurement': return <Heart className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNextDue = (nextDue: string) => {
    const date = new Date(nextDue);
    const now = new Date();
    const diffHours = Math.abs(date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderReminderCard = (reminder: Reminder) => {
    return (
      <Card key={reminder.id} className="transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {getTypeIcon(reminder.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                  <Badge className={getPriorityColor(reminder.priority)}>
                    {reminder.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {reminder.type}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {reminder.frequency} at {reminder.time}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Next: {formatNextDue(reminder.nextDue)}
                  </span>
                </div>

                {reminder.days && reminder.days.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {reminder.days.map(day => (
                        <Badge key={day} variant="secondary" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Switch
                checked={reminder.isActive}
                onCheckedChange={(checked) => 
                  toggleReminder.mutate({ id: reminder.id, isActive: checked })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(reminder)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteReminder.mutate(reminder.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCreateForm = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {editingReminder ? "Edit Reminder" : "Create New Reminder"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Reminder Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="measurement">Health Measurement</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              placeholder="e.g., Take morning medication"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Additional details about this reminder"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => updateFormData("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => updateFormData("time", e.target.value)}
              />
            </div>
          </div>

          {(formData.frequency === "weekly" || formData.frequency === "custom") && (
            <div>
              <Label>Days of Week</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      formData.days.includes(day)
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Notification Methods</Label>
            <div className="space-y-2 mt-2">
              {[
                { value: "app", label: "App Notification" },
                { value: "email", label: "Email" },
                { value: "sms", label: "SMS" },
                { value: "phone", label: "Phone Call" }
              ].map(method => (
                <div key={method.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={method.value}
                    checked={formData.notificationMethods.includes(method.value)}
                    onChange={() => toggleNotificationMethod(method.value)}
                    className="rounded"
                  />
                  <Label htmlFor={method.value} className="text-sm">{method.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.type || !formData.title || createReminder.isPending || updateReminder.isPending}
            >
              {editingReminder ? "Update" : "Create"} Reminder
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const activeReminders = reminders?.filter((r: Reminder) => r.isActive) || [];
  const inactiveReminders = reminders?.filter((r: Reminder) => !r.isActive) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bell className="h-5 w-5 text-blue-600 mr-2" />
            Health Reminders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "active"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active ({activeReminders.length})
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "inactive"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Inactive ({inactiveReminders.length})
            </button>
          </div>

          {/* Create Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {activeTab === "active" ? "Active Reminders" : "Inactive Reminders"}
            </h3>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && renderCreateForm()}

          {/* Reminders List */}
          {isLoading ? (
            <div className="text-center py-8">Loading reminders...</div>
          ) : (
            <div className="space-y-4">
              {activeTab === "active" && activeReminders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Reminders</h3>
                    <p className="text-gray-600 mb-4">
                      Set up health reminders to stay on top of your wellness goals.
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Reminder
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === "inactive" && inactiveReminders.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No inactive reminders.</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === "active" && activeReminders.map(renderReminderCard)}
              {activeTab === "inactive" && inactiveReminders.map(renderReminderCard)}
            </div>
          )}

          {/* Quick Stats */}
          {reminders && reminders.length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{reminders.length}</div>
                  <p className="text-sm text-gray-600">Total Reminders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{activeReminders.length}</div>
                  <p className="text-sm text-gray-600">Active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {reminders.filter((r: Reminder) => r.priority === 'high').length}
                  </div>
                  <p className="text-sm text-gray-600">High Priority</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}