import Link from "next/link";
import DeviceTable from "../components/DeviceTable";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [totalDevices, activeDevices, totalPositions] = await Promise.all([
    prisma.device.count(),
    prisma.device.count({ where: { isActive: true } }),
    prisma.position.count(),
  ]);

  return { totalDevices, activeDevices, totalPositions };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage your GPS tracking devices</p>
          </div>
          <Link
            href="/"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            🗺️ View Live Map
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Devices
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDevices}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-2xl">🟢</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Active Devices
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeDevices}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <span className="text-2xl">📍</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Locations
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPositions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Device Management */}
        <DeviceTable />

        {/* API Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🔌 API Endpoints
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Traccar Data Endpoint:</p>
              <code className="bg-gray-100 px-2 py-1 rounded block mt-1">
                POST /api/traccar
              </code>
              <p className="text-gray-600 mt-1">
                Receives GPS data from Traccar Client
              </p>
            </div>
            <div>
              <p className="font-medium">Live Positions:</p>
              <code className="bg-gray-100 px-2 py-1 rounded block mt-1">
                GET /api/positions
              </code>
              <p className="text-gray-600 mt-1">
                Returns latest positions for all devices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
