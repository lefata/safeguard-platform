// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'NEW': return 'bg-purple-100 text-purple-800'
    case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800'
    case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800'
    case 'ESCALATED': return 'bg-red-100 text-red-800'
    case 'MONITORING': return 'bg-teal-100 text-teal-800'
    case 'CLOSED': return 'bg-green-100 text-green-800'
    case 'ARCHIVED': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateId(): string {
  return crypto.randomUUID()
}

export const safeguardingCategories = [
  'Child Protection',
  'Neglect',
  'Emotional Wellbeing',
  'Self Harm',
  'Bullying',
  'Online Safety',
  'Attendance',
  'Medical Concern',
  'Substance Abuse',
  'Peer Conflict',
  'Radicalization',
  'Other',
] as const

export const attendanceStatuses = ['PRESENT', 'ABSENT', 'TARDY', 'EXCUSED', 'SUSPENDED'] as const

export const caseStatuses = ['NEW', 'UNDER_REVIEW', 'INVESTIGATING', 'ESCALATED', 'MONITORING', 'CLOSED', 'ARCHIVED'] as const

export const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
