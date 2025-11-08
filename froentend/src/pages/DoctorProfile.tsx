import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { fetchDoctorById } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppointmentCalendar from '@/components/ui/AppointmentCalendar';

const DoctorProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);

  useEffect(() => {
    const loadDoctor = async () => {
      if (id) {
        try {
          const fetchedDoctor = await fetchDoctorById(id);
          setDoctor(fetchedDoctor);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load doctor details.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadDoctor();
  }, [id, toast]);

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDateTime({ date, time });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Doctor Not Found</h2>
          <p className="text-muted-foreground">
            The doctor you are looking for does not exist.
          </p>
          <Link to="/doctors" className="btn-primary mt-4">
            Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Doctor Details Section */}
            <section className="w-full md:w-2/3 space-y-6">
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="shrink-0 w-32 h-32 rounded-full overflow-hidden mr-6">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold">{doctor.name}</h1>
                    <p className="text-lg text-muted-foreground">{doctor.specialty}</p>
                    <div className="flex items-center mt-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">
                        ({doctor.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span>{doctor.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{doctor.bio}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Working Hours
                    </h3>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <span>{doctor.availability}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Services</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {(doctor.services ?? []).map((service: string, index: number) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>

              </div>
            </section>

            {/* Appointment Section */}
            <section className="w-full md:w-1/3 space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6">Book Appointment</h3>

                {doctor && (
                  <AppointmentCalendar
                    onSelectDateTime={handleDateTimeSelect}
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    doctorSpecialty={doctor.specialty}
                    doctorImage={doctor.image}
                  />
                )}

                {selectedDateTime && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-semibold mb-2">Selected Time</h4>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <span>{selectedDateTime.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      <span>{selectedDateTime.time}</span>
                    </div>

                    {user ? (
                      <div className="mt-4">
                        <Link
                          to={`/appointment?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}&doctorSpecialty=${encodeURIComponent(doctor.specialty)}&doctorImage=${encodeURIComponent(doctor.image)}`}
                          className="btn-primary w-full"
                        >
                          Confirm Appointment
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <Link to="/login" className="btn-primary w-full">
                          Login to Book
                        </Link>
                        <p className="text-center text-sm text-muted-foreground">
                          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Reviews</h3>
                <div className="space-y-4">
                  {(doctor.reviewsData ?? []).map((review: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                            <img
                              src={review.userImage}
                              alt={review.userName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-sm font-medium">
                            {review.userName}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {review.date}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorProfile;
