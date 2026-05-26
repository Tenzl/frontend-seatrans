"use client"

import React, { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { QueryClientProvider } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"
import {
  BriefcaseBusiness,
  ChevronRight,
  Database,
  FileText,
  Home,
  Image as ImageIcon,
  ListChecks,
  PanelLeft,
  ReceiptText,
  User as UserIcon,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
import Image from "next/image"

import { useAuth } from "@/modules/auth/context/AuthContext"
import { DashboardContent } from "@/shared/components/layout/dashboard/DashboardContent"
import {
  DashboardSection,
  getSectionConfig,
  listSectionsByRoleGroup,
  SectionRole,
} from "@/shared/config/dashboard-registry"
import { NavUser } from "@/shared/components/ui/nav-user"
import { createQueryClient } from "@/shared/config/react-query.config"
import { getRoleGroup } from "@/shared/utils/auth"
import { RoleGroup } from "@/shared/types/dashboard"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

interface MainDashboardProps {
  initialSection?: DashboardSection
  roleGroup?: RoleGroup
  onNavigateHome?: () => void
}

interface CategoryGroup {
  name: string
  items: { id: DashboardSection; label: string }[]
}

type CategoryIcon = LucideIcon | string

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  Profile: UserIcon,
  "Port Charge": ReceiptText,
  Inquiries: ListChecks,
  "Image Management": ImageIcon,
  "Data Management": Database,
  "Content Management": FileText,
  "Booking Management": BriefcaseBusiness,
}

const ROLE_GROUP_LABEL: Record<RoleGroup, string> = {
  INTERNAL: "Operations",
  EXTERNAL: "Customer",
}

function mapUserRole(role?: string, roleGroup?: RoleGroup): SectionRole | undefined {
  const upper = role?.toUpperCase()
  if (upper?.includes("ADMIN")) return "ADMIN"
  if (upper?.includes("EMPLOYEE")) return "EMPLOYEE"
  if (upper?.includes("CUSTOMER")) return "CUSTOMER"
  return undefined
}

function buildCategories(sections: ReturnType<typeof listSectionsByRoleGroup>): CategoryGroup[] {
  const order: Record<string, number> = {
    Profile: 0,
    "Port Charge": 1,
    Inquiries: 2,
    "Image Management": 3,
    "Data Management": 4,
    "Content Management": 5,
    "Booking Management": 6,
  }

  const grouped = sections.reduce<Record<string, { id: DashboardSection; label: string }[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push({ id: s.id, label: s.label })
    return acc
  }, {})

  return Object.entries(grouped)
    .sort((a, b) => (order[a[0]] ?? 99) - (order[b[0]] ?? 99))
    .map(([name, items]) => ({ name, items }))
}

function findCategoryForSection(categories: CategoryGroup[], sectionId?: DashboardSection) {
  if (!sectionId) return undefined
  return categories.find((cat) => cat.items.some((item) => item.id === sectionId))?.name
}

const CategoryButton = React.forwardRef<
  HTMLButtonElement,
  {
    category: CategoryGroup
    icon?: CategoryIcon
    onOpenSection: (sectionId: DashboardSection) => void
  } & React.ComponentProps<typeof SidebarMenuButton>
>(({ category, icon, onOpenSection, onClick, ...props }, ref) => {
  const { state, setOpen } = useSidebar()

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event)
    if (state === "collapsed" && category.items.length > 0) {
      onOpenSection(category.items[0].id)
      setOpen(true)
    }
  }

  const renderIcon = () => {
    if (!icon) return <PanelLeft className="h-4 w-4 shrink-0 opacity-70" />
    if (typeof icon === "string") {
      return <Image src={icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
    }
    const IconComponent = icon
    return <IconComponent className="h-4 w-4 shrink-0 opacity-80" />
  }

  return (
    <SidebarMenuButton
      ref={ref}
      tooltip={category.name}
      onClick={handleClick}
      className="h-9 transition-colors duration-200 hover:bg-sidebar-accent/80"
      {...props}
    >
      {renderIcon()}
      <span className="dashboard-nav-category group-data-[collapsible=icon]:hidden">{category.name}</span>
      <span className="ml-auto hidden rounded-md bg-sidebar-accent/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground group-data-[collapsible=icon]:hidden">
        {category.items.length}
      </span>
      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
    </SidebarMenuButton>
  )
})
CategoryButton.displayName = "CategoryButton"

