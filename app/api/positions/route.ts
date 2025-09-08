import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Device } from '@/lib/types'

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      where: { isActive: true },
      include: {
        positions: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    })

    const devicesWithPosition: Device[] = devices.map(device => ({
      id: device.id,
      deviceId: device.deviceId,
      name: device.name,
      isActive: device.isActive,
      lastSeen: device.lastSeen,
      positions: device.positions,
      latestPosition: device.positions[0] || null,
    }))

    return NextResponse.json(devicesWithPosition)
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
  }
}
