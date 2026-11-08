import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Pexels free images (per-creator, mixed portrait + cover)
const DATA: Record<string, { avatar: string; cover: string }> = {
  amara:  { avatar: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=400', cover: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=1400' },
  juma:   { avatar: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=400', cover: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=1400' },
  nia:    { avatar: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=400', cover: 'https://images.pexels.com/photos/7299866/pexels-photo-7299866.jpeg?w=1400' },
  kev:    { avatar: 'https://images.pexels.com/photos/7299866/pexels-photo-7299866.jpeg?w=400', cover: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=1400' },
  zawadi: { avatar: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=400', cover: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=1400' },
  tai:    { avatar: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=400', cover: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=1400' },
  sanaa:  { avatar: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=400', cover: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=1400' },
  moyo:   { avatar: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=400', cover: 'https://images.pexels.com/photos/7299866/pexels-photo-7299866.jpeg?w=1400' },
};

async function main() {
  for (const [handle, d] of Object.entries(DATA)) {
    await prisma.creator.update({
      where: { handle },
      data: { avatarKey: d.avatar, coverKey: d.cover },
    });
    console.log(`updated @${handle}`);
  }
  console.log('done');
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); process.exit(1); });
