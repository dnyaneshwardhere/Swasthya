
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Download, Lock } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    shareHealthMetrics: false,
    allowDoctorAccess: true,
    emailNotifications: true,
    smsNotifications: false,
    showProfilePublicly: false,
    twoFactorAuth: false
  });

  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePrivacyChange = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const savePrivacySettings = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Privacy settings saved successfully");
    setIsSubmitting(false);
  };

  const exportHealthData = async () => {
    setIsExporting(true);
    
    try {
      // Simulate API call and file creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a sample JSON data
      const healthData = {
        userId: user?.id || "user-123",
        name: user?.name || "Sample User",
        metrics: [
          { type: "blood-pressure", value: "120/80", date: new Date().toISOString() },
          { type: "heart-rate", value: "72 bpm", date: new Date().toISOString() },
          { type: "blood-sugar", value: "90 mg/dL", date: new Date().toISOString() }
        ],
        reports: [
          { id: "report-1", title: "Annual Checkup", date: new Date().toISOString() },
          { id: "report-2", title: "Blood Test Results", date: new Date().toISOString() }
        ],
        appointments: [
          { id: "apt-1", doctor: "Dr. Smith", date: new Date().toISOString(), status: "completed" },
          { id: "apt-2", doctor: "Dr. Jones", date: new Date().toISOString(), status: "scheduled" }
        ]
      };
      
      // Create and download the file
      const dataStr = JSON.stringify(healthData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `health-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Health data exported successfully");
    } catch (error) {
      console.error("Error exporting health data:", error);
      toast.error("Failed to export health data");
    } finally {
      setIsExporting(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <div className="container py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Your Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage how your information is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="share-metrics">Share Health Metrics</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your doctors to view your health metrics
                    </p>
                  </div>
                  <Switch
                    id="share-metrics"
                    checked={privacySettings.shareHealthMetrics}
                    onCheckedChange={() => handlePrivacyChange('shareHealthMetrics')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="doctor-access">Doctor Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your doctors to access your medical history
                    </p>
                  </div>
                  <Switch
                    id="doctor-access"
                    checked={privacySettings.allowDoctorAccess}
                    onCheckedChange={() => handlePrivacyChange('allowDoctorAccess')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive appointment reminders and updates via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={privacySettings.emailNotifications}
                    onCheckedChange={() => handlePrivacyChange('emailNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive appointment reminders and updates via SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={privacySettings.smsNotifications}
                    onCheckedChange={() => handlePrivacyChange('smsNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public-profile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={privacySettings.showProfilePublicly}
                    onCheckedChange={() => handlePrivacyChange('showProfilePublicly')}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={savePrivacySettings} 
                  className="health-gradient"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Privacy Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={updatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="health-gradient"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-6 border-t mt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={privacySettings.twoFactorAuth}
                      onCheckedChange={() => handlePrivacyChange('twoFactorAuth')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Your Health Data</CardTitle>
                <CardDescription>
                  Manage and export your health information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Export Health Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your health records, metrics, and appointments in JSON format
                  </p>
                </div>
                
                <Button 
                  onClick={exportHealthData}
                  variant="outline"
                  className="w-full"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Export...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Health Data
                    </>
                  )}
                </Button>

                <div className="pt-6 border-t">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Data Retention</h3>
                    <p className="text-sm text-muted-foreground">
                      We store your health data securely according to medical regulations.
                      Your data is retained for 7 years unless you request deletion.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm">
                      Request Account Deletion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
