'use client'

import React, { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'

import {
  AdminDataPanel,
  AdminSection,
  AdminToolbar,
  AdminToolbarGroup,
} from '@/shared/components/layout/dashboard/admin'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { toast } from '@/shared/utils/toast'
import { DataTableContent } from '@/shared/components/ui/data-table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

import { queryKeys } from '@/shared/config/react-query.config'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import {
  adminUsersService,
  type AdminRoleOption,
  type AdminUserRow,
  type RoleGroup,
} from '@/features/admin/services/adminUsersService'

type UserScope = 'INTERNAL' | 'EXTERNAL'

const SCOPE_OPTIONS: { id: UserScope; label: string }[] = [
  { id: 'INTERNAL', label: 'Internal users' },
  { id: 'EXTERNAL', label: 'External accounts' },
]

export function ManageUsers() {
  const queryClient = useQueryClient()

  const [scope, setScope] = useState<UserScope>('INTERNAL')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 250)
  const [roleFilter, setRoleFilter] = useState<string>('__ALL__')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])

  const roleGroup: RoleGroup = scope

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: queryKeys.adminUserRoles(roleGroup),
    queryFn: async () => adminUsersService.listRoles(roleGroup),
  })

  const { data: rows = [], isLoading } = useQuery({
    queryKey: queryKeys.adminUsers({
      roleGroup,
      q: debouncedSearch,
      roleName: roleFilter === '__ALL__' ? undefined : roleFilter,
    }),
    queryFn: async () =>
      adminUsersService.listUsers({
        roleGroup,
        q: debouncedSearch,
        roleName: roleFilter === '__ALL__' ? undefined : roleFilter,
        limit: 200,
      }),
  })

  const columns = useMemo<ColumnDef<AdminUserRow>[]>(() => {
    const cols: ColumnDef<AdminUserRow>[] = [
      { accessorKey: 'id', header: 'ID', cell: (ctx) => String(ctx.getValue<number>()), meta: { className: 'w-20' } },
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: (ctx) => ctx.getValue<string | null>() ?? '—',
        meta: { className: 'min-w-[220px]' },
      },
      {
        accessorKey: 'username',
        header: 'Username',
        cell: (ctx) => ctx.getValue<string | null>() ?? '—',
        meta: { className: 'min-w-[160px]' },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (ctx) => ctx.getValue<string>() || '—',
        meta: { className: 'min-w-[260px]' },
      },
      {
        accessorKey: 'roleName',
        header: 'Role',
        cell: (ctx) => ctx.getValue<string | null>() ?? '—',
        meta: { className: 'w-44' },
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: (ctx) => (ctx.getValue<boolean>() ? 'Yes' : 'No'),
        meta: { className: 'w-28' },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: (ctx) => {
          const value = ctx.getValue<string>()
          return value ? new Date(value).toLocaleString() : '—'
        },
        meta: { className: 'w-56' },
      },
    ]

    return cols
  }, [])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createUsername, setCreateUsername] = useState('')
  const [createName, setCreateName] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRoleId, setCreateRoleId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)

  const internalRoles = useMemo(
    () => roles.filter((r) => r.roleGroup === 'INTERNAL'),
    [roles],
  )

  const canCreateInternal = scope === 'INTERNAL'

  const resetCreate = () => {
    setCreateEmail('')
    setCreateUsername('')
    setCreateName('')
    setCreatePassword('')
    setCreateRoleId('')
  }

  const handleCreate = async () => {
    if (!canCreateInternal) return
    const email = createEmail.trim()
    const password = createPassword
    const roleId = Number(createRoleId)
    if (!email) {
      toast.error('Email is required')
      return
    }
    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!Number.isFinite(roleId) || roleId <= 0) {
      toast.error('Select a role')
      return
    }

    setIsCreating(true)
    try {
      await adminUsersService.createInternalUser({
        email,
        username: createUsername.trim() || undefined,
        fullName: createName.trim() || undefined,
        password,
        roleId,
      })
      toast.success('User created')
      setCreateOpen(false)
      resetCreate()
      await queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    } catch (err) {
      console.error('Failed to create user:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <AdminSection description="Manage internal users (create allowed) and view external accounts (read-only).">
      <AdminToolbar>
        <AdminToolbarGroup>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as UserScope)}>
              <SelectTrigger className="h-9 w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCOPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter} disabled={isLoadingRoles}>
              <SelectTrigger className="h-9 w-[240px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All roles</SelectItem>
                {roles.map((role: AdminRoleOption) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Search</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, name, company…"
              className="h-9 w-[320px]"
            />
          </div>
        </AdminToolbarGroup>

        <AdminToolbarGroup>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={!canCreateInternal}
            className="gap-2 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Create internal user
          </Button>
        </AdminToolbarGroup>
      </AdminToolbar>

      <AdminDataPanel>
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users…
          </div>
        ) : (
          <DataTableContent table={table} columnCount={columns.length} />
        )}
      </AdminDataPanel>

      <Dialog
        open={createOpen}
        onOpenChange={(next) => {
          setCreateOpen(next)
          if (!next) resetCreate()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create internal user</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="off"
                name="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Username (optional)</Label>
              <Input
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                placeholder="username"
                autoComplete="off"
                name="username"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Full name (optional)</Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Full name"
                autoComplete="off"
                name="fullName"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                name="password"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={createRoleId} onValueChange={setCreateRoleId} disabled={isLoadingRoles}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={isLoadingRoles ? 'Loading roles…' : 'Select role'} />
                </SelectTrigger>
                <SelectContent>
                  {internalRoles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Only INTERNAL roles can be created here.</p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreate} disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminSection>
  )
}

