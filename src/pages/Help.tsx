
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Phone, MessageSquare, Headphones } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import { supportAPI } from "@/lib/apiService";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportType, setSupportType] = useState<string>("question");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      toast.error("Please provide a subject for your request");
      return;
    }
    
    if (!message.trim()) {
      toast.error("Please include a message with your request");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await supportAPI.submitRequest({
        supportType,
        subject,
        message
      });
      
      toast.success("Your message has been sent. We'll get back to you soon.");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast.error("Failed to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (resourceType: string) => {
    switch (resourceType) {
      case "guide":
        toast.success("Downloading Getting Started Guide...");
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = "#";
          link.download = "TeleHealth-Getting-Started-Guide.pdf";
          link.click();
          toast.success("Download complete!");
        }, 1500);
        break;
      case "videos":
        navigate("/help/videos");
        break;
      case "articles":
        navigate("/help/articles");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <div className="container py-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Help & Support</h1>

        <Tabs defaultValue="support" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="support">Contact Support</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Our Support Team</CardTitle>
                <CardDescription>
                  Fill out this form, and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="support-type">Support Type</Label>
                    <Select
                      value={supportType}
                      onValueChange={setSupportType}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select support type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">General Question</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Support</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue in detail"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="submit"
                    className="health-gradient"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Phone className="mr-2" size={18} /> Phone Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Available Monday-Friday</p>
                  <p className="text-muted-foreground">9am - 5pm EST</p>
                  <p className="font-medium mt-2">+1 (555) 123-4567</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Mail className="mr-2" size={18} /> Email Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Response within 24 hours</p>
                  <p className="font-medium mt-2">support@telehealth.com</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><MessageSquare className="mr-2" size={18} /> Live Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Available 24/7</p>
                  <Button variant="outline" className="mt-2">
                    <Headphones className="mr-2 h-4 w-4" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I book an appointment?</AccordionTrigger>
                    <AccordionContent>
                      To book an appointment, navigate to the Appointments page and click "Book New Appointment". 
                      You can then select a doctor, choose an available time slot, and confirm your booking.
                      All appointment details will be visible in your Appointments dashboard.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I join a virtual appointment?</AccordionTrigger>
                    <AccordionContent>
                      For virtual appointments, go to the Appointments page and find your scheduled appointment.
                      Click "Join Meeting" when it's time for your appointment. You will need to allow camera and
                      microphone access to participate. We recommend testing your equipment 5 minutes before 
                      your appointment starts.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How can I access my medical reports?</AccordionTrigger>
                    <AccordionContent>
                      Your medical reports are available in the Reports section. You can view, download, 
                      or share reports with other healthcare providers as needed. Reports can be filtered
                      by type, date, and doctor.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How is my data protected?</AccordionTrigger>
                    <AccordionContent>
                      We use industry-standard encryption to protect your health information. Our platform 
                      is HIPAA compliant, and you can control privacy settings in your account page.
                      All data transfers use secure protocols, and we never share your information without 
                      your explicit consent.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Can I cancel or reschedule an appointment?</AccordionTrigger>
                    <AccordionContent>
                      Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time. 
                      Go to the Appointments page, find the appointment, and use the "Cancel" or "Reschedule" options.
                      Appointments canceled with less than 24 hours notice may incur a fee, depending on your doctor's policy.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-6">
                    <AccordionTrigger>How do I update my health information?</AccordionTrigger>
                    <AccordionContent>
                      Your health information can be updated in your Profile page. Look for the "Health Information" 
                      section where you can update details about allergies, medications, medical history, and more.
                      It's important to keep this information up to date for accurate medical care.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-7">
                    <AccordionTrigger>How do I export my health data?</AccordionTrigger>
                    <AccordionContent>
                      You can export your health data from the Settings page. Look for the "Export Health Data" option
                      in the Data Management section. You can choose to export in various formats including PDF, CSV, 
                      and JSON. This feature is useful if you need to share your medical history with other healthcare providers.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Helpful Resources</CardTitle>
                <CardDescription>
                  Guides and information to help you use TeleHealth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Getting Started Guide</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">A complete walkthrough of TeleHealth features</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownload('guide')}
                      >
                        Download PDF
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Video Tutorials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Step-by-step video guides for common tasks</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownload('videos')}
                      >
                        View Library
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Health Articles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Latest medical news and health tips</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownload('articles')}
                      >
                        Read Articles
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Help;
