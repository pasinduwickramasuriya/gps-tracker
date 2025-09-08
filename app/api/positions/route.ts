import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const devicesWithPosition = devices.map(device => ({
      id: device.id,
      deviceId: device.deviceId,
      name: device.name,
      isActive: device.isActive,
      lastSeen: device.lastSeen,
      latestPosition: device.positions[0] || null,
    }))

    return NextResponse.json(devicesWithPosition)
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
  }
}
