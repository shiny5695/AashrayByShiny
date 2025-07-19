import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const bookingSchema = z.object({
  bookingDate: z.string().min(1, "दिनांक चुनना आवश्यक है"),
  time: z.string().min(1, "समय चुनना आवश्यक है"),
  duration: z.number().min(1, "अवधि चुनना आवश्यक है"),
  address: z.string().min(10, "पूरा पता लिखना आवश्यक है"),
  specialInstructions: z.string().optional(),
  bookedByRelative: z.boolean().default(false),
  relativeId: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Booking() {
  const { providerId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookedByRelative, setBookedByRelative] = useState(false);

  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ["/api/service-providers", providerId],
  });

  const { data: relatives } = useQuery({
    queryKey: ["/api/relatives"],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      bookingDate: new Date().toISOString().split('T')[0],
      time: "",
      duration: 1,
      address: user?.address || "",
      specialInstructions: "",
      bookedByRelative: false,
      relativeId: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const bookingDateTime = new Date(`${data.bookingDate}T${data.time}`);
      const totalAmount = (parseFloat(provider.hourlyRate) * data.duration).toFixed(2);
      
      const bookingData = {
        providerId: parseInt(providerId!),
        bookingDate: bookingDateTime.toISOString(),
        duration: data.duration,
        totalAmount,
        address: data.address,
        specialInstructions: data.specialInstructions || null,
        bookedByRelative: data.bookedByRelative,
        relativeId: data.bookedByRelative ? data.relativeId : null,
      };

      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return await response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "बुकिंग सफल!",
        description: `आपकी बुकिंग पुष्टि हो गई है। बुकिंग ID: ${booking.id}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      navigate("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "बुकिंग में समस्या",
        description: "कृपया पुनः प्रयास करें या सहायता के लिए संपर्क करें।",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const duration = form.watch("duration");
  const totalAmount = provider ? (parseFloat(provider.hourlyRate) * duration).toFixed(0) : "0";

  useEffect(() => {
    if (user?.address) {
      form.setValue("address", user.address);
    }
  }, [user, form]);

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                <Skeleton className="h-8 w-96" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-2xl text-red-500"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                सेवा प्रदाता नहीं मिला
              </h3>
              <p className="text-base text-gray-600 mb-6">
                यह सेवा प्रदाता उपलब्ध नहीं है या हटा दिया गया है।
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                वापस जाएं
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-2xl font-medium text-gray-900 mb-6">
              अपॉइंटमेंट बुक करें - {provider.name}
            </h3>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-lg font-medium text-gray-700 mb-3">
                    दिनांक चुनें
                  </Label>
                  <Input
                    type="date"
                    {...form.register("bookingDate")}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-12 text-base"
                  />
                  {form.formState.errors.bookingDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.bookingDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-lg font-medium text-gray-700 mb-3">
                    समय चुनें
                  </Label>
                  <Select
                    value={form.watch("time")}
                    onValueChange={(value) => form.setValue("time", value)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="समय चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.availableFrom && provider.availableTo && (
                        Array.from(
                          { length: parseInt(provider.availableTo) - parseInt(provider.availableFrom) },
                          (_, i) => {
                            const hour = parseInt(provider.availableFrom) + i;
                            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                            const displayTime = hour < 12 ? `${hour}:00 AM` : 
                              hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`;
                            return (
                              <SelectItem key={timeStr} value={timeStr}>
                                {displayTime}
                              </SelectItem>
                            );
                          }
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.time && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.time.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label className="text-lg font-medium text-gray-700 mb-3">
                  सेवा की अवधि
                </Label>
                <Select
                  value={form.watch("duration").toString()}
                  onValueChange={(value) => form.setValue("duration", parseInt(value))}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 घंटा - ₹{provider.hourlyRate}</SelectItem>
                    <SelectItem value="2">2 घंटे - ₹{(parseFloat(provider.hourlyRate) * 2).toFixed(0)}</SelectItem>
                    <SelectItem value="3">3 घंटे - ₹{(parseFloat(provider.hourlyRate) * 3).toFixed(0)}</SelectItem>
                    <SelectItem value="4">4 घंटे - ₹{(parseFloat(provider.hourlyRate) * 4).toFixed(0)}</SelectItem>
                    <SelectItem value="8">8 घंटे - ₹{(parseFloat(provider.hourlyRate) * 8).toFixed(0)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div>
                <Label className="text-lg font-medium text-gray-700 mb-3">
                  पता
                </Label>
                <Textarea
                  {...form.register("address")}
                  className="text-base min-h-[80px]"
                  placeholder="पूरा पता लिखें"
                />
                {form.formState.errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              {/* Special Instructions */}
              <div>
                <Label className="text-lg font-medium text-gray-700 mb-3">
                  विशेष निर्देश (वैकल्पिक)
                </Label>
                <Textarea
                  {...form.register("specialInstructions")}
                  className="text-base min-h-[80px]"
                  placeholder="कोई विशेष आवश्यकता या निर्देश"
                />
              </div>

              {/* Relative Booking Option */}
              {relatives && relatives.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Checkbox
                        id="relative-booking"
                        checked={bookedByRelative}
                        onCheckedChange={(checked) => {
                          setBookedByRelative(!!checked);
                          form.setValue("bookedByRelative", !!checked);
                        }}
                      />
                      <Label htmlFor="relative-booking" className="text-lg font-medium text-gray-700">
                        क्या यह बुकिंग किसी रिश्तेदार की ओर से है?
                      </Label>
                    </div>
                    {bookedByRelative && (
                      <Select
                        value={form.watch("relativeId")}
                        onValueChange={(value) => form.setValue("relativeId", value)}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="रिश्तेदार चुनें" />
                        </SelectTrigger>
                        <SelectContent>
                          {relatives.map((rel: any) => (
                            <SelectItem key={rel.relativeId} value={rel.relativeId}>
                              {rel.relative.firstName} {rel.relative.lastName} ({rel.relationship})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Booking Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <h4 className="text-xl font-medium text-gray-900 mb-4">
                    बुकिंग सारांश
                  </h4>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span>सेवा प्रदाता:</span>
                      <span className="font-medium">{provider.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>सेवा:</span>
                      <span className="font-medium">
                        {provider.serviceType === "nurse" && "नर्स सेवा"}
                        {provider.serviceType === "electrician" && "इलेक्ट्रीशियन"}
                        {provider.serviceType === "plumber" && "प्लंबर"}
                        {provider.serviceType === "beautician" && "ब्यूटीशियन"}
                        {provider.serviceType === "cab_driver" && "कैब ड्राइवर"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>दर:</span>
                      <span className="font-medium">₹{provider.hourlyRate}/घंटा</span>
                    </div>
                    <div className="flex justify-between">
                      <span>अवधि:</span>
                      <span className="font-medium">{duration} घंटे</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg font-medium">
                      <span>कुल राशि:</span>
                      <span>₹{totalAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 text-lg py-6"
                  onClick={() => navigate("/")}
                  disabled={bookingMutation.isPending}
                >
                  रद्द करें
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 text-lg py-6"
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      प्रक्रिया में...
                    </>
                  ) : (
                    "बुकिंग पुष्टि करें"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
