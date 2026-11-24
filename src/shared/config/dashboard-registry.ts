import { lazy } from 'react'
import type React from 'react'
import { FileText, User } from 'lucide-react'
import type { RoleGroup } from '@/shared/types/dashboard'

export type SectionRole = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER'
export type DashboardSection = 'profile' | 'inquiry'

export interface SectionConfig {
  id: DashboardSection
  label: string
  icon: React.ComponentType<{ className?: string }>
  component: React.LazyExoticComponent<React.ComponentType<any>>
  roles: SectionRole[]
  roleGroups: RoleGroup[]
  category: string
  title: string
  description?: string
}

const EditProfileTab = lazy(() =>
  import('@/features/admin/components/EditProfileTab').then((module) => ({
    default: module.EditProfileTab,
  }))
)
const UserInquiriesPage = lazy(() =>
  import('@/features/user/component/UserInquiriesPage').then((module) => ({
    default: module.UserInquiriesPage,
  }))
)

export const SECTION_REGISTRY: Record<DashboardSection, SectionConfig> = {
  profile: {
    id: 'profile',
    label: 'Edit Profile',
    icon: User,
    component: EditProfileTab,
    roles: ['CUSTOMER'],
    roleGroups: ['EXTERNAL'],
    category: 'Profile',
    title: 'Edit Profile',
  },
  inquiry: {
    id: 'inquiry',
    label: 'My Inquiries',
    icon: FileText,
    component: UserInquiriesPage,
    roles: ['CUSTOMER'],
    roleGroups: ['EXTERNAL'],
    category: 'Inquiries',
    title: 'My Inquiries',
  },
}

export function getSectionConfig(section: DashboardSection): SectionConfig | undefined {
  return SECTION_REGISTRY[section]
}

export function listSectionsByRole(role: SectionRole): SectionConfig[] {
  return Object.values(SECTION_REGISTRY).filter((section) => section.roles.includes(role))
}

export function listSectionsByRoleGroup(roleGroup: RoleGroup): SectionConfig[] {
  return Object.values(SECTION_REGISTRY).filter((section) => section.roleGroups.includes(roleGroup))
}

export function canAccessSection(section: DashboardSection, role: SectionRole): boolean {
  return getSectionConfig(section)?.roles.includes(role) ?? false
}
