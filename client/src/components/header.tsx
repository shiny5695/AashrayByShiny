import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Header() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b-2 border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-primary-500 text-white p-3 rounded-lg">
              <i className="fas fa-home text-2xl"></i>
            </div>
            <div>
              <div className="flex items-start gap-1">
                <h1 className="text-2xl font-medium text-gray-900">आश्रय</h1>
                <span className="text-xs text-gray-400 mt-1">by Shiny</span>
              </div>
              <p className="text-base text-gray-600">आपकी सेवा में</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button variant="outline" size="sm" className="px-4 py-2 text-base font-medium">
              हिंदी | EN
            </Button>
            {/* Profile */}
            <div 
              className="flex items-center space-x-2 bg-gray-100 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => navigate("/profile")}
            >
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
              )}
              <span className="text-base font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            {/* Logout */}
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/api/logout")}
              className="text-base"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              लॉगआउट
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
