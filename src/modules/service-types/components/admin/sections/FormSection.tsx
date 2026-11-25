'use client'

import { useEffect, useMemo, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { authService } from '@/modules/auth/services/authService'
import { ChevronsUpDown, AlertCircle, Loader2, ArrowRight, ArrowLeft, Info, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
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
import { API_CONFIG } from '@/shared/config/api.config'
import { isFieldVisible, validateInquiryFields } from './inquiryForm'
import styles from '../ServicePage.module.css'

const API_BASE_URL = API_CONFIG.API_URL

export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'port' | 'mv-prefix'
  placeholder?: string
  required?: boolean
  options?: string[]
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
  placeholder,
  disabled,
  invalid,
  describedBy,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options?: string[]
  placeholder?: string
  disabled?: boolean
  enableSearch?: boolean
  invalid?: boolean
  describedBy?: string
}) {
  const [open, setOpen] = useState(false)
  const normalizedOptions = (options || []).map(opt => ({ label: opt, value: opt.toLowerCase() }))
  const selected = normalizedOptions.find(opt => opt.value === (value || '').toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
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
  const [activeStep, setActiveStep] = useState(0)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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

  const steps = useMemo(() => {
    const sections = form.sections?.filter(section => section.fields.length > 0)
    return sections?.length ? sections : [{ title: 'Shipment details', fields: form.fields }]
  }, [form.sections, form.fields])
  const lastStep = activeStep === steps.length - 1

  const showFieldErrors = (errors: Record<string, string>, step: number) => {
    setActiveStep(step)
    setFieldErrors(errors)
    requestAnimationFrame(() => document.getElementById(Object.keys(errors)[0])?.focus())
  }

  const moveToStep = (next: number) => {
    if (submitting) return
    if (next > activeStep) {
      for (let index = activeStep; index < next; index++) {
        const errors = validateInquiryFields(steps[index].fields, formData)
        if (Object.keys(errors).length) {
          showFieldErrors(errors, index)
          return
        }
      }
    }
    setFieldErrors({})
    setActiveStep(next)
  }

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
    setActiveStep(0)
    setFieldErrors({})
  }, [allFields])

  // Port fields are free-text; no province/port loading needed

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setFieldErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lastStep) {
      moveToStep(activeStep + 1)
      return
    }
    for (let index = 0; index < steps.length; index++) {
      const errors = validateInquiryFields(steps[index].fields, formData)
      if (Object.keys(errors).length) {
        showFieldErrors(errors, index)
        return
      }
    }
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

    const normalizeCargoTypeCode = (value?: string) =>
      (value || '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_')

    const isTallyFeeEligibleCargo = (value?: string) => {
      const normalized = normalizeCargoTypeCode(value)
      return normalized.includes('IN_BAGS') || normalized.includes('EQUIPMENT')
    }

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
          boatHireAmount: formData.dischargeLoadingLocation?.toLowerCase() === 'anchorage' ? toDecimal(formData.boatHireAmount) : null,
          tallyFeeAmount: isTallyFeeEligibleCargo(formData.cargoType) ? toDecimal(formData.tallyFeeAmount) : null,
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

        const response = await fetch(`${API_BASE_URL}${form.submitPath || '/inquiries'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeader(),
          },
          body: JSON.stringify(body),
        })

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
        setSubmitMessage('Your inquiry has been sent. Our team will contact you shortly.')
        setActiveStep(0)
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
    const accessibility = {
      'aria-invalid': Boolean(fieldErrors[field.id]) || undefined,
      'aria-describedby': fieldErrors[field.id] ? `${field.id}-error` : field.helperText ? `${field.id}-help` : undefined,
    }
    if (field.type === 'textarea') {
      return (
        <Textarea
          id={field.id}
          {...accessibility}
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
          {...accessibility}
          value={value}
          invalid={Boolean(fieldErrors[field.id])}
          describedBy={fieldErrors[field.id] ? `${field.id}-error` : field.helperText ? `${field.id}-help` : undefined}
          onChange={v => onChange(field.id, v)}
          options={field.options}
          placeholder={field.placeholder}
          disabled={disabled}
          enableSearch={field.enableSearch}
        />
      )
    }

    if (field.type === 'date') {
      return (
        <DatePicker
          id={field.id}
          {...accessibility}
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
          {...accessibility}
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
      return (
        <Input
          id={field.id}
          {...accessibility}
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
        {...accessibility}
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
    <section id="quote-form" className={styles.formPanel} aria-labelledby="inquiry-title">
      <h2 id="inquiry-title">{form.sectionTitle}</h2>
      {steps.length > 1 && (
        <nav aria-label="Inquiry steps">
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title || index} className={styles.stepItem} aria-current={index === activeStep ? 'step' : undefined}>
                <button type="button" className={styles.stepButton} onClick={() => moveToStep(index)} disabled={submitting} aria-controls="inquiry-step">
                  <span className={`${styles.stepNumber} ${index < activeStep ? styles.stepComplete : ''}`}>
                    {index < activeStep ? <Check size={15} aria-hidden="true" /> : index + 1}
                  </span>
                  <span>{step.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {form.fieldsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Unable to load form</AlertTitle>
          <AlertDescription>{form.fieldsError}</AlertDescription>
        </Alert>
      )}
      {submitMessage && <Alert className="mb-4" role="status"><AlertTitle>Inquiry sent</AlertTitle><AlertDescription>{submitMessage}</AlertDescription></Alert>}
      {submitError && <Alert variant="destructive" className="mb-4"><AlertTitle>Unable to send inquiry</AlertTitle><AlertDescription>{submitError}</AlertDescription></Alert>}
      <form onSubmit={handleSubmit} noValidate>
        <fieldset id="inquiry-step" disabled={submitting} aria-busy={submitting}>
          <legend className="sr-only" aria-live="polite">Step {activeStep + 1} of {steps.length}: {steps[activeStep].title}</legend>
          {form.loadingFields && <p role="status">Loading form fields...</p>}
          <div className={styles.fields}>
            {steps[activeStep].fields.filter(field => isFieldVisible(field, formData)).map(field => (
              <div key={field.id} className={`${styles.field} ${field.gridSpan === 2 ? styles.fieldWide : ''}`} data-invalid={Boolean(fieldErrors[field.id])}>
                <Label htmlFor={field.id}>{field.label}{field.required && <span className={styles.required}> *</span>}</Label>
                {renderField(field, formData[field.id] || '', handleInputChange, submitting)}
                {fieldErrors[field.id] ? (
                  <p id={`${field.id}-error`} className={styles.fieldError} role="alert">{fieldErrors[field.id]}</p>
                ) : field.helperText ? (
                  <p id={`${field.id}-help`} className={styles.fieldHelp}>{field.helperText}</p>
                ) : null}
              </div>
            ))}
          </div>
        </fieldset>
        <div className={styles.formActions}>
          <div className={styles.authNote}>
            {!isAuthenticated ? (
              <><Info size={16} aria-hidden="true" /><span>Sign in before submitting your inquiry. <Link href="/login">Sign in</Link></span></>
            ) : !profileComplete ? (
              <><AlertCircle size={16} aria-hidden="true" /><span>Please complete your profile before submitting. <Link href="/dashboard">Complete profile</Link></span></>
            ) : (
              <><Info size={16} aria-hidden="true" /><span>{lastStep ? 'Review your details before submitting.' : 'Fields marked * are required.'}</span></>
            )}
          </div>
          <div className={styles.actionButtons}>
            {activeStep > 0 && <Button type="button" variant="outline" onClick={() => moveToStep(activeStep - 1)} disabled={submitting}><ArrowLeft size={15} aria-hidden="true" />Back</Button>}
            {lastStep ? (
              <Button type="submit" disabled={submitting || !isAuthenticated || !profileComplete || !form.serviceTypeId || hasNegativeNumbers}>
                {submitting ? <><Loader2 size={16} className="animate-spin" />Sending...</> : <>{form.submitButtonText}<ArrowRight size={16} aria-hidden="true" /></>}
              </Button>
            ) : (
              <Button type="submit" disabled={submitting || form.loadingFields}>Continue<ArrowRight size={16} aria-hidden="true" /></Button>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}
