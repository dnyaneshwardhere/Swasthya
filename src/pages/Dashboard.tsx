
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HealthMetricsChart from '@/components/HealthMetricsChart';
import { User, HealthMetric, Appointment, getHealthMetrics, getAppointmentsForPatient, getAppointmentsForDoctor } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Video, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user, isDoctor, isPatient } = useAuth();
  const { toast } = useToast();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch health metrics
        if (isPatient()) {
          const fetchedMetrics = await getHealthMetrics(user.id);
          setHealthMetrics(fetchedMetrics);
        }

        // Fetch appointments
        let fetchedAppointments: Appointment[] = [];
        if (isDoctor()) {
          fetchedAppointments = await getAppointmentsForDoctor(user.id);
        } else {
          fetchedAppointments = await getAppointmentsForPatient(user.id);
        }
        
        // Sort appointments by date (most recent first)
        fetchedAppointments.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast, isDoctor, isPatient]);

  if (!user) return null;

  const upcomingAppointments = appointments.filter(appt => {
    const appointmentDate = new Date(appt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && appt.status !== 'cancelled';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-muted/20">
      <NavBar />
      <main className="container py-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user.name}</h1>
        <p className="text-muted-foreground mb-6">
          {isDoctor() ? 'View your appointments and patient information.' : 'Here\'s a summary of your health data and upcoming appointments.'}
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Main content area - 2/3 width on large screens */}
          <div className="space-y-6 lg:col-span-2">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled medical appointments</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/appointments">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading appointments...</div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No upcoming appointments.</p>
                    {isPatient() && (
                      <Button asChild>
                        <Link to="/book-appointment">Book an Appointment</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {isDoctor() 
                              ? `Appointment with Patient ${appointment.patientId}` 
                              : `Appointment with Dr. ${appointment.doctorId}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>{new Date(appointment.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{appointment.startTime}</span>
                            </div>
                            {appointment.type === 'virtual' && (
                              <div className="flex items-center">
                                <Video className="mr-1 h-4 w-4" />
                                <span>Zoom</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={
                          appointment.status === 'confirmed' ? 'bg-green-500' :
                          appointment.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                        }>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to={isPatient() ? "/book-appointment" : "/appointments"}>
                    {isPatient() ? "Book New Appointment" : "Manage Appointments"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Health Metrics (only for patients) */}
            {isPatient() && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">Health Metrics</CardTitle>
                    <CardDescription>Your recent health data</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      Loading health metrics...
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <HealthMetricsChart metrics={healthMetrics} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medical Reports Quick Access */}
            {isPatient() && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">Medical Reports</CardTitle>
                    <CardDescription>Your recent medical documents</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/reports">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Quick access to your medical reports.</p>
                    <Button asChild>
                      <Link to="/reports">View Reports</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Profile Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="font-medium">{user.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="font-medium">{user.height} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{user.weight} kg</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  <p className="font-medium line-clamp-2">
                    {user.allergies.length > 0 ? user.allergies.join(', ') : 'None reported'}
                  </p>
                </div>

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/profile">View Full Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isPatient() ? (
                  <>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link to="/book-appointment">Book an Appointment</Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link to="/reports/new">Upload Medical Report</Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link to="/emergency">Update Emergency Info</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link to="/appointments">Manage Appointments</Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link to="/settings">Update Availability</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Emergency Access (only for patients) */}
            {isPatient() && (
              <Card>
                <CardHeader className="bg-red-50 dark:bg-red-900/20">
                  <CardTitle className="text-red-600 dark:text-red-400">Emergency Access</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Quickly access your critical health information in case of emergency.
                  </p>
                  <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                    <Link to="/emergency">View Emergency Info</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
