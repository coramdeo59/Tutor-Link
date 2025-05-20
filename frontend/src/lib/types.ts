export enum Role {
    ADMIN = "admin",
    PARENT = "parent",
    TUTOR = "tutor",
    CHILD = "child",
  }
  
// Export progress types
export * from './types/progress';
  
  // Parent Data Types
export interface ParentData {
  id: string
  name: string
  email: string
  upcomingSessions: number
}

// Parent Stats Types
export interface ChildrenStat {
  count: number
  names: string
}

export interface TutorsStat {
  count: number
  description: string
}

export interface SessionsStat {
  count: number
  description: string
}

export interface SpendingStat {
  value: number
  formatted: string
  description: string
}

export interface ParentStats {
  children: ChildrenStat
  tutors: TutorsStat
  sessions: SessionsStat
  spending: SpendingStat
}

// Children Types
export interface ChildData {
  id: string
  name: string
  age: number
  grade: string
  progress: number
  nextSession?: string
}

export interface ChildrenData {
  children: ChildData[]
}

// Payment Types
export interface UpcomingPayment {
  amount: number
  dueDate: string
}

export interface Transaction {
  id: string
  tutorName: string
  subject: string
  amount: number
  date: string
}

export interface PaymentData {
  upcomingPayment?: UpcomingPayment
  transactions: Transaction[]
}