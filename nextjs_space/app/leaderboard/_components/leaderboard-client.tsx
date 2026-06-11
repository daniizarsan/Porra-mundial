'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Medal, Award, ChevronDown, ChevronUp, Target, Crosshair, Star } from 'lucide-react';
import { FlagImage } from '@/components/flag-image';
import { teamAbbr } from '@/components/team-code';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUND_LABELS } from '@/lib/scoring';
import { UserAvatar } from '@/components/user-avatar';
import { Podium } from '@/components/podium';
import { ScoringInfo } from '@/components/scoring-info';

interface BracketRoundDetail {
  correct: number;
  total: number;
  points: number;
  picks: { matchIndex: number; team: string; correct: boolean }[];
}

interface BonusDetailItem {
  question: string;
  prediction: string;
  answer: string | null;
  correct: boolean;
  points: number;
}

interface Entry {
  userId: string;
  firstName: string;
  lastName: string;
  alias: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  groupPoints: number;
  bracketPoints: number;
  bonusPoints: number;
  groupDetail: { groupName: string; positionHits: number; qualifierHits: number; points: number; predicted?: string[]; actual?: string[]; predictedWins?: Record<string, number>; actualWins?: Record<string, number> }[];
  bracketDetail: Record<string, BracketRoundDetail>;
  bonusDetail: BonusDetailItem[];
}

