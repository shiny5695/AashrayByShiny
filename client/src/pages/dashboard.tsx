import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import EmergencyBanner from "@/components/emergency-banner";
import ServiceCard from "@/components/service-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

const services = [
  {
    id: "nurse",
    name: "नर्स सेवा",
    description: "स्वास्थ्य देखभाल और दवा सहायता",
    icon: "fas fa-user-nurse",
    color: "primary",
  },
  {
    id: "electrician",
    name: "इलेक्ट्रीशियन",
    description: "बिजली की समस्या और मरम्मत",
    icon: "fas fa-bolt",
    color: "secondary",
  },
  {
    id: "plumber",
    name: "प्लंबर",
    description: "पानी और नल की मरम्मत",
    icon: "fas fa-wrench",
    color: "blue",
  },
  {
    id: "beautician",
    name: "ब्यूटीशियन",
    description: "बाल काटना और सुंदरता सेवा",
    icon: "fas fa-cut",
    color: "pink",
  },
  {
    id: "cab_driver",
    name: "कैब ड्राइवर",
    description: "आराम से यात्रा सेवा",
    icon: "fas fa-taxi",
    color: "yellow",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: serviceProviders } = useQuery({
    queryKey: ["/api/service-providers"],
  });

  const getAvailableCount = (serviceType: string) => {
    if (!serviceProviders) return 0;
    return serviceProviders.filter((p: any) => p.serviceType === serviceType && p.isActive).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <EmergencyBanner />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-medium text-gray-900 mb-4">
              स्वागत है, {user?.firstName} {user?.lastName} जी
            </h2>
            <p className="text-xl text-gray-600">
              आज आपको किस सेवा की आवश्यकता है?
            </p>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              availableCount={getAvailableCount(service.id)}
            />
          ))}
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardContent className="p-8">
            <h3 className="text-2xl font-medium text-gray-900 mb-6">
              आपकी हाल की बुकिंग
            </h3>

            {bookingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-48 mb-4" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBookings?.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.slice(0, 3).map((booking: any) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-medium text-gray-900">
                          {booking.provider.name}
                        </h4>
                        <p className="text-base text-gray-600">
                          {booking.provider.serviceType === "nurse" && "नर्स सेवा"}
                          {booking.provider.serviceType === "electrician" && "इलेक्ट्रीशियन"}
                          {booking.provider.serviceType === "plumber" && "प्लंबर"}
                          {booking.provider.serviceType === "beautician" && "ब्यूटीशियन"}
                          {booking.provider.serviceType === "cab_driver" && "कैब ड्राइवर"}
                        </p>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-base font-medium ${
                        booking.status === "completed" ? "bg-green-100 text-green-800" :
                        booking.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                        booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {booking.status === "completed" && "पूर्ण"}
                        {booking.status === "confirmed" && "पुष्टि"}
                        {booking.status === "pending" && "प्रतीक्षा"}
                        {booking.status === "cancelled" && "रद्द"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base text-gray-600">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-calendar"></i>
                        <span>{new Date(booking.bookingDate).toLocaleDateString('hi-IN')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-clock"></i>
                        <span>{booking.duration} घंटे</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-rupee-sign"></i>
                        <span>₹{booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar-times text-2xl text-gray-400"></i>
                </div>
                <p className="text-lg text-gray-500">
                  अभी तक कोई बुकिंग नहीं है
                </p>
                <p className="text-base text-gray-400 mt-2">
                  ऊपर से कोई सेवा चुनकर अपनी पहली बुकिंग करें
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
