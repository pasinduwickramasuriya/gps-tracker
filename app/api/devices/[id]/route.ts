import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Device } from '@/lib/types'

interface Params {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const device = await prisma.device.findUnique({
      where: { id: params.id },
      include: {
        positions: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    })

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    return NextResponse.json(device as Device)
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch device' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { name, isActive } = (await request.json()) as Partial<Device>

    const device = await prisma.device.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(device as Device)
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await prisma.position.deleteMany({
      where: { deviceId: params.id },
    })

    await prisma.device.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 })
  }
}
