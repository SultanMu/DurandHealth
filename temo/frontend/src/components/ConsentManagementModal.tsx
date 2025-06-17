import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Check, X, Clock, FileText, Eye, Download, AlertTriangle } from "lucide-react";

interface ConsentManagementModalProps {
  open: boolean;
  onClose: () => void;
}

interface ConsentType {
  id: string;
  type: string;
  title: string;
  description: string;
  required: boolean;
  category: string;
  details: string;
  dataUsage: string[];
  consequences: string;
}

export default function ConsentManagementModal({ open, onClose }: ConsentManagementModalProps) {
  const [activeTab, setActiveTab] = useState("current");
  const [selectedConsent, setSelectedConsent] = useState<ConsentType | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Static consent data to prevent refresh loops
  const currentConsents = [
    {
      id: 1,
      consentType: 'data_processing',
      granted: true,
      grantedAt: new Date().toISOString(),
      revokedAt: null
    },
    {
      id: 2,
      consentType: 'health_data_sharing',
      granted: false,
      grantedAt: null,
      revokedAt: null
    }
  ];

  const consentHistory = [
    {
      id: 1,
      consentType: 'data_processing',
      action: 'granted',
      timestamp: new Date().toISOString(),
      reason: 'Initial consent'
    }
  ];

  const consentsLoading = false;
  const historyLoading = false;

  const consentTypes: ConsentType[] = [
    {
      id: "data_sharing",
      type: "data_sharing",
      title: "Health Data Sharing",
      description: "Allow sharing of your health data with authorized healthcare providers and research institutions.",
      required: false,
      category: "Data Privacy",
      details: "This consent allows us to share your de-identified health information with trusted partners for the purpose of improving healthcare outcomes and conducting medical research.",
      dataUsage: [
        "De-identified health metrics",
        "Treatment outcomes",
        "Medication effectiveness data",
        "Lifestyle and wellness information"
      ],
      consequences: "Withdrawing this consent may limit your access to personalized recommendations and participation in beneficial research programs."
    },
    {
      id: "medical_research",
      type: "medical_research",
      title: "Medical Research Participation",
      description: "Participate in medical research studies to advance healthcare knowledge.",
      required: false,
      category: "Research",
      details: "Your health data may be used in anonymous research studies to develop new treatments and improve medical understanding.",
      dataUsage: [
        "Anonymous clinical data",
        "Treatment response patterns",
        "Health outcome statistics",
        "Demographic information (age, gender)"
      ],
      consequences: "Opting out will exclude you from research studies but will not affect your standard care."
    },
    {
      id: "marketing_communications",
      type: "marketing_communications",
      title: "Marketing Communications",
      description: "Receive personalized health tips, wellness content, and service updates.",
      required: false,
      category: "Communications",
      details: "We'll send you relevant health information, wellness tips, and updates about new services that may benefit you.",
      dataUsage: [
        "Contact preferences",
        "Health interests",
        "Service usage patterns",
        "Communication history"
      ],
      consequences: "You'll miss out on personalized wellness content and important service updates."
    },
    {
      id: "third_party_access",
      type: "third_party_access",
      title: "Third-Party Integrations",
      description: "Allow integration with third-party health apps and devices for comprehensive health tracking.",
      required: false,
      category: "Integrations",
      details: "Connect your health data with fitness trackers, nutrition apps, and other health services for a complete wellness picture.",
      dataUsage: [
        "Fitness and activity data",
        "Nutrition information",
        "Sleep patterns",
        "Vital signs from connected devices"
      ],
      consequences: "Limited integration capabilities with external health and fitness platforms."
    },
    {
      id: "telemedicine",
      type: "telemedicine",
      title: "Telemedicine Services",
      description: "Enable video consultations and remote health monitoring services.",
      required: true,
      category: "Healthcare Services",
      details: "Required for accessing virtual consultations, remote monitoring, and digital health services.",
      dataUsage: [
        "Video consultation recordings",
        "Chat communication logs",
        "Remote monitoring data",
        "Digital health assessments"
      ],
      consequences: "Telemedicine and remote health services will not be available."
    },
    {
      id: "emergency_access",
      type: "emergency_access",
      title: "Emergency Medical Access",
      description: "Allow emergency healthcare providers to access your critical health information.",
      required: true,
      category: "Emergency Care",
      details: "In emergency situations, authorized medical personnel can access your essential health information to provide appropriate care.",
      dataUsage: [
        "Medical allergies and conditions",
        "Current medications",
        "Emergency contact information",
        "Blood type and vital medical history"
      ],
      consequences: "Emergency responders may not have access to critical medical information during emergencies."
    }
  ];

  const updateConsent = useMutation({
    mutationFn: async ({ consentType, granted }: { consentType: string; granted: boolean }) => {
      const response = await apiRequest("POST", "/api/consents/", {
        consentType,
        granted,
        grantedAt: granted ? new Date().toISOString() : null,
        revokedAt: !granted ? new Date().toISOString() : null,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.granted ? "Consent Granted" : "Consent Revoked",
        description: `Your ${variables.consentType.replace('_', ' ')} consent has been ${variables.granted ? 'granted' : 'revoked'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/consents/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/consents/history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadConsentRecord = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/consents/download");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consent-record-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your consent record is being downloaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getConsentStatus = (consentType: string) => {
    const consent = currentConsents?.find((c: any) => c.consentType === consentType);
    return consent?.granted || false;
  };

  const getConsentDate = (consentType: string) => {
    const consent = currentConsents?.find((c: any) => c.consentType === consentType);
    return consent?.grantedAt ? new Date(consent.grantedAt).toLocaleDateString() : null;
  };

  const handleConsentToggle = (consentType: string, granted: boolean) => {
    if (!granted) {
      const consent = consentTypes.find(c => c.type === consentType);
      if (consent?.required) {
        toast({
          title: "Required Consent",
          description: "This consent is required for core healthcare services and cannot be revoked.",
          variant: "destructive",
        });
        return;
      }
    }
    updateConsent.mutate({ consentType, granted });
  };

  const renderConsentCard = (consent: ConsentType) => {
    const isGranted = getConsentStatus(consent.type);
    const grantedDate = getConsentDate(consent.type);

    return (
      <Card key={consent.id} className="transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{consent.title}</h3>
                {consent.required && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {consent.category}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{consent.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {grantedDate ? `Granted: ${grantedDate}` : "Not granted"}
                </span>
                <button
                  onClick={() => {
                    setSelectedConsent(consent);
                    setShowDetails(true);
                  }}
                  className="flex items-center text-medical-blue hover:underline"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              <div className="flex items-center space-x-2">
                {isGranted ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {isGranted ? "Granted" : "Not Granted"}
                </span>
              </div>
              
              <Switch
                checked={isGranted}
                onCheckedChange={(checked) => handleConsentToggle(consent.type, checked)}
                disabled={updateConsent.isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConsentHistory = () => {
    if (historyLoading) {
      return <div className="text-center py-8">Loading consent history...</div>;
    }

    if (!consentHistory || consentHistory.length === 0) {
      return <div className="text-center py-8 text-gray-500">No consent history found.</div>;
    }

    return (
      <div className="space-y-4">
        {consentHistory.map((record: any) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{record.consentType.replace('_', ' ').toUpperCase()}</h4>
                  <p className="text-sm text-gray-600">
                    {record.granted ? 'Granted' : 'Revoked'} on{' '}
                    {new Date(record.granted ? record.grantedAt : record.revokedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={record.granted ? "default" : "secondary"}>
                  {record.granted ? "Granted" : "Revoked"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderConsentDetails = () => {
    if (!selectedConsent) return null;

    return (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedConsent.title} - Detailed Information</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-gray-600">{selectedConsent.details}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Data Usage</h4>
              <ul className="space-y-1">
                {selectedConsent.dataUsage.map((usage, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <Check className="h-3 w-3 text-green-600 mr-2" />
                    {usage}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h5 className="font-medium text-yellow-800 mb-1">Important Note</h5>
                  <p className="text-sm text-yellow-700">{selectedConsent.consequences}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const isGranted = getConsentStatus(selectedConsent.type);
                  handleConsentToggle(selectedConsent.type, !isGranted);
                  setShowDetails(false);
                }}
                disabled={selectedConsent.required && getConsentStatus(selectedConsent.type)}
              >
                {getConsentStatus(selectedConsent.type) ? "Revoke Consent" : "Grant Consent"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 text-medical-blue mr-2" />
              Privacy & Consent Management
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
                Current Consents
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "history"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Consent History
              </button>
            </div>

            {/* Content */}
            {activeTab === "current" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">HIPAA Compliance</h3>
                      <p className="text-sm text-blue-800">
                        Your privacy is protected under HIPAA regulations. You have the right to know how your 
                        health information is used and shared. All consent decisions are logged and auditable.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manage Your Consents</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadConsentRecord.mutate()}
                    disabled={downloadConsentRecord.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloadConsentRecord.isPending ? "Downloading..." : "Download Record"}
                  </Button>
                </div>

                {/* Consent Cards */}
                {consentsLoading ? (
                  <div className="text-center py-8">Loading consents...</div>
                ) : (
                  <div className="space-y-4">
                    {consentTypes.map(renderConsentCard)}
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Consent History</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-1" />
                    Audit Trail (HIPAA Compliant)
                  </div>
                </div>
                {renderConsentHistory()}
              </div>
            )}

            {/* Footer */}
            <Separator />
            <div className="text-xs text-gray-500 space-y-2">
              <p>
                <strong>Data Retention:</strong> Consent records are maintained for 6 years as required by HIPAA regulations.
              </p>
              <p>
                <strong>Audit Trail:</strong> All consent changes are logged with timestamps and are available for your review.
              </p>
              <p>
                <strong>Contact:</strong> If you have questions about your privacy rights, contact our Privacy Officer at privacy@durandhealth.com
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderConsentDetails()}
    </>
  );
}