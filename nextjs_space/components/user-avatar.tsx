'use client';
import { useState } from 'react';
import { User } from 'lucide-react';

interface Props {
  avatarUrl: string | null | undefined;
  name: string;
  size?: number;
}

export function UserAvatar({ avatarUrl, name, size = 32 }: Props) {
  const [error, setError] = useState(false);

  if (!avatarUrl || error) {
    const initials = name
      ?.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
    return (
      <div
        className="rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}
