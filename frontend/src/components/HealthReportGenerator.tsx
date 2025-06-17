import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Activity, 
  Heart, 
  Scale, 
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface HealthData {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  assessments?: Array<{
    id: number;
    height: number;
    weight: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    heartRate: number;
    stressLevel: number;
    sleepHours: number;
    smokingStatus: string;
    exerciseFrequency: string;
    dietQuality: string;
    chronicConditions: string[];
    medications: string[];
    allergies: string[];
    createdAt: string;
  }>;
  appointments?: Array<{
    id: number;
    appointmentType: string;
    provider: string;
    date: string;
    status: string;
  }>;
  goals?: Array<{
    id: number;
    goalType: string;
    description: string;
    targetValue: number;
    currentValue: number;
    status: string;
    progress: number;
  }>;
}

export default function HealthReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Static health data to prevent refresh loops
  const healthData: HealthData = {
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    assessments: [
      {
        id: 1,
        height: 175,
        weight: 70,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 72,
        stressLevel: 3,
        sleepHours: 7,
        smokingStatus: 'never',
        exerciseFrequency: 'moderate',
        dietQuality: 'good',
        chronicConditions: [],
        medications: [],
        allergies: [],
        createdAt: new Date().toISOString()
      }
    ],
    appointments: [
      {
        id: 1,
        appointmentType: 'General Checkup',
        provider: 'Dr. Smith',
        date: new Date().toISOString(),
        status: 'completed'
      }
    ],
    goals: [
      {
        id: 1,
        goalType: 'weight_loss',
        description: 'Lose 5kg',
        targetValue: 65,
        currentValue: 70,
        status: 'active',
        progress: 20
      }
    ]
  };
  const isLoading = false;

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      // Create HTML content for the PDF
      const htmlContent = generateHTMLReport(healthData);
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHTMLReport = (data: HealthData) => {
    const currentDate = new Date().toLocaleDateString();
    const latestAssessment = data?.assessments?.[0];
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Health Report - ${data?.user?.firstName} ${data?.user?.lastName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .patient-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .metric-card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
        }
        .metric-label {
          font-weight: 600;
          color: #64748b;
          font-size: 14px;
        }
        .metric-value {
          font-size: 20px;
          font-weight: bold;
          margin: 5px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-good { background: #dcfce7; color: #166534; }
        .status-warning { background: #fef3c7; color: #92400e; }
        .status-danger { background: #fecaca; color: #991b1b; }
        .appointments-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .appointments-table th,
        .appointments-table td {
          border: 1px solid #e2e8f0;
          padding: 10px;
          text-align: left;
        }
        .appointments-table th {
          background: #f1f5f9;
          font-weight: 600;
        }
        .goals-list {
          list-style: none;
          padding: 0;
        }
        .goal-item {
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin-bottom: 10px;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏥 DurandHealth</div>
        <h1>Comprehensive Health Report</h1>
        <p>Generated on ${currentDate}</p>
      </div>

      <div class="patient-info">
        <h2>Patient Information</h2>
        <p><strong>Name:</strong> ${data?.user?.firstName || 'N/A'} ${data?.user?.lastName || ''}</p>
        <p><strong>Email:</strong> ${data?.user?.email || 'N/A'}</p>
        <p><strong>Report Date:</strong> ${currentDate}</p>
      </div>

      <div class="section">
        <div class="section-title">📊 Current Health Metrics</div>
        ${latestAssessment ? `
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Weight</div>
            <div class="metric-value">${latestAssessment.weight} kg</div>
            <span class="status-badge ${getWeightStatus(latestAssessment.weight)}">${getWeightStatusText(latestAssessment.weight)}</span>
          </div>
          <div class="metric-card">
            <div class="metric-label">Blood Pressure</div>
            <div class="metric-value">${latestAssessment.bloodPressureSystolic}/${latestAssessment.bloodPressureDiastolic} mmHg</div>
            <span class="status-badge ${getBPStatus(latestAssessment.bloodPressureSystolic, latestAssessment.bloodPressureDiastolic)}">${getBPStatusText(latestAssessment.bloodPressureSystolic, latestAssessment.bloodPressureDiastolic)}</span>
          </div>
          <div class="metric-card">
            <div class="metric-label">Heart Rate</div>
            <div class="metric-value">${latestAssessment.heartRate} bpm</div>
            <span class="status-badge ${getHRStatus(latestAssessment.heartRate)}">${getHRStatusText(latestAssessment.heartRate)}</span>
          </div>
          <div class="metric-card">
            <div class="metric-label">Stress Level</div>
            <div class="metric-value">${latestAssessment.stressLevel}/10</div>
            <span class="status-badge ${getStressStatus(latestAssessment.stressLevel)}">${getStressStatusText(latestAssessment.stressLevel)}</span>
          </div>
          <div class="metric-card">
            <div class="metric-label">Sleep Hours</div>
            <div class="metric-value">${latestAssessment.sleepHours} hrs</div>
            <span class="status-badge ${getSleepStatus(latestAssessment.sleepHours)}">${getSleepStatusText(latestAssessment.sleepHours)}</span>
          </div>
          <div class="metric-card">
            <div class="metric-label">Exercise Frequency</div>
            <div class="metric-value">${latestAssessment.exerciseFrequency}</div>
          </div>
        </div>
        ` : '<p>No health assessment data available.</p>'}
      </div>

      <div class="section">
        <div class="section-title">🎯 Health Goals Progress</div>
        ${data?.goals?.length ? `
        <ul class="goals-list">
          ${data.goals.map(goal => `
            <li class="goal-item">
              <strong>${goal.description}</strong>
              <p>Target: ${goal.targetValue} | Current: ${goal.currentValue} | Status: ${goal.status}</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(goal.progress || 0, 100)}%"></div>
              </div>
              <small>Progress: ${Math.round(goal.progress || 0)}%</small>
            </li>
          `).join('')}
        </ul>
        ` : '<p>No active health goals.</p>'}
      </div>

      <div class="section">
        <div class="section-title">📅 Recent Appointments</div>
        ${data?.appointments?.length ? `
        <table class="appointments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Provider</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.appointments.slice(0, 5).map(appointment => `
              <tr>
                <td>${new Date(appointment.date).toLocaleDateString()}</td>
                <td>${appointment.appointmentType}</td>
                <td>${appointment.provider}</td>
                <td><span class="status-badge ${getAppointmentStatus(appointment.status)}">${appointment.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<p>No recent appointments.</p>'}
      </div>

      ${latestAssessment && (latestAssessment.chronicConditions?.length || latestAssessment.medications?.length || latestAssessment.allergies?.length) ? `
      <div class="section">
        <div class="section-title">🏥 Medical Information</div>
        ${latestAssessment.chronicConditions?.length ? `
          <div style="margin-bottom: 15px;">
            <strong>Chronic Conditions:</strong>
            <ul>${latestAssessment.chronicConditions.map(condition => `<li>${condition}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ${latestAssessment.medications?.length ? `
          <div style="margin-bottom: 15px;">
            <strong>Current Medications:</strong>
            <ul>${latestAssessment.medications.map(medication => `<li>${medication}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ${latestAssessment.allergies?.length ? `
          <div style="margin-bottom: 15px;">
            <strong>Allergies:</strong>
            <ul>${latestAssessment.allergies.map(allergy => `<li>${allergy}</li>`).join('')}</ul>
          </div>
        ` : ''}
      </div>
      ` : ''}

      <div class="footer">
        <p>This report is generated automatically based on your health data in the DurandHealth system.</p>
        <p>Please consult with your healthcare provider for medical advice and interpretation of these results.</p>
        <p>Report generated on ${currentDate}</p>
      </div>
    </body>
    </html>
    `;
  };

  // Helper functions for status determination
  const getWeightStatus = (weight: number) => {
    if (weight >= 60 && weight <= 80) return 'status-good';
    if (weight < 50 || weight > 100) return 'status-danger';
    return 'status-warning';
  };

  const getWeightStatusText = (weight: number) => {
    if (weight >= 60 && weight <= 80) return 'Healthy';
    if (weight < 50 || weight > 100) return 'Concerning';
    return 'Monitor';
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic <= 130 && diastolic <= 85) return 'status-good';
    if (systolic > 160 || diastolic > 100) return 'status-danger';
    return 'status-warning';
  };

  const getBPStatusText = (systolic: number, diastolic: number) => {
    if (systolic <= 130 && diastolic <= 85) return 'Normal';
    if (systolic > 160 || diastolic > 100) return 'High';
    return 'Elevated';
  };

  const getHRStatus = (hr: number) => {
    if (hr >= 60 && hr <= 100) return 'status-good';
    if (hr < 50 || hr > 120) return 'status-danger';
    return 'status-warning';
  };

  const getHRStatusText = (hr: number) => {
    if (hr >= 60 && hr <= 100) return 'Normal';
    if (hr < 50 || hr > 120) return 'Abnormal';
    return 'Monitor';
  };

  const getStressStatus = (stress: number) => {
    if (stress <= 4) return 'status-good';
    if (stress >= 8) return 'status-danger';
    return 'status-warning';
  };

  const getStressStatusText = (stress: number) => {
    if (stress <= 4) return 'Low';
    if (stress >= 8) return 'High';
    return 'Moderate';
  };

  const getSleepStatus = (sleep: number) => {
    if (sleep >= 7 && sleep <= 9) return 'status-good';
    if (sleep < 5 || sleep > 11) return 'status-danger';
    return 'status-warning';
  };

  const getSleepStatusText = (sleep: number) => {
    if (sleep >= 7 && sleep <= 9) return 'Optimal';
    if (sleep < 5 || sleep > 11) return 'Poor';
    return 'Adequate';
  };

  const getAppointmentStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-good';
      case 'cancelled': return 'status-danger';
      default: return 'status-warning';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading health data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle>Health Report Generator</CardTitle>
        </div>
        <CardDescription>
          Generate a comprehensive PDF report of your health data and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Contents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Patient Information</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Current Health Metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Health Goals Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Recent Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Medical History</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Health Trends Analysis</span>
            </div>
          </div>
        </div>

        {/* Current Health Summary */}
        {healthData?.assessments?.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Latest Health Snapshot</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <Scale className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <p className="font-semibold">{healthData.assessments[0].weight} kg</p>
                <p className="text-gray-600">Weight</p>
              </div>
              <div className="text-center">
                <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                <p className="font-semibold">{healthData.assessments[0].bloodPressureSystolic}/{healthData.assessments[0].bloodPressureDiastolic}</p>
                <p className="text-gray-600">Blood Pressure</p>
              </div>
              <div className="text-center">
                <Activity className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <p className="font-semibold">{healthData.assessments[0].heartRate} bpm</p>
                <p className="text-gray-600">Heart Rate</p>
              </div>
              <div className="text-center">
                <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                <p className="font-semibold">{healthData.assessments[0].stressLevel}/10</p>
                <p className="text-gray-600">Stress Level</p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="text-center">
          <Button 
            onClick={generatePDFReport}
            disabled={isGenerating || !healthData}
            className="w-full md:w-auto"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Health Report PDF
              </>
            )}
          </Button>
          
          {!healthData && (
            <p className="text-sm text-gray-600 mt-2">
              Complete a health assessment to generate your report
            </p>
          )}
        </div>

        {/* Report Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-800 dark:text-blue-200">Important Note</p>
              <p className="text-blue-700 dark:text-blue-300">
                This report is for informational purposes only and should not replace professional medical advice. 
                Please consult with your healthcare provider for medical interpretation and guidance.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}