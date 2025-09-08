import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Device } from '@/lib/types'

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        positions: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(devices as Device[])
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { deviceId, name } = (await request.json()) as Pick<Device, 'deviceId' | 'name'>

    if (!deviceId || !name) {
      return NextResponse.json({ error: 'Device ID and name required' }, { status: 400 })
    }

    const device = await prisma.device.create({
      data: { deviceId, name },
    })

    return NextResponse.json(device, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Device ID already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create device' }, { status: 500 })
  }
}
