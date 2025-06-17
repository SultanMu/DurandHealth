import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Activity, Heart, Scale, Zap } from 'lucide-react';

interface HealthDataPoint {
  date: string;
  weight?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  stressLevel?: number;
  sleepHours?: number;
}

interface HealthTrendsChartProps {
  data: HealthDataPoint[];
}

const metricConfigs = {
  weight: {
    label: 'Weight (kg)',
    icon: Scale,
    color: 'hsl(220, 70%, 50%)',
    goodRange: [60, 80],
    unit: 'kg',
    formatValue: (value: number) => `${value.toFixed(1)} kg`
  },
  bloodPressureSystolic: {
    label: 'Blood Pressure (Systolic)',
    icon: Heart,
    color: 'hsl(0, 70%, 50%)',
    goodRange: [110, 130],
    unit: 'mmHg',
    formatValue: (value: number) => `${value} mmHg`
  },
  heartRate: {
    label: 'Heart Rate',
    icon: Activity,
    color: 'hsl(120, 70%, 50%)',
    goodRange: [60, 100],
    unit: 'bpm',
    formatValue: (value: number) => `${value} bpm`
  },
  stressLevel: {
    label: 'Stress Level',
    icon: Zap,
    color: 'hsl(40, 70%, 50%)',
    goodRange: [1, 4],
    unit: '',
    formatValue: (value: number) => `${value}/10`
  },
  sleepHours: {
    label: 'Sleep Hours',
    icon: Minus,
    color: 'hsl(260, 70%, 50%)',
    goodRange: [7, 9],
    unit: 'hrs',
    formatValue: (value: number) => `${value.toFixed(1)} hrs`
  }
};

const getColorForValue = (value: number, range: readonly [number, number], baseColor: string) => {
  const [min, max] = range;
  if (value >= min && value <= max) {
    return 'hsl(120, 70%, 50%)'; // Green for good values
  } else if (value < min * 0.8 || value > max * 1.2) {
    return 'hsl(0, 70%, 50%)'; // Red for concerning values
  } else {
    return 'hsl(40, 70%, 50%)'; // Orange for moderate values
  }
};

const getTrendIcon = (current: number, previous: number, metric: string) => {
  const isImprovement = metric === 'stressLevel' ? current < previous : current > previous;
  const diff = Math.abs(current - previous);
  const threshold = metric === 'stressLevel' ? 0.5 : 2;

  if (diff < threshold) return <Minus className="h-4 w-4 text-gray-500" />;
  return isImprovement ? 
    <TrendingUp className="h-4 w-4 text-green-500" /> : 
    <TrendingDown className="h-4 w-4 text-red-500" />;
};

export default function HealthTrendsChart({ data }: HealthTrendsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<keyof typeof metricConfigs>('weight');
  
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const filteredData = useMemo(() => {
    return sortedData.filter(point => point[selectedMetric] !== undefined);
  }, [sortedData, selectedMetric]);

  const config = metricConfigs[selectedMetric];
  const Icon = config.icon;

  const chartData = useMemo(() => {
    if (!filteredData.length) return [];

    const maxValue = Math.max(...filteredData.map(d => d[selectedMetric] as number));
    const minValue = Math.min(...filteredData.map(d => d[selectedMetric] as number));
    const range = maxValue - minValue;

    return filteredData.map((point, index) => {
      const value = point[selectedMetric] as number;
      const normalizedValue = range > 0 ? ((value - minValue) / range) * 100 : 50;
      const color = getColorForValue(value, config.goodRange as [number, number], config.color);
      
      return {
        ...point,
        value,
        normalizedValue,
        color,
        x: (index / Math.max(filteredData.length - 1, 1)) * 100,
        trend: index > 0 ? getTrendIcon(value, filteredData[index - 1][selectedMetric] as number, selectedMetric) : null
      };
    });
  }, [filteredData, selectedMetric, config]);

  const latestValue = chartData[chartData.length - 1]?.value;
  const previousValue = chartData[chartData.length - 2]?.value;
  const trend = latestValue && previousValue ? 
    ((latestValue - previousValue) / previousValue * 100) : 0;

  const getStatusBadge = (value: number) => {
    const [min, max] = config.goodRange;
    if (value >= min && value <= max) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Optimal</Badge>;
    } else if (value < min * 0.8 || value > max * 1.2) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Attention</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Monitor</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle>Health Trends</CardTitle>
          </div>
          <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as keyof typeof metricConfigs)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(metricConfigs).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          Track your {config.label.toLowerCase()} over time with dynamic color-coding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No data available for {config.label}
          </div>
        ) : (
          <>
            {/* Current Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current {config.label}</p>
                <p className="text-2xl font-bold">{config.formatValue(latestValue!)}</p>
                {trend !== 0 && (
                  <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}% from last reading
                  </p>
                )}
              </div>
              <div className="text-right">
                {getStatusBadge(latestValue!)}
                <div className="mt-2">
                  {chartData[chartData.length - 1]?.trend}
                </div>
              </div>
            </div>

            {/* Interactive Chart */}
            <div className="relative h-64 bg-white dark:bg-gray-900 border rounded-lg p-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Grid lines */}
                {[20, 40, 60, 80].map(y => (
                  <line 
                    key={y} 
                    x1="0" 
                    y1={y} 
                    x2="100" 
                    y2={y} 
                    stroke="currentColor" 
                    strokeOpacity="0.1" 
                    strokeWidth="0.2"
                  />
                ))}
                
                {/* Data line */}
                {chartData.length > 1 && (
                  <polyline
                    points={chartData.map(d => `${d.x},${100 - d.normalizedValue}`).join(' ')}
                    fill="none"
                    stroke={config.color}
                    strokeWidth="0.8"
                    className="transition-all duration-300"
                  />
                )}
                
                {/* Data points */}
                {chartData.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={point.x}
                      cy={100 - point.normalizedValue}
                      r="1.5"
                      fill={point.color}
                      className="transition-all duration-300 hover:r-2"
                    />
                    {/* Tooltip on hover */}
                    <circle
                      cx={point.x}
                      cy={100 - point.normalizedValue}
                      r="3"
                      fill="transparent"
                      className="cursor-pointer"
                    >
                      <title>
                        {new Date(point.date).toLocaleDateString()}: {config.formatValue(point.value)}
                      </title>
                    </circle>
                  </g>
                ))}
              </svg>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
                {[100, 75, 50, 25, 0].map(percent => {
                  const maxVal = Math.max(...filteredData.map(d => d[selectedMetric] as number));
                  const minVal = Math.min(...filteredData.map(d => d[selectedMetric] as number));
                  const range = maxVal - minVal;
                  const value = minVal + (range * percent / 100);
                  
                  return (
                    <span key={percent} className="leading-none">
                      {range > 0 ? value.toFixed(0) : maxVal.toFixed(0)}
                    </span>
                  );
                })}
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 mt-2">
                {chartData.length > 0 && (
                  <>
                    <span>{new Date(chartData[0].date).toLocaleDateString()}</span>
                    <span>{new Date(chartData[chartData.length - 1].date).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Color Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Optimal Range</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Monitor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Needs Attention</span>
              </div>
            </div>

            {/* Recent Trends Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chartData.slice(-3).map((point, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(point.date).toLocaleDateString()}
                    </span>
                    {point.trend}
                  </div>
                  <p className="font-semibold">{config.formatValue(point.value)}</p>
                  <div 
                    className="w-full h-2 rounded-full mt-2" 
                    style={{ backgroundColor: point.color, opacity: 0.3 }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-300" 
                      style={{ 
                        backgroundColor: point.color, 
                        width: `${point.normalizedValue}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}