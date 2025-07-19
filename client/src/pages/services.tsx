import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ProviderCard from "@/components/provider-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const serviceNames: Record<string, string> = {
  nurse: "नर्स सेवा",
  electrician: "इलेक्ट्रीशियन",
  plumber: "प्लंबर",
  beautician: "ब्यूटीशियन",
  cab_driver: "कैब ड्राइवर",
};

export default function Services() {
  const { serviceType } = useParams();
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: providers, isLoading } = useQuery({
    queryKey: ["/api/service-providers", { serviceType, location }],
  });

  const serviceName = serviceNames[serviceType || ""] || "सेवा";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card className="mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-medium text-gray-900 mb-6">
              {serviceName} - उपलब्ध व्यावसायिक
            </h3>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-medium text-gray-700 mb-3">
                  आपका क्षेत्र
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue placeholder="क्षेत्र चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">सभी क्षेत्र</SelectItem>
                    <SelectItem value="साकेत">दिल्ली - साकेत</SelectItem>
                    <SelectItem value="गुड़गांव">दिल्ली - गुड़गांव</SelectItem>
                    <SelectItem value="नोएडा">दिल्ली - नोएडा</SelectItem>
                    <SelectItem value="द्वारका">दिल्ली - द्वारका</SelectItem>
                    <SelectItem value="लाजपत नगर">दिल्ली - लाजपत नगर</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-lg font-medium text-gray-700 mb-3">
                  तारीख चुनें
                </Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-12 text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Providers List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            [1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-40" />
                          <Skeleton className="h-4 w-60" />
                          <Skeleton className="h-4 w-80" />
                          <Skeleton className="h-4 w-96" />
                        </div>
                        <Skeleton className="h-12 w-32" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : providers?.length > 0 ? (
            providers.map((provider: any) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  कोई सेवा प्रदाता नहीं मिला
                </h3>
                <p className="text-base text-gray-500">
                  इस समय {serviceName} के लिए कोई व्यावसायिक उपलब्ध नहीं है।
                  <br />
                  कृपया बाद में पुनः प्रयास करें या अन्य क्षेत्र चुनें।
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
