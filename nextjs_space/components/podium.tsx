'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';

interface PrizeConfig {
  entryFee: number;
  split: number[];
  lastGetsRefund: boolean;
}

interface Entry {
  userId: string;
  firstName: string;
  lastName: string;
  alias: string | null;
  avatarUrl: string | null;
  totalPoints: number;
}

interface PodiumPosition {
  rank: number;
  entries: Entry[];
  prize: number;
}

function computePodium(leaderboard: Entry[], prizes: PrizeConfig): { positions: PodiumPosition[]; last: PodiumPosition | null; totalPot: number } {
  if (leaderboard.length === 0) return { positions: [], last: null, totalPot: 0 };

  const totalPot = leaderboard.length * prizes.entryFee;
  const prizeSplit = prizes.split.map(s => s / 100);

  // Last place — if multiple tied, they split a single refund (not each gets full refund)
  const lowestPoints = leaderboard[leaderboard.length - 1]?.totalPoints;
  const lastEntries = leaderboard.filter(e => e.totalPoints === lowestPoints);
  const lastTotalReturn = prizes.lastGetsRefund ? prizes.entryFee : 0;
  const remainingPot = totalPot - lastTotalReturn;

  const isLastAlsoPodium = leaderboard.length <= 3;

  const positions: PodiumPosition[] = [];
  let idx = 0;
  let rank = 1;
  while (idx < leaderboard.length && rank <= 3) {
    const pts = leaderboard[idx].totalPoints;
    const tied = leaderboard.filter(e => e.totalPoints === pts);
    let mergedPrize = 0;
    for (let r = rank; r < rank + tied.length && r <= 3; r++) {
      mergedPrize += (prizeSplit[r - 1] ?? 0) * remainingPot;
    }
    const prizePerPerson = mergedPrize / tied.length;
    positions.push({ rank, entries: tied, prize: prizePerPerson });
    idx += tied.length;
    rank += tied.length;
  }

  const last: PodiumPosition | null = (isLastAlsoPodium || !prizes.lastGetsRefund) ? null : {
    rank: leaderboard.length,
    entries: lastEntries,
    prize: prizes.entryFee / lastEntries.length,
  };

  return { positions, last, totalPot };
}

const PODIUM_COLORS = [
  'from-yellow-400/20 to-yellow-600/10 border-yellow-500/30',
  'from-gray-300/20 to-gray-400/10 border-gray-400/30',
  'from-amber-600/20 to-amber-700/10 border-amber-600/30',
];
const PODIUM_HEIGHTS = ['h-44', 'h-36', 'h-28'];
const PODIUM_ICONS = [Trophy, Medal, Award];
const PODIUM_LABELS = ['🥇 1º', '🥈 2º', '🥉 3º'];

export function Podium({ leaderboard }: { leaderboard: Entry[] }) {
  const [prizes, setPrizes] = useState<PrizeConfig>({ entryFee: 15, split: [60, 25, 15], lastGetsRefund: true });

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(c => {
      if (c?.prizes) setPrizes(c.prizes);
    }).catch(() => {});
  }, []);

  const { positions, last, totalPot } = computePodium(leaderboard, prizes);
  if (leaderboard.length < 2) return null;

  const displayOrder = [1, 0, 2];
  const lastDeduction = last ? prizes.entryFee : 0;
  const distributablePot = totalPot - lastDeduction;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Podio y Premios
        </CardTitle>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-1">
          <span>Cuota: {prizes.entryFee}€</span>
          <span>•</span>
          <span>Bote total: {totalPot}€</span>
          <span>•</span>
          <span>{leaderboard.length} participantes</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-center gap-3 mb-6 pt-4">
          {displayOrder.map((posIdx, visualIdx) => {
            const pos = positions[posIdx];
            if (!pos) return <div key={visualIdx} className="w-28" />;
            const heightClass = PODIUM_HEIGHTS[posIdx] ?? 'h-24';
            const colorClass = PODIUM_COLORS[posIdx] ?? '';
            const Icon = PODIUM_ICONS[posIdx] ?? Award;

            return (
              <motion.div
                key={posIdx}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + visualIdx * 0.15, type: 'spring', stiffness: 100 }}
                className="flex flex-col items-center"
              >
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                  {pos.entries.map((e) => (
                    <div key={e.userId} className="flex flex-col items-center">
                      <UserAvatar avatarUrl={e.avatarUrl} name={e.alias || e.firstName} size={posIdx === 0 ? 56 : 44} />
                      <p className="text-xs font-medium mt-1 text-center max-w-[80px] truncate">
                        {e.alias || e.firstName}
                      </p>
                    </div>
                  ))}
                </div>

                <div className={`w-28 ${heightClass} rounded-t-xl bg-gradient-to-t ${colorClass} border border-b-0 flex flex-col items-center justify-start pt-3 relative`}>
                  <Icon className={`h-6 w-6 ${posIdx === 0 ? 'text-yellow-500' : posIdx === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                  <span className="text-lg font-bold mt-1">{PODIUM_LABELS[posIdx]}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{pos.entries[0]?.totalPoints} pts</span>
                  <div className="mt-auto mb-3 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-500" />
                    <span className="text-sm font-bold text-green-500">{pos.prize.toFixed(0)}€</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {last && last.entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center p-3 rounded-lg bg-muted/50 border border-dashed"
          >
            <p className="text-sm text-muted-foreground">
              💩 Último puesto — {last.entries.length > 1 ? `se reparten ${prizes.entryFee}€ (${last.prize.toFixed(2)}€ cada uno)` : `recupera su cuota (${prizes.entryFee}€)`}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {last.entries.map((e) => (
                <div key={e.userId} className="flex items-center gap-2">
                  <UserAvatar avatarUrl={e.avatarUrl} name={e.alias || e.firstName} size={28} />
                  <span className="text-sm font-medium">{e.alias || e.firstName}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground text-sm mb-1">💰 Reparto</p>
          <p>• Bote total: {leaderboard.length} × {prizes.entryFee}€ = {totalPot}€</p>
          {prizes.lastGetsRefund && last && <p>• Último recupera cuota: -{lastDeduction}€</p>}
          <p>• Bote a repartir: {distributablePot}€ ({prizes.split.join('% / ')}%)</p>
          <p>• En caso de empate se fusionan premios y se dividen a partes iguales</p>
        </div>
      </CardContent>
    </Card>
  );
}
