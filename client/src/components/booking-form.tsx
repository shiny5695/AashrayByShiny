import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const bookingSchema = z.object({
  date: z.string().min(1, "तारीख चुनना आवश्यक है"),
  time: z.string().min(1, "समय चुनना आवश्यक है"),
  duration: z.number().min(1, "अवधि चुनना आवश्यक है"),
  address: z.string().min(10, "पूरा पता लिखना आवश्यक है"),
  specialInstructions: z.string().optional(),
  bookedByRelative: z.boolean().default(false),
  relativeId: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  provider: any;
  relatives?: any[];
  onSubmit: (data: BookingFormData) => void;
  isSubmitting: boolean;
}

export default function BookingForm({ 
  provider, 
  relatives = [], 
  onSubmit, 
  isSubmitting 
}: BookingFormProps) {
  const [bookedByRelative, setBookedByRelative] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: "",
      duration: 1,
      address: "",
      specialInstructions: "",
      bookedByRelative: false,
      relativeId: "",
    },
  });

  const duration = form.watch("duration");
  const totalAmount = (parseFloat(provider.hourlyRate) * duration).toFixed(0);

  return (
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
                {...form.register("date")}
                min={new Date().toISOString().split('T')[0]}
                className="h-12 text-base"
              />
              {form.formState.errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.date.message}
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
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
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
          {relatives.length > 0 && (
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
              disabled={isSubmitting}
            >
              रद्द करें
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "प्रक्रिया में..." : "बुकिंग पुष्टि करें"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
