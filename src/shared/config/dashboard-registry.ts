import { lazy } from "react"
import type React from "react"
import {
  User,
  Package,
  Truck,
  Anchor,
  FileText,
  Image as ImageIcon,
  Cog,
  LayoutDashboard,
  Database,
} from "lucide-react"

import { RoleGroup } from "@/shared/types/dashboard"

// Role strings from backend
export type SectionRole = "ADMIN" | "EMPLOYEE" | "CUSTOMER"

export type DashboardSection =
  | "profile"
  | "freight-forwarding-inquiries"
  | "logistics-inquiries"
  | "chartering-inquiries"
  | "special-request-inquiries"
  | "images"
  | "services"
  | "offices"
  | "categories"
  | "posts"
  | "inquiry"

export interface SectionConfig {
  id: DashboardSection
  label: string
  icon: React.ComponentType<{ className?: string }>
  component: React.LazyExoticComponent<React.ComponentType<any>>
  roles: SectionRole[]
  roleGroups: RoleGroup[] // allow sharing sections (e.g., profile) across groups
  category: string
  title: string
  description?: string
  /** Deep-link screen only (e.g. inquiry detail); omitted from sidebar */
  navHidden?: boolean
}

// Lazy loaded components
const EditProfileTab = lazy(() => import("@/features/admin/components/EditProfileTab").then(m => ({ default: m.EditProfileTab })))
const FreightForwardingInquiriesTab = lazy(() => import("@/features/admin/components/FreightForwardingInquiriesTab").then(m => ({ default: m.FreightForwardingInquiriesTab })))
const LogisticsInquiriesTab = lazy(() => import("@/features/admin/components/LogisticsInquiriesTab").then(m => ({ default: m.LogisticsInquiriesTab })))
const CharteringInquiriesTab = lazy(() => import("@/features/admin/components/CharteringInquiriesTab").then(m => ({ default: m.CharteringInquiriesTab })))
const SpecialRequestInquiriesTab = lazy(() => import("@/features/admin/components/SpecialRequestInquiriesTab").then(m => ({ default: m.SpecialRequestInquiriesTab })))
const GalleryImageHub = lazy(() => import("@/modules/gallery/components/admin/GalleryImageHub").then(m => ({ default: m.GalleryImageHub })))
const ManageServices = lazy(() => import("@/features/admin/components/ManageServices").then(m => ({ default: m.ManageServices })))
const ManageOffices = lazy(() => import("@/features/admin/components/ManageOffices").then(m => ({ default: m.ManageOffices })))
const ManageCategories = lazy(() => import("@/modules/categories/components/admin/CategoryManagement").then(m => ({ default: m.ManageCategories })))
const ManagePosts = lazy(() => import("@/modules/posts/components/admin/PostManagement").then(m => ({ default: m.ManagePosts })))

const UserInquiriesPage = lazy(() => import("@/features/user/component/UserInquiriesPage").then(m => ({ default: m.UserInquiriesPage })))

export const SECTION_REGISTRY: Record<DashboardSection, SectionConfig> = {
  profile: {
    id: "profile",
    label: "Edit Profile",
    icon: User,
    component: EditProfileTab,
    roles: ["ADMIN", "EMPLOYEE", "CUSTOMER"],
    roleGroups: ["INTERNAL", "EXTERNAL"],
    category: "Profile",
    title: "Edit Profile",
  },
  "freight-forwarding-inquiries": {
    id: "freight-forwarding-inquiries",
    label: "Freight Forwarding",
    icon: Package,
    component: FreightForwardingInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Freight Forwarding Inquiries",
  },
  "logistics-inquiries": {
    id: "logistics-inquiries",
    label: "Logistics",
    icon: Truck,
    component: LogisticsInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Logistics Inquiries",
  },
  "chartering-inquiries": {
    id: "chartering-inquiries",
    label: "Chartering",
    icon: Anchor,
    component: CharteringInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Chartering Inquiries",
  },
  "special-request-inquiries": {
    id: "special-request-inquiries",
    label: "Special Request",
    icon: FileText,
    component: SpecialRequestInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Special Request Inquiries",
  },
  images: {
    id: "images",
    label: "Images",
    icon: ImageIcon,
    component: GalleryImageHub,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Data Management",
    title: "Gallery Images",
    description: "Upload and manage field gallery images by area, port, and cargo type.",
  },
  services: {
    id: "services",
    label: "Services",
    icon: Cog,
    component: ManageServices,
    roles: [],
    roleGroups: [],
    category: "Data Management",
    title: "Manage Services",
  },
  offices: {
    id: "offices",
    label: "Offices",
    icon: LayoutDashboard,
    component: ManageOffices,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Data Management",
    title: "Manage Offices",
  },
  categories: {
    id: "categories",
    label: "Categories",
    icon: Database,
    component: ManageCategories,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Content Management",
    title: "Manage Categories",
  },
  posts: {
    id: "posts",
    label: "Posts",
    icon: FileText,
    component: ManagePosts,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Content Management",
    title: "Manage Posts",
  },
  inquiry: {
    id: "inquiry",
    label: "My Inquiries",
    icon: FileText,
    component: UserInquiriesPage,
    roles: ["CUSTOMER"],
    roleGroups: ["EXTERNAL"],
    category: "Inquiries",
    title: "My Inquiries",
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

export function listNavSectionsByRoleGroup(roleGroup: RoleGroup): SectionConfig[] {
  return listSectionsByRoleGroup(roleGroup).filter((section) => !section.navHidden)
}

export function canAccessSection(section: DashboardSection, role: SectionRole): boolean {
  const config = getSectionConfig(section)
  if (!config) return false
  return config.roles.includes(role)
}
