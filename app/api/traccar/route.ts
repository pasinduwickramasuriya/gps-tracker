import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface TraccarBody {
  id: string
  lat: string | number
  lon: string | number
  speed?: string | number
  timestamp?: string
}

export async function POST(request: Request) {
  try {
    const body: TraccarBody = await request.json()
    const { id, lat, lon, speed, timestamp } = body

    console.log('📡 Received from Traccar:', { id, lat, lon })

    if (!id || lat === undefined || lon === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create or update device
    await prisma.device.upsert({
      where: { deviceId: id },
      update: {
        lastSeen: new Date(),
        isActive: true,
      },
      create: {
        deviceId: id,
        name: `Device ${id}`,
      },
    })

    // Save position
    await prisma.position.create({
      data: {
        deviceId: id,
        latitude: Number(lat),
        longitude: Number(lon),
        speed: speed ? Number(speed) : null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    console.log(`✅ Location saved for ${id}`)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
