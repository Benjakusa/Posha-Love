import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SAMPLE_IMAGES = [
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
  'New week, new energy. Who is with me?',
  'The quietest hour of the day.',
  'Real talk. No filters.',
  'Golden hour again.',
  'A moment of stillness.',
  'Thinking about the people who lift us up.',
];

const COMMENTS = [
  ['Love this', 'So true', 'Beautiful'],
  ['Where is this?', 'Amazing view'],
  ['Same energy today', 'Needed this'],
  ['We should collab', 'Beautiful as always'],
  ['Yes!', 'Real one'],
];

async function main() {
  const creators = await prisma.creator.findMany({ where: { status: 'approved' }, take: 8 });
  if (creators.length === 0) {
    console.log('no creators, run seed-creators first');
    return;
  }

  // Clear old samples so re-running is idempotent
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.scheduledLive.deleteMany({});

  for (let i = 0; i < 10; i++) {
    const c = creators[i % creators.length];
    const post = await prisma.post.create({
      data: {
        creatorId: c.userId,
        caption: CAPTIONS[i],
        mediaKey: SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
        mediaType: 'image',
      },
    });
    const picks = COMMENTS[i % COMMENTS.length];
    for (let j = 0; j < picks.length; j++) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: `seed_commenter_${j}`,
          authorAlias: `GUEST${String(1000 + j).slice(-4)}`,
          text: picks[j],
        },
      });
    }
  }

  for (let i = 0; i < 3; i++) {
    const c = creators[i % creators.length];
    const startsAt = new Date(Date.now() + (i === 0 ? -5 * 60 * 1000 : (i * 60 + 30) * 60 * 1000));
    await prisma.scheduledLive.create({
      data: {
        creatorId: c.userId,
        title: ['Friday night hangout', 'Q&A session', 'Sunday chill'][i],
        startsAt,
        status: i === 0 ? 'live' : 'scheduled',
      },
    });
  }

  console.log(`created 10 posts, 3 lives`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
