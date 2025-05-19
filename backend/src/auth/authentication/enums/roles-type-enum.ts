export enum Role {
  ADMIN = 'admin',
  PARENT = 'parent',
  TUTOR = 'tutor',
  CHILD = 'child'
}

// Also export a type for TypeScript type checking
export type RoleType = typeof Role[keyof typeof Role]; 