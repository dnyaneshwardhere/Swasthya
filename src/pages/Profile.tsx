
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserProfile, updateUserProfile } from '@/lib/api';
import { User } from '@/lib/api';
import SpinnerLoader from '@/components/SpinnerLoader';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<User>>({});
  
  // Input states for arrays
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const profileData = await getUserProfile(user.id);
        setProfile(profileData);
        setFormData(profileData || {});
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleBloodTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, bloodType: value }));
  };

  // Allergies handlers
  const addAllergy = () => {
    if (allergyInput.trim() && formData.allergies) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    if (formData.allergies) {
      setFormData(prev => ({
        ...prev,
        allergies: prev.allergies?.filter((_, i) => i !== index)
      }));
    }
  };

  // Conditions handlers
  const addCondition = () => {
    if (conditionInput.trim() && formData.chronicConditions) {
      setFormData(prev => ({
        ...prev,
        chronicConditions: [...(prev.chronicConditions || []), conditionInput.trim()]
      }));
      setConditionInput('');
    }
  };

  const removeCondition = (index: number) => {
    if (formData.chronicConditions) {
      setFormData(prev => ({
        ...prev,
        chronicConditions: prev.chronicConditions?.filter((_, i) => i !== index)
      }));
    }
  };

  // Medications handlers
  const addMedication = () => {
    if (medicationInput.trim() && formData.medications) {
      setFormData(prev => ({
        ...prev,
        medications: [...(prev.medications || []), medicationInput.trim()]
      }));
      setMedicationInput('');
    }
  };

  const removeMedication = (index: number) => {
    if (formData.medications) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications?.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    try {
      setIsSaving(true);
      const updatedProfile = await updateUserProfile(user.id, formData);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setEditMode(false);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  if (loading || !profile) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex h-[80vh] items-center justify-center">
          <SpinnerLoader size="lg" text="Loading your profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <main className="container py-6">
        <div className="mb-6">
          <h1>My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal and medical information
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 md:col-span-2">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!editMode && (
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select
                          value={formData.bloodType}
                          onValueChange={handleBloodTypeChange}
                        >
                          <SelectTrigger id="bloodType">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            {bloodTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          name="height"
                          type="number"
                          value={formData.height}
                          onChange={handleNumericInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleNumericInputChange}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditMode(false);
                          setFormData(profile);
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{profile.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{profile.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Type</p>
                        <p className="font-medium">{profile.bloodType}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Height</p>
                        <p className="font-medium">{profile.height} cm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-medium">{profile.weight} kg</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-6">
                    {/* Allergies */}
                    <div className="space-y-3">
                      <Label>Allergies</Label>
                      <div className="flex gap-2">
                        <Input
                          value={allergyInput}
                          onChange={(e) => setAllergyInput(e.target.value)}
                          placeholder="Enter allergy"
                          disabled={isSaving}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addAllergy}
                          disabled={isSaving || !allergyInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      {formData.allergies && formData.allergies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.allergies.map((allergy, index) => (
                            <div
                              key={index}
                              className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center"
                            >
                              {allergy}
                              <button
                                type="button"
                                className="ml-1 rounded-full bg-red-200 text-red-600 hover:bg-red-300 h-4 w-4 flex items-center justify-center"
                                onClick={() => removeAllergy(index)}
                                disabled={isSaving}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chronic Conditions */}
                    <div className="space-y-3">
                      <Label>Chronic Conditions</Label>
                      <div className="flex gap-2">
                        <Input
                          value={conditionInput}
                          onChange={(e) => setConditionInput(e.target.value)}
                          placeholder="Enter condition"
                          disabled={isSaving}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addCondition}
                          disabled={isSaving || !conditionInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      {formData.chronicConditions && formData.chronicConditions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.chronicConditions.map((condition, index) => (
                            <div
                              key={index}
                              className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center"
                            >
                              {condition}
                              <button
                                type="button"
                                className="ml-1 rounded-full bg-yellow-200 text-yellow-600 hover:bg-yellow-300 h-4 w-4 flex items-center justify-center"
                                onClick={() => removeCondition(index)}
                                disabled={isSaving}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Medications */}
                    <div className="space-y-3">
                      <Label>Medications</Label>
                      <div className="flex gap-2">
                        <Input
                          value={medicationInput}
                          onChange={(e) => setMedicationInput(e.target.value)}
                          placeholder="Enter medication"
                          disabled={isSaving}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addMedication}
                          disabled={isSaving || !medicationInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      {formData.medications && formData.medications.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.medications.map((medication, index) => (
                            <div
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                            >
                              {medication}
                              <button
                                type="button"
                                className="ml-1 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300 h-4 w-4 flex items-center justify-center"
                                onClick={() => removeMedication(index)}
                                disabled={isSaving}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Allergies</h3>
                      <div className="flex flex-wrap gap-1">
                        {profile.allergies.length > 0 ? (
                          profile.allergies.map((allergy, index) => (
                            <Badge key={index} variant="secondary" className="bg-red-100">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No known allergies</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Chronic Conditions</h3>
                      <div className="flex flex-wrap gap-1">
                        {profile.chronicConditions.length > 0 ? (
                          profile.chronicConditions.map((condition, index) => (
                            <Badge key={index} variant="secondary" className="bg-yellow-100">
                              {condition}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No chronic conditions</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Medications</h3>
                      <div className="flex flex-wrap gap-1">
                        {profile.medications.length > 0 ? (
                          profile.medications.map((medication, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100">
                              {medication}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No current medications</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel Editing' : 'Edit Profile'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  Change Password
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
            
            {/* Data Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Data Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Your health data is encrypted and stored securely. Only you and authorized healthcare providers can access it.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Blockchain Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Your medical records are verified using blockchain technology for added security.
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Privacy Settings
                </Button>
              </CardContent>
            </Card>
            
            {/* Connected Devices */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Fall Detection Wristband</h3>
                      <p className="text-xs text-muted-foreground">Connected</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Button variant="link" className="px-0 h-auto text-sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Connect New Device
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
