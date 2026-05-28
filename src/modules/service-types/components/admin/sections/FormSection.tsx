'use client'

import { useEffect, useMemo, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { authService } from '@/modules/auth/services/authService'
import { ChevronsUpDown, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { DoubleBezel } from '@/shared/components/service/DoubleBezel'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { inquiryService } from '@/modules/inquiries/services/inquiryService'
import {
  buildCargoNameSelectOptions,
  buildCargoTypeSelectOptions,
  CARGO_NAME_OTHER,
  isTallyFeeEligibleCargoType,
  type CargoSelectOption,
} from '@/modules/gallery/shippingAgencyCargoCatalog'
import {
  commodityService,
  type Commodity,
} from '@/modules/gallery/services/commodityService'
import { portService, type Port } from '@/modules/logistics/services/portService'
import { buildPortOfCallSelectOptions } from '@/modules/logistics/shippingAgencyPortCatalog'

export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'port' | 'mv-prefix'
  placeholder?: string
  required?: boolean
  options?: string[]
  selectOptions?: CargoSelectOption[]
  gridSpan?: 1 | 2
  identity?: boolean
  helperText?: string
  enableSearch?: boolean
  showWhen?: { field: string; value: string | string[] }
}

export interface InquiryPayload {
  serviceTypeId: number
  serviceTypeSlug?: string
  fullName: string
  company: string
  email: string
  phone: string
  notes: string
}

function ComboboxSelect({
  id,
  value,
  onChange,
  options,
  selectOptions,
  placeholder,
  disabled,
  enableSearch = true,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options?: string[]
  selectOptions?: CargoSelectOption[]
  placeholder?: string
  disabled?: boolean
  enableSearch?: boolean
}) {
  const [open, setOpen] = useState(false)
  const normalizedOptions: CargoSelectOption[] =
    selectOptions ??
    (options || []).map((opt) => ({ label: opt, value: opt }))
  const selected = normalizedOptions.find((opt) => opt.value === (value || ''))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white"
          disabled={disabled}
          id={id}
        >
          {selected ? selected.label : (placeholder || 'Select...')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px]" align="start">
        <Command loop shouldFilter={false}>
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {normalizedOptions.map(opt => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function FormSection({
  form
}: {
  form: {
    sectionTitle: string
    sectionDescription: string
    badgeText?: string
    fields: FormField[]
    sections?: { title?: string; description?: string; fields: FormField[] }[]
    submitButtonText: string
    onSubmit: (data: InquiryPayload) => void
    serviceTypeId?: number
    submitPath?: string
    serviceTypeSlug?: string
    loadingFields?: boolean
    fieldsError?: string | null
  }
}) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [shippingCargoCatalog, setShippingCargoCatalog] = useState<Commodity[]>([])
  const [isLoadingShippingCargo, setIsLoadingShippingCargo] = useState(false)
  const [portsByField, setPortsByField] = useState<Record<string, Port[]>>({})
  const [isLoadingPortsByField, setIsLoadingPortsByField] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { user, isAuthenticated, profileComplete } = useAuth()
  // User fields we may want to preserve on reset
  const userFieldIds = ['fullName', 'company', 'email', 'phone']
  
  // Port fields now free-text; no province/port loading needed

  // Flatten sections into fields if sections are provided (no identity fields injected)
  const allFields = useMemo(() => {
    if (form.sections && form.sections.length > 0) {
      return form.sections.flatMap(section => section.fields)
    }
    return form.fields
  }, [form.sections, form.fields])

  const otherFields = allFields
  const isShippingAgencyForm = form.serviceTypeSlug === 'shipping-agency'

  useEffect(() => {
    if (!isShippingAgencyForm || !form.serviceTypeId) {
      setShippingCargoCatalog([])
      return
    }
    let cancelled = false
    setIsLoadingShippingCargo(true)
    commodityService
      .getCommoditiesByServiceType(form.serviceTypeId)
      .then((rows) => {
        if (!cancelled) setShippingCargoCatalog(rows)
      })
      .catch(() => {
        if (!cancelled) setShippingCargoCatalog([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingShippingCargo(false)
      })
    return () => {
      cancelled = true
    }
  }, [isShippingAgencyForm, form.serviceTypeId])

  useEffect(() => {
    const portAreaPairs: Array<{ portId: string; areaId: string }> = [
      { portId: 'portOfCall', areaId: 'portArea' },
      { portId: 'loadingPort', areaId: 'loadingArea' },
      { portId: 'dischargingPort', areaId: 'dischargingArea' },
    ]

    const pairsInForm = portAreaPairs.filter(({ portId, areaId }) => {
      const hasPort = allFields.some((f) => f.id === portId && f.type === 'port')
      const hasArea = allFields.some((f) => f.id === areaId && f.type === 'select')
      return hasPort && hasArea
    })

    if (pairsInForm.length === 0) return

    let cancelled = false

    pairsInForm.forEach(({ portId, areaId }) => {
      const area = (formData[areaId] || '').trim()
      if (!area) {
        setPortsByField((prev) => ({ ...prev, [portId]: [] }))
        setIsLoadingPortsByField((prev) => ({ ...prev, [portId]: false }))
        return
      }

      setIsLoadingPortsByField((prev) => ({ ...prev, [portId]: true }))
      portService
        .getPortsByArea(area)
        .then((rows) => {
          if (!cancelled) {
            setPortsByField((prev) => ({ ...prev, [portId]: rows }))
          }
        })
        .catch(() => {
          if (!cancelled) {
            setPortsByField((prev) => ({ ...prev, [portId]: [] }))
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoadingPortsByField((prev) => ({ ...prev, [portId]: false }))
          }
        })
    })

    return () => {
      cancelled = true
    }
  }, [allFields, formData, isShippingAgencyForm])

  const resolvedFields = useMemo(() => {
    const portOptionsByField: Record<string, CargoSelectOption[] | undefined> = {}
    Object.entries(portsByField).forEach(([fieldId, ports]) => {
      if (ports?.length) portOptionsByField[fieldId] = buildPortOfCallSelectOptions(ports)
    })

    if (!isShippingAgencyForm) {
      return allFields.map((field) => {
        if (field.type === 'port' && portOptionsByField[field.id]?.length) {
          return { ...field, selectOptions: portOptionsByField[field.id], options: undefined }
        }
        return field
      })
    }

    const cargoTypeOptions = buildCargoTypeSelectOptions(shippingCargoCatalog)
    const cargoNameOptions = formData.cargoType
      ? [
          ...buildCargoNameSelectOptions(shippingCargoCatalog, formData.cargoType),
          { value: CARGO_NAME_OTHER, label: 'Other (specify)' },
        ]
      : []

    return allFields.map((field) => {
      if (field.id === 'cargoType' && cargoTypeOptions.length > 0) {
        return { ...field, selectOptions: cargoTypeOptions, options: undefined }
      }
      if (field.id === 'cargoName' && cargoNameOptions.length > 0) {
        return { ...field, selectOptions: cargoNameOptions, options: undefined }
      }
      if (field.type === 'port' && portOptionsByField[field.id]?.length) {
        return { ...field, selectOptions: portOptionsByField[field.id], options: undefined }
      }
      return field
    })
  }, [allFields, isShippingAgencyForm, shippingCargoCatalog, portsByField, formData.cargoType])

  const resolvedFieldById = useMemo(() => {
    const map = new Map<string, FormField>()
    for (const field of resolvedFields) {
      map.set(field.id, field)
    }
    return map
  }, [resolvedFields])

  const resolvedSections = useMemo(() => {
    if (!form.sections?.length) return null
    return form.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => resolvedFieldById.get(field.id) ?? field),
    }))
  }, [form.sections, resolvedFieldById])

  useEffect(() => {
    const initial: Record<string, string> = {}
    allFields.forEach(f => {
      // Initialize MV prefix fields with "MV "
      if (f.type === 'mv-prefix') {
        initial[f.id] = 'MV '
      } else if (f.id === 'boatHireEnabled' || f.id === 'tallyFeeEnabled') {
        // Default yes/no toggles to "No"
        initial[f.id] = 'no'
      } else {
        initial[f.id] = ''
      }
    })
    setFormData(initial)
  }, [allFields])

  // Port fields are free-text; no province/port loading needed

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'portArea' && prev.portArea !== value) next.portOfCall = ''
      if (field === 'loadingArea' && prev.loadingArea !== value) next.loadingPort = ''
      if (field === 'dischargingArea' && prev.dischargingArea !== value) next.dischargingPort = ''
      if (field === 'cargoType' && isShippingAgencyForm && prev.cargoType !== value) {
        next.cargoName = ''
        next.cargoNameOther = ''
      }
      if (field === 'cargoName' && value !== CARGO_NAME_OTHER) {
        next.cargoNameOther = ''
      }
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      const errorMsg = 'Please log in to submit an inquiry.'
      toast.error('Authentication Required', {
        description: errorMsg
      })
      setSubmitError(errorMsg)
      setSubmitMessage(null)
      return
    }

    if (!form.serviceTypeId) {
      const errorMsg = 'Missing service identifier. Please try again later.'
      toast.error('Configuration Error', {
        description: errorMsg
      })
      setSubmitError(errorMsg)
      setSubmitMessage(null)
      return
    }

    // Validate: number fields must not be negative
    const numberFields = allFields.filter(f => f.type === 'number')
    for (const field of numberFields) {
      const value = formData[field.id]
      if (value && Number(value) < 0) {
        const errorMsg = `${field.label} cannot be negative. Please enter a value >= 0.`
        toast.error('Validation Error', {
          description: errorMsg
        })
        setSubmitError(errorMsg)
        setSubmitMessage(null)
        return
      }
    }

    const toDecimal = (value?: string) => {
      if (value === undefined || value === null) return null
      const trimmed = value.toString().trim()
      if (trimmed === '') return null
      const num = Number(trimmed)
      if (Number.isNaN(num)) return null
      return Math.round(num * 100) / 100
    }


    const serviceTypeSlug = form.serviceTypeSlug
    const isShippingAgency = serviceTypeSlug === 'shipping-agency'
    const isChartering = serviceTypeSlug === 'chartering-ship-broking'
    const isFreight = serviceTypeSlug === 'freight-forwarding'
    const isLogistics = serviceTypeSlug === 'total-logistics'

    // Map to backend DTO shape for shipping agency
    const shippingAgencyPayload = isShippingAgency
      ? {
          serviceTypeId: form.serviceTypeId,
          serviceTypeSlug: serviceTypeSlug,
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: (user as any)?.company || '',
          notes: formData.otherInfo || formData.notes || '',
          shipownerTo: formData.to,
          vesselName: formData.mv,
          grt: toDecimal(formData.grt),
          dwt: toDecimal(formData.dwt),
          loa: toDecimal(formData.loa),
          eta: formData.eta || null,
          cargoType: formData.cargoType,
          cargoName: formData.cargoName,
          cargoNameOther: formData.cargoNameOther,
          quantityTons: toDecimal(formData.quantityTons),
          frtTaxType: formData.frtTaxType,
          purposeOfCalling: formData.purposeOfCalling,
          portOfCall: formData.portOfCall,
          dischargeLoadingLocation: formData.dischargeLoadingLocation,
          boatHireAmount: formData.dischargeLoadingLocation === 'Anchorage' ? toDecimal(formData.boatHireAmount) : null,
          tallyFeeAmount: isTallyFeeEligibleCargoType(formData.cargoType)
            ? toDecimal(formData.tallyFeeAmount)
            : null,
          transportLs: toDecimal(formData.transportLs),
          transportQuarantine: toDecimal(formData.transportQuarantine),
        }
      : null

    // Map to backend DTO for chartering
    const charteringPayload = isChartering
      ? {
          serviceTypeId: form.serviceTypeId,
          serviceTypeSlug: serviceTypeSlug,
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: (user as any)?.company || '',
          notes: formData.otherInfo || '',
          cargoQuantity: formData.cargoQuantity,
          loadingPort: formData.loadingPort,
          dischargingPort: formData.dischargingPort,
          laycanFrom: formData.laycanFrom || null,
          laycanTo: formData.laycanTo || null,
        }
      : null

    // Map to backend DTO for freight forwarding
    const freightPayload = isFreight
      ? {
          serviceTypeId: form.serviceTypeId,
          serviceTypeSlug: serviceTypeSlug,
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: (user as any)?.company || '',
          notes: formData.otherInfo || '',
          cargoName: formData.cargoName,
          deliveryTerm: formData.deliveryTerm,
          container20: formData.container20 ? parseInt(formData.container20) : null,
          container40: formData.container40 ? parseInt(formData.container40) : null,
          loadingPort: formData.loadingPort,
          dischargingPort: formData.dischargingPort,
          shipmentFrom: formData.shipmentFrom || null,
          shipmentTo: formData.shipmentTo || null,
        }
      : null

    // Map to backend DTO for logistics (same as freight)
    const logisticsPayload = isLogistics
      ? {
          serviceTypeId: form.serviceTypeId,
          serviceTypeSlug: serviceTypeSlug,
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: (user as any)?.company || '',
          notes: formData.otherInfo || '',
          cargoName: formData.cargoName,
          deliveryTerm: formData.deliveryTerm,
          container20: formData.container20 ? parseInt(formData.container20) : null,
          container40: formData.container40 ? parseInt(formData.container40) : null,
          loadingPort: formData.loadingPort,
          dischargingPort: formData.dischargingPort,
          shipmentFrom: formData.shipmentFrom || null,
          shipmentTo: formData.shipmentTo || null,
        }
      : null

    const submit = async () => {
      setSubmitting(true)
      setSubmitError(null)
      setSubmitMessage(null)
      try {
        const body = shippingAgencyPayload || charteringPayload || freightPayload || logisticsPayload

        if (!body) {
          setSubmitError('Invalid service type configuration.')
          return
        }

        const response = await inquiryService.submitJson(body)
        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          const message = result?.message || 'Request could not be sent. Please try again.'
          toast.error('Submission Failed', {
            description: message
          })
          setSubmitError(message)
          return
        }

        toast.success('Request Sent Successfully', {
          description: 'Your request was sent successfully. We will contact you shortly.'
        })
        if (form.onSubmit) {
          form.onSubmit(body)
        }
        setFormData(prev => {
          const cleared: Record<string, string> = {}
          Object.keys(prev).forEach(key => {
            const keepUserField = isAuthenticated && userFieldIds.includes(key)
            const userValue = (user as any)?.[key]
            cleared[key] = keepUserField ? userValue || '' : ''
          })
          return cleared
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
        toast.error('Submission Error', {
          description: errorMessage
        })
        setSubmitError(errorMessage)
      } finally {
        setSubmitting(false)
      }
    }

    submit()
  }

  // Helper function to render a field
  const renderField = (
    field: FormField,
    value: string,
    onChange: (id: string, value: string) => void,
    disabled: boolean
  ) => {
    if (field.type === 'textarea') {
      return (
        <Textarea
          id={field.id}
          value={value}
          onChange={e => onChange(field.id, e.target.value)}
          required={field.required}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={4}
          className="bg-white"
        />
      )
    }
    
    if (field.type === 'select') {
      return (
        <ComboboxSelect
          id={field.id}
          value={value}
          onChange={v => onChange(field.id, v)}
          options={field.options}
          selectOptions={field.selectOptions}
          placeholder={
            field.id === 'cargoType' || field.id === 'cargoName'
              ? isLoadingShippingCargo
                ? 'Loading catalog…'
                : field.placeholder
              : field.placeholder
          }
          disabled={
            disabled ||
            (isShippingAgencyForm &&
              (field.id === 'cargoType' || field.id === 'cargoName') &&
              (isLoadingShippingCargo || shippingCargoCatalog.length === 0))
          }
          enableSearch={field.enableSearch}
        />
      )
    }
    
    if (field.type === 'date') {
      return (
        <DatePicker
          id={field.id}
          value={value}
          onChange={v => onChange(field.id, v)}
          placeholder={field.placeholder || 'dd/mm/yyyy'}
          disabled={disabled}
          required={field.required}
        />
      )
    }
    
    if (field.type === 'mv-prefix') {
      // Special handling for MV prefix that cannot be deleted
      const mvPrefix = 'MV '
      const displayValue = value.startsWith(mvPrefix) ? value : mvPrefix + value
      
      return (
        <Input
          id={field.id}
          value={displayValue}
          onChange={e => {
            const newValue = e.target.value
            // Ensure MV prefix is always present
            if (newValue.startsWith(mvPrefix)) {
              onChange(field.id, newValue)
            } else if (newValue.length < mvPrefix.length) {
              onChange(field.id, mvPrefix)
            }
          }}
          onKeyDown={e => {
            // Prevent deleting past the prefix
            const input = e.target as HTMLInputElement
            const cursorPos = input.selectionStart || 0
            if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= mvPrefix.length) {
              e.preventDefault()
            }
          }}
          required={field.required}
          placeholder={field.placeholder}
          disabled={disabled}
          className="bg-white"
        />
      )
    }
    
    if (field.type === 'port') {
      if (field.selectOptions?.length) {
        const areaFieldByPortId: Record<string, string> = {
          portOfCall: 'portArea',
          loadingPort: 'loadingArea',
          dischargingPort: 'dischargingArea',
        }
        const areaFieldId = areaFieldByPortId[field.id]
        const areaValue = areaFieldId ? (formData[areaFieldId] || '').trim() : ''
        const isAreaDriven = Boolean(areaFieldId)
        const isLoadingPorts = Boolean(isLoadingPortsByField[field.id])

        return (
          <ComboboxSelect
            id={field.id}
            value={value}
            onChange={(v) => onChange(field.id, v)}
            selectOptions={field.selectOptions}
            placeholder={
              isAreaDriven && areaValue === ''
                ? 'Select area first'
                : isLoadingPorts
                  ? 'Loading ports…'
                  : field.placeholder || 'Select port'
            }
            disabled={
              disabled ||
              (isAreaDriven && areaValue === '') ||
              isLoadingPorts
            }
            enableSearch
          />
        )
      }
      return (
        <Input
          id={field.id}
          value={value}
          onChange={e => onChange(field.id, e.target.value)}
          required={field.required}
          placeholder={field.placeholder || 'Enter port'}
          disabled={disabled}
          className="bg-white"
        />
      )
    }
    
    const isNumber = field.type === 'number'
    const numberRegex = /^\d*(\.\d{0,2})?$/

    const allowNumber = (next: string) => next === '' || numberRegex.test(next)

    const handleNumberChange = (next: string) => {
      if (allowNumber(next)) {
        onChange(field.id, next)
      }
    }

    const handleNumberKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      const allowedNavigation = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter']
      const isShortcut = (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())
      if (allowedNavigation.includes(e.key) || isShortcut) return

      if (e.key === '.' && value.includes('.')) {
        e.preventDefault()
        return
      }

      if (!/\d/.test(e.key) && e.key !== '.') {
        e.preventDefault()
      }
    }

    const handleNumberPaste = (e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text')?.trim() || ''
      if (!allowNumber(pasted)) {
        e.preventDefault()
      }
    }

    return (
      <Input
        id={field.id}
        type={isNumber ? 'text' : field.type}
        inputMode={isNumber ? 'decimal' : undefined}
        value={value}
        onChange={isNumber ? e => handleNumberChange(e.target.value) : e => onChange(field.id, e.target.value)}
        onKeyDown={isNumber ? handleNumberKeyDown : undefined}
        onPaste={isNumber ? handleNumberPaste : undefined}
        required={field.required}
        placeholder={field.placeholder}
        disabled={disabled}
        className="bg-white"
      />
    )
  }

  const hasNegativeNumbers = useMemo(() => {
    const numberFields = allFields.filter(f => f.type === 'number')
    return numberFields.some(field => {
      const value = formData[field.id]
      return value && Number(value) < 0
    })
  }, [formData, allFields])

  return (
    <section id="quote-form" className="py-16 md:py-24 scroll-mt-24">
      <div className="container max-w-7xl">
        <div className="max-w-3xl mx-auto">
          {/* Section header — consistent asymmetric style */}
          <div className="mb-10 grid gap-5 md:grid-cols-[1fr_1.5fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                Inquiry
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter leading-none text-slate-900 text-balance">
                {form.sectionTitle}
              </h2>
              {form.badgeText && (
                <Badge className="mt-3 rounded-full px-3 py-1">{form.badgeText}</Badge>
              )}
            </div>
            <p className="text-base text-slate-600 leading-relaxed max-w-[52ch]">
              {form.sectionDescription}
            </p>
          </div>

          <DoubleBezel>
            <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-8 md:p-10">
              {form.fieldsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Unable to load form</AlertTitle>
                  <AlertDescription>{form.fieldsError}</AlertDescription>
                </Alert>
              )}
              {!isAuthenticated && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Login required</AlertTitle>
                  <AlertDescription>
                    Please sign in before submitting your inquiry.
                    <Link href="/auth/login" className="ml-2 underline font-semibold">
                      Go to login
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              {isAuthenticated && !profileComplete && (
                <Alert variant="destructive" className="mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <AlertDescription className="flex-1">
                      Please complete your profile before submitting an inquiry.
                      <Link href="/dashboard" className="ml-1 underline font-semibold">
                        Complete Profile
                      </Link>
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {submitMessage && (
                <Alert className="mb-4">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{submitMessage}</AlertDescription>
                </Alert>
              )}

              {submitError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {form.loadingFields && (
                  <div className="text-sm text-muted-foreground">
                    Loading form fields...
                  </div>
                )}
                
                {/* Render sections if provided */}
                {resolvedSections && resolvedSections.length > 0 ? (
                  <>
                    {/* Render each section */}
                    {resolvedSections.map((section, sectionIdx) => {
                      const sectionFields = section.fields
                      if (sectionFields.length === 0) return null

                      return (
                        <div key={sectionIdx} className="space-y-4">
                          {section.title && (
                            <div className="border-b pb-2">
                              <h3 className="text-lg font-semibold">{section.title}</h3>
                              {section.description && (
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                              )}
                            </div>
                          )}
                          <div className="grid md:grid-cols-2 gap-6">
                            {sectionFields.map(field => {
                              // Check if field should be shown based on showWhen condition
                              if (field.showWhen) {
                                const conditionValue = formData[field.showWhen.field]
                                const expectedValues = Array.isArray(field.showWhen.value) 
                                  ? field.showWhen.value 
                                  : [field.showWhen.value]
                                const shouldShow = expectedValues.some(v => 
                                  conditionValue?.toLowerCase() === v.toLowerCase()
                                )
                                if (!shouldShow) return null
                              }

                              const colSpan = field.gridSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'
                              const disabledByToggle = false
                              return (
                                <div key={field.id} className={`space-y-2 ${colSpan}`}>
                                  <Label htmlFor={field.id}>
                                    {field.label} {field.required && '*'}
                                  </Label>
                                  {renderField(field, formData[field.id] || '', handleInputChange, disabledByToggle)}
                                  {field.helperText && (
                                    <p className="text-xs text-muted-foreground">{field.helperText}</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </>
                ) : (
                  /* Fallback: render fields without sections */
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      {otherFields.map(field => {
                        const colSpan = field.gridSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'
                        const disabledByToggle =
                          (field.id === 'boatHireAmount' && (formData.boatHireEnabled || '').toLowerCase() !== 'yes') ||
                          (field.id === 'tallyFeeAmount' && (formData.tallyFeeEnabled || '').toLowerCase() !== 'yes')
                        return (
                          <div key={field.id} className={`space-y-2 ${colSpan}`}>
                            <Label htmlFor={field.id}>
                              {field.label} {field.required && '*'}
                            </Label>
                            {renderField(field, formData[field.id] || '', handleInputChange, disabledByToggle)}
                            {field.helperText && (
                              <p className="text-xs text-muted-foreground">{field.helperText}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full hover-lift"
                  size="lg"
                  disabled={submitting || !isAuthenticated || !profileComplete || !form.serviceTypeId || hasNegativeNumbers}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    (!profileComplete && isAuthenticated) ? 'Complete Profile First' : form.submitButtonText
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          </DoubleBezel>
        </div>
      </div>
    </section>
  )
}
