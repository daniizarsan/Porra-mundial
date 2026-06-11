import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const groups: Record<string, { name: string; code: string; cc: string }[]> = {
  A: [
    { name: 'Mexico', code: 'MEX', cc: 'mx' },
    { name: 'South Africa', code: 'RSA', cc: 'za' },
    { name: 'South Korea', code: 'KOR', cc: 'kr' },
    { name: 'Czech Republic', code: 'CZE', cc: 'cz' },
  ],
  B: [
    { name: 'Canada', code: 'CAN', cc: 'ca' },
    { name: 'Bosnia and Herzegovina', code: 'BIH', cc: 'ba' },
    { name: 'Qatar', code: 'QAT', cc: 'qa' },
    { name: 'Switzerland', code: 'SUI', cc: 'ch' },
  ],
  C: [
    { name: 'Brazil', code: 'BRA', cc: 'br' },
    { name: 'Morocco', code: 'MAR', cc: 'ma' },
    { name: 'Haiti', code: 'HAI', cc: 'ht' },
    { name: 'Scotland', code: 'SCO', cc: 'gb-sct' },
  ],
  D: [
    { name: 'USA', code: 'USA', cc: 'us' },
    { name: 'Paraguay', code: 'PAR', cc: 'py' },
    { name: 'Australia', code: 'AUS', cc: 'au' },
    { name: 'Turkey', code: 'TUR', cc: 'tr' },
  ],
  E: [
    { name: 'Germany', code: 'GER', cc: 'de' },
    { name: 'Curaçao', code: 'CUW', cc: 'cw' },
    { name: 'Ivory Coast', code: 'CIV', cc: 'ci' },
    { name: 'Ecuador', code: 'ECU', cc: 'ec' },
  ],
  F: [
    { name: 'Netherlands', code: 'NED', cc: 'nl' },
    { name: 'Japan', code: 'JPN', cc: 'jp' },
    { name: 'Sweden', code: 'SWE', cc: 'se' },
    { name: 'Tunisia', code: 'TUN', cc: 'tn' },
  ],
  G: [
    { name: 'Belgium', code: 'BEL', cc: 'be' },
    { name: 'Egypt', code: 'EGY', cc: 'eg' },
    { name: 'Iran', code: 'IRN', cc: 'ir' },
    { name: 'New Zealand', code: 'NZL', cc: 'nz' },
  ],
  H: [
    { name: 'Spain', code: 'ESP', cc: 'es' },
    { name: 'Cape Verde', code: 'CPV', cc: 'cv' },
    { name: 'Saudi Arabia', code: 'KSA', cc: 'sa' },
    { name: 'Uruguay', code: 'URU', cc: 'uy' },
  ],
  I: [
    { name: 'France', code: 'FRA', cc: 'fr' },
    { name: 'Senegal', code: 'SEN', cc: 'sn' },
    { name: 'Iraq', code: 'IRQ', cc: 'iq' },
    { name: 'Norway', code: 'NOR', cc: 'no' },
  ],
  J: [
    { name: 'Argentina', code: 'ARG', cc: 'ar' },
    { name: 'Algeria', code: 'ALG', cc: 'dz' },
    { name: 'Austria', code: 'AUT', cc: 'at' },
    { name: 'Jordan', code: 'JOR', cc: 'jo' },
  ],
  K: [
    { name: 'Portugal', code: 'POR', cc: 'pt' },
    { name: 'DR Congo', code: 'COD', cc: 'cd' },
    { name: 'Uzbekistan', code: 'UZB', cc: 'uz' },
    { name: 'Colombia', code: 'COL', cc: 'co' },
  ],
  L: [
    { name: 'England', code: 'ENG', cc: 'gb-eng' },
    { name: 'Croatia', code: 'CRO', cc: 'hr' },
    { name: 'Ghana', code: 'GHA', cc: 'gh' },
    { name: 'Panama', code: 'PAN', cc: 'pa' },
  ],
};

async function main() {
  console.log('Seeding database...');

  // Admin Zarza
  const zarzaPass = await bcrypt.hash('ROZgKPdqlWiMdE', 10);
  await prisma.user.upsert({
    where: { email: 'daniizarsan@gmail.com' },
    update: { role: 'ADMIN', alias: 'Zarza', avatarUrl: '/images/dragonite.png' },
    create: {
      email: 'daniizarsan@gmail.com',
      password: zarzaPass,
      firstName: 'Zarza',
      lastName: '',
      alias: 'Zarza',
      avatarUrl: '/images/dragonite.png',
      role: 'ADMIN',
    },
  });

  // Internal test account (non-admin, hidden)
  const testPass = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: testPass,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    },
  });

  for (const [groupName, teams] of Object.entries(groups)) {
    const group = await prisma.group.upsert({
      where: { name: groupName },
      update: {},
      create: { name: groupName },
    });

    for (const team of teams) {
      const FLAG_HOST = 'https://flagcdn.com';
      const flagUrl = `${FLAG_HOST}/w160/${team.cc}.png`;
      await prisma.team.upsert({
        where: { code: team.code },
        update: { name: team.name, groupId: group.id, flagUrl },
        create: { name: team.name, code: team.code, flagUrl, groupId: group.id },
      });
    }
  }

  const deadlines = [
    { phase: 'GROUP_STAGE', closesAt: new Date('2026-06-11T00:00:00Z'), label: 'Fase de Grupos' },
    { phase: 'ROUND_OF_32', closesAt: new Date('2026-06-28T00:00:00Z'), label: 'Dieciseisavos' },
    { phase: 'ROUND_OF_16', closesAt: new Date('2026-07-04T00:00:00Z'), label: 'Octavos de Final' },
    { phase: 'QUARTER_FINALS', closesAt: new Date('2026-07-09T00:00:00Z'), label: 'Cuartos de Final' },
    { phase: 'SEMI_FINALS', closesAt: new Date('2026-07-14T00:00:00Z'), label: 'Semifinales' },
    { phase: 'FINAL', closesAt: new Date('2026-07-18T00:00:00Z'), label: 'Final' },
  ];

  for (const d of deadlines) {
    await prisma.deadline.upsert({
      where: { phase: d.phase },
      update: { closesAt: d.closesAt, label: d.label },
      create: d,
    });
  }

  // Bonus questions
  const bonusQuestions = [
    { slug: 'top_scorer', question: '¿Quién será el máximo goleador del torneo?', type: 'player', points: 10 },
    { slug: 'champion', question: '¿Qué selección ganará el Mundial?', type: 'team', points: 15 },
    { slug: 'best_goalkeeper', question: '¿Qué selección recibirá menos goles?', type: 'team', points: 8 },
    { slug: 'hat_trick', question: '¿Qué jugador hará el primer hat-trick del torneo?', type: 'player', points: 5 },
    { slug: 'most_goals_match', question: '¿Cuántos goles tendrá el partido con más goles?', type: 'number', points: 8 },
    { slug: 'surprise_team', question: '¿Qué selección no favorita llegará más lejos? (fuera del top 10 FIFA)', type: 'team', points: 10 },
    { slug: 'red_cards', question: '¿Cuántas tarjetas rojas habrá en todo el torneo?', type: 'number', points: 5 },
    { slug: 'own_goals', question: '¿Cuántos autogoles habrá en el torneo?', type: 'number', points: 5 },
  ];

  for (const q of bonusQuestions) {
    await prisma.bonusQuestion.upsert({
      where: { slug: q.slug },
      update: { question: q.question, type: q.type, points: q.points },
      create: { ...q, closesAt: new Date('2026-06-11T00:00:00Z') },
    });
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });