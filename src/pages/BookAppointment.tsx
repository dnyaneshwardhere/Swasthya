
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorProfile, TimeSlot, createAppointment } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // This would fetch doctor information and available slots from API
    // For now we're just setting mock data
    setDoctor({
      id: doctorId || 'doctor-1',
      userId: 'user-1',
      name: 'Dr. Jane Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '555-123-4567',
      profileImage: '/placeholder.svg',
      specialization: 'Cardiology',
      qualifications: [
        { degree: 'MD', institution: 'Harvard Medical School', year: 2010 }
      ],
      experience: 12,
      consultationFee: 150,
      bio: 'Experienced cardiologist specializing in preventive cardiology and heart health.',
      availableSlots: [
        { id: 'slot-1', day: 'Monday', date: '2025-04-28', startTime: '09:00', endTime: '09:30' },
        { id: 'slot-2', day: 'Monday', date: '2025-04-28', startTime: '10:00', endTime: '10:30' },
        { id: 'slot-3', day: 'Tuesday', date: '2025-04-29', startTime: '14:00', endTime: '14:30' },
      ],
      rating: 4.9,
      reviewCount: 120
    });
    setLoading(false);
  }, [doctorId]);
  
  const handleSelectSlot = (slotId: string) => {
    setSelectedSlot(slotId);
  };
  
  const handleBookAppointment = async () => {
    if (!user || !doctor || !selectedSlot) return;
    
    const selectedSlotDetails = doctor.availableSlots?.find(slot => slot.id === selectedSlot);
    if (!selectedSlotDetails) return;
    
    try {
      setSubmitting(true);
      
      await createAppointment({
        patientId: user.id,
        doctorId: doctor.id,
        date: selectedSlotDetails.date,
        startTime: selectedSlotDetails.startTime,
        endTime: selectedSlotDetails.endTime,
        type: 'virtual',
        status: 'pending',
        reason: 'Consultation'
      });
      
      toast({
        title: 'Appointment Booked',
        description: `Your appointment with ${doctor.name} has been scheduled.`,
      });
      
      navigate('/appointments');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'There was an error booking your appointment. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20">
        <NavBar />
        <div className="container py-8">
          <p>Loading doctor information...</p>
        </div>
      </div>
    );
  }
  
  if (!doctor) {
    return (
      <div className="min-h-screen bg-muted/20">
        <NavBar />
        <div className="container py-8">
          <p>Doctor not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl font-semibold">{doctor.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm"><span className="font-medium">Experience:</span> {doctor.experience} years</p>
                    <p className="text-sm"><span className="font-medium">Consultation Fee:</span> ${doctor.consultationFee}</p>
                    <p className="text-sm mt-2">{doctor.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
              </CardHeader>
              <CardContent>
                {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                  <div className="space-y-4">
                    {doctor.availableSlots.map((slot) => (
                      <div 
                        key={slot.id}
                        className={`p-4 border rounded-md cursor-pointer transition-colors ${
                          selectedSlot === slot.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleSelectSlot(slot.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{slot.day}, {new Date(slot.date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                          <Button 
                            variant={selectedSlot === slot.id ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSlot(slot.id);
                            }}
                          >
                            {selectedSlot === slot.id ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6">
                      <Button 
                        onClick={handleBookAppointment} 
                        className="w-full health-gradient"
                        disabled={!selectedSlot || submitting}
                      >
                        {submitting ? "Booking..." : "Book Appointment"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No available slots found for this doctor.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                      Go Back
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