function DashboardLoadingFallback() {
  return (
    <div className="dashboard-shell flex min-h-dvh w-full items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-primary/20" />
        <p className="text-sm text-muted-foreground">Loading workspace…</p>
      </div>
    </div>
  )
}

function DashboardEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="dashboard-shell flex min-h-dvh items-center justify-center p-6">
      <div className="dashboard-section-panel max-w-md p-8 text-center">
        <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function MainDashboard({ initialSection, roleGroup: roleGroupOverride, onNavigateHome }: MainDashboardProps) {
  const { user } = useAuth()
  const roleGroup = roleGroupOverride ?? getRoleGroup(user as any)
  const userRole = mapUserRole(user?.role, roleGroup)

  const sections = useMemo(() => {
    if (!roleGroup) return []
    return listSectionsByRoleGroup(roleGroup).filter((s) => (userRole ? s.roles.includes(userRole) : true))
  }, [roleGroup, userRole])

  const defaultSection = useMemo(() => {
    if (initialSection && sections.some((s) => s.id === initialSection)) return initialSection
    return sections[0]?.id
  }, [initialSection, sections])

  const queryClient = useMemo(() => createQueryClient(), [])

  if (!roleGroup) {
    return (
      <DashboardEmptyState
        title="No role detected"
        description="Please sign in again or contact support if this continues."
      />
    )
  }

  const categories = buildCategories(sections)

  if (categories.length === 0) {
    return (
      <DashboardEmptyState
        title="No accessible sections"
        description="Your account does not have permissions for any workspace modules yet."
      />
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <Suspense fallback={<DashboardLoadingFallback />}>
          <DashboardShell
            categories={categories}
            sections={sections}
            userRole={userRole}
            roleGroup={roleGroup}
            defaultSection={defaultSection}
            onNavigateHome={onNavigateHome}
            user={user ?? undefined}
          />
        </Suspense>
      </SidebarProvider>
    </QueryClientProvider>
  )
}

function DashboardShell({
  categories,
  sections,
  userRole,
  roleGroup,
  defaultSection,
  onNavigateHome,
  user,
}: {
  categories: CategoryGroup[]
  sections: ReturnType<typeof listSectionsByRoleGroup>
  userRole?: SectionRole
  roleGroup: RoleGroup
  defaultSection?: DashboardSection
  onNavigateHome?: () => void
  user?: { fullName?: string; email?: string; role?: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { state: sidebarState } = useSidebar()

  const querySection = searchParams.get("section") as DashboardSection | null
  const isValidSection = querySection && sections.some((s) => s.id === querySection)
  const activeSection = isValidSection ? querySection : defaultSection

  // Legacy sidebar URLs → unified Images hub with tab deep-link
  useEffect(() => {
    const rawSection = searchParams.get("section")
    if (rawSection !== "add-image" && rawSection !== "manage-images") return
    const params = new URLSearchParams(searchParams.toString())
    params.set("section", "images")
    params.set("tab", rawSection === "add-image" ? "add" : "manage")
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, searchParams, router])

  const setActiveSection = (sectionId: DashboardSection) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("section", sectionId)
    router.push(`${pathname}?${params.toString()}`)
  }

  const activeConfig = activeSection ? getSectionConfig(activeSection) : undefined
  const activeCategory = findCategoryForSection(categories, activeSection)

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    const openCategory = findCategoryForSection(categories, defaultSection)
    categories.forEach((cat) => {
      initial[cat.name] = cat.name === openCategory
    })
    return initial
  })

  useEffect(() => {
    const openCategory = findCategoryForSection(categories, activeSection)
    if (!openCategory) return
    setExpandedCategories((prev) => ({ ...prev, [openCategory]: true }))
  }, [activeSection, categories])

  useEffect(() => {
    if (sidebarState === "collapsed") {
      setExpandedCategories((prev) =>
        Object.keys(prev).reduce<Record<string, boolean>>((acc, key) => {
          acc[key] = false
          return acc
        }, {}),
      )
    }
  }, [sidebarState])

  return (
    <div className="dashboard-shell flex min-h-dvh w-full">
      <Sidebar collapsible="icon" variant="inset" className="dashboard-sidebar text-sidebar-foreground">
        <SidebarHeader className="border-b border-sidebar-border/60 pb-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="h-auto py-3 hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sidebar-border/80 bg-background shadow-sm">
                    <Image
                      src="/landing-image/footer_Logo.png"
                      alt="Seatrans"
                      width={28}
                      height={28}
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-semibold tracking-tight text-foreground">Seatrans</span>
                    <span className="text-xs text-muted-foreground">{ROLE_GROUP_LABEL[roleGroup]} workspace</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="gap-1 px-1 py-3">
          <SidebarMenu className="gap-0.5">
            {categories.map((category) => {
              const icon = CATEGORY_ICONS[category.name]
              const isOpen = expandedCategories[category.name] ?? false

              return (
                <Collapsible
                  key={category.name}
                  open={isOpen}
                  onOpenChange={(open) => setExpandedCategories((prev) => ({ ...prev, [category.name]: open }))}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <CategoryButton category={category} icon={icon} onOpenSection={setActiveSection} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="CollapsibleContent">
                      <SidebarMenuSub className="mr-0 border-l border-sidebar-border/80 pl-2">
                        {category.items.map((item) => {
                          const isActive = activeSection === item.id
                          return (
                            <SidebarMenuSubItem key={item.id}>
                              <SidebarMenuSubButton
                                onClick={() => setActiveSection(item.id)}
                                isActive={isActive}
                                className={cn(
                                  "h-8 rounded-md text-sm transition-all duration-200",
                                  isActive && "dashboard-nav-item-active",
                                  !isActive && "text-sidebar-foreground/85 hover:bg-sidebar-accent/70",
                                )}
                              >
                                <span className="truncate">{item.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60">
          {user && (
            <NavUser
              user={{
                name: user.fullName || user.email || "User",
                email: user.email || "",
                avatar: "",
              }}
            />
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex min-h-dvh min-w-0 flex-1 flex-col bg-transparent">
        <header className="dashboard-header">
          <div className="flex min-h-[3.75rem] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-6">
            <SidebarTrigger className="-ml-1 text-muted-foreground transition-colors hover:text-foreground" />
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <nav
              className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
              aria-label="Breadcrumb"
            >
              <Badge variant="secondary" className="shrink-0 font-medium tabular-nums">
                {ROLE_GROUP_LABEL[roleGroup]}
              </Badge>
              {activeCategory ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                  <span className="truncate">{activeCategory}</span>
                </>
              ) : null}
              {activeConfig ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                  <span className="truncate font-medium text-foreground">
                    {activeConfig.title ?? activeConfig.label}
                  </span>
                </>
              ) : null}
            </nav>
            {onNavigateHome && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateHome}
                className="shrink-0 gap-1.5 transition-transform duration-200 active:scale-[0.98]"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Public site</span>
              </Button>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto px-3 py-4 sm:px-4 md:px-6 md:py-5">
          {userRole && activeSection ? (
            <div className="dashboard-section-panel min-h-[min(68dvh,760px)]">
              <DashboardContent section={activeSection} userRole={userRole} />
            </div>
          ) : (
            <div className="dashboard-section-panel flex min-h-[280px] items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">Choose a section from the navigation to begin.</p>
            </div>
          )}
        </main>
      </SidebarInset>
    </div>
  )
}

export default MainDashboard
