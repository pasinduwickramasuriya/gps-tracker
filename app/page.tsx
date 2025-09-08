import Link from "next/link";
import LiveMap from "./components/LiveMap";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📍 GPS Live Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Real-time device tracking with search functionality
          </p>
          <Link
            href="/admin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            🛠️ Admin Dashboard
          </Link>
        </div>

        {/* Live Map */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🗺️ Live Tracking Map
          </h2>
          <LiveMap />
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            📱 Traccar Client Setup
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="mb-2">
                <strong>1.</strong> Install Traccar Client on your phone
              </p>
              <p className="mb-2">
                <strong>2.</strong> Open app settings
              </p>
              <p className="mb-2">
                <strong>3.</strong> Set Device Identifier:{" "}
                <code className="bg-blue-100 px-2 py-1 rounded">
                  your-device-id
                </code>
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>4.</strong> Set Server URL:{" "}
                <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                  http://YOUR-IP:3000/api/traccar
                </code>
              </p>
              <p className="mb-2">
                <strong>5.</strong> Set Frequency: <strong>10 seconds</strong>
              </p>
              <p className="mb-2">
                <strong>6.</strong> Start service and see your device appear!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
