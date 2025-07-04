
import React from 'react';
import { Link } from 'react-router-dom';
import { MedicalReport } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, User, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MedicalReportItemProps {
  report: MedicalReport;
}

const MedicalReportItem: React.FC<MedicalReportItemProps> = ({ report }) => {
  // Function to determine badge color based on report type
  const getBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'laboratory':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'radiology':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'consultation':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'surgery':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'physical examination':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Link to={`/reports/${report.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <Badge className={getBadgeVariant(report.reportType)} variant="secondary">
              {report.reportType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date(report.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="mr-2 h-4 w-4" />
              {report.doctor}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building className="mr-2 h-4 w-4" />
              {report.hospital}
            </div>
            <div className="mt-2 flex justify-end">
              <FileText className="h-5 w-5 text-health-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MedicalReportItem;
