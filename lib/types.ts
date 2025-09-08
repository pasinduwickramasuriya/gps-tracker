// Common interfaces shared between API and components

export interface Position {
  id?: string
  latitude: number
  longitude: number
  speed?: number | null
  timestamp: string | Date
}

export interface Device {
  id: string
  deviceId: string
  name: string
  isActive: boolean
  createdAt?: string | Date
  lastSeen: string | Date
  positions?: Position[]
  latestPosition?: Position | null
}
