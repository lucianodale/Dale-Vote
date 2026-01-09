
export interface VotingItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt: number;
}

export interface VoterInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface Vote {
  id: string;
  itemId: string;
  voterName: string;
  voterEmail: string;
  voterPhone: string;
  isVerified: boolean;
  createdAt: number;
}

export enum AppRoute {
  HOME = 'home',
  ADMIN_DASHBOARD = 'admin',
  ADMIN_REPORTS = 'reports',
  VOTING_ITEM = 'vote-item',
  CREATE_ITEM = 'create',
  LOGIN = 'login'
}
