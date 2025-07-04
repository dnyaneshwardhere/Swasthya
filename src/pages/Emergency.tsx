
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import EmergencyInfoCard from '@/components/EmergencyInfoCard';
import SpinnerLoader from '@/components/SpinnerLoader';
import { getUserProfile, getEmergencyContacts, createEmergencyContact, deleteEmergencyContact } from '@/lib/api';
import { User, EmergencyContact } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Plus, Trash, Phone, Mail, Download, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const Emergency = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: ''
  });

  useEffect(() => {
    const loadEmergencyData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [profileData, contactsData] = await Promise.all([
          getUserProfile(user.id),
          getEmergencyContacts(user.id),
        ]);

        setProfile(profileData);
        setContacts(contactsData);
      } catch (error) {
        console.error('Error loading emergency data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load emergency information.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadEmergencyData();
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({ ...prev, [name]: value }));
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!newContact.name || !newContact.relationship || !newContact.phoneNumber) {
        toast({
          variant: 'destructive',
          title: 'Missing information',
          description: 'Please fill in all required fields.',
        });
        return;
      }
      
      const contact = await createEmergencyContact({
        userId: user.id,
        ...newContact
      });
      
      setContacts(prev => [...prev, contact]);
      setNewContact({
        name: '',
        relationship: '',
        phoneNumber: '',
        email: ''
      });
      setIsAddingContact(false);
      
      toast({
        title: 'Contact Added',
        description: 'Emergency contact has been successfully added.',
      });
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add emergency contact.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const success = await deleteEmergencyContact(contactId);
      
      if (success) {
        setContacts(prev => prev.filter(c => c.id !== contactId));
        toast({
          title: 'Contact Removed',
          description: 'Emergency contact has been removed.',
        });
      }
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove emergency contact.',
      });
    }
  };

  const generatePrintableEmergencyCard = () => {
    // In a real application, this would generate a PDF or printable HTML
    toast({
      title: 'Emergency Card',
      description: 'Your emergency card is being generated for download.',
    });
  };

  const shareEmergencyInfo = () => {
    // In a real application, this would share via email or generate a shareable link
    toast({
      title: 'Share Emergency Info',
      description: 'Your emergency information sharing link has been generated.',
    });
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex h-[80vh] items-center justify-center">
          <SpinnerLoader size="lg" text="Loading emergency information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <main className="container py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h1>Emergency Information</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your critical medical information for emergency situations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main content */}
          <div className="md:col-span-2">
            <EmergencyInfoCard user={profile} contacts={contacts} />
            
            {/* Emergency contacts section */}
            <div className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Emergency Contacts</CardTitle>
                    <CardDescription>
                      People who should be contacted in case of emergency
                    </CardDescription>
                  </div>
                  <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Contact
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleAddContact}>
                        <DialogHeader>
                          <DialogTitle>Add Emergency Contact</DialogTitle>
                          <DialogDescription>
                            Add someone who should be contacted in case of emergency.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                            <Input
                              id="name"
                              name="name"
                              value={newContact.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="relationship">Relationship <span className="text-red-500">*</span></Label>
                            <Input
                              id="relationship"
                              name="relationship"
                              value={newContact.relationship}
                              onChange={handleInputChange}
                              placeholder="E.g., Spouse, Parent, Friend"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                            <Input
                              id="phoneNumber"
                              name="phoneNumber"
                              value={newContact.phoneNumber}
                              onChange={handleInputChange}
                              placeholder="+1-555-123-4567"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={newContact.email}
                              onChange={handleInputChange}
                              placeholder="contact@example.com"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddingContact(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Contact'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {contacts.length > 0 ? (
                    <div className="space-y-4">
                      {contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="space-y-1">
                            <h4 className="font-medium">{contact.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {contact.relationship}
                            </p>
                            <div className="flex flex-col gap-1 mt-2">
                              <a
                                href={`tel:${contact.phoneNumber}`}
                                className="flex items-center text-sm text-blue-600 hover:underline"
                              >
                                <Phone className="mr-1 h-3 w-3" />
                                {contact.phoneNumber}
                              </a>
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="flex items-center text-sm text-blue-600 hover:underline"
                                >
                                  <Mail className="mr-1 h-3 w-3" />
                                  {contact.email}
                                </a>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No emergency contacts added yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add contacts that should be notified in case of emergency.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" onClick={generatePrintableEmergencyCard}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Emergency Card
                </Button>
                <Button className="w-full justify-start" onClick={shareEmergencyInfo}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Emergency Info
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/profile">
                    Edit Medical Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Emergency Info */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700">In Case of Emergency</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-red-500">1.</span>
                    <span>Call emergency services (911)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-500">2.</span>
                    <span>Show this emergency card to medical personnel</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-red-500">3.</span>
                    <span>Contact listed emergency contacts</span>
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

export default Emergency;