export function LeaderboardClient() {
  const { data: session } = useSession() || {};
  const [entries, setEntries] = useState<Entry[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);


  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then((data: any) => {
      const list = data?.entries ?? (Array.isArray(data) ? data : []);
      setEntries(list);
    }).catch(() => {});
    fetch('/api/groups').then(r => r.json()).then((data: any) => {
      if (Array.isArray(data)) setGroups(data.map((g: any) => ({ id: g.id, name: g.name })));
    }).catch(() => {});
  }, []);

  const getGroupName = (groupId: string) => groups.find((g) => g.id === groupId)?.name ?? groupId;

  const currentUserId = (session?.user as any)?.id;

  const displayName = (e: Entry) => e.alias || e.firstName || 'Anónimo';

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center"><Trophy className="h-5 w-5 text-yellow-500" /></div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center"><Medal className="h-5 w-5 text-gray-400" /></div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center"><Award className="h-5 w-5 text-orange-600" /></div>;
    return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-mono text-sm font-bold text-muted-foreground">{rank}</div>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[900px] mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Clasificación</h1>
          <p className="text-muted-foreground">Haz clic en cualquier jugador para ver el desglose de sus puntos</p>
        </div>

        <ScoringInfo />

        {/* Podium */}
        {entries.length >= 2 && <Podium leaderboard={entries} />}

        {entries.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Aún no hay puntuaciones</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {entries.map((entry: Entry, i: number) => {
              const isMe = entry?.userId === currentUserId;
              const isExpanded = expandedUser === entry?.userId;
              return (
                <motion.div
                  key={entry?.userId ?? i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`transition-all cursor-pointer ${isMe ? 'ring-2 ring-primary/40' : 'hover:shadow-md'}`}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : entry?.userId)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      >
                        {getRankDisplay(i + 1)}
                        <UserAvatar avatarUrl={entry.avatarUrl} name={displayName(entry)} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{displayName(entry)}</span>
                            {isMe && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Tú</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="hidden sm:flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span className="font-mono">{entry?.groupPoints ?? 0}</span>
                          </div>
                          <div className="hidden sm:flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                            <Crosshair className="h-3 w-3 text-green-500" />
                            <span className="font-mono">{entry?.bracketPoints ?? 0}</span>
                          </div>
                          {(entry?.bonusPoints ?? 0) > 0 && (
                            <div className="hidden sm:flex items-center gap-1 text-xs bg-yellow-500/10 px-2 py-1 rounded-full">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="font-mono">{entry.bonusPoints}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full">
                            <Star className="h-3.5 w-3.5" />
                            <span className="font-mono text-sm">{entry?.totalPoints ?? 0}</span>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <SummaryCard label="Grupos" points={entry?.groupPoints ?? 0} icon={<Target className="h-4 w-4 text-blue-500" />} />
                                <SummaryCard label="Eliminatorias" points={entry?.bracketPoints ?? 0} icon={<Crosshair className="h-4 w-4 text-green-500" />} />
                                <SummaryCard label="Bonus" points={entry?.bonusPoints ?? 0} icon={<Star className="h-4 w-4 text-yellow-500" />} />
                                <SummaryCard label="Total" points={entry?.totalPoints ?? 0} icon={<Trophy className="h-4 w-4 text-primary" />} highlight />
                              </div>

                              {entry?.groupDetail && entry.groupDetail.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Desglose Grupos</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {entry.groupDetail.map((gd) => (
                                      <div key={gd.groupName} className="bg-muted/50 rounded-lg p-2">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-xs font-bold">{getGroupName(gd.groupName)}</span>
                                          {gd.points > 0 && <span className="text-xs font-mono font-bold text-green-500">+{gd.points}</span>}
                                        </div>
                                        {gd.predicted && gd.predicted.length > 0 ? gd.predicted.map((t, ti) => {
                                          const posCorrect = gd.actual && gd.actual.length > 0 ? gd.actual[ti] === t : null;
                                          const winsCorrect = gd.actualWins && gd.predictedWins && gd.predictedWins[t] !== undefined ? gd.predictedWins[t] === gd.actualWins[t] : null;
                                          return (
                                            <div key={ti} className={`flex items-center gap-1 text-xs py-0.5 px-1 rounded ${posCorrect === true ? 'bg-green-500/10' : posCorrect === false ? 'bg-red-500/10' : ''}`}>
                                              <span className="w-3 text-muted-foreground font-mono">{ti + 1}</span>
                                              <FlagImage teamName={t} size={14} />
                                              <span className={`font-mono flex-1 ${ti < 2 ? 'font-semibold' : 'text-muted-foreground'}`}>{teamAbbr(t)}</span>
                                              {gd.predictedWins && gd.predictedWins[t] !== undefined && (
                                                <span className={`font-mono text-[10px] ${winsCorrect === true ? 'text-green-500 font-bold' : winsCorrect === false ? 'text-red-400' : 'text-muted-foreground'}`}>W{gd.predictedWins[t]}</span>
                                              )}
                                              {posCorrect === true && <span className="text-green-500 text-[10px]">✓</span>}
                                              {posCorrect === false && <span className="text-red-400 text-[10px]">✗</span>}
                                            </div>
                                          );
                                        }) : (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">{gd.positionHits} pos · {gd.qualifierHits} clas.</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry?.bracketDetail && Object.keys(entry.bracketDetail).length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Desglose Eliminatorias</h4>
                                  <div className="space-y-2">
                                    {Object.entries(entry.bracketDetail).map(([round, detail]) => (
                                      <div key={round} className="bg-muted/50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-semibold">{ROUND_LABELS[round] ?? round}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{detail.correct}/{detail.picks.length} aciertos</span>
                                            <span className="font-mono font-bold text-green-500 text-sm">+{detail.points}</span>
                                          </div>
                                        </div>
                                        {detail.picks.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5">
                                            {detail.picks.map((pick) => (
                                              <div key={`${round}-${pick.matchIndex}`} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${pick.correct ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : 'bg-muted border-border text-muted-foreground'}`}>
                                                <FlagImage teamName={pick.team} size={14} />
                                                <span className="font-mono font-medium">{teamAbbr(pick.team)}</span>
                                                {pick.correct && <span>✓</span>}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry?.bonusDetail && entry.bonusDetail.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Desglose Quiz Bonus</h4>
                                  <div className="space-y-1">
                                    {entry.bonusDetail.map((bd, bi) => (
                                      <div key={bi} className={`flex items-center justify-between text-xs p-2 rounded ${bd.correct ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                                        <span className="flex-1 truncate">{bd.question}</span>
                                        <span className="font-medium mx-2">{bd.prediction}</span>
                                        {bd.correct ? (
                                          <span className="font-mono font-bold text-green-500">+{bd.points}</span>
                                        ) : bd.answer ? (
                                          <span className="text-muted-foreground">✗</span>
                                        ) : (
                                          <span className="text-muted-foreground">—</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}


                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, points, icon, highlight }: { label: string; points: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? 'bg-primary/10' : 'bg-muted/50'}`}>
      <div className="flex items-center justify-center gap-1 mb-1">{icon}<span className="text-xs font-medium text-muted-foreground">{label}</span></div>
      <p className={`font-mono text-xl font-bold ${highlight ? 'text-primary' : ''}`}>{points}</p>
    </div>
  );
}
