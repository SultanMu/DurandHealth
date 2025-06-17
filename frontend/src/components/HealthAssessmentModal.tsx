import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Brain, Activity, Shield } from "lucide-react";

interface HealthAssessmentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HealthAssessmentModal({ open, onClose }: HealthAssessmentModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    height: "",
    weight: "",
    age: "",
    gender: "",
    
    // Vital Signs
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    
    // Lifestyle
    smokingStatus: "",
    exerciseFrequency: "",
    dietQuality: "",
    stressLevel: "",
    sleepHours: "",
    
    // Medical History
    chronicConditions: [] as string[],
    medications: [] as string[],
    allergies: [] as string[],
    familyHistory: "",
    
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitAssessment = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/health-assessments/", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Completed",
        description: "Your health assessment has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/health-assessments"] });
      onClose();
      setStep(1);
      setFormData({
        height: "", weight: "", age: "", gender: "",
        bloodPressureSystolic: "", bloodPressureDiastolic: "", heartRate: "",
        smokingStatus: "", exerciseFrequency: "", dietQuality: "", stressLevel: "", sleepHours: "",
        chronicConditions: [], medications: [], allergies: [], familyHistory: "",
        emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assessment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const processedData = {
      ...formData,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      bloodPressureSystolic: parseInt(formData.bloodPressureSystolic),
      bloodPressureDiastolic: parseInt(formData.bloodPressureDiastolic),
      heartRate: parseInt(formData.heartRate),
      stressLevel: parseInt(formData.stressLevel),
      sleepHours: parseFloat(formData.sleepHours),
      emergencyContact: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relation: formData.emergencyContactRelation,
      },
    };
    submitAssessment.mutate(processedData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }));
  };

  const commonConditions = [
    "Diabetes", "Hypertension", "Heart Disease", "Asthma", "Arthritis",
    "Depression", "Anxiety", "High Cholesterol", "Obesity", "Thyroid Disorder"
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 text-medical-blue mr-2" />
                Personal & Vital Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateFormData("height", e.target.value)}
                    placeholder="175"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateFormData("weight", e.target.value)}
                    placeholder="70"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="systolic">Blood Pressure (Systolic)</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={formData.bloodPressureSystolic}
                    onChange={(e) => updateFormData("bloodPressureSystolic", e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic">Blood Pressure (Diastolic)</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={formData.bloodPressureDiastolic}
                    onChange={(e) => updateFormData("bloodPressureDiastolic", e.target.value)}
                    placeholder="80"
                  />
                </div>
                <div>
                  <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => updateFormData("heartRate", e.target.value)}
                    placeholder="72"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 text-health-green mr-2" />
                Lifestyle Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="smoking">Smoking Status</Label>
                <Select value={formData.smokingStatus} onValueChange={(value) => updateFormData("smokingStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select smoking status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never smoked</SelectItem>
                    <SelectItem value="former">Former smoker</SelectItem>
                    <SelectItem value="current">Current smoker</SelectItem>
                    <SelectItem value="occasional">Occasional smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="exercise">Exercise Frequency</Label>
                <Select value={formData.exerciseFrequency} onValueChange={(value) => updateFormData("exerciseFrequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No regular exercise</SelectItem>
                    <SelectItem value="1-2_times">1-2 times per week</SelectItem>
                    <SelectItem value="3-4_times">3-4 times per week</SelectItem>
                    <SelectItem value="5_plus_times">5+ times per week</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="diet">Diet Quality</Label>
                <Select value={formData.dietQuality} onValueChange={(value) => updateFormData("dietQuality", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select diet quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor (mostly processed foods)</SelectItem>
                    <SelectItem value="fair">Fair (some healthy foods)</SelectItem>
                    <SelectItem value="good">Good (balanced diet)</SelectItem>
                    <SelectItem value="excellent">Excellent (mostly whole foods)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stress">Stress Level (1-10)</Label>
                  <Input
                    id="stress"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.stressLevel}
                    onChange={(e) => updateFormData("stressLevel", e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="sleep">Sleep Hours per Night</Label>
                  <Input
                    id="sleep"
                    type="number"
                    step="0.5"
                    value={formData.sleepHours}
                    onChange={(e) => updateFormData("sleepHours", e.target.value)}
                    placeholder="8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 text-alert-orange mr-2" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Chronic Conditions (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {commonConditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={formData.chronicConditions.includes(condition)}
                        onCheckedChange={() => toggleCondition(condition)}
                      />
                      <Label htmlFor={condition} className="text-sm">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="medications">Current Medications (one per line)</Label>
                <Textarea
                  id="medications"
                  value={formData.medications.join('\n')}
                  onChange={(e) => updateFormData("medications", e.target.value.split('\n').filter(m => m.trim()))}
                  placeholder="List your current medications..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies (one per line)</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies.join('\n')}
                  onChange={(e) => updateFormData("allergies", e.target.value.split('\n').filter(a => a.trim()))}
                  placeholder="List your allergies..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="familyHistory">Family Medical History</Label>
                <Textarea
                  id="familyHistory"
                  value={formData.familyHistory}
                  onChange={(e) => updateFormData("familyHistory", e.target.value)}
                  placeholder="Describe relevant family medical history..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-purple-500 mr-2" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContactName}
                  onChange={(e) => updateFormData("emergencyContactName", e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => updateFormData("emergencyContactPhone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <Label htmlFor="emergencyRelation">Relationship</Label>
                <Select value={formData.emergencyContactRelation} onValueChange={(value) => updateFormData("emergencyContactRelation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalized Health Assessment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <Progress value={(step / 4) * 100} className="h-2" />
          </div>

          {/* Form Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 4 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={submitAssessment.isPending}
              >
                {submitAssessment.isPending ? "Submitting..." : "Complete Assessment"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}