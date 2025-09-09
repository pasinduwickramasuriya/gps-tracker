"use client";

import { useEffect, useState, useCallback } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ViewStateChangeEvent
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
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
import { Button } from "@/components/ui/button";
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
  Target,
  X,
  AlertCircle,
} from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  transitionDuration?: number;
}

export default function LiveMap() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [focusedDevice, setFocusedDevice] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Map viewport state
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 5,
  });

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      toast.error("Mapbox token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.");
      return;
    }

    setIsLoaded(true);
    fetchPositions();

    const interval = setInterval(() => {
      fetchPositions();
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus when search finds single device
  useEffect(() => {
    const filteredDevices = getFilteredDevices();
    const devicesWithLocation = filteredDevices.filter(d => d.latestPosition);

    if (searchTerm && devicesWithLocation.length === 1) {
      const device = devicesWithLocation[0];
      flyToDevice(device);
      setFocusedDevice(device.id);
    } else if (!searchTerm) {
      setFocusedDevice(null);
    }
  }, [searchTerm, devices]);

  // Enhanced fetchPositions that matches your API structure
  const fetchPositions = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      console.log('🔄 Fetching positions from /api/positions');

      const response = await fetch("/api/positions", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data for real-time tracking
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(`API Error ${response.status}: ${errorData.error || 'Unknown error'}`);
        } else {
          throw new Error(`API endpoint '/api/positions' not found (Status ${response.status})`);
        }
      }

      const data: Device[] = await response.json();
      console.log('✅ Successfully fetched devices:', data.length);
      console.log('📊 Sample device:', data[0] || 'No devices');
      console.log('📊 Devices with location:', data.filter(d => d.latestPosition && d.latestPosition.latitude && d.latestPosition.longitude).length);

      setDevices(data);
      setFetchError(null);

      // Auto-center on first device with location if this is initial load
      if (!searchTerm && data.length > 0) {
        const firstDeviceWithLocation = data.find(d => d.latestPosition && d.latestPosition.latitude && d.latestPosition.longitude);
        if (firstDeviceWithLocation && devices.length === 0) {
          flyToDevice(firstDeviceWithLocation, false); // Don't show toast on initial load
        }
      }

    } catch (error: any) {
      console.error('❌ Error fetching positions:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setFetchError(errorMessage);
      toast.error(`Failed to fetch device positions: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered devices with null safety
  const getFilteredDevices = () => {
    if (!searchTerm.trim()) {
      return devices;
    }

    return devices.filter(
      (device) =>
        (device.name && device.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (device.deviceId && device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Enhanced fly to device with animation
  const flyToDevice = useCallback((device: Device, showToast: boolean = true) => {
    if (device.latestPosition && device.latestPosition.latitude && device.latestPosition.longitude) {
      const { latitude, longitude } = device.latestPosition;
      setViewState(prevState => ({
        ...prevState,
        longitude,
        latitude,
        zoom: 16,
        transitionDuration: 1500, // Smooth animation
      }));
      setFocusedDevice(device.id);
      if (showToast) {
        toast.success(`🎯 Focused on ${device.name}`);
      }
    } else {
      toast.error(`${device.name} has no location data available`);
    }
  }, []);

  // Handle marker click
  const onMarkerClick = useCallback((device: Device) => {
    setSelectedDevice(device);
    flyToDevice(device);
  }, [flyToDevice]);

  // Retry fetch function
  const retryFetch = () => {
    toast.info("Retrying to fetch devices...");
    fetchPositions();
  };

  // Clear search and show all devices
  const clearSearch = () => {
    setSearchTerm("");
    setFocusedDevice(null);
    setSelectedDevice(null);

    // Show all devices on map
    const devicesWithLocation = devices.filter(d => d.latestPosition && d.latestPosition.latitude && d.latestPosition.longitude);
    if (devicesWithLocation.length > 0) {
      // Calculate bounds to fit all devices
      const latitudes = devicesWithLocation.map(d => d.latestPosition!.latitude);
      const longitudes = devicesWithLocation.map(d => d.latestPosition!.longitude);

      const centerLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
      const centerLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

      setViewState(prevState => ({
        ...prevState,
        longitude: centerLng,
        latitude: centerLat,
        zoom: 10,
        transitionDuration: 1000,
      }));
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
              <span>Loading GPS Tracking Map...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!MAPBOX_TOKEN) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-2xl">🗝️</div>
            <div>
              <h3 className="text-lg font-semibold">Mapbox Token Required</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please add your Mapbox token to <code className="bg-muted px-1 rounded">.env.local</code>:
              </p>
              <code className="block bg-muted p-2 rounded mt-2 text-sm">
                NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Get your token from <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">mapbox.com</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if API fetch failed
  if (fetchError && devices.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-600">API Connection Error</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Failed to connect to the device tracking API:
              </p>
              <code className="block bg-red-50 border border-red-200 p-3 rounded text-xs text-red-700 mb-4">
                {fetchError}
              </code>
              <div className="flex gap-2">
                <Button onClick={retryFetch} variant="default" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </Button>
                <Button
                  onClick={() => window.open('/api/positions', '_blank')}
                  variant="outline"
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Test API
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredDevices = getFilteredDevices();
  const devicesWithLocation = devices.filter((d) => d.latestPosition && d.latestPosition.latitude && d.latestPosition.longitude);
  const filteredWithLocation = filteredDevices.filter((d) => d.latestPosition && d.latestPosition.latitude && d.latestPosition.longitude);

  return (
    <div className="w-full space-y-4">
      {/* Error Banner */}
      {fetchError && devices.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Connection Warning: {fetchError}
                </p>
              </div>
              <Button onClick={retryFetch} size="sm" variant="outline">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Device Search & Focus
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search devices by name or ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearSearch}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results Preview */}
          {searchTerm && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Found {filteredDevices.length} device(s) • {filteredWithLocation.length} with GPS location
              </p>
              <div className="flex flex-wrap gap-2">
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <Badge
                      key={device.id}
                      variant={
                        focusedDevice === device.id
                          ? "default"
                          : device.latestPosition && device.latestPosition.latitude && device.latestPosition.longitude
                            ? "secondary"
                            : "outline"
                      }
                      className="cursor-pointer gap-1 hover:scale-105 transition-transform"
                      onClick={() => device.latestPosition && device.latestPosition.latitude && device.latestPosition.longitude && onMarkerClick(device)}
                    >
                      {device.latestPosition && device.latestPosition.latitude && device.latestPosition.longitude && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {focusedDevice === device.id && <Target className="h-3 w-3" />}
                      {device.name || `Device ${device.deviceId}`}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Search className="h-3 w-3" />
                    No devices found matching "{searchTerm}"
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live GPS Tracking Map
                {focusedDevice && (
                  <Badge variant="default" className="ml-2 gap-1">
                    <Target className="h-3 w-3" />
                    Focused
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time GPS positions • {devicesWithLocation.length} active device{devicesWithLocation.length !== 1 ? "s" : ""} tracking
                {filteredDevices.length !== devices.length && (
                  <span className="ml-2 text-primary">
                    (filtered {filteredDevices.length} from {devices.length} total)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <Signal className="h-3 w-3" />
                LIVE
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full rounded-lg overflow-hidden border-2 border-muted shadow-lg">
            <Map
              {...viewState}
              onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            >
              <NavigationControl position="top-left" />
              <FullscreenControl position="top-left" />

              {/* Red Circle Markers */}
              {filteredDevices.map((device) => {
                // Enhanced null checking for location data
                if (!device.latestPosition ||
                  !device.latestPosition.latitude ||
                  !device.latestPosition.longitude ||
                  typeof device.latestPosition.latitude !== 'number' ||
                  typeof device.latestPosition.longitude !== 'number') {
                  return null;
                }

                const { latitude, longitude } = device.latestPosition;
                const isFocused = focusedDevice === device.id;

                return (
                  <Marker
                    key={device.id}
                    longitude={longitude}
                    latitude={latitude}
                  >
                    <div
                      className={`cursor-pointer transition-transform hover:scale-110 ${isFocused ? 'animate-pulse' : ''
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkerClick(device);
                      }}
                    >
                      {/* Large Red Circle Marker */}
                      <div
                        className={`w-8 h-8 rounded-full border-4 border-white shadow-lg ${isFocused ? 'bg-red-600 ring-4 ring-red-300' : 'bg-red-500'
                          }`}
                        style={{
                          boxShadow: isFocused
                            ? '0 0 20px rgba(239, 68, 68, 0.8)'
                            : '0 4px 12px rgba(239, 68, 68, 0.5)',
                        }}
                      />
                      {/* Device name tooltip */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {device.name || `Device ${device.deviceId}`}
                      </div>
                    </div>
                  </Marker>
                );
              })}

              {/* Enhanced Device Popup */}
              {selectedDevice && selectedDevice.latestPosition && (
                <Popup
                  longitude={selectedDevice.latestPosition.longitude}
                  latitude={selectedDevice.latestPosition.latitude}
                  anchor="bottom"
                  onClose={() => setSelectedDevice(null)}
                  closeOnClick={false}
                  className="max-w-sm"
                >
                  <div className="p-4 min-w-80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl text-gray-800">
                        {selectedDevice.name || `Device ${selectedDevice.deviceId}`}
                      </h3>
                      <Badge variant="destructive" className="gap-1 text-xs">
                        🔴 LIVE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-700">Device ID</p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded border">
                            {selectedDevice.deviceId}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-700">Speed</p>
                          <Badge variant="secondary" className="text-sm font-bold">
                            {Math.round(selectedDevice.latestPosition.speed || 0)} km/h
                          </Badge>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700">GPS Coordinates</p>
                          <p className="font-mono text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                            📍 {selectedDevice.latestPosition.latitude.toFixed(6)}, {selectedDevice.latestPosition.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700">Last Update</p>
                          <p className="text-sm text-gray-600">
                            📅 {new Date(selectedDevice.latestPosition.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700">Status</p>
                          <Badge variant={selectedDevice.isActive ? "default" : "secondary"} className="text-xs">
                            {selectedDevice.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        onClick={() => flyToDevice(selectedDevice)}
                        className="flex-1 gap-2"
                        variant="default"
                      >
                        <Target className="h-4 w-4" />
                        🎯 Focus Here
                      </Button>
                      <Button
                        onClick={() => setSelectedDevice(null)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Popup>
              )}
            </Map>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Smartphone className="h-3 w-3" />
                Total: {devices.length}
              </Badge>

              <Badge variant="default" className="gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                GPS Active: {devicesWithLocation.length}
              </Badge>

              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  Found: {filteredDevices.length} ({filteredWithLocation.length} with GPS)
                </Badge>
              )}

              {focusedDevice && (
                <Badge variant="default" className="gap-1">
                  <Target className="h-3 w-3" />
                  Focused Device
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Auto-refresh: 5s</span>
              <span className="text-xs">
                🕒 {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {devices.length === 0 && !fetchError && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Smartphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No GPS Devices Found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              No active GPS tracking devices are currently registered in the system.
              Add devices to start tracking their locations in real-time.
            </p>
            <Button onClick={retryFetch} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
