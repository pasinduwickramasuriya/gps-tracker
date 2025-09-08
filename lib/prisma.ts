import { PrismaClient } from '@prisma/client'

declare global {
  // Ensures that `globalThis.prisma` is recognized by TypeScript
  // but not re-declared on every file import.
  // `var` is important here for type merging.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
