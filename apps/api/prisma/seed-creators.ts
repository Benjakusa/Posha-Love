import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CREATORS = [
  { handle: 'amara', displayName: 'Amara', bio: 'Late night talks and city walks.', price: 20000 },
  { handle: 'juma', displayName: 'Juma', bio: 'Coffee, questions, and long-form chat.', price: 15000 },
  { handle: 'nia', displayName: 'Nia', bio: 'Sunday thoughts and soft music.', price: 30000 },
  { handle: 'kev', displayName: 'Kev', bio: 'Street sounds from Nairobi.', price: 10000 },
  { handle: 'zawadi', displayName: 'Zawadi', bio: 'Quiet hours, slow living.', price: 18000 },
  { handle: 'tai', displayName: 'Tai', bio: 'City lights and conversations.', price: 12000 },
  { handle: 'sanaa', displayName: 'Sanaa', bio: 'Art, storytelling, and the everyday.', price: 25000 },
  { handle: 'moyo', displayName: 'Moyo', bio: 'Heart-first conversations.', price: 22000 },
];

async function main() {
  for (const c of CREATORS) {
    const userId = `seed_creator_${c.handle}`;
    const existing = await prisma.creator.findUnique({ where: { handle: c.handle } });
    if (existing) {
      console.log(`skip @${c.handle} (exists)`);
      continue;
    }
    await prisma.creator.create({
      data: {
        userId,
        displayName: c.displayName,
        handle: c.handle,
        bio: c.bio,
        subscriptionPriceMinor: c.price,
        status: 'approved',
      },
    });
    console.log(`created @${c.handle} (id=${userId})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
