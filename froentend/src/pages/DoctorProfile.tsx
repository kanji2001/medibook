import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { fetchDoctorById } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppointmentCalendar from '@/components/ui/AppointmentCalendar';
import axios from 'axios';

interface DoctorProfileData {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  availability: string;
  experience: number;
  about?: string;
  education?: string[];
  languages?: string[];
  specializations?: string[];
  insurances?: string[];
  featured?: boolean;
  reviewDetails?: Array<{
    id: string;
    name: string;
    date: string;
    rating: number;
    comment?: string;
  }>;
}

const DoctorProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [errorState, setErrorState] = useState<{ status: number | null; message: string | null }>({
    status: null,
    message: null,
  });

  useEffect(() => {
    const loadDoctor = async () => {
      if (id) {
        try {
          const fetchedDoctor = await fetchDoctorById(id);
          setDoctor(fetchedDoctor);
          setErrorState({ status: null, message: null });
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status ?? null;
            let message = error.response?.data?.message || 'Failed to load doctor details.';

            if (status === 403) {
              message = 'This doctor profile is not yet approved and is currently unavailable.';
            } else if (status === 404) {
              message = 'The doctor you are looking for does not exist.';
            }

            setErrorState({ status, message });
            toast({
              title: status === 403 ? 'Profile Unavailable' : 'Error',
              description: message,
              variant: status === 403 ? 'default' : 'destructive',
            });
          } else if (error instanceof Error) {
            setErrorState({ status: null, message: error.message });
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          } else {
            setErrorState({ status: null, message: 'Failed to load doctor details.' });
            toast({
              title: 'Error',
              description: 'Failed to load doctor details.',
              variant: 'destructive',
            });
          }
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

  const formattedEducation = useMemo(() => doctor?.education ?? [], [doctor]);
  const formattedLanguages = useMemo(() => doctor?.languages ?? [], [doctor]);
  const formattedSpecializations = useMemo(() => doctor?.specializations ?? [], [doctor]);
  const formattedInsurances = useMemo(() => doctor?.insurances ?? [], [doctor]);
  const reviews = useMemo(() => doctor?.reviewDetails ?? [], [doctor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorState.message) {
    const isPendingProfile = errorState.status === 403;

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6 py-8 glass-card rounded-xl space-y-4">
          <h2 className="text-2xl font-semibold">
            {isPendingProfile ? 'Doctor Profile Unavailable' : 'Doctor Not Found'}
          </h2>
          <p className="text-muted-foreground">{errorState.message}</p>
          <Link to="/doctors" className="btn-primary inline-flex justify-center">
            Back to Doctors
          </Link>
        </div>
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
                      <span className="font-medium">{(doctor.rating ?? 0).toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">
                        ({doctor.reviews ?? 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span>{doctor.location}</span>
                    </div>
                    {doctor.address && (
                      <div className="flex items-center mt-1 text-muted-foreground">
                        <span>{doctor.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{doctor.about || 'Details coming soon.'}</p>
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
                <h3 className="text-xl font-semibold mb-4">Specializations & Services</h3>
                {formattedSpecializations.length ? (
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    {formattedSpecializations.map((specialization, index) => (
                      <li key={index}>{specialization}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Specializations will be updated soon.</p>
                )}
              </div>

              <div className="glass-card rounded-xl p-6 space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-2">Education</h3>
                  {formattedEducation.length ? (
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {formattedEducation.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Education details will be updated soon.</p>
                  )}
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">Languages</h3>
                  {formattedLanguages.length ? (
                    <div className="flex flex-wrap gap-2">
                      {formattedLanguages.map((language, idx) => (
                        <span key={idx} className="badge badge-outline">
                          {language}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Languages will be updated soon.</p>
                  )}
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">Insurance Accepted</h3>
                  {formattedInsurances.length ? (
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {formattedInsurances.map((insurance, idx) => (
                        <li key={idx}>{insurance}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Insurance information will be updated soon.</p>
                  )}
                </section>

                {(doctor.phone || doctor.email) && (
                  <section>
                    <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-1 text-muted-foreground">
                      {doctor.phone && <p>Phone: {doctor.phone}</p>}
                      {doctor.email && <p>Email: {doctor.email}</p>}
                    </div>
                  </section>
                )}
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
                {reviews.length ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{review.name}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span>{review.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {review.date}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
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
