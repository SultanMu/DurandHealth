import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar as CalendarIcon, Clock, MapPin, User, Phone, Video, Stethoscope } from "lucide-react";

interface AppointmentBookingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AppointmentBookingModal({ open, onClose }: AppointmentBookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [formData, setFormData] = useState({
    appointmentType: "",
    serviceCategory: "",
    provider: "",
    location: "",
    preferredTime: "",
    notes: "",
    contactMethod: "phone",
    urgency: "routine",
    symptoms: "",
    reason: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const appointmentTypes = [
    { value: "general_checkup", label: "General Checkup", icon: Stethoscope, category: "primary" },
    { value: "specialist_consultation", label: "Specialist Consultation", icon: User, category: "specialty" },
    { value: "follow_up", label: "Follow-up Appointment", icon: Clock, category: "follow-up" },
    { value: "emergency", label: "Emergency Consultation", icon: Phone, category: "urgent" },
    { value: "screening", label: "Health Screening", icon: Stethoscope, category: "preventive" },
    { value: "vaccination", label: "Vaccination", icon: Stethoscope, category: "preventive" },
    { value: "mental_health", label: "Mental Health", icon: User, category: "specialty" },
    { value: "telehealth", label: "Telehealth Consultation", icon: Video, category: "virtual" },
  ];

  const serviceProviders = [
    { name: "Dr. Sarah Johnson", specialty: "Family Medicine", availability: "Mon-Fri 9AM-5PM" },
    { name: "Dr. Michael Chen", specialty: "Cardiology", availability: "Tue, Thu 10AM-4PM" },
    { name: "Dr. Emily Rodriguez", specialty: "Dermatology", availability: "Wed, Fri 1PM-6PM" },
    { name: "Dr. David Kim", specialty: "Mental Health", availability: "Mon-Wed 9AM-3PM" },
    { name: "Nurse Practitioner Lisa Wong", specialty: "Primary Care", availability: "Mon-Fri 8AM-6PM" },
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  const submitAppointment = useMutation({
    mutationFn: async (data: any) => {
      const appointmentData = {
        ...data,
        date: selectedDate?.toISOString(),
        time: selectedTimeSlot,
        status: "scheduled",
      };
      const response = await apiRequest("POST", "/api/appointments/", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been scheduled successfully. You'll receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep(1);
    setSelectedDate(undefined);
    setSelectedTimeSlot("");
    setFormData({
      appointmentType: "",
      serviceCategory: "",
      provider: "",
      location: "",
      preferredTime: "",
      notes: "",
      contactMethod: "phone",
      urgency: "routine",
      symptoms: "",
      reason: "",
    });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    submitAppointment.mutate(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      routine: "bg-green-100 text-green-800",
      urgent: "bg-yellow-100 text-yellow-800",
      emergency: "bg-red-100 text-red-800",
    };
    return colors[urgency as keyof typeof colors] || colors.routine;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">Select Appointment Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {appointmentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.appointmentType === type.value
                          ? "ring-2 ring-medical-blue bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        updateFormData("appointmentType", type.value);
                        updateFormData("serviceCategory", type.category);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-medical-blue" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{type.label}</h3>
                            <p className="text-xs text-gray-600 capitalize">{type.category}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={formData.urgency} onValueChange={(value) => updateFormData("urgency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine (within 2 weeks)</SelectItem>
                  <SelectItem value="urgent">Urgent (within 3 days)</SelectItem>
                  <SelectItem value="emergency">Emergency (today)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => updateFormData("reason", e.target.value)}
                placeholder="Briefly describe the reason for your appointment..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="symptoms">Current Symptoms (if any)</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => updateFormData("symptoms", e.target.value)}
                placeholder="Describe any symptoms you're experiencing..."
                rows={2}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">Select Healthcare Provider</Label>
              <div className="space-y-3">
                {serviceProviders.map((provider) => (
                  <Card
                    key={provider.name}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.provider === provider.name
                        ? "ring-2 ring-medical-blue bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => updateFormData("provider", provider.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.specialty}</p>
                          <p className="text-xs text-gray-500">{provider.availability}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Available
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="location">Preferred Location</Label>
              <Select value={formData.location} onValueChange={(value) => updateFormData("location", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_clinic">Main Clinic - Downtown</SelectItem>
                  <SelectItem value="north_branch">North Branch - Uptown</SelectItem>
                  <SelectItem value="south_branch">South Branch - Midtown</SelectItem>
                  <SelectItem value="telehealth">Virtual/Telehealth</SelectItem>
                  <SelectItem value="home_visit">Home Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contactMethod">Preferred Contact Method</Label>
              <Select value={formData.contactMethod} onValueChange={(value) => updateFormData("contactMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">Text Message</SelectItem>
                  <SelectItem value="app">App Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Any additional information or special requests..."
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">Select Date & Time</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Choose Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-md border"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Available Time Slots</Label>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className="justify-start"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Please select a date first</p>
                  )}
                </div>
              </div>
            </div>

            {selectedDate && selectedTimeSlot && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Type:</strong> {appointmentTypes.find(t => t.value === formData.appointmentType)?.label}</p>
                    <p><strong>Provider:</strong> {formData.provider}</p>
                    <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedTimeSlot}</p>
                    <p><strong>Location:</strong> {formData.location}</p>
                    <Badge className={getUrgencyBadge(formData.urgency)}>
                      {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.appointmentType && formData.reason;
      case 2:
        return formData.provider && formData.location;
      case 3:
        return selectedDate && selectedTimeSlot;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Healthcare Appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? "bg-medical-blue text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? "bg-medical-blue" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {step === 1 && "Service Details"}
              {step === 2 && "Provider & Preferences"}
              {step === 3 && "Date & Time Selection"}
            </h3>
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
            
            {step < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={!canProceed() || submitAppointment.isPending}
              >
                {submitAppointment.isPending ? "Booking..." : "Book Appointment"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}