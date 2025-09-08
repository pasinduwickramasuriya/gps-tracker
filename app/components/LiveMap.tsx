"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Device } from "@/lib/types";

// Lazy load Leaflet components (no SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function LiveMap() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    fetchPositions();

    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/positions");
      const data: Device[] = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-lg">Loading Map... 🗺️</div>
      </div>
    );
  }

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCenter = (): [number, number] => {
    const deviceWithPosition = filteredDevices.find((d) => d.latestPosition);
    if (deviceWithPosition?.latestPosition) {
      return [
        deviceWithPosition.latestPosition.latitude,
        deviceWithPosition.latestPosition.longitude,
      ];
    }
    return [20.5937, 78.9629]; // Default (India)
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search devices by name or ID..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Map */}
      <div className="h-96 w-full rounded-lg overflow-hidden border-2 border-gray-200">
        <MapContainer center={getCenter()} zoom={12} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filteredDevices.map((device) => {
            if (!device.latestPosition) return null;

            const { latitude, longitude, speed, timestamp } =
              device.latestPosition;

            return (
              <Marker key={device.id} position={[latitude, longitude]}>
                <Popup>
                  <div className="p-2 min-w-48">
                    <h3 className="font-bold text-lg mb-2">{device.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Device ID:</strong> {device.deviceId}
                      </p>
                      <p>
                        <strong>Location:</strong> {latitude.toFixed(6)},{" "}
                        {longitude.toFixed(6)}
                      </p>
                      <p>
                        <strong>Speed:</strong> {Math.round(speed || 0)} km/h
                      </p>
                      <p>
                        <strong>Last Update:</strong>{" "}
                        {new Date(timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        🟢 LIVE
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div className="flex space-x-4">
          <span>
            📱 Total: <strong>{devices.length}</strong>
          </span>
          <span className="text-green-600">
            🟢 With Location:{" "}
            <strong>{devices.filter((d) => d.latestPosition).length}</strong>
          </span>
          <span>
            🔍 Showing: <strong>{filteredDevices.length}</strong>
          </span>
        </div>
        <span className="text-xs">🔄 Auto-refresh: 5s</span>
      </div>
    </div>
  );
}
