export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ROUND_ORDER, MATCH_COUNTS, ROUND_LABELS } from '@/lib/scoring';
import { getAppConfig } from '@/lib/config';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, alias: true, avatarUrl: true },
    });
    const allGroupPredictions = await prisma.groupPrediction.findMany();
    const allBracketPredictions = await prisma.bracketPrediction.findMany();
    const allBonusPredictions = await prisma.bonusPrediction.findMany();
    const bonusQuestions = await prisma.bonusQuestion.findMany();
    const actualGroupResults = await prisma.actualGroupResult.findMany();
    const actualBracketResults = await prisma.actualBracketResult.findMany();

    const actualGroupMap = new Map<string, string[]>();
    for (const r of actualGroupResults) {
      try { actualGroupMap.set(r.groupId, JSON.parse(r.positions)); } catch {}
    }
    const actualBracketMap = new Map<string, string>();
    const actualBracketScoreMap = new Map<string, { scoreA: number | null; scoreB: number | null }>();
    for (const r of actualBracketResults) {
      actualBracketMap.set(`${r.round}_${r.matchIndex}`, r.teamName);
      actualBracketScoreMap.set(`${r.round}_${r.matchIndex}`, { scoreA: r.scoreA, scoreB: r.scoreB });
    }

    // Build actual group wins map: groupId -> { teamName: wins }
    const actualGroupWinsMap = new Map<string, Record<string, number>>();
    for (const r of actualGroupResults) {
      if (r.wins) {
        try { actualGroupWinsMap.set(r.groupId, JSON.parse(r.wins)); } catch {}
      }
    }

    const appConfig = await getAppConfig();
    const SCORING = appConfig.scoring;


    const leaderboard = users.map((user: any) => {
      let totalPoints = 0;
      let groupPoints = 0;
      let bracketPoints = 0;

      // Detailed breakdown
      const groupDetail: { groupName: string; positionHits: number; qualifierHits: number; points: number; predicted: string[]; actual: string[]; predictedWins?: Record<string, number>; actualWins?: Record<string, number> }[] = [];
      const bracketDetail: Record<string, { correct: number; total: number; points: number; picks: { matchIndex: number; team: string; correct: boolean }[] }> = {};

      // Group scoring
      const userGroupPreds = allGroupPredictions.filter((p: any) => p.userId === user.id);
      for (const pred of userGroupPreds) {
        const actual = actualGroupMap.get(pred.groupId);
        if (!actual) continue;
        try {
          const predicted: string[] = JSON.parse(pred.positions);
          let posHits = 0;
          let qualHits = 0;
          let pts = 0;
          for (let i = 0; i < predicted.length; i++) {
            if (predicted[i] === actual[i]) {
              posHits++;
              pts += SCORING.GROUP_POSITION;
            }
          }
          const actualQualifiers = actual.slice(0, 2);
          const predictedQualifiers = predicted.slice(0, 2);
          for (const team of predictedQualifiers) {
            if (actualQualifiers.includes(team)) {
              qualHits++;
              pts += SCORING.GROUP_QUALIFIER;
            }
          }
          // GROUP_WINS scoring
          if (pred.wins) {
            try {
              const predictedWins: Record<string, number> = JSON.parse(pred.wins);
              const actualWins = actualGroupWinsMap.get(pred.groupId);
              if (actualWins) {
                for (const [team, pWins] of Object.entries(predictedWins)) {
                  if (actualWins[team] !== undefined && actualWins[team] === pWins) {
                    pts += SCORING.GROUP_WINS;
                  }
                }
              }
            } catch {}
          }
          groupPoints += pts;
          const gActualWins = actualGroupWinsMap.get(pred.groupId);
          let gPredWins: Record<string, number> | undefined;
          if (pred.wins) { try { gPredWins = JSON.parse(pred.wins); } catch {} }
          groupDetail.push({ groupName: pred.groupId, positionHits: posHits, qualifierHits: qualHits, points: pts, predicted, actual, predictedWins: gPredWins, actualWins: gActualWins ?? undefined });
        } catch {}
      }
      totalPoints += groupPoints;

      // Bracket scoring - detailed per round
      const userBracketPreds = allBracketPredictions.filter((p: any) => p.userId === user.id);
      for (const round of ROUND_ORDER) {
        const count = MATCH_COUNTS[round] ?? 0;
        const roundPreds = userBracketPreds.filter((p: any) => p.round === round);
        let roundCorrect = 0;
        let roundPts = 0;
        const picks: { matchIndex: number; team: string; correct: boolean }[] = [];
        for (const pred of roundPreds) {
          const actual = actualBracketMap.get(`${pred.round}_${pred.matchIndex}`);
          const isCorrect = actual ? pred.teamName === actual : false;
          if (isCorrect) {
            const pts = (SCORING as any)[pred.round] ?? 0;
            roundCorrect++;
            roundPts += pts;
            bracketPoints += pts;
          }
          // SCORE_GOAL scoring: +1 per correctly predicted goal count for a team
          const actualScore = actualBracketScoreMap.get(`${pred.round}_${pred.matchIndex}`);
          if (actualScore && actualScore.scoreA !== null && actualScore.scoreB !== null && pred.scoreA !== null && pred.scoreB !== null) {
            if (pred.scoreA === actualScore.scoreA) {
              roundPts += SCORING.SCORE_GOAL;
              bracketPoints += SCORING.SCORE_GOAL;
            }
            if (pred.scoreB === actualScore.scoreB) {
              roundPts += SCORING.SCORE_GOAL;
              bracketPoints += SCORING.SCORE_GOAL;
            }
          }
          picks.push({ matchIndex: pred.matchIndex, team: pred.teamName, correct: isCorrect });
        }
        if (roundPreds.length > 0 || count > 0) {
          bracketDetail[round] = {
            correct: roundCorrect,
            total: count,
            points: roundPts,
            picks,
          };
        }
      }
      totalPoints += bracketPoints;

      // Bonus scoring
      let bonusPoints = 0;
      const bonusDetail: { question: string; prediction: string; answer: string | null; correct: boolean; points: number }[] = [];
      const userBonusPreds = allBonusPredictions.filter((p: any) => p.userId === user.id);
      for (const bp of userBonusPreds) {
        const q = bonusQuestions.find((qq: any) => qq.id === bp.questionId);
        if (!q) continue;
        // Support multiple winning answers separated by #
        let isCorrect = false;
        if (q.answer) {
          const winningAnswers = q.answer.split('#').map((a: string) => a.trim().toUpperCase());
          isCorrect = winningAnswers.includes(bp.answer.toUpperCase().trim());
        }
        const pts = isCorrect ? q.points : 0;
        bonusPoints += pts;
        bonusDetail.push({
          question: q.question,
          prediction: bp.answer,
          answer: q.answer,
          correct: isCorrect,
          points: pts,
        });
      }
      totalPoints += bonusPoints;

      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        alias: user.alias,
        avatarUrl: user.avatarUrl,
        totalPoints,
        groupPoints,
        bracketPoints,
        bonusPoints,
        groupDetail,
        bracketDetail,
        bonusDetail,
      };
    });

    leaderboard.sort((a: any, b: any) => (b?.totalPoints ?? 0) - (a?.totalPoints ?? 0));
    return NextResponse.json({ entries: leaderboard });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error computing leaderboard' }, { status: 500 });
  }
}
