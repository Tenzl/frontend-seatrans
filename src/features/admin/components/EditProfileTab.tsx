'use client'

import { useEffect, useState } from 'react'
import { Mail, Building } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { PhoneInput } from '@/shared/components/ui/phone-input'
import { Label } from '@/shared/components/ui/label'
import { useAuth } from '@/modules/auth/context/AuthContext'

export function EditProfileTab() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
  })

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <CardDescription className="max-w-2xl text-sm leading-relaxed">
            Your account details are managed by the system. Contact an administrator to update your profile or password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={formData.fullName} disabled />
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
                disabled
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="company" value={formData.company} className="pl-9" disabled />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
