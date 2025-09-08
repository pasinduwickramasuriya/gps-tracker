import Link from "next/link";
import DeviceTable from "../components/DeviceTable";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Map,
  Smartphone,
  Activity,
  MapPin,
  Database,
  Plug,
  ArrowUpRight,
} from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-3xl">
                  <Settings className="h-8 w-8" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription className="text-lg">
                  Manage your GPS tracking devices
                </CardDescription>
              </div>
              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  <Map className="h-4 w-4" />
                  View Live Map
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Devices
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDevices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Devices
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDevices}</div>
              <Badge
                variant={stats.activeDevices > 0 ? "default" : "secondary"}
                className="mt-2"
              >
                {stats.activeDevices > 0 ? "Online" : "Offline"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Locations
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPositions.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Database className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  GPS coordinates stored
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Management */}
        <Card>
          <CardHeader>
            <CardTitle>Device Management</CardTitle>
            <CardDescription>
              View and manage all registered GPS tracking devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceTable />
          </CardContent>
        </Card>

        {/* API Information */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plug className="h-5 w-5" />
              API Endpoints
            </CardTitle>
            <CardDescription>
              Available endpoints for integrating with the GPS tracking system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-semibold">
                    POST
                  </Badge>
                  <span className="font-medium">Traccar Data Endpoint</span>
                </div>
                <Card className="bg-background/50">
                  <CardContent className="p-3">
                    <code className="text-sm font-mono break-all">
                      /api/traccar
                    </code>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <ArrowUpRight className="h-3 w-3" />
                  Receives GPS data from Traccar Client
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-semibold">
                    GET
                  </Badge>
                  <span className="font-medium">Live Positions</span>
                </div>
                <Card className="bg-background/50">
                  <CardContent className="p-3">
                    <code className="text-sm font-mono break-all">
                      /api/positions
                    </code>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <ArrowUpRight className="h-3 w-3" />
                  Returns latest positions for all devices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
