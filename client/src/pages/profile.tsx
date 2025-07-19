import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    userType: user?.userType || "senior_citizen",
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: "",
  });

  const { data: relatives } = useQuery({
    queryKey: ["/api/relatives"],
  });

  const { data: emergencyContacts } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/auth/user", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "प्रोफाइल अपडेट हुई",
        description: "आपकी जानकारी सफलतापूर्वक सहेजी गई है।",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        title: "अपडेट में समस्या",
        description: "कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    },
  });

  const addEmergencyContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/emergency-contacts", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "आपातकालीन संपर्क जोड़ा गया",
        description: "नया आपातकालीन संपर्क सफलतापूर्वक जोड़ा गया।",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
      setEmergencyContact({ name: "", phone: "", relationship: "" });
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
        title: "संपर्क जोड़ने में समस्या",
        description: "कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleEmergencyContactAdd = () => {
    if (!emergencyContact.name || !emergencyContact.phone || !emergencyContact.relationship) {
      toast({
        title: "जानकारी अधूरी है",
        description: "कृपया सभी फील्ड भरें।",
        variant: "destructive",
      });
      return;
    }
    addEmergencyContactMutation.mutate(emergencyContact);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-2xl text-white"></i>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-gray-900">
                  प्रोफाइल सेटिंग्स
                </h2>
                <p className="text-base text-gray-600">
                  अपनी जानकारी और आपातकालीन संपर्क प्रबंधित करें
                </p>
              </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="text-base">
                  व्यक्तिगत जानकारी
                </TabsTrigger>
                <TabsTrigger value="emergency" className="text-base">
                  आपातकालीन संपर्क
                </TabsTrigger>
                <TabsTrigger value="relatives" className="text-base">
                  रिश्तेदार
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-lg font-medium text-gray-700 mb-3">
                      पहला नाम
                    </Label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-lg font-medium text-gray-700 mb-3">
                      अंतिम नाम
                    </Label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-medium text-gray-700 mb-3">
                    फोन नंबर
                  </Label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label className="text-lg font-medium text-gray-700 mb-3">
                    पता
                  </Label>
                  <Textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="text-base min-h-[100px]"
                    placeholder="पूरा पता लिखें"
                  />
                </div>

                <Button
                  onClick={handleProfileUpdate}
                  disabled={updateProfileMutation.isPending}
                  size="lg"
                  className="text-lg px-8"
                >
                  {updateProfileMutation.isPending ? "सहेज रहे हैं..." : "प्रोफाइल सहेजें"}
                </Button>
              </TabsContent>

              {/* Emergency Contacts Tab */}
              <TabsContent value="emergency" className="space-y-6">
                {/* Existing Contacts */}
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">
                    मौजूदा आपातकालीन संपर्क
                  </h3>
                  {emergencyContacts?.length > 0 ? (
                    <div className="space-y-3">
                      {emergencyContacts.map((contact: any) => (
                        <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{contact.name}</h4>
                            <p className="text-base text-gray-600">{contact.phone}</p>
                            <p className="text-sm text-gray-500">{contact.relationship}</p>
                          </div>
                          {contact.isPrimary && (
                            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm">
                              मुख्य
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <i className="fas fa-phone text-2xl text-gray-400 mb-3"></i>
                      <p className="text-lg text-gray-500">कोई आपातकालीन संपर्क नहीं</p>
                    </div>
                  )}
                </div>

                {/* Add New Contact */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <h4 className="text-xl font-medium text-gray-900 mb-4">
                      नया आपातकालीन संपर्क जोड़ें
                    </h4>
                    <div className="space-y-4">
                      <Input
                        value={emergencyContact.name}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                        placeholder="नाम"
                        className="h-12 text-base"
                      />
                      <Input
                        type="tel"
                        value={emergencyContact.phone}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                        placeholder="फोन नंबर"
                        className="h-12 text-base"
                      />
                      <Input
                        value={emergencyContact.relationship}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                        placeholder="रिश्ता (जैसे: बेटा, बेटी, पति, पत्नी)"
                        className="h-12 text-base"
                      />
                      <Button
                        onClick={handleEmergencyContactAdd}
                        disabled={addEmergencyContactMutation.isPending}
                        className="text-base"
                      >
                        {addEmergencyContactMutation.isPending ? "जोड़ रहे हैं..." : "संपर्क जोड़ें"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Relatives Tab */}
              <TabsContent value="relatives" className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">
                    जुड़े हुए रिश्तेदार
                  </h3>
                  {relatives?.length > 0 ? (
                    <div className="space-y-3">
                      {relatives.map((rel: any) => (
                        <div key={rel.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {rel.relative.firstName} {rel.relative.lastName}
                            </h4>
                            <p className="text-base text-gray-600">{rel.relative.email}</p>
                            <p className="text-sm text-gray-500">{rel.relationship}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded text-sm ${
                              rel.canBookServices ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {rel.canBookServices ? "बुकिंग अनुमति है" : "बुकिंग अनुमति नहीं"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <i className="fas fa-users text-2xl text-gray-400 mb-3"></i>
                      <p className="text-lg text-gray-500 mb-2">कोई रिश्तेदार जुड़ा नहीं है</p>
                      <p className="text-base text-gray-400">
                        रिश्तेदार आपकी ओर से सेवा बुक कर सकते हैं
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
