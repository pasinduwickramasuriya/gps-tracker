"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Device } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Smartphone,
  Activity,
  RefreshCw,
  Loader2,
  Gauge,
  Clock,
  Signal,
} from "lucide-react";

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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setIsLoaded(true);
    fetchPositions();

    const interval = setInterval(() => {
      fetchPositions();
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/positions");
      const data: Device[] = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast.error("Failed to fetch device positions");
    }
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              <span>Loading Map...</span>
            </div>
          </div>
        </CardContent>
      </Card>
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

  const devicesWithLocation = devices.filter((d) => d.latestPosition);

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Device Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search devices by name or ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Tracking Map
              </CardTitle>
              <CardDescription>
                Real-time GPS positions with {devicesWithLocation.length} active
                device{devicesWithLocation.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Signal className="h-3 w-3" />
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full rounded-lg overflow-hidden border">
            <MapContainer
              center={getCenter()}
              zoom={12}
              className="h-full w-full"
            >
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
                      <div className="p-2 min-w-48 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg">{device.name}</h3>
                          <Badge variant="default" className="gap-1">
                            <Activity className="h-3 w-3" />
                            LIVE
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">Device ID:</span>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {device.deviceId}
                            </code>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">Location:</span>
                            <span className="font-mono text-xs">
                              {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Gauge className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">Speed:</span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(speed || 0)} km/h
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">Updated:</span>
                            <span className="text-xs">
                              {new Date(timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Smartphone className="h-3 w-3" />
                  Total: {devices.length}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="default" className="gap-1">
                  <Activity className="h-3 w-3" />
                  With Location: {devicesWithLocation.length}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  Showing: {filteredDevices.length}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Auto-refresh: 5s</span>
              <span className="text-xs">
                • Last: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
