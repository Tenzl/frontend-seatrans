'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, Building } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { PhoneInput } from '@/shared/components/ui/phone-input'
import { Label } from '@/shared/components/ui/label'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { Button } from '@/shared/components/ui/button'
import { toast } from '@/shared/utils/toast'

export function EditProfileTab() {
  const { user, updateMyProfile } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        company: user.company || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const canEdit = useMemo(() => {
    const roleUpper = user?.role?.toUpperCase() || ''
    const isEmployee = roleUpper.includes('EMPLOYEE')
    return Boolean(isEmployee)
  }, [user?.role])

  const handleSave = async () => {
    if (!canEdit) return
    setIsSaving(true)
    try {
      const res = await updateMyProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        company: formData.company,
      })
      if (!res.success) {
        toast.error(res.message || 'Failed to update profile')
        return
      }
      toast.success('Profile updated')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <CardDescription className="max-w-2xl text-sm leading-relaxed">
            {canEdit
              ? 'Update your profile details. Email and role are managed by the system.'
              : 'Your account details are managed by the system. Contact an administrator to update your profile or password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                disabled={!canEdit}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={formData.email} className="pl-9" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <PhoneInput
                id="phone"
                international
                defaultCountry="VN"
                value={formData.phone}
                disabled={!canEdit}
                onChange={(value) => setFormData((prev) => ({ ...prev, phone: String(value ?? '') }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  value={formData.company}
                  className="pl-9"
                  disabled={!canEdit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
