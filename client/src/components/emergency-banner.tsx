import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function EmergencyBanner() {
  const { toast } = useToast();

  const sosMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/emergency/sos", {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🚨 SOS अलर्ट भेजा गया",
        description: `${data.contactsNotified} आपातकालीन संपर्कों को सूचना भेजी गई है।`,
      });
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
        title: "SOS अलर्ट में समस्या",
        description: "कृपया पुनः प्रयास करें या सीधे फोन करें।",
        variant: "destructive",
      });
    },
  });

  const handleSOS = () => {
    if (confirm("क्या आप वाकई आपातकालीन SOS अलर्ट भेजना चाहते हैं? इससे आपके सभी आपातकालीन संपर्कों को सूचना मिलेगी।")) {
      sosMutation.mutate();
    }
  };

  return (
    <div className="bg-error text-white py-4">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <i className="fas fa-exclamation-triangle text-2xl"></i>
            <span className="text-lg font-medium">आपातकाल में तुरंत सहायता</span>
          </div>
          <Button
            onClick={handleSOS}
            disabled={sosMutation.isPending}
            className="bg-white text-error px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {sosMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-error mr-2"></div>
                भेज रहे हैं...
              </>
            ) : (
              <>
                <i className="fas fa-phone mr-2"></i>
                SOS कॉल करें
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
