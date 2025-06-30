'use client';

import { User } from '@/types/review';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const bgColor = user.backgroundColor || 'bg-green-500';

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${className}`}
    >
      {user.initials}
    </div>
  );
}