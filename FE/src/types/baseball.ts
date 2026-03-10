// src/types/baseball.ts

export interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'finished' | 'scheduled' | 'live';
}

export interface TeamStanding {
  rank: number;
  teamName: string;
  wins: number;
  losses: number;
  draws: number;
  winRate: string;
}

export interface LeagueLeader {
  category: string;
  value: string | number;
  playerName: string;
  teamName: string;
}