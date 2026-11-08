import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DETAILS: Record<string, { gender: string; ethnicity: string; orientation: string; ageMin: number; ageMax: number }> = {
  amara:  { gender: 'female', ethnicity: 'black', orientation: 'straight', ageMin: 24, ageMax: 30 },
  juma:   { gender: 'male',   ethnicity: 'black', orientation: 'straight', ageMin: 27, ageMax: 35 },
  nia:    { gender: 'female', ethnicity: 'black', orientation: 'lesbian',  ageMin: 25, ageMax: 32 },
  kev:    { gender: 'male',   ethnicity: 'black', orientation: 'gay',      ageMin: 23, ageMax: 29 },
  zawadi: { gender: 'female', ethnicity: 'mixed', orientation: 'straight', ageMin: 26, ageMax: 33 },
  tai:    { gender: 'nonbinary', ethnicity: 'asian', orientation: 'other',  ageMin: 22, ageMax: 28 },
  sanaa:  { gender: 'female', ethnicity: 'white', orientation: 'bisexual', ageMin: 28, ageMax: 36 },
  moyo:   { gender: 'male',   ethnicity: 'black', orientation: 'straight', ageMin: 30, ageMax: 40 },
};

async function main() {
  for (const [handle, d] of Object.entries(DETAILS)) {
    await prisma.creator.update({
      where: { handle },
      data: {
        gender: d.gender,
        ethnicity: d.ethnicity,
        orientation: d.orientation,
        ageMin: d.ageMin,
        ageMax: d.ageMax,
      },
    });
    console.log(`updated @${handle}`);
  }
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); process.exit(1); });
