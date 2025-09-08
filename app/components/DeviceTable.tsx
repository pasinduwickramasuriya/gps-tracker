"use client";

import { useState, useEffect, FormEvent } from "react";
import { Device } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  MapPin,
  Gauge,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function DeviceTable() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({ deviceId: "", name: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/devices");
      const data: Device[] = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.error("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const loadingToast = toast.loading(
      `${editingDevice ? "Updating" : "Creating"} device...`
    );

    try {
      let response: Response;
      if (editingDevice) {
        response = await fetch(`/api/devices/${editingDevice.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        fetchDevices();
        resetForm();
        toast.success(
          `Device ${editingDevice ? "updated" : "created"} successfully`,
          {
            id: loadingToast,
          }
        );
      } else {
        const error = await response.json();
        toast.error(error.error, {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error saving device:", error);
      toast.error("Failed to save device", {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setFormData({ deviceId: device.deviceId, name: device.name });
    setShowForm(true);
  };

  const handleDelete = async (device: Device) => {
    const loadingToast = toast.loading("Deleting device...");

    try {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchDevices();
        toast.success("Device deleted successfully", {
          id: loadingToast,
        });
      } else {
        toast.error("Failed to delete device", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      toast.error("Failed to delete device", {
        id: loadingToast,
      });
    }
  };

  const toggleActive = async (device: Device) => {
    const loadingToast = toast.loading(
      `${device.isActive ? "Disabling" : "Enabling"} device...`
    );

    try {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !device.isActive }),
      });
      if (response.ok) {
        fetchDevices();
        toast.success(`Device ${!device.isActive ? "enabled" : "disabled"}`, {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error updating device:", error);
      toast.error("Failed to update device", {
        id: loadingToast,
      });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDevice(null);
    setFormData({ deviceId: "", name: "" });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading devices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Device Management</CardTitle>
            <CardDescription>
              Manage and monitor your GPS tracking devices
            </CardDescription>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingDevice ? "Edit Device" : "Add New Device"}
                </DialogTitle>
                <DialogDescription>
                  {editingDevice
                    ? "Update device information"
                    : "Create a new GPS tracking device"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deviceId">Device ID *</Label>
                    <Input
                      id="deviceId"
                      type="text"
                      required
                      placeholder="e.g., phone-001"
                      value={formData.deviceId}
                      onChange={(e) =>
                        setFormData({ ...formData, deviceId: e.target.value })
                      }
                      disabled={!!editingDevice}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must match Traccar Client ID
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Device Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g., John's Phone"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {editingDevice ? "Updating..." : "Creating..."}
                      </>
                    ) : editingDevice ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latest Location</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No devices found. Add your first device!
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {device.deviceId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={device.isActive ? "default" : "secondary"}
                        className="gap-1"
                      >
                        {device.isActive ? (
                          <Power className="h-3 w-3" />
                        ) : (
                          <PowerOff className="h-3 w-3" />
                        )}
                        {device.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {device.positions && device.positions[0] ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {device.positions[0].latitude.toFixed(4)},{" "}
                            {device.positions[0].longitude.toFixed(4)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Gauge className="h-3 w-3" />
                            {Math.round(device.positions[0].speed || 0)} km/h
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          No location data
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(device.lastSeen).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(device)}
                          className="gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant={device.isActive ? "secondary" : "default"}
                          size="sm"
                          onClick={() => toggleActive(device)}
                          className="gap-1"
                        >
                          {device.isActive ? (
                            <PowerOff className="h-3 w-3" />
                          ) : (
                            <Power className="h-3 w-3" />
                          )}
                          {device.isActive ? "Disable" : "Enable"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Device</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{device.name}"?
                                This will also delete all location history and
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(device)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
