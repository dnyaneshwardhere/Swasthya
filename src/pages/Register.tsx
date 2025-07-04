import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// Define base schema without the refine() at this level
const basePatientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  bloodType: z.string().min(1, { message: "Blood type is required" }),
  height: z.number().positive({ message: "Height must be greater than 0" }),
  weight: z.number().positive({ message: "Weight must be greater than 0" }),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  medications: z.string().optional(),
});

// Create the patientSchema with the refine after
const patientSchema = basePatientSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Extend the base schema for doctors, then add refine separately
const doctorSchema = z.object({
  ...basePatientSchema.shape,
  specialization: z.string().min(1, { message: "Specialization is required" }),
  experience: z.number().int().positive({ message: "Experience must be a positive number" }),
  licenseNumber: z.string().min(1, { message: "License number is required" }),
  licenseAuthority: z.string().min(1, { message: "Issuing medical council is required" }),
  consultationFee: z.number().positive({ message: "Consultation fee must be greater than 0" }),
  qualifications: z.array(
    z.object({
      degree: z.string().min(1, { message: "Degree is required" }),
      institution: z.string().min(1, { message: "Institution is required" }),
      year: z.number().int().positive().lte(new Date().getFullYear(), { message: "Year must be valid" }),
    })
  ).min(1, { message: "At least one qualification is required" }),
  bio: z.string().max(500, { message: "Bio cannot be more than 500 characters" }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PatientFormValues = z.infer<typeof patientSchema>;
type DoctorFormValues = z.infer<typeof doctorSchema>;

// Define RegisterData interface to match what Auth context expects
interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  bloodType: string;
  height: number;
  weight: number;
  userType: 'doctor' | 'patient' | 'admin'; // Explicitly typed as union
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  specialization?: string;
  experience?: number;
  licenseNumber?: string;
  licenseAuthority?: string;
  consultationFee?: number;
  qualifications?: { degree: string; institution: string; year: number }[];
  bio?: string;
}

const Register = () => {
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qualifications, setQualifications] = useState([
    { degree: '', institution: '', year: new Date().getFullYear() }
  ]);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const patientForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      bloodType: '',
      height: 0,
      weight: 0,
      allergies: '',
      chronicConditions: '',
      medications: '',
    }
  });

  const doctorForm = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      bloodType: '',
      height: 0,
      weight: 0,
      allergies: '',
      chronicConditions: '',
      medications: '',
      specialization: '',
      experience: 0,
      licenseNumber: '',
      licenseAuthority: '',
      consultationFee: 0,
      qualifications: [{ degree: '', institution: '', year: new Date().getFullYear() }],
      bio: '',
    }
  });

  const addQualification = () => {
    setQualifications([...qualifications, { degree: '', institution: '', year: new Date().getFullYear() }]);
    doctorForm.setValue('qualifications', [...qualifications, { degree: '', institution: '', year: new Date().getFullYear() }]);
  };

  const removeQualification = (index: number) => {
    if (qualifications.length > 1) {
      const updatedQualifications = [...qualifications];
      updatedQualifications.splice(index, 1);
      setQualifications(updatedQualifications);
      doctorForm.setValue('qualifications', updatedQualifications);
    }
  };

  const handleQualificationChange = (index: number, field: string, value: string | number) => {
    const updatedQualifications = [...qualifications];
    updatedQualifications[index] = { ...updatedQualifications[index], [field]: field === 'year' ? Number(value) : value };
    setQualifications(updatedQualifications);
    doctorForm.setValue('qualifications', updatedQualifications);
  };

  const handlePatientSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    
    try {
      const userData: RegisterData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: "",
        dateOfBirth: data.dateOfBirth,
        bloodType: data.bloodType,
        height: data.height,
        weight: data.weight,
        allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()).filter(Boolean) : [],
        chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(item => item.trim()).filter(Boolean) : [],
        medications: data.medications ? data.medications.split(',').map(item => item.trim()).filter(Boolean) : [],
        userType: 'patient' as const
      };
      
      const success = await registerUser(userData);
      
      if (success) {
        toast.success("Registration successful");
        navigate('/');
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoctorSubmit = async (data: DoctorFormValues) => {
    if (!licenseFile) {
      toast.error("Please upload your medical license");
      return;
    }

    if (!certificateFile) {
      toast.error("Please upload your degree certificate");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sanitizedQualifications = data.qualifications.map(qual => ({
        degree: qual.degree || "",
        institution: qual.institution || "",
        year: qual.year || new Date().getFullYear()
      }));
      
      const userData: RegisterData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: "",
        dateOfBirth: data.dateOfBirth,
        bloodType: data.bloodType,
        height: data.height,
        weight: data.weight,
        allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()).filter(Boolean) : [],
        chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(item => item.trim()).filter(Boolean) : [],
        medications: data.medications ? data.medications.split(',').map(item => item.trim()).filter(Boolean) : [],
        userType: 'doctor' as const,
        specialization: data.specialization,
        experience: data.experience,
        licenseNumber: data.licenseNumber,
        licenseAuthority: data.licenseAuthority,
        consultationFee: data.consultationFee,
        qualifications: sanitizedQualifications,
        bio: data.bio
      };
      
      const success = await registerUser(userData);
      
      if (success) {
        toast.success("Registration successful. Your credentials will be verified.");
        navigate('/');
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Register for TeleHealth to access your personal health passport
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patient" onValueChange={(value) => setUserType(value as 'patient' | 'doctor')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
              </TabsList>

              <TabsContent value="patient">
                <Form {...patientForm}>
                  <form onSubmit={patientForm.handleSubmit(handlePatientSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <FormField
                        control={patientForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={patientForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={patientForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={patientForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={patientForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={patientForm.control}
                        name="bloodType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value} 
                              disabled={isSubmitting}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                                <SelectItem value="Unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={patientForm.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={patientForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={patientForm.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Penicillin, Pollen, etc." {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={patientForm.control}
                        name="chronicConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chronic Conditions (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Asthma, Diabetes, etc." {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={patientForm.control}
                        name="medications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Medications (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Insulin, Albuterol, etc." {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full health-gradient"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Patient Account'
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="doctor">
                <Form {...doctorForm}>
                  <form onSubmit={doctorForm.handleSubmit(handleDoctorSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <FormField
                        control={doctorForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={doctorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={doctorForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={doctorForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={doctorForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={doctorForm.control}
                        name="bloodType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value} 
                              disabled={isSubmitting}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                                <SelectItem value="Unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={doctorForm.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <FormControl>
                              <Input placeholder="Cardiology, Neurology, etc." {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={doctorForm.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={doctorForm.control}
                        name="consultationFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consultation Fee ($)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={doctorForm.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical License Number</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={doctorForm.control}
                        name="licenseAuthority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issuing Medical Council</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. AMA, GMC, etc." {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Qualifications</Label>
                      <div className="space-y-4">
                        {qualifications.map((qualification, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2 p-3 border border-gray-200 rounded-md relative">
                            {index > 0 && (
                              <button 
                                type="button"
                                className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                                onClick={() => removeQualification(index)}
                              >
                                ✕
                              </button>
                            )}
                            <div>
                              <Label htmlFor={`degree-${index}`}>Degree</Label>
                              <Input 
                                id={`degree-${index}`}
                                value={qualification.degree} 
                                onChange={(e) => handleQualificationChange(index, 'degree', e.target.value)} 
                                placeholder="MD, PhD, etc."
                                disabled={isSubmitting}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`institution-${index}`}>Institution</Label>
                              <Input 
                                id={`institution-${index}`}
                                value={qualification.institution} 
                                onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)} 
                                placeholder="University name"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`year-${index}`}>Year</Label>
                              <Input 
                                id={`year-${index}`}
                                type="number" 
                                value={qualification.year} 
                                onChange={(e) => handleQualificationChange(index, 'year', e.target.value)} 
                                disabled={isSubmitting}
                                max={new Date().getFullYear()}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={addQualification}
                        disabled={isSubmitting}
                      >
                        Add Another Qualification
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <FormField
                        control={doctorForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Bio (max 500 characters)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Brief description of your professional background" 
                                {...field} 
                                disabled={isSubmitting} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseFile" className="text-base font-medium">Medical License (PDF/Image)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="licenseFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setLicenseFile(e.target.files ? e.target.files[0] : null)}
                          disabled={isSubmitting}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('licenseFile')?.click()}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      {licenseFile && (
                        <p className="text-sm text-green-600">File selected: {licenseFile.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certificateFile" className="text-base font-medium">Degree Certificate (PDF/Image)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="certificateFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setCertificateFile(e.target.files ? e.target.files[0] : null)}
                          disabled={isSubmitting}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('certificateFile')?.click()}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      {certificateFile && (
                        <p className="text-sm text-green-600">File selected: {certificateFile.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <FormField
                        control={doctorForm.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={doctorForm.control}
                        name="chronicConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chronic Conditions (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormField
                        control={doctorForm.control}
                        name="medications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Medications (comma separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full health-gradient"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Credentials...
                        </>
                      ) : (
                        'Submit Doctor Registration'
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-health-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
