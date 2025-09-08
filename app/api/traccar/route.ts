import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('[TRACCAR] Incoming body:', body)

    // Adapt to Traccar's actual payload structure
    const id = body.device_id
    const coords = body.location?.coords
    const lat = coords?.latitude
    const lon = coords?.longitude
    const speed = coords?.speed
    const timestamp = body.location?.timestamp

    if (!id || lat === undefined || lon === undefined) {
      console.log('[TRACCAR] Missing required fields:', { id, lat, lon })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const upsertDevice = await prisma.device.upsert({
      where: { deviceId: id },
      update: { lastSeen: new Date(), isActive: true },
      create: { deviceId: id, name: `Device ${id}` },
    })
    console.log('[TRACCAR] Device upserted:', upsertDevice)

    const createdPosition = await prisma.position.create({
      data: {
        deviceId: id,
        latitude: Number(lat),
        longitude: Number(lon),
        speed: typeof speed === 'number' && speed !== -1 ? speed : null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })
    console.log('[TRACCAR] Position created:', createdPosition)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[TRACCAR] Server error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
