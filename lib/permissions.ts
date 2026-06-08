// src/lib/permissions.ts
import { UserRole } from '@prisma/client'

type Permission = 
  | 'view:safeguarding:all'
  | 'view:safeguarding:own'
  | 'create:safeguarding'
  | 'edit:safeguarding'
  | 'delete:safeguarding'
  | 'assign:safeguarding'
  | 'escalate:safeguarding'
  | 'view:wellbeing:all'
  | 'view:wellbeing:own'
  | 'create:wellbeing'
  | 'edit:wellbeing'
  | 'view:behavior:all'
  | 'create:behavior'
  | 'view:attendance:all'
  | 'manage:attendance'
  | 'view:students'
  | 'manage:students'
  | 'view:dashboard:dsl'
  | 'view:dashboard:admin'
  | 'view:dashboard:executive'
  | 'view:reports'
  | 'export:reports'
  | 'manage:users'
  | 'manage:school'
  | 'manage:system'
  | 'view:audit'
  | 'manage:integrations'
  | 'view:parent_portal'

const rolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'manage:system', 'view:audit', 'manage:integrations',
    'view:dashboard:executive', 'view:reports', 'export:reports',
  ],
  SCHOOL_ADMIN: [
    'manage:users', 'manage:school', 'view:audit',
    'view:dashboard:admin', 'view:reports', 'export:reports',
    'view:students', 'manage:students', 'manage:attendance',
  ],
  DSL: [
    'view:safeguarding:all', 'create:safeguarding', 'edit:safeguarding',
    'delete:safeguarding', 'assign:safeguarding', 'escalate:safeguarding',
    'view:dashboard:dsl', 'view:reports', 'export:reports',
    'view:students', 'view:wellbeing:all', 'view:behavior:all',
    'view:attendance:all',
  ],
  DEPUTY_DSL: [
    'view:safeguarding:all', 'create:safeguarding', 'edit:safeguarding',
    'assign:safeguarding', 'escalate:safeguarding',
    'view:dashboard:dsl', 'view:reports', 'export:reports',
    'view:students', 'view:wellbeing:all', 'view:behavior:all',
  ],
  COUNSELOR: [
    'view:wellbeing:all', 'create:wellbeing', 'edit:wellbeing',
    'view:students', 'view:safeguarding:own',
  ],
  PRINCIPAL: [
    'view:dashboard:executive', 'view:reports', 'export:reports',
    'view:students', 'view:safeguarding:all', 'view:wellbeing:all',
    'view:behavior:all', 'view:attendance:all',
  ],
  TEACHER: [
    'view:safeguarding:own', 'create:safeguarding',
    'create:wellbeing', 'create:behavior',
    'view:students', 'view:attendance:all',
  ],
  NURSE: [
    'view:safeguarding:own', 'create:safeguarding',
    'create:wellbeing', 'view:students',
    'view:wellbeing:all',
  ],
  STUDENT_SUPPORT: [
    'view:wellbeing:all', 'create:wellbeing', 'edit:wellbeing',
    'view:students', 'create:behavior',
  ],
  READ_ONLY_AUDITOR: [
    'view:audit', 'view:reports', 'export:reports',
    'view:safeguarding:all', 'view:students',
  ],
  PARENT: [
    'view:parent_portal',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return rolePermissions[role] || []
}

export { rolePermissions }
export type { Permission }
