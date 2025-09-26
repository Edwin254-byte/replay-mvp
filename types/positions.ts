// Type definitions for the position data
interface PositionApplication {
  status: string;
}

interface PositionCounts {
  applications: number;
  questions: number;
}

export interface Position {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  userId: string;
  applications: PositionApplication[];
  _count: PositionCounts;
}

export interface PositionWithStats extends Position {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    passed: number;
  };
}
