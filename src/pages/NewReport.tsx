
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Loader2, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createMedicalReport } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const reportTypes = [
  'Laboratory',
  'Radiology',
  'Consultation',
  'Surgery',
  'Physical Examination',
  'Dental',
  'Ophthalmology',
  'Other'
];

const NewReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    reportType: '',
    doctor: '',
    hospital: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    content: '',
    file: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!formData.title || !formData.reportType || !formData.date) {
        toast({
          variant: 'destructive',
          title: 'Missing information',
          description: 'Please fill in all required fields.',
        });
        return;
      }
      
      const reportData: any = {
        patientId: user.id,
        title: formData.title,
        reportType: formData.reportType,
        doctor: formData.doctor,
        hospital: formData.hospital,
        date: formData.date,
        content: formData.content
      };
      
      // Add file if selected
      if (formData.file) {
        reportData.fileUrl = URL.createObjectURL(formData.file);
      }
      
      const report = await createMedicalReport(reportData);
      
      toast({
        title: 'Report Created',
        description: 'Your medical report has been successfully added.',
      });
      
      navigate(`/reports/${report?.id || ''}`);
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create medical report. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <main className="container py-6">
        {/* Header with back button */}
        <div className="mb-6">
          <Link to="/reports" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Back to Reports</span>
          </Link>
        </div>
        
        <div className="mb-6">
          <h1>Add Medical Report</h1>
          <p className="text-muted-foreground">
            Upload a new medical report to your health passport
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main form content */}
          <div className="md:col-span-2">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="E.g., Annual Physical Examination"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportType">Report Type <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.reportType}
                        onValueChange={(value) => handleSelectChange('reportType', value)}
                        required
                      >
                        <SelectTrigger id="reportType">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Doctor's Name</Label>
                      <Input
                        id="doctor"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleInputChange}
                        placeholder="Dr. John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hospital">Hospital/Clinic</Label>
                      <Input
                        id="hospital"
                        name="hospital"
                        value={formData.hospital}
                        onChange={handleInputChange}
                        placeholder="General Hospital"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Report Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Enter or paste the report content here..."
                      rows={10}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button type="button" variant="outline" asChild>
                    <Link to="/reports">Cancel</Link>
                  </Button>
                  <Button type="submit" className="health-gradient" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Report'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          {/* Sidebar - file upload and help */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG (MAX. 10MB)</p>
                    </div>
                    <input
                      id="file-upload"
                      name="file"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {formData.file && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Selected file:</p>
                    <p className="text-sm text-muted-foreground">{formData.file.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-health-blue-500">•</span>
                    <span>Fields marked with <span className="text-red-500">*</span> are required.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-health-blue-500">•</span>
                    <span>Your report will be encrypted and securely stored.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-health-blue-500">•</span>
                    <span>You can upload a file to associate with this report.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-health-blue-500">•</span>
                    <span>Reports are verified using blockchain technology.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewReport;
