import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, FileText, Download, Mail, Calendar } from "lucide-react";

interface ReportingModalProps {
  open: boolean;
  onClose: () => void;
}

const reportPeriods = [
  { value: "30days", label: "Last 30 days" },
  { value: "quarter", label: "Last quarter" },
  { value: "6months", label: "Last 6 months" },
  { value: "year", label: "Last year" },
  { value: "custom", label: "Custom date range" }
];

const departments = [
  { value: "all", label: "All departments" },
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales" },
  { value: "operations", label: "Operations" },
  { value: "marketing", label: "Marketing" },
  { value: "hr", label: "Human Resources" }
];

const employeeGroups = [
  { value: "all", label: "All employees" },
  { value: "fulltime", label: "Full-time only" },
  { value: "parttime", label: "Part-time only" },
  { value: "remote", label: "Remote workers" },
  { value: "onsite", label: "On-site workers" }
];

const reportSections = [
  {
    id: "participation",
    name: "Participation Overview",
    description: "Total engagement and enrollment statistics",
    defaultChecked: true
  },
  {
    id: "assessments",
    name: "Health Assessment Results",
    description: "Risk factors and health score trends",
    defaultChecked: true
  },
  {
    id: "utilization",
    name: "Program Utilization",
    description: "Service bookings and benefit usage",
    defaultChecked: true
  },
  {
    id: "cost",
    name: "Cost Analysis",
    description: "ROI and healthcare cost savings",
    defaultChecked: false
  },
  {
    id: "compliance",
    name: "Compliance Audit",
    description: "HIPAA compliance and consent tracking",
    defaultChecked: false
  }
];

export default function ReportingModal({ open, onClose }: ReportingModalProps) {
  const [reportPeriod, setReportPeriod] = useState("quarter");
  const [department, setDepartment] = useState("all");
  const [employeeGroup, setEmployeeGroup] = useState("all");
  const [selectedSections, setSelectedSections] = useState<string[]>(
    reportSections.filter(s => s.defaultChecked).map(s => s.id)
  );
  const [emailReport, setEmailReport] = useState(false);
  const [scheduleReport, setScheduleReport] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateReport = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("POST", "/api/reports", reportData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Your wellness report has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setSelectedSections(prev => 
      checked 
        ? [...prev, sectionId]
        : prev.filter(id => id !== sectionId)
    );
  };

  const handleGenerateReport = () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No Sections Selected",
        description: "Please select at least one report section.",
        variant: "destructive",
      });
      return;
    }

    const reportData = {
      name: `Wellness Report - ${new Date().toLocaleDateString()}`,
      type: "wellness",
      parameters: {
        period: reportPeriod,
        department,
        employeeGroup,
        sections: selectedSections,
        emailReport,
        scheduleReport
      }
    };

    generateReport.mutate(reportData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Generate Wellness Report</DialogTitle>
              <DialogDescription className="mt-2">
                Create comprehensive reports on employee wellness engagement and program effectiveness.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Report Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Parameters</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-period" className="text-sm font-medium text-gray-700 mb-2">
                    Report Period
                  </Label>
                  <Select value={reportPeriod} onValueChange={setReportPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportPeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="department-filter" className="text-sm font-medium text-gray-700 mb-2">
                    Department Filter
                  </Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="employee-group" className="text-sm font-medium text-gray-700 mb-2">
                    Employee Group
                  </Label>
                  <Select value={employeeGroup} onValueChange={setEmployeeGroup}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeGroups.map((group) => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Sections</h3>
              <div className="space-y-3">
                {reportSections.map((section) => (
                  <div key={section.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={(checked) => handleSectionToggle(section.id, !!checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={section.id} className="font-medium text-gray-900 cursor-pointer">
                        {section.name}
                      </Label>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
              <div className="space-y-4">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Total employees eligible for wellness programs</p>
                      <p>• Overall participation rate and trends</p>
                      <p>• Health assessment completion statistics</p>
                      <p>• Estimated healthcare cost savings</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Department-level engagement comparisons</p>
                      <p>• Program utilization metrics and trends</p>
                      <p>• Health risk score improvements</p>
                      <p>• Compliance and consent management status</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Report Options */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-report"
                  checked={emailReport}
                  onCheckedChange={setEmailReport}
                />
                <Label htmlFor="email-report" className="text-sm text-gray-700 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email report to stakeholders
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule-report"
                  checked={scheduleReport}
                  onCheckedChange={setScheduleReport}
                />
                <Label htmlFor="schedule-report" className="text-sm text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule monthly
                </Label>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="secondary">
                <FileText className="h-4 w-4 mr-2" />
                Preview PDF
              </Button>
              <Button 
                onClick={handleGenerateReport}
                disabled={generateReport.isPending || selectedSections.length === 0}
              >
                {generateReport.isPending ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
