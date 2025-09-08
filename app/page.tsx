import Link from "next/link";
import LiveMap from "./components/LiveMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Settings,
  Smartphone,
  Server,
  Clock,
  Play,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="h-8 w-8 text-primary" />
              <CardTitle className="text-4xl font-bold">
                GPS Live Tracker
              </CardTitle>
            </div>
            <p className="text-xl text-muted-foreground">
              Real-time device tracking with search functionality
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="gap-2">
              <Link href="/admin">
                <Settings className="h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Live Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MapPin className="h-6 w-6" />
              Live Tracking Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveMap />
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Smartphone className="h-5 w-5" />
              Traccar Client Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    1
                  </Badge>
                  <span>Install Traccar Client on your phone</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    2
                  </Badge>
                  <span>Open app settings</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    3
                  </Badge>
                  <div>
                    <span>Set Device Identifier:</span>
                    <Badge variant="outline" className="ml-2 font-mono text-xs">
                      your-device-id
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    4
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="h-3 w-3" />
                      <span>Set Server URL:</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs break-all"
                    >
                      http://YOUR-IP:3000/api/traccar
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    5
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Set Frequency:</span>
                    <Badge variant="default" className="text-xs">
                      10 seconds
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    6
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Play className="h-3 w-3" />
                    <span>Start service and see your device appear!</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
