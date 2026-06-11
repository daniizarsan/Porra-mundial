import { prisma } from '@/lib/prisma';

export interface AppConfigData {
  scoring: {
    GROUP_POSITION: number;
    GROUP_QUALIFIER: number;
    GROUP_WINS: number;       // points per correct team win count prediction
    ROUND_OF_32: number;
    ROUND_OF_16: number;
    QUARTER_FINALS: number;
    SEMI_FINALS: number;
    FINAL: number;
    THIRD_PLACE: number;
    SCORE_GOAL: number;       // points per correctly predicted goal count for a team in bracket
  };
  prizes: {
    entryFee: number;
    split: number[];         // [1st%, 2nd%, 3rd%] — stored as 0-100
    lastGetsRefund: boolean; // último recupera su cuota
  };
}

export const DEFAULT_CONFIG: AppConfigData = {
  scoring: {
    GROUP_POSITION: 1,
    GROUP_QUALIFIER: 2,
    GROUP_WINS: 1,
    ROUND_OF_32: 3,
    ROUND_OF_16: 5,
    QUARTER_FINALS: 8,
    SEMI_FINALS: 12,
    FINAL: 20,
    THIRD_PLACE: 5,
    SCORE_GOAL: 1,
  },
  prizes: {
    entryFee: 15,
    split: [60, 25, 15],
    lastGetsRefund: true,
  },
};

export async function getAppConfig(): Promise<AppConfigData> {
  try {
    const row = await prisma.appConfig.findUnique({ where: { id: 'singleton' } });
    if (row?.data) {
      const parsed = JSON.parse(row.data);
      return {
        scoring: { ...DEFAULT_CONFIG.scoring, ...(parsed.scoring || {}) },
        prizes: { ...DEFAULT_CONFIG.prizes, ...(parsed.prizes || {}) },
      };
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return DEFAULT_CONFIG;
}
