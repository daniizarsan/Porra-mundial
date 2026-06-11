'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Eye, ChevronDown, ChevronUp, Target, Crosshair, Star, Trophy } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';
import { FlagImage } from '@/components/flag-image';
import { teamAbbr } from '@/components/team-code';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUND_LABELS } from '@/lib/scoring';
import { BracketTree } from '@/components/bracket-tree';

interface BracketRoundDetail {
  correct: number;
  total: number;
  points: number;
  picks: { matchIndex: number; team: string; correct: boolean }[];
}

interface LeaderboardEntry {
  userId: string;
  firstName: string;
  lastName: string;
  alias: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  groupPoints: number;
  bracketPoints: number;
  groupDetail: { groupName: string; positionHits: number; qualifierHits: number; points: number }[];
  bracketDetail: Record<string, BracketRoundDetail>;
}

interface GroupPred { groupId: string; positions: string; wins?: string | null; }
interface BracketPred { round: string; matchIndex: number; teamName: string; scoreA?: number | null; scoreB?: number | null; }
interface GroupData { id: string; name: string; teams: { name: string }[]; }
interface ActualGroupRes { groupId: string; positions: string; wins?: string | null; }

export function ParticipantsClient() {
  const { data: session } = useSession() || {};
  const [participants, setParticipants] = useState<LeaderboardEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [userGroupPreds, setUserGroupPreds] = useState<GroupPred[]>([]);
  const [userBracketPreds, setUserBracketPreds] = useState<BracketPred[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [baseMatchups, setBaseMatchups] = useState<{ teamA: string | null; teamB: string | null }[]>([]);
  const [actualBracketResults, setActualBracketResults] = useState<Record<string, string>>({});
  const [actualGroupResults, setActualGroupResults] = useState<Map<string, { positions: string[]; wins: Record<string, number> }>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then((data: any) => {
      const list = data?.entries ?? (Array.isArray(data) ? data : []);
      setParticipants(list);

    }).catch(() => {});
    fetch('/api/groups').then(r => r.json()).then((data: any) => {
      setGroups(Array.isArray(data) ? data : []);
    }).catch(() => {});
    fetch('/api/bracket-structure').then(r => r.json()).then((d: any) => {
      if (d && d['ROUND_OF_32']) setBaseMatchups(d['ROUND_OF_32']);
    }).catch(() => {});
    fetch('/api/results/bracket').then(r => r.json()).then((data: any) => {
      const map: Record<string, string> = {};
      if (Array.isArray(data)) for (const r of data) map[`${r.round}_${r.matchIndex}`] = r.teamName;
      setActualBracketResults(map);
    }).catch(() => {});
    fetch('/api/results/groups').then(r => r.json()).then((data: any) => {
      const map = new Map<string, { positions: string[]; wins: Record<string, number> }>();
      if (Array.isArray(data)) for (const r of data) {
        let pos: string[] = []; let w: Record<string, number> = {};
        try { pos = JSON.parse(r.positions); } catch {}
        if (r.wins) try { w = JSON.parse(r.wins); } catch {}
        map.set(r.groupId, { positions: pos, wins: w });
      }
      setActualGroupResults(map);
    }).catch(() => {});
  }, []);

  const currentUserId = (session?.user as any)?.id;

  const viewUser = async (userId: string) => {
    if (selectedUser === userId) { setSelectedUser(null); return; }
    setLoading(true);
    setSelectedUser(userId);
    try {
      const [gRes, bRes] = await Promise.all([
        fetch(`/api/predictions/groups?userId=${userId}`),
        fetch(`/api/predictions/bracket?userId=${userId}`),
      ]);
      const gData = await gRes.json();
      const bData = await bRes.json();
      setUserGroupPreds(Array.isArray(gData) ? gData : []);
      setUserBracketPreds(Array.isArray(bData) ? bData : []);
    } catch {
      setUserGroupPreds([]);
      setUserBracketPreds([]);
    } finally { setLoading(false); }
  };

  const getGroupName = (groupId: string) => groups.find((g) => g.id === groupId)?.name ?? groupId;

  const getRank = (idx: number) => {
    if (idx === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    return <span className="text-xs font-mono font-bold text-muted-foreground">{idx + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[900px] mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Participantes</h1>
        <p className="text-muted-foreground mb-6">Haz clic en un jugador para ver sus predicciones y puntos</p>

        <div className="space-y-2">
          {participants.map((p: LeaderboardEntry, i: number) => {
            const isMe = p?.userId === currentUserId;
            const isExpanded = selectedUser === p?.userId;
            const entry = p;

            return (
              <motion.div key={p?.userId ?? i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`transition-all ${isMe ? 'ring-2 ring-primary/40' : 'hover:shadow-md'}`}>
                  <CardContent className="p-0">
                    {/* Main row */}
                    <button
                      onClick={() => viewUser(p?.userId ?? '')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getRank(i)}
                      </div>
                      <UserAvatar avatarUrl={p?.avatarUrl} name={p?.alias || p?.firstName || ''} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{p?.alias || p?.firstName || ''}</span>
                          {isMe && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Tú</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">
                          <Star className="h-3.5 w-3.5" />
                          <span className="font-mono text-sm">{p?.totalPoints ?? 0}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Expanded predictions */}
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
                            {loading ? (
                              <p className="text-sm text-muted-foreground py-4 text-center">Cargando predicciones...</p>
                            ) : (
                              <>
                                {/* Points summary */}
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="rounded-lg p-2.5 bg-muted/50 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1"><Target className="h-3.5 w-3.5 text-blue-500" /><span className="text-xs text-muted-foreground">Grupos</span></div>
                                    <p className="font-mono text-lg font-bold">{entry?.groupPoints ?? 0}</p>
                                  </div>
                                  <div className="rounded-lg p-2.5 bg-muted/50 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1"><Crosshair className="h-3.5 w-3.5 text-green-500" /><span className="text-xs text-muted-foreground">Eliminatorias</span></div>
                                    <p className="font-mono text-lg font-bold">{entry?.bracketPoints ?? 0}</p>
                                  </div>
                                  <div className="rounded-lg p-2.5 bg-primary/10 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1"><Star className="h-3.5 w-3.5 text-yellow-500" /><span className="text-xs text-muted-foreground">Total</span></div>
                                    <p className="font-mono text-lg font-bold text-primary">{entry?.totalPoints ?? 0}</p>
                                  </div>
                                </div>

                                {/* Group predictions */}
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Predicciones Fase de Grupos</h4>
                                  {userGroupPreds.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">Sin predicciones aún</p>
                                  ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                      {userGroupPreds.map((gp: GroupPred) => {
                                        let positions: string[] = [];
                                        try { positions = JSON.parse(gp.positions); } catch {}
                                        let predWins: Record<string, number> = {};
                                        if (gp.wins) try { predWins = JSON.parse(gp.wins); } catch {}
                                        const actual = actualGroupResults.get(gp.groupId);
                                        const groupDetailItem = entry?.groupDetail?.find((gd) => gd.groupName === gp.groupId);
                                        return (
                                          <div key={gp.groupId} className="bg-muted/50 rounded-lg p-2">
                                            <div className="flex items-center justify-between mb-1.5">
                                              <span className="text-xs font-bold">{getGroupName(gp.groupId)}</span>
                                              {groupDetailItem && groupDetailItem.points > 0 && (
                                                <span className="text-xs font-mono font-bold text-green-500">+{groupDetailItem.points}</span>
                                              )}
                                            </div>
                                            {positions.map((t: string, ti: number) => {
                                              const posCorrect = actual && actual.positions.length > 0 ? actual.positions[ti] === t : null;
                                              const winsCorrect = actual && actual.wins && predWins[t] !== undefined ? predWins[t] === actual.wins[t] : null;
                                              return (
                                                <div key={ti} className={`flex items-center gap-1 text-xs py-0.5 px-1 rounded ${posCorrect === true ? 'bg-green-500/10' : posCorrect === false ? 'bg-red-500/10' : ''}`}>
                                                  <span className="w-3 text-muted-foreground font-mono">{ti + 1}</span>
                                                  <FlagImage teamName={t} size={14} />
                                                  <span className={`font-mono flex-1 ${ti < 2 ? 'font-semibold' : 'text-muted-foreground'}`}>{teamAbbr(t)}</span>
                                                  {predWins[t] !== undefined && (
                                                    <span className={`font-mono text-[10px] ${winsCorrect === true ? 'text-green-500 font-bold' : winsCorrect === false ? 'text-red-400' : 'text-muted-foreground'}`}>
                                                      W{predWins[t]}
                                                    </span>
                                                  )}
                                                  {posCorrect === true && <span className="text-green-500 text-[10px]">✓</span>}
                                                  {posCorrect === false && <span className="text-red-400 text-[10px]">✗</span>}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Bracket predictions - visual tree */}
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Predicciones Eliminatorias</h4>
                                  {userBracketPreds.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">Sin predicciones aún</p>
                                  ) : (
                                    <BracketTree
                                      predictions={userBracketPreds}
                                      baseMatchups={baseMatchups}
                                      actualResults={actualBracketResults}
                                    />
                                  )}
                                </div>
                              </>
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
      </main>
    </div>
  );
}
