import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-xl border-0">
          <CardContent className="p-12 text-center">
            <div className="bg-primary-500 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-home text-3xl"></i>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-3">
                <h1 className="text-4xl font-medium text-gray-900">स्वागत है आश्रय में</h1>
                <span className="text-lg text-gray-400">शाइनी द्वारा</span>
              </div>
            </div>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              सीनियर सिटिजन के लिए विश्वसनीय सेवा प्लेटफॉर्म
              <br />
              <span className="text-lg">आपकी सेवा में, आपके घर पर</span>
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-user-nurse text-2xl text-primary-500"></i>
                </div>
                <p className="text-base text-gray-600">नर्स सेवा</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-bolt text-2xl text-secondary-500"></i>
                </div>
                <p className="text-base text-gray-600">इलेक्ट्रीशियन</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-wrench text-2xl text-blue-500"></i>
                </div>
                <p className="text-base text-gray-600">प्लंबर</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-cut text-2xl text-pink-500"></i>
                </div>
                <p className="text-base text-gray-600">ब्यूटीशियन</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-taxi text-2xl text-yellow-600"></i>
                </div>
                <p className="text-base text-gray-600">कैब ड्राइवर</p>
              </div>
              <div className="text-center">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-phone text-2xl text-red-500"></i>
                </div>
                <p className="text-base text-gray-600">आपातकाल</p>
              </div>
            </div>

            <Button
              size="lg"
              className="text-xl px-12 py-6 rounded-xl"
              onClick={() => (window.location.href = "/api/login")}
            >
              <i className="fas fa-sign-in-alt mr-3"></i>
              लॉगिन करें
            </Button>

            <p className="text-base text-gray-500 mt-6">
              सुरक्षित और विश्वसनीय सेवा के लिए पहले लॉगिन करें
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
