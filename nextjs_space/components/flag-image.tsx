'use client';
import { useState } from 'react';

const nameToCountryCode: Record<string, string> = {
  'Mexico': 'mx', 'South Africa': 'za', 'South Korea': 'kr', 'Czech Republic': 'cz',
  'Canada': 'ca', 'Bosnia and Herzegovina': 'ba', 'Qatar': 'qa', 'Switzerland': 'ch',
  'Brazil': 'br', 'Morocco': 'ma', 'Haiti': 'ht', 'Scotland': 'gb-sct',
  'USA': 'us', 'Paraguay': 'py', 'Australia': 'au', 'Turkey': 'tr',
  'Germany': 'de', 'Curaçao': 'cw', 'Ivory Coast': 'ci', 'Ecuador': 'ec',
  'Netherlands': 'nl', 'Japan': 'jp', 'Sweden': 'se', 'Tunisia': 'tn',
  'Belgium': 'be', 'Egypt': 'eg', 'Iran': 'ir', 'New Zealand': 'nz',
  'Spain': 'es', 'Cape Verde': 'cv', 'Saudi Arabia': 'sa', 'Uruguay': 'uy',
  'France': 'fr', 'Senegal': 'sn', 'Iraq': 'iq', 'Norway': 'no',
  'Argentina': 'ar', 'Algeria': 'dz', 'Austria': 'at', 'Jordan': 'jo',
  'Portugal': 'pt', 'DR Congo': 'cd', 'Uzbekistan': 'uz', 'Colombia': 'co',
  'England': 'gb-eng', 'Croatia': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
};

const FLAG_HOST = 'https://flagcdn.com';

export function FlagImage({ teamName, size = 24 }: { teamName: string; size?: number }) {
  const [error, setError] = useState(false);
  const cc = nameToCountryCode[teamName];
  const url = cc ? `${FLAG_HOST}/w160/${cc}.png` : '';

  if (!url || error) {
    return (
      <div
        className="rounded-sm bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-mono"
        style={{ width: size, height: Math.round(size * 0.67) }}
      >
        {teamName?.slice(0, 3).toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`Bandera de ${teamName}`}
      title={teamName}
      width={size}
      height={Math.round(size * 0.67)}
      className="rounded-sm object-cover"
      onError={() => setError(true)}
    />
  );
}
