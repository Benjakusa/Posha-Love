import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VIDEO_URLS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

const IMAGE_URLS = [
  'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=900',
  'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=900',
  'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=900',
  'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=900',
  'https://images.pexels.com/photos/7299866/pexels-photo-7299866.jpeg?w=900',
];

const CAPTIONS = [
  'Late night thoughts. Anyone else awake?',
  'Coffee and questions. Ask me anything.',
  'Sunday vibes, slow mornings.',
  'City sounds from my window.',
  'New week, new energy.',
  'The quietest hour of the day.',
  'Real talk. No filters.',
  'Golden hour again.',
  'A moment of stillness.',
  'Thinking about the people who lift us up.',
  'Just me and this light.',
  'Behind the scenes.',
];

async function main() {
  const creators = await prisma.creator.findMany({ where: { status: 'approved' } });

  for (const c of creators) {
    // Clear existing posts for this creator
    await prisma.post.deleteMany({ where: { creatorId: c.userId } });

    // 4 videos
    for (let i = 0; i < 4; i++) {
      await prisma.post.create({
        data: {
          creatorId: c.userId,
          caption: CAPTIONS[(i + 3) % CAPTIONS.length],
          mediaKey: VIDEO_URLS[(i + creators.indexOf(c)) % VIDEO_URLS.length],
          mediaType: 'video',
        },
      });
    }

    // 2 images
    for (let i = 0; i < 2; i++) {
      await prisma.post.create({
        data: {
          creatorId: c.userId,
          caption: CAPTIONS[(i + 7) % CAPTIONS.length],
          mediaKey: IMAGE_URLS[(i + creators.indexOf(c)) % IMAGE_URLS.length],
          mediaType: 'image',
        },
      });
    }

    console.log(`@${c.handle}: 4 videos + 2 images`);
  }
  console.log('done');
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); process.exit(1); });
