
import React, { useState } from 'react';
import { HealthMetric } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface HealthMetricsChartProps {
  metrics: HealthMetric[];
}

const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({ metrics }) => {
  const [activeMetric, setActiveMetric] = useState<string>('heart_rate');
  
  // Group metrics by type
  const metricTypes = Array.from(new Set(metrics.map(metric => metric.type)));
  
  // Process data for chart based on the selected metric type
  const getChartData = () => {
    if (!metrics || metrics.length === 0) return [];
    
    // Filter metrics by selected type
    const filteredMetrics = metrics.filter(metric => metric.type === activeMetric);
    
    // Sort by timestamp
    filteredMetrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Format data for the chart
    return filteredMetrics.map(metric => ({
      date: new Date(metric.timestamp).toLocaleDateString(),
      value: metric.value,
      unit: metric.unit
    }));
  };

  const getMetricName = (metricType: string): string => {
    switch (metricType) {
      case 'heart_rate':
        return 'Heart Rate';
      case 'blood_pressure_systolic':
        return 'Blood Pressure (Systolic)';
      case 'blood_pressure_diastolic':
        return 'Blood Pressure (Diastolic)';
      case 'weight':
        return 'Weight';
      default:
        return metricType.charAt(0).toUpperCase() + metricType.slice(1).replace(/_/g, ' ');
    }
  };

  const getMetricColor = (metricType: string): string => {
    switch (metricType) {
      case 'heart_rate':
        return '#ef4444';
      case 'blood_pressure_systolic':
        return '#3b82f6';
      case 'blood_pressure_diastolic':
        return '#6b7280';
      case 'weight':
        return '#10b981';
      default:
        return '#8b5cf6';
    }
  };

  const data = getChartData();
  const unit = data.length > 0 ? data[0].unit : '';

  const formatYAxis = (value: number) => `${value}${unit ? ' ' + unit : ''}`;

  // If no metrics, show a message
  if (metrics.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No health metrics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeMetric} onValueChange={setActiveMetric} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {metricTypes.map(type => (
            <TabsTrigger key={type} value={type} className="text-xs md:text-sm">
              {getMetricName(type)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip 
              formatter={(value, name) => [`${value} ${unit}`, getMetricName(activeMetric)]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getMetricColor(activeMetric)}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={getMetricName(activeMetric)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthMetricsChart;
