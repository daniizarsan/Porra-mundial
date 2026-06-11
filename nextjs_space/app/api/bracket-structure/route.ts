export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ROUND_ORDER, MATCH_COUNTS } from '@/lib/scoring';

// Returns the bracket structure: for each round and match, the two teams playing
// (or null if not yet determined). ROUND_OF_32 matchups come from the BracketMatchup
// table (set manually by admin once group stage ends). Subsequent rounds are derived
// from ActualBracketResult of the previous round (winners pair up).
export async function GET() {
  try {
    const matchups = await prisma.bracketMatchup.findMany();
    const actuals = await prisma.actualBracketResult.findMany();

    const matchupMap: Record<string, { teamA: string; teamB: string }> = {};
    for (const m of matchups) matchupMap[`${m.round}-${m.matchIndex}`] = { teamA: m.teamA, teamB: m.teamB };
    const actualMap: Record<string, string> = {};
    for (const a of actuals) actualMap[`${a.round}-${a.matchIndex}`] = a.teamName;

    const structure: Record<string, Array<{ teamA: string | null; teamB: string | null }>> = {};

    for (const round of ROUND_ORDER) {
      const count = MATCH_COUNTS[round] ?? 0;
      structure[round] = [];
      for (let i = 0; i < count; i++) {
        if (round === 'ROUND_OF_32') {
          const m = matchupMap[`${round}-${i}`];
          structure[round].push({ teamA: m?.teamA ?? null, teamB: m?.teamB ?? null });
        } else if (round === 'THIRD_PLACE') {
          // Losers of semifinals
          const semiAWinner = actualMap[`SEMI_FINALS-0`];
          const semiBWinner = actualMap[`SEMI_FINALS-1`];
          const semiAMatchup = round === 'THIRD_PLACE' ? structure['SEMI_FINALS']?.[0] : null;
          const semiBMatchup = round === 'THIRD_PLACE' ? structure['SEMI_FINALS']?.[1] : null;
          const loserA = semiAMatchup && semiAWinner
            ? (semiAMatchup.teamA === semiAWinner ? semiAMatchup.teamB : semiAMatchup.teamA)
            : null;
          const loserB = semiBMatchup && semiBWinner
            ? (semiBMatchup.teamA === semiBWinner ? semiBMatchup.teamB : semiBMatchup.teamA)
            : null;
          structure[round].push({ teamA: loserA, teamB: loserB });
        } else {
          const prevRoundIdx = ROUND_ORDER.indexOf(round) - 1;
          const prevRound = ROUND_ORDER[prevRoundIdx];
          const winA = actualMap[`${prevRound}-${i * 2}`] ?? null;
          const winB = actualMap[`${prevRound}-${i * 2 + 1}`] ?? null;
          structure[round].push({ teamA: winA, teamB: winB });
        }
      }
    }

    return NextResponse.json(structure);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
