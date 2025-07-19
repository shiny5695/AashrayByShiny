import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface ProviderCardProps {
  provider: {
    id: number;
    name: string;
    serviceType: string;
    experience?: number;
    hourlyRate: string;
    location: string;
    availableFrom?: string;
    availableTo?: string;
    rating: string;
    totalReviews: number;
    profileImageUrl?: string;
    specialization?: string;
  };
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const [, navigate] = useLocation();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
    }

    return stars;
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const hour = parseInt(time);
    if (hour === 12) return "12:00 PM";
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          {/* Provider Photo */}
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {provider.profileImageUrl ? (
              <img 
                src={provider.profileImageUrl} 
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <i className="fas fa-user text-2xl text-gray-400"></i>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xl font-medium text-gray-900">
                  {provider.name}
                </h4>
                <p className="text-base text-gray-600 mb-2">
                  {provider.specialization || 
                    `${provider.experience ? `${provider.experience} साल अनुभव` : "अनुभवी"}`
                  }
                </p>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {renderStars(parseFloat(provider.rating))}
                    </div>
                    <span className="text-base text-gray-600">
                      {provider.rating} ({provider.totalReviews} समीक्षा)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <i className="fas fa-map-marker-alt"></i>
                    <span className="text-base">{provider.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-base text-gray-600">
                  {provider.availableFrom && provider.availableTo && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-clock"></i>
                      <span>
                        उपलब्ध: {formatTime(provider.availableFrom)} - {formatTime(provider.availableTo)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-rupee-sign"></i>
                    <span>₹{parseFloat(provider.hourlyRate).toFixed(0)}/घंटा</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/booking/${provider.id}`)}
                size="lg"
                className="text-lg px-8 py-3"
              >
                बुकिंग करें
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
