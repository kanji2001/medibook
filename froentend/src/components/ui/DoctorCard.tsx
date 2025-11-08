
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock } from 'lucide-react';

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
  experience: number;
  featured?: boolean;
}

const DoctorCard = ({
  id,
  name,
  specialty,
  image,
  rating,
  reviews,
  location,
  availability,
  experience,
  featured = false,
}: DoctorCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`glass-card-hover rounded-xl overflow-hidden transition-all duration-300 transform ${
        isHovered ? 'scale-[1.02]' : ''
      } ${featured ? 'ring-2 ring-primary/20' : ''} w-full max-w-sm md:max-w-md lg:max-w-lg`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        {featured && (
          <div className="absolute top-4 left-4">
            <span className="badge badge-primary">Featured</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-300">({reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{specialty}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 shrink-0 text-primary" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 shrink-0 text-primary" />
            <span>{availability}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 shrink-0 text-primary" />
            <span>{experience} years experience</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Link
            to={`/doctors/${id}`}
            className="btn-outline py-2 flex-1 text-center"
          >
            View Profile
          </Link>
          <Link 
            to={`/appointment?doctorId=${id}&doctorName=${encodeURIComponent(name)}&doctorSpecialty=${encodeURIComponent(specialty)}&doctorImage=${encodeURIComponent(image)}`} 
            className="btn-primary py-2 flex-1 text-center"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
