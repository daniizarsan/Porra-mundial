export const SCORING = {
  GROUP_POSITION: 1,
  GROUP_QUALIFIER: 2,
  ROUND_OF_32: 3,
  ROUND_OF_16: 5,
  QUARTER_FINALS: 8,
  SEMI_FINALS: 12,
  FINAL: 20,
  THIRD_PLACE: 5,
};

export const ROUND_LABELS: Record<string, string> = {
  ROUND_OF_32: 'Dieciseisavos',
  ROUND_OF_16: 'Octavos',
  QUARTER_FINALS: 'Cuartos',
  SEMI_FINALS: 'Semifinales',
  FINAL: 'Final',
  THIRD_PLACE: '3er Puesto',
};

export const ROUND_ORDER = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL', 'THIRD_PLACE'];

export const MATCH_COUNTS: Record<string, number> = {
  ROUND_OF_32: 16,
  ROUND_OF_16: 8,
  QUARTER_FINALS: 4,
  SEMI_FINALS: 2,
  FINAL: 1,
  THIRD_PLACE: 1,
};
