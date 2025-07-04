import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import SpinnerLoader from '@/components/SpinnerLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getMedicalReport, deleteMedicalReport } from '@/lib/api';
import { MedicalReport } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  FileText,
  Trash,
  FilePenLine,
  Download
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        const reportData = await getMedicalReport(id);
        
        if (!reportData) {
          // Report doesn't exist
          navigate('/reports', { replace: true });
          return;
        }
        
        setReport(reportData);
      } catch (error) {
        console.error('Error loading medical report:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load medical report. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id, user, navigate, toast]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      const success = await deleteMedicalReport(id);
      
      if (success) {
        toast({
          title: 'Report Deleted',
          description: 'The medical report has been deleted successfully.',
        });
        navigate('/reports', { replace: true });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete the report. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (report?.fileUrl) {
      // Create a temporary anchor element and trigger the download
      const link = document.createElement('a');
      link.href = report.fileUrl;
      link.download = `Report-${report.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download Started',
        description: 'Your report is being downloaded.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'No file is associated with this report.',
      });
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex h-[80vh] items-center justify-center">
          <SpinnerLoader size="lg" text="Loading report..." />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
            <p className="mb-6">The medical report you're looking for doesn't exist or has been removed.</p>
            <Link to="/reports">
              <Button>Back to Reports</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <main className="container py-6">
        <div className="mb-6">
          <Link to="/reports" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Back to Reports</span>
          </Link>
        </div>
        
        {report && (
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1>{report.title}</h1>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge className={getBadgeVariant(report.reportType)} variant="secondary">
                    {report.reportType}
                  </Badge>
                  <span className="text-muted-foreground">
                    Report ID: {report.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {report.fileUrl && (
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/reports/${report.id}/edit`}>
                    <FilePenLine className="mr-1 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Medical Report</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this medical report? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete} 
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p className="flex items-center mt-1">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Doctor</h3>
                  <p className="flex items-center mt-1">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    {report.doctor}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Hospital/Clinic</h3>
                  <p className="flex items-center mt-1">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    {report.hospital}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Added to System</h3>
                  <p className="flex items-center mt-1">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-4">
              <Card className="bg-health-green-50 border-health-green-200">
                <CardContent className="py-4 text-center">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-health-green-100">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-health-green-600"
                    >
                      <path d="m6 9 6 6 6-6"/>
                      <path d="M6 5v4h4" />
                      <path d="M18 19v-4h-4" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-health-green-800">Blockchain Verified</h4>
                  <p className="text-xs text-health-green-700 mt-1">
                    Hash: {report.id.substring(0, 10)}...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="md:col-span-3">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-medium mb-4">Report Content</h3>
                  <div className="whitespace-pre-wrap font-serif">
                    {report.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportDetail;
