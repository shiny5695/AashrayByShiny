import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  availableCount: number;
}

export default function ServiceCard({ service, availableCount }: ServiceCardProps) {
  const [, navigate] = useLocation();

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      primary: "bg-primary-50 text-primary-500",
      secondary: "bg-orange-50 text-secondary-500", 
      blue: "bg-blue-50 text-blue-500",
      pink: "bg-pink-50 text-pink-500",
      yellow: "bg-yellow-50 text-yellow-600",
    };
    return colorMap[color] || "bg-gray-50 text-gray-500";
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/services/${service.id}`)}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${getColorClasses(service.color)}`}>
            <i className={`${service.icon} text-3xl`}></i>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {service.name}
          </h3>
          <p className="text-base text-gray-600 mb-4">
            {service.description}
          </p>
          <div className="flex items-center justify-center space-x-2 text-base text-green-600">
            <i className="fas fa-circle text-xs"></i>
            <span>{availableCount} उपलब्ध</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
