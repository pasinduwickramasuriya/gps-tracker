"use client";

import { useState, useEffect, FormEvent } from "react";
import { Device } from "@/lib/types";

export default function DeviceTable() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({ deviceId: "", name: "" });

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error("Error saving device:", error);
      alert("Error saving device");
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setFormData({ deviceId: device.deviceId, name: device.name });
    setShowForm(true);
  };

  const handleDelete = async (device: Device) => {
    if (
      !confirm(
        `Delete ${device.name}? This will also delete all location history.`
      )
    )
      return;
    try {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: "DELETE",
      });
      if (response.ok) fetchDevices();
      else alert("Failed to delete device");
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("Error deleting device");
    }
  };

  const toggleActive = async (device: Device) => {
    try {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !device.isActive }),
      });
      if (response.ok) fetchDevices();
    } catch (error) {
      console.error("Error updating device:", error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDevice(null);
    setFormData({ deviceId: "", name: "" });
  };

  if (loading)
    return <div className="text-center py-8">Loading devices...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Device Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Device
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingDevice ? "Edit Device" : "Add New Device"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device ID *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., phone-001"
                value={formData.deviceId}
                onChange={(e) =>
                  setFormData({ ...formData, deviceId: e.target.value })
                }
                disabled={!!editingDevice}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must match Traccar Client ID
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., John's Phone"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {editingDevice ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Device Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Device Info
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Latest Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Last Seen
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {devices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No devices found. Add your first device!
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {device.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {device.deviceId}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        device.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {device.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {device.positions && device.positions[0] ? (
                      <div>
                        <div>
                          📍 {device.positions[0].latitude.toFixed(4)},{" "}
                          {device.positions[0].longitude.toFixed(4)}
                        </div>
                        <div>
                          🚗 {Math.round(device.positions[0].speed || 0)} km/h
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No location data</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {new Date(device.lastSeen).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(device)}
                        className="bg-yellow-500 text-white px-3 py-1 text-sm rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(device)}
                        className={`px-3 py-1 text-sm rounded text-white ${
                          device.isActive
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {device.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(device)}
                        className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
