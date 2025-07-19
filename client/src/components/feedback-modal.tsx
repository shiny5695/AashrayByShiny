import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface FeedbackModalProps {
  booking: any;
  onClose: () => void;
}

export default function FeedbackModal({ booking, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const reviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const response = await apiRequest("POST", "/api/reviews", {
        bookingId: booking.id,
        providerId: booking.providerId,
        rating: data.rating,
        comment: data.comment,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "समीक्षा सफल!",
        description: "आपकी समीक्षा सफलतापूर्वक सबमिट हुई है।",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
      onClose();
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
        title: "समीक्षा में समस्या",
        description: "कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "रेटिंग दें",
        description: "कृपया पहले स्टार रेटिंग दें।",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({ rating, comment });
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`text-3xl transition-colors ${
            i <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"
          }`}
        >
          <i className="fas fa-star"></i>
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-medium text-gray-900">
              सेवा की समीक्षा करें
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={reviewMutation.isPending}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 mb-4">
              {booking.provider.name} की सेवा को रेटिंग दें
            </p>
            <div className="flex justify-center space-x-2 mb-6">
              {renderStars()}
            </div>
            {rating > 0 && (
              <p className="text-base text-gray-600">
                {rating === 1 && "खराब"}
                {rating === 2 && "ठीक नहीं"}
                {rating === 3 && "ठीक है"}
                {rating === 4 && "अच्छा"}
                {rating === 5 && "बहुत अच्छा"}
              </p>
            )}
          </div>

          <div className="mb-6">
            <Label className="text-lg font-medium text-gray-700 mb-3">
              आपकी टिप्पणी
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-base min-h-[120px]"
              placeholder="सेवा के बारे में अपना अनुभव साझा करें"
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 text-lg py-6"
              onClick={onClose}
              disabled={reviewMutation.isPending}
            >
              रद्द करें
            </Button>
            <Button
              onClick={handleSubmit}
              size="lg"
              className="flex-1 text-lg py-6"
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? "सबमिट कर रहे हैं..." : "समीक्षा सबमिट करें"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
