import { PrismaClient } from '@prisma/client';

let prismaClient;

export function getPrismaClient() {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}
