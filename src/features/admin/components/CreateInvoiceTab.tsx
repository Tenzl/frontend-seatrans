"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'
import { toast } from '@/shared/utils/toast'
import { Loader2, Eye, Save, Send, ArrowLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { buildDashboardUrl } from '@/shared/utils/dashboardNavigation'
import { AdminSection } from '@/shared/components/layout/dashboard/admin'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { renderQuoteHtml as renderQuoteHtmlHcm } from '@/modules/inquiries/components/common/Quote-hcm'
import { renderQuoteHtml as renderQuoteHtmlQn } from '@/modules/inquiries/components/common/Quote-qn'
import { commodityService, type CargoType, type CargoTypeCatalogItem, type Commodity } from '@/modules/gallery/services/commodityService'
import { serviceTypeService } from '@/modules/service-types/services/serviceTypeService'
import { portService, type Port as LogisticsPort } from '@/modules/logistics/services/portService'
import { PdfPreviewDialog } from '@/shared/components/PdfPreviewDialog'
import { delay, EPDA_PREVIEW_LOAD_DELAY_MS } from '@/shared/utils/epdaExport'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { CreateInvoiceQnForm } from '@/features/admin/components/invoice/CreateInvoiceQnForm'
import { CreateInvoiceHcmForm } from '@/features/admin/components/invoice/CreateInvoiceHcmForm'
import type { AgencyFeeModeOption } from '@/features/admin/components/invoice/CreateInvoiceVariantForm'
import {
  buildRequiredFields,
  getMissingRequiredFields,
  getRequiredFieldState,
} from '@/features/admin/components/invoice/invoiceValidation'
import { buildInvoiceQuoteData } from '@/features/admin/components/invoice/buildInvoiceQuoteData'
import { EpdaFormSkeleton, EpdaSectionNav } from '@/features/admin/components/invoice/EpdaFormLayout'
import {
  applyAdminInquiryToForm,
  buildEpdaPatchPayload,
  buildInternalCreatePayload,
  type ShippingAgencyAdminInquiry,
} from '@/features/admin/components/invoice/epda/epdaApiMappers'
import { inquiryService } from '@/modules/inquiries/services/inquiryService'
import { shippingAgencyEpdaService } from '@/modules/inquiries/services/shippingAgencyEpdaService'
import { EpdaCustomerSelect } from '@/features/admin/components/invoice/epda/EpdaCustomerSelect'
import { EpdaInquiryMetaPanel } from '@/features/admin/components/invoice/epda/EpdaInquiryMetaPanel'
import { EpdaCustomerChangeConfirmDialog } from '@/features/admin/components/invoice/epda/EpdaCustomerChangeConfirmDialog'
import {
  applyCustomerBaselineToForm,
  buildCustomerBaselineFromInquiry,
  buildCustomerBaselineFromQuoteInput,
  diffCustomerFields,
  getCustomerModifiedFieldClass,
  getModifiedCustomerFieldSet,
  mapCustomerChangesForApi,
  shouldTrackCustomerFields,
  type EpdaCustomerBaseline,
  type EpdaCustomerFieldChange,
  type EpdaCustomerTrackedField,
} from '@/features/admin/components/invoice/epda/epdaCustomerFieldTracking'
import { EpdaFieldChangeHistory } from '@/features/admin/components/invoice/epda/EpdaFieldChangeHistory'
import { findPortSelectionFromInquiry } from '@/modules/logistics/shippingAgencyPortCatalog'
import {
  readInquiryCargoForEpda,
  type InquiryCargoFields,
} from '@/modules/gallery/shippingAgencyCargoCatalog'
import {
  quoteFormFromArea,
  quoteFormFromStored,
} from '@/features/admin/components/invoice/epda/quoteFormFromArea'
import {
  DEFAULT_GARBAGE_CBM_AMOUNT,
  getDefaultGarbageUsdRate,
} from '@/features/admin/components/invoice/garbageFeeDefaults'
import { cn } from '@/shared/lib/utils'
import { PURPOSE_OF_CALLING_OPTIONS } from '@/modules/inquiries/constants/shippingAgencyInquiryOptions'

type EpdaCargoType = CargoType

const AREA_OPTIONS = ['NORTHERN', 'MIDDLE', 'SOUTHERN'] as const
type AreaOption = typeof AREA_OPTIONS[number]

const PURPOSE_OPTIONS = PURPOSE_OF_CALLING_OPTIONS
type PurposeOption = typeof PURPOSE_OPTIONS[number]['value']

const SHIP_TYPE_OPTIONS = [
  { value: 'BULK_SHIP', label: 'Bulk-ship' },
  { value: 'TANKER_SHIP', label: 'Tanker ship' },
] as const
type ShipTypeOption = typeof SHIP_TYPE_OPTIONS[number]['value']

const FRT_TAX_TYPE_OPTIONS = [
  { value: 'Import', label: 'Import - No freight tax' },
  { value: 'Export - Pls Advise', label: 'Export - Pls Advise' },
  { value: 'Export - Freight rate declaration', label: 'Export - Freight rate declaration' },
] as const
type FrtTaxTypeOption = typeof FRT_TAX_TYPE_OPTIONS[number]['value']

const AGENCY_FEE_MODE_OPTIONS = [
  { value: 'TARRIF_AGENCY', label: 'TARRIF AGENCY' },
  { value: 'AGENCY_IN_LUMPSUM', label: 'AGENCY IN LUMPSUM' },
] as const

const QUARANTINE_CARGO_OPTIONS = [
  { value: 'ONE_LEG', label: 'Chỉ xếp hoặc dở hàng', fee: 100, trips: 1 },
  { value: 'BOTH_LEGS', label: 'Xếp và dở hàng', fee: 200, trips: 2 },
  { value: 'OTHER', label: 'Khác (cấp nước / sửa chữa / crew change ...)', fee: 0, trips: 0 },
] as const
type QuarantineCargoOption = typeof QUARANTINE_CARGO_OPTIONS[number]['value']

const normalizeCargoTypeCode = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, '_')

const isTallyFeeEligibleCargo = (value: string) => {
  const normalized = normalizeCargoTypeCode(value)
  return normalized.includes('IN_BAGS') || normalized.includes('EQUIPMENT')
}

const parseNumeric = (value: string) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const normalizePurpose = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, '_')

const canEnableFreightTaxByPurpose = (purpose: string) => {
  const normalized = normalizePurpose(purpose)
  return normalized === 'NHAP_XUAT' || normalized === 'CHUYEN_CANG_XUAT'
}

const getShipQuarantineTrips = (purpose: string) => {
  const normalized = normalizePurpose(purpose)
  if (normalized === 'NHAP_XUAT') return 2
  if (normalized === 'NHAP_CHUYEN_CANG' || normalized === 'CHUYEN_CANG_XUAT') return 1
  return 0
}

const formatUsdAmount = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const normalizeFrtTaxType = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, '_')

const isExportTotalAmountMode = (value: string) => {
  const normalized = normalizeFrtTaxType(value)
  return normalized === 'EXPORT_FREIGHT_RATE_DECLARATION'
}

const isExportPlsAdviseMode = (value: string) => normalizeFrtTaxType(value) === 'EXPORT_PLS_ADVISE'

const isImportFrtTaxType = (value: string) => normalizeFrtTaxType(value) === 'IMPORT'

export type EpdaScreenFlow = 'create' | 'inquiry-detail'

export interface CreateInvoiceTabProps {
  /** When set, loads inquiry EPDA from API and saves drafts to this record. */
  inquiryId?: number
  /** `create` = Port Charge menu; `inquiry-detail` = opened from shipping agency inquiries. */
  flow?: EpdaScreenFlow
  /** View-only mode (inquiry detail dialog). */
  readOnly?: boolean
  /** Render without AdminSection chrome (inside a dialog). */
  embedded?: boolean
}

export function CreateInvoiceTab({
  inquiryId: inquiryIdProp,
  flow: flowProp,
  readOnly = false,
  embedded = false,
}: CreateInvoiceTabProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const flow: EpdaScreenFlow =
    flowProp ??
    (searchParams.get('section') === 'shipping-agency-inquiry-detail' ? 'inquiry-detail' : 'create')
  const isInquiryDetailFlow = flow === 'inquiry-detail'
  const inquiryIdFromQuery = useMemo(() => {
    const raw = searchParams.get('inquiryId')
    if (!raw) return undefined
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }, [searchParams])

  const resolvedInquiryId = isInquiryDetailFlow
    ? inquiryIdProp ?? inquiryIdFromQuery
    : inquiryIdProp

  const formNavRef = useRef<HTMLDivElement | null>(null)
  const [linkedInquiryId, setLinkedInquiryId] = useState<number | null>(resolvedInquiryId ?? null)
  const [customerUserId, setCustomerUserId] = useState<number | null>(null)
  const [customerLabel, setCustomerLabel] = useState<string | null>(null)
  const [isLoadingInquiry, setIsLoadingInquiry] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [epdaExportName, setEpdaExportName] = useState<string>('EPDA.html')
  const [showPreview, setShowPreview] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [cargoTypeOptions, setCargoTypeOptions] = useState<CargoTypeCatalogItem[]>([])
  const [cargoTypeCatalog, setCargoTypeCatalog] = useState<Commodity[]>([])
  const [isLoadingCargoCatalog, setIsLoadingCargoCatalog] = useState(false)
  const [ports, setPorts] = useState<LogisticsPort[]>([])
  const [isLoadingPorts, setIsLoadingPorts] = useState(false)
  const pendingPortOfCallRef = useRef<string | null>(null)
  
  // Form fields
  const [formCreatedDate, setFormCreatedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedArea, setSelectedArea] = useState<AreaOption | ''>('')
  const [loadedInquiryQuoteForm, setLoadedInquiryQuoteForm] = useState<'HCM' | 'QN' | null>(null)
  const [viewInquiryMeta, setViewInquiryMeta] = useState<ShippingAgencyAdminInquiry | null>(null)
  const [customerBaseline, setCustomerBaseline] = useState<EpdaCustomerBaseline | null>(null)
  const customerBaselineInquiryIdRef = useRef<number | null>(null)
  const [customerChangeDialogOpen, setCustomerChangeDialogOpen] = useState(false)
  const [pendingEpdaAction, setPendingEpdaAction] = useState<'issue' | 'save-draft' | null>(null)
  const [pendingCustomerChanges, setPendingCustomerChanges] = useState<EpdaCustomerFieldChange[]>([])
  const [fieldChangeHistoryKey, setFieldChangeHistoryKey] = useState(0)
  const [pendingInquiryCargo, setPendingInquiryCargo] = useState<InquiryCargoFields | null>(null)
  const [toShipowner, setToShipowner] = useState('')
  const [mv, setMv] = useState('')
  const [dwt, setDwt] = useState('')
  const [grt, setGrt] = useState('')
  const [loa, setLoa] = useState('')
  const [eta, setEta] = useState('')
  const [cargoType, setCargoType] = useState<EpdaCargoType | ''>('')
  const [cargoQty, setCargoQty] = useState('')
  const [cargoName, setCargoName] = useState('')
  const [frtTaxType, setFrtTaxType] = useState<FrtTaxTypeOption | ''>('')
  const [oceanFrtRateUsdPerMt, setOceanFrtRateUsdPerMt] = useState('')
  const [garbageUsdRate, setGarbageUsdRate] = useState(() => getDefaultGarbageUsdRate('HCM'))
  const [garbageCbmAmount, setGarbageCbmAmount] = useState(DEFAULT_GARBAGE_CBM_AMOUNT)
  const [purposeOfCalling, setPurposeOfCalling] = useState<PurposeOption | ''>('')
  const [shipType, setShipType] = useState<ShipTypeOption>('BULK_SHIP')
  const [port, setPort] = useState('')
  const [dischargeLoadingLocation, setDischargeLoadingLocation] = useState('')
  const [berthHours, setBerthHours] = useState('96')
  const [anchorageHours, setAnchorageHours] = useState('24')
  const [pilotageThirdMiles, setPilotageThirdMiles] = useState('17')
  const [qnPilotageMiles, setQnPilotageMiles] = useState('5')
  const [boatHireAmount, setBoatHireAmount] = useState('')
  const [boatHireQuarantineAmount, setBoatHireQuarantineAmount] = useState('')
  const [tallyFeeAmount, setTallyFeeAmount] = useState('')
  const [transportLs, setTransportLs] = useState('')
  const [quarantineCargoMode, setQuarantineCargoMode] = useState<QuarantineCargoOption>('ONE_LEG')
  const [agencyFeeMode, setAgencyFeeMode] = useState<AgencyFeeModeOption>('TARRIF_AGENCY')
  const [agencyDiscountPercent, setAgencyDiscountPercent] = useState('')
  const [agencyLumpsumAmount, setAgencyLumpsumAmount] = useState('')

  const shouldAutoselectTestCustomer =
    process.env.NODE_ENV !== 'production' &&
    !readOnly &&
    !isInquiryDetailFlow &&
    !linkedInquiryId

  useEffect(() => {
    if (!shouldAutoselectTestCustomer) return
    if (customerUserId != null) return
    setCustomerUserId(5)
    setCustomerLabel('tester')
  }, [shouldAutoselectTestCustomer, customerUserId])

  const getRequiredState = (value: string | null | undefined) => getRequiredFieldState(value, showValidationErrors)
  const canEnableFreightTaxDeclaration = useMemo(
    () => canEnableFreightTaxByPurpose(purposeOfCalling),
    [purposeOfCalling]
  )

  const requiredFields = useMemo(
    () =>
      buildRequiredFields({
        toShipowner,
        mv,
        dischargeLoadingLocation,
        dwt,
        grt,
        loa,
        cargoQty,
        cargoType,
        cargoName,
        purposeOfCalling,
        frtTaxType,
      }, { requireFrtTaxType: canEnableFreightTaxDeclaration }),
    [toShipowner, mv, dischargeLoadingLocation, dwt, grt, loa, cargoQty, cargoType, cargoName, purposeOfCalling, frtTaxType]
  )

  const missingRequiredFields = useMemo(
    () => getMissingRequiredFields(requiredFields),
    [requiredFields]
  )

  const shipQuarantineFee = useMemo(() => {
    const grtValue = parseNumeric(grt)
    const trips = getShipQuarantineTrips(purposeOfCalling)
    if (!grtValue || trips <= 0) return 0
    const unitRate = grtValue >= 10000 ? 110 : 95
    return unitRate * trips
  }, [grt, purposeOfCalling])

  const cargoQuarantineFee = useMemo(() => {
    const purposeNormalized = normalizePurpose(purposeOfCalling)
    if (purposeNormalized === 'MUC_DICH_KHAC') return 0

    const cargoQtyValue = parseNumeric(cargoQty)
    if (!cargoQtyValue || cargoQtyValue <= 0) return 0

    const selectedOption = QUARANTINE_CARGO_OPTIONS.find((option) => option.value === quarantineCargoMode)
    return selectedOption?.fee ?? 100
  }, [cargoQty, purposeOfCalling, quarantineCargoMode])

  useEffect(() => {
    const loadCargoTypeCatalog = async () => {
      try {
        setIsLoadingCargoCatalog(true)
        const serviceTypes = await serviceTypeService.getAllServiceTypes()
        const shippingAgency = serviceTypes.find((service) => {
          const normalized = (service.name || '').toUpperCase().replace(/[\s-]+/g, '_')
          return normalized === 'SHIPPING_AGENCY'
        })

        if (!shippingAgency?.id) {
          setCargoTypeOptions([])
          setCargoTypeCatalog([])
          toast.error('Shipping Agency service type not found')
          return
        }

        const [cargoTypes, commodities] = await Promise.all([
          commodityService.getCargoTypesByServiceType(shippingAgency.id),
          commodityService.getCommoditiesByServiceType(shippingAgency.id),
        ])

        setCargoTypeOptions(Array.isArray(cargoTypes) ? cargoTypes : [])
        setCargoTypeCatalog(Array.isArray(commodities) ? commodities : [])
      } catch (error) {
        console.error('Failed to load cargo type catalog for EPDA:', error)
        toast.error('Failed to load cargo names from database')
        setCargoTypeOptions([])
        setCargoTypeCatalog([])
      } finally {
        setIsLoadingCargoCatalog(false)
      }
    }

    void loadCargoTypeCatalog()
  }, [])

  const quoteForm = useMemo<'HCM' | 'QN'>(() => {
    if (selectedArea) return quoteFormFromArea(selectedArea)
    if (loadedInquiryQuoteForm) return loadedInquiryQuoteForm
    return 'HCM'
  }, [selectedArea, loadedInquiryQuoteForm])

  useEffect(() => {
    if (linkedInquiryId) return
    setGarbageUsdRate(getDefaultGarbageUsdRate(quoteForm))
  }, [quoteForm, linkedInquiryId])

  useEffect(() => {
    if (!selectedArea) {
      setPort('')
      setPorts([])
      return
    }

    const restorePort = pendingPortOfCallRef.current
    if (!restorePort) {
      setPort('')
    }

    let cancelled = false
    setIsLoadingPorts(true)
    void portService
      .getPortsByArea(selectedArea)
      .then((portData) => {
        if (!cancelled) {
          const list = Array.isArray(portData) ? portData : []
          setPorts(list)
          if (restorePort) {
            const matched = list.find((item) => item.portOfCall?.trim() === restorePort)
            setPort(matched?.portOfCall ?? restorePort)
            pendingPortOfCallRef.current = null
          }
        }
      })
      .catch((error) => {
        console.error('Failed to load ports for area:', error)
        if (!cancelled) {
          toast.error('Failed to load port list by area')
          setPorts([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingPorts(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedArea])

  const portsByArea = useMemo(() => {
    if (!selectedArea) return []

    const areaPorts = ports
      .filter((item) => item.portOfCall?.trim())
      .sort((a, b) => (a.portOfCall || '').localeCompare(b.portOfCall || ''))

    const seen = new Set<string>()
    return areaPorts.filter((item) => {
      const value = item.portOfCall as string
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  }, [ports, selectedArea])

  const filteredCargoNames = useMemo(() => {
    if (!cargoType) return []
    const base = cargoTypeCatalog.filter((item) => item.cargoType === cargoType)
    if (cargoName && !base.some((item) => item.name === cargoName)) {
      return [
        {
          id: 0,
          name: cargoName,
          displayName: cargoName,
          serviceTypeId: 0,
          requiredImageCount: 0,
          cargoType,
          isActive: true,
        },
        ...base,
      ]
    }
    return base
  }, [cargoType, cargoTypeCatalog, cargoName])

  useEffect(() => {
    if (!pendingInquiryCargo) return
    if (isLoadingCargoCatalog || cargoTypeCatalog.length === 0) return

    const { cargoType: mappedType, cargoName: mappedName } = readInquiryCargoForEpda(
      pendingInquiryCargo,
      cargoTypeCatalog,
    )
    if (mappedType) setCargoType(mappedType as EpdaCargoType)
    if (mappedName) setCargoName(mappedName)
    setPendingInquiryCargo(null)
  }, [pendingInquiryCargo, cargoTypeCatalog, isLoadingCargoCatalog])

  useEffect(() => {
    if (isLoadingCargoCatalog || pendingInquiryCargo) return
    if (!cargoType) {
      setCargoName('')
      return
    }

    const stillValid = filteredCargoNames.some((item) => item.name === cargoName)
    if (!stillValid && cargoName) return
    if (!stillValid) {
      setCargoName('')
    }
  }, [cargoType, cargoName, filteredCargoNames, isLoadingCargoCatalog, pendingInquiryCargo])

  useEffect(() => {
    if (!cargoType || !isTallyFeeEligibleCargo(cargoType)) {
      setTallyFeeAmount('')
    }
  }, [cargoType])

  useEffect(() => {
    if (dischargeLoadingLocation !== 'Anchorage') {
      setBoatHireAmount('')
    }
  }, [dischargeLoadingLocation])

  useEffect(() => {
    if (agencyFeeMode === 'AGENCY_IN_LUMPSUM') {
      setTransportLs('')
      setBoatHireAmount('')
      return
    }

    setAgencyLumpsumAmount('')
  }, [agencyFeeMode])

  useEffect(() => {
    if (isLoadingCargoCatalog || pendingInquiryCargo) return
    if (!cargoType) return
    const stillValid = cargoTypeOptions.some((item) => item.code === cargoType)
    if (!stillValid) {
      setCargoType('')
    }
  }, [cargoType, cargoTypeOptions, isLoadingCargoCatalog, pendingInquiryCargo])

  useEffect(() => {
    if (!canEnableFreightTaxDeclaration) {
      setFrtTaxType('')
      setOceanFrtRateUsdPerMt('')
    }
  }, [canEnableFreightTaxDeclaration])

  useEffect(() => {
    if (!frtTaxType) {
      setOceanFrtRateUsdPerMt('')
      return
    }

    if (isImportFrtTaxType(frtTaxType)) {
      setOceanFrtRateUsdPerMt('')
      return
    }

    if (isExportPlsAdviseMode(frtTaxType)) {
      setOceanFrtRateUsdPerMt('')
    }
  }, [frtTaxType])

  const isFormBusy =
    isLoading || isLoadingCargoCatalog || isLoadingPorts || isSavingDraft || isIssuing || isLoadingInquiry

  const buildQuoteParamsInput = () => ({
    quoteForm,
    formCreatedDate,
    toShipowner,
    mv,
    dwt,
    grt,
    loa,
    eta,
    cargoQty,
    cargoName,
    cargoType,
    cargoTypeOptions,
    filteredCargoNames,
    shipType,
    port,
    frtTaxType,
    shouldIncludeOceanFrtRate: isExportTotalAmountMode(frtTaxType),
    oceanFrtRateUsdPerMt,
    garbageUsdRate: garbageUsdRate || getDefaultGarbageUsdRate(quoteForm),
    garbageCbmAmount: garbageCbmAmount || DEFAULT_GARBAGE_CBM_AMOUNT,
    purposeOfCalling,
    dischargeLoadingLocation,
    transportLs,
    boatHireQuarantineAmount,
    quarantineCargoMode,
    quarantineCargoOptions: QUARANTINE_CARGO_OPTIONS,
    boatHireAmount,
    agencyFeeMode,
    agencyDiscountPercent,
    agencyLumpsumAmount,
    isTallyFeeEligible: Boolean(cargoType && isTallyFeeEligibleCargo(cargoType)),
    tallyFeeAmount,
    berthHours,
    buoyDueHours: quoteForm === 'HCM' && dischargeLoadingLocation === 'Anchorage' ? berthHours : '',
    anchorageHours,
    qnPilotageMiles,
    pilotageThirdMiles,
  })

  const buildQuoteParams = () => buildInvoiceQuoteData(buildQuoteParamsInput())

  const tracksCustomerFields = shouldTrackCustomerFields(viewInquiryMeta?.createdSource)
  const showSaveDraftButton = !readOnly

  const customerFieldChanges = useMemo(() => {
    if (!customerBaseline || !tracksCustomerFields) return []
    return diffCustomerFields(
      customerBaseline,
      buildCustomerBaselineFromQuoteInput(buildQuoteParamsInput()),
    )
  }, [
    customerBaseline,
    tracksCustomerFields,
    toShipowner,
    mv,
    dwt,
    grt,
    loa,
    eta,
    cargoQty,
    cargoName,
    cargoType,
    port,
    dischargeLoadingLocation,
    frtTaxType,
    purposeOfCalling,
  ])

  const modifiedCustomerFields = useMemo(
    () => getModifiedCustomerFieldSet(customerFieldChanges),
    [customerFieldChanges],
  )

  const getCustomerFieldClass = (field: EpdaCustomerTrackedField) =>
    getCustomerModifiedFieldClass(field, modifiedCustomerFields)

  useEffect(() => {
    setLinkedInquiryId(resolvedInquiryId ?? null)
  }, [resolvedInquiryId])

  useEffect(() => {
    if (!linkedInquiryId) return

    let cancelled = false
    const load = async () => {
      setIsLoadingInquiry(true)
      try {
        const inquiry = await inquiryService.getShippingAgencyDetail<ShippingAgencyAdminInquiry>(
          linkedInquiryId,
        )
        if (cancelled) return
        setViewInquiryMeta(inquiry)
        if (shouldTrackCustomerFields(inquiry.createdSource)) {
          if (customerBaselineInquiryIdRef.current !== linkedInquiryId) {
            customerBaselineInquiryIdRef.current = linkedInquiryId
            setCustomerBaseline(buildCustomerBaselineFromInquiry(inquiry))
          }
        } else {
          customerBaselineInquiryIdRef.current = null
          setCustomerBaseline(null)
        }
        setLoadedInquiryQuoteForm(quoteFormFromStored(inquiry.quoteForm))
        setPendingInquiryCargo({
          cargoType: inquiry.cargoType,
          cargoName: inquiry.cargoName,
          cargoNameOther: inquiry.cargoNameOther,
        })
        applyAdminInquiryToForm(inquiry, {
          setFormCreatedDate,
          setToShipowner,
          setMv,
          setDwt,
          setGrt,
          setLoa,
          setEta,
          setCargoQty,
          setFrtTaxType: (v) => setFrtTaxType(v as FrtTaxTypeOption),
          setPort,
          setDischargeLoadingLocation,
          setPurposeOfCalling: (v) => setPurposeOfCalling(v as PurposeOption),
          setBerthHours,
          setAnchorageHours,
          setPilotageThirdMiles,
          setQnPilotageMiles,
          setShipType: (v) => setShipType(v as ShipTypeOption),
          setOceanFrtRateUsdPerMt,
          setGarbageUsdRate,
          setGarbageCbmAmount,
          setQuarantineCargoMode: (v) => setQuarantineCargoMode(v as QuarantineCargoOption),
          setAgencyFeeMode: (v) => setAgencyFeeMode(v as AgencyFeeModeOption),
          setAgencyDiscountPercent,
          setAgencyLumpsumAmount,
          setBoatHireAmount,
          setBoatHireQuarantineAmount,
          setTallyFeeAmount,
          setTransportLs,
        })
        if (inquiry.portOfCall?.trim()) {
          const selection = await findPortSelectionFromInquiry(inquiry.portOfCall)
          if (cancelled) return
          pendingPortOfCallRef.current = selection.portOfCall
          if (selection.area) {
            setSelectedArea(selection.area)
            setPorts(selection.ports)
          } else {
            setPort(selection.portOfCall)
            pendingPortOfCallRef.current = null
          }
        }
        if (inquiry.userId) {
          setCustomerUserId(inquiry.userId)
          const label =
            inquiry.fullName?.trim() ||
            inquiry.toName?.trim() ||
            (inquiry.company ? `${inquiry.toName ?? inquiry.fullName ?? 'Customer'} — ${inquiry.company}` : null)
          setCustomerLabel(label)
        }
      } catch (err) {
        console.error('Failed to load inquiry for EPDA:', err)
        toast.error('Could not load inquiry EPDA data')
      } finally {
        if (!cancelled) setIsLoadingInquiry(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [linkedInquiryId])

  const handleSaveDraft = async () => {
    setShowValidationErrors(true)
    if (missingRequiredFields.length > 0) {
      toast.error('Complete required fields before saving the EPDA draft.')
      return
    }

    const changes = customerFieldChanges
    if (changes.length > 0) {
      setPendingCustomerChanges(changes)
      setPendingEpdaAction('save-draft')
      setCustomerChangeDialogOpen(true)
      return
    }

    await executeSaveDraft()
  }

  const executeSaveDraft = async (confirmedChanges: EpdaCustomerFieldChange[] = []) => {
    setIsSavingDraft(true)
    try {
      const input = buildQuoteParamsInput()
      const patchBody = buildEpdaPatchPayload(input)
      patchBody.epdaSnapshot = buildInvoiceQuoteData(input) as unknown as Record<string, unknown>
      if (confirmedChanges.length > 0) {
        patchBody.confirmedCustomerFieldChanges = mapCustomerChangesForApi(confirmedChanges)
      }

      if (linkedInquiryId) {
        await shippingAgencyEpdaService.updateEpda(linkedInquiryId, patchBody)
        toast.success('EPDA draft saved')
        setFieldChangeHistoryKey((key) => key + 1)
        return
      }

      if (!customerUserId || customerUserId < 1) {
        toast.error('Select or create a customer before saving the EPDA draft.')
        return
      }

      const created = await shippingAgencyEpdaService.createInternalInquiry(
        buildInternalCreatePayload(customerUserId, input),
      )
      setLinkedInquiryId(created.id)
      toast.success(`Inquiry #${created.id} created with EPDA draft`)
    } catch (err) {
      console.error('Failed to save EPDA draft:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save EPDA draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleIssueToCustomer = async () => {
    if (!linkedInquiryId) {
      toast.error('Save a draft or link an inquiry before issuing to the customer.')
      return
    }

    setShowValidationErrors(true)
    if (missingRequiredFields.length > 0) {
      toast.error('Complete required fields before issuing the EPDA.')
      return
    }

    const changes = customerFieldChanges
    if (changes.length > 0) {
      setPendingCustomerChanges(changes)
      setPendingEpdaAction('issue')
      setCustomerChangeDialogOpen(true)
      return
    }

    await executeIssueToCustomer()
  }

  const executeIssueToCustomer = async (confirmedChanges: EpdaCustomerFieldChange[] = []) => {
    if (!linkedInquiryId) return

    setIsIssuing(true)
    try {
      const input = buildQuoteParamsInput()
      const snapshot = buildInvoiceQuoteData(input) as unknown as Record<string, unknown>
      const patchBody = buildEpdaPatchPayload(input)
      if (confirmedChanges.length > 0) {
        patchBody.confirmedCustomerFieldChanges = mapCustomerChangesForApi(confirmedChanges)
      }
      await shippingAgencyEpdaService.updateEpda(linkedInquiryId, patchBody)
      await shippingAgencyEpdaService.issueEpda(linkedInquiryId, snapshot, {
        confirmedCustomerFieldChanges:
          confirmedChanges.length > 0 ? mapCustomerChangesForApi(confirmedChanges) : undefined,
      })
      toast.success('EPDA issued — customer can access the quote')
      setFieldChangeHistoryKey((key) => key + 1)
    } catch (err) {
      console.error('Failed to issue EPDA:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to issue EPDA')
    } finally {
      setIsIssuing(false)
    }
  }

  const revertCustomerFieldValues = () => {
    if (!customerBaseline) return
    applyCustomerBaselineToForm(customerBaseline, {
      setToShipowner,
      setMv,
      setDwt,
      setGrt,
      setLoa,
      setEta,
      setCargoQty,
      setCargoType: (value) => setCargoType(value as EpdaCargoType),
      setCargoName,
      setPort,
      setDischargeLoadingLocation,
      setFrtTaxType: (value) => setFrtTaxType(value as FrtTaxTypeOption),
      setPurposeOfCalling: (value) => setPurposeOfCalling(value as PurposeOption),
    })
    if (customerBaseline.cargoType || customerBaseline.cargoName) {
      setPendingInquiryCargo({
        cargoType: customerBaseline.cargoType || null,
        cargoName: customerBaseline.cargoName || null,
        cargoNameOther: null,
      })
    }
    toast.info('Reverted to customer-submitted values')
  }

  const handleConfirmCustomerChanges = async () => {
    const changes = pendingCustomerChanges
    setCustomerChangeDialogOpen(false)
    const action = pendingEpdaAction
    setPendingEpdaAction(null)
    setPendingCustomerChanges([])
    if (action === 'issue') {
      await executeIssueToCustomer(changes)
    } else if (action === 'save-draft') {
      await executeSaveDraft(changes)
    }
  }

  const handleRevertCustomerChanges = () => {
    setCustomerChangeDialogOpen(false)
    setPendingEpdaAction(null)
    setPendingCustomerChanges([])
    revertCustomerFieldValues()
  }

  const handlePreview = async () => {
    setShowValidationErrors(true)
    if (missingRequiredFields.length > 0) {
      toast.error('Complete all required fields before previewing the EPDA.')
      return
    }

    setIsLoading(true)
    setIsPdfGenerating(true)
    setPreviewHtml(null)
    setShowPreview(true)

    try {
      const res = await fetch('/templates/quote.html')
      if (!res.ok) throw new Error('Template not found')
      const template = await res.text()

      const quoteData = buildQuoteParams()
      const renderer = quoteForm === 'QN' ? renderQuoteHtmlQn : renderQuoteHtmlHcm
      const html = renderer(template, quoteData)

      const filename = linkedInquiryId
        ? `EPDA_inquiry_${linkedInquiryId}.html`
        : `EPDA_${quoteForm}_${new Date().toISOString().slice(0, 10)}.html`

      setEpdaExportName(filename)

      await delay(EPDA_PREVIEW_LOAD_DELAY_MS)
      setPreviewHtml(html)
    } catch (err) {
      console.error('Failed to generate preview:', err)
      toast.error('Failed to generate invoice preview')
      setShowPreview(false)
    } finally {
      setIsPdfGenerating(false)
      setIsLoading(false)
    }
  }

  const handlePreviewOpenChange = (open: boolean) => {
    setShowPreview(open)
    if (!open) {
      setPreviewHtml(null)
      setIsPdfGenerating(false)
    }
  }

  const handleReset = () => {
    setShowValidationErrors(false)
    setSelectedArea('')
    setLoadedInquiryQuoteForm(null)
    setViewInquiryMeta(null)
    setPendingInquiryCargo(null)
    setFormCreatedDate(new Date().toISOString().split('T')[0])
    setToShipowner('')
    setMv('')
    setDwt('')
    setGrt('')
    setLoa('')
    setEta('')
    setCargoType('')
    setCargoQty('')
    setCargoName('')
    setFrtTaxType('')
    setOceanFrtRateUsdPerMt('')
    setGarbageUsdRate(getDefaultGarbageUsdRate(quoteForm))
    setGarbageCbmAmount(DEFAULT_GARBAGE_CBM_AMOUNT)
    setPurposeOfCalling('')
    setShipType('BULK_SHIP')
    setPort('')
    setDischargeLoadingLocation('')
    setBerthHours('96')
    setAnchorageHours('24')
    setPilotageThirdMiles('17')
    setQnPilotageMiles('5')
    setBoatHireAmount('')
    setBoatHireQuarantineAmount('')
    setTallyFeeAmount('')
    setTransportLs('')
    setQuarantineCargoMode('ONE_LEG')
    setAgencyFeeMode('TARRIF_AGENCY')
    setAgencyDiscountPercent('')
    setAgencyLumpsumAmount('')
    setPreviewHtml(null)
    setShowPreview(false)
    setLinkedInquiryId(resolvedInquiryId ?? null)
    setCustomerUserId(null)
    setCustomerLabel(null)
  }

  const handleFormEnterNavigation = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return

    const target = event.target as HTMLElement | null
    if (!(target instanceof HTMLInputElement) || target.disabled || target.readOnly) return

    const container = formNavRef.current
    if (!container) return

    const focusableFields = Array.from(
      container.querySelectorAll<HTMLElement>(
        "input:not([type='hidden']):not([disabled]):not([readonly]), button#eta:not([disabled]), button[role='combobox']:not([disabled])"
      )
    )

    const currentIndex = focusableFields.indexOf(target)
    if (currentIndex < 0) return

    const nextField = focusableFields[currentIndex + 1]
    if (!nextField) return

    event.preventDefault()
    nextField.focus()
  }

  const formValues = {
    toShipowner,
    eta,
    mv,
    dischargeLoadingLocation,
    dwt,
    grt,
    loa,
    cargoQty,
    cargoType,
    cargoName,
    shipType,
    berthHours,
    anchorageHours,
    qnPilotageMiles,
    pilotageThirdMiles,
    garbageUsdRate: garbageUsdRate || getDefaultGarbageUsdRate(quoteForm),
    garbageCbmAmount: garbageCbmAmount || DEFAULT_GARBAGE_CBM_AMOUNT,
    purposeOfCalling,
    quarantineCargoMode,
    frtTaxType,
    tallyFeeAmount,
    oceanFrtRateUsdPerMt,
    transportLs,
    boatHireAmount,
    boatHireQuarantineAmount,
    agencyFeeMode,
    agencyDiscountPercent,
    agencyLumpsumAmount,
  }

  const formHandlers = {
    setToShipowner,
    setEta,
    setMv,
    setDischargeLoadingLocation,
    setDwt,
    setGrt,
    setLoa,
    setCargoQty,
    setCargoType: (value: CargoType) => setCargoType(value as EpdaCargoType),
    setCargoName,
    setShipType: (value: 'BULK_SHIP' | 'TANKER_SHIP') => setShipType(value),
    setBerthHours,
    setAnchorageHours,
    setQnPilotageMiles,
    setPilotageThirdMiles,
    setGarbageUsdRate,
    setGarbageCbmAmount,
    setPurposeOfCalling: (value: PurposeOption) => setPurposeOfCalling(value),
    setQuarantineCargoMode: (value: QuarantineCargoOption) => setQuarantineCargoMode(value),
    setFrtTaxType: (value: FrtTaxTypeOption) => setFrtTaxType(value),
    setTallyFeeAmount,
    setOceanFrtRateUsdPerMt,
    setTransportLs,
    setBoatHireAmount,
    setBoatHireQuarantineAmount,
    setAgencyFeeMode: (value: AgencyFeeModeOption) => setAgencyFeeMode(value),
    setAgencyDiscountPercent,
    setAgencyLumpsumAmount,
  }

  const formOptions = {
    cargoTypeOptions,
    filteredCargoNames,
    shipTypeOptions: SHIP_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    purposeOptions: PURPOSE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    quarantineCargoOptions: QUARANTINE_CARGO_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    frtTaxTypeOptions: FRT_TAX_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    agencyFeeModeOptions: AGENCY_FEE_MODE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
  }

  const formComputed = {
    isLoadingCargoCatalog,
    isTallyFeeEligibleCargo: Boolean(cargoType && isTallyFeeEligibleCargo(cargoType)),
    shipQuarantineFee: formatUsdAmount(shipQuarantineFee),
    cargoQuarantineFee: formatUsdAmount(cargoQuarantineFee),
    isImportFrtTaxType: isImportFrtTaxType(frtTaxType),
    isExportPlsAdviseMode: isExportPlsAdviseMode(frtTaxType),
    canEnableFreightTaxDeclaration,
    isOceanFreightInputDisabled: !canEnableFreightTaxDeclaration || isExportPlsAdviseMode(frtTaxType) || isImportFrtTaxType(frtTaxType),
    frtHint: !canEnableFreightTaxDeclaration
      ? 'N/A'
      : isImportFrtTaxType(frtTaxType)
      ? '0'
      : isExportPlsAdviseMode(frtTaxType)
        ? 'pls advise'
        : `Frt USD${oceanFrtRateUsdPerMt || '16'}/mt x abt ${cargoQty || '0'}mts x 2%`,
  }

  const editorActions = (
    <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:items-center md:justify-end">
      <Button
        variant="outline"
        onClick={handleReset}
        disabled={isFormBusy}
        className="h-10 active:scale-[0.98] sm:h-9"
      >
        <span className="hidden sm:inline">Reset form</span>
        <span className="sm:hidden">Reset</span>
      </Button>
      {showSaveDraftButton ? (
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isFormBusy}
          className="h-10 gap-2 active:scale-[0.98] sm:h-9"
        >
          {isSavingDraft ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Save draft</span>
          <span className="sm:hidden">Save</span>
        </Button>
      ) : null}
      <Button
        variant="secondary"
        onClick={handleIssueToCustomer}
        disabled={isFormBusy || !linkedInquiryId}
        className="h-10 gap-2 active:scale-[0.98] sm:h-9"
      >
        {isIssuing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4 shrink-0" />
        )}
        <span className="hidden sm:inline">Issue to customer</span>
        <span className="sm:hidden">Issue</span>
      </Button>
      <Button
        onClick={handlePreview}
        disabled={isFormBusy}
        className="col-span-2 h-10 gap-2 active:scale-[0.98] md:col-span-1 md:h-9"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Generating...</span>
            <span className="sm:hidden">Loading...</span>
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Preview EPDA
          </>
        )}
      </Button>
    </div>
  )

  const backToInquiries = isInquiryDetailFlow ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 mb-2 h-auto min-h-9 max-w-full gap-2 whitespace-normal py-2 text-left text-muted-foreground hover:text-foreground sm:whitespace-nowrap"
      onClick={() => router.push(buildDashboardUrl(pathname, 'shipping-agency-inquiries'))}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Back to Shipping Agency Inquiries</span>
      <span className="sm:hidden">Back to inquiries</span>
    </Button>
  ) : null

  const epdaWorksheet = (
    <div className="min-h-0">
      <div className="min-w-0 space-y-6">
        {backToInquiries}
        <div
          className={cn(
            'space-y-4',
            !embedded &&
              'sticky top-0 z-10 -mx-1 border-b border-border/60 bg-background/95 px-1 pb-4 pt-1 backdrop-blur-md supports-[backdrop-filter]:bg-background/80',
          )}
        >
          {customerFieldChanges.length > 0 ? (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-50/50 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
              {customerFieldChanges.length} customer field{customerFieldChanges.length === 1 ? '' : 's'} modified
              (highlighted in green). Confirm changes when issuing the EPDA.
            </p>
          ) : null}

          {isLoadingInquiry ? (
            <p className="text-xs text-muted-foreground">Loading inquiry EPDA...</p>
          ) : null}

          {viewInquiryMeta && linkedInquiryId ? (
            <EpdaInquiryMetaPanel inquiry={viewInquiryMeta} />
          ) : null}

          {linkedInquiryId && tracksCustomerFields ? (
            <EpdaFieldChangeHistory inquiryId={linkedInquiryId} refreshKey={fieldChangeHistoryKey} />
          ) : null}

          {!readOnly && !linkedInquiryId ? (
            <div className="sm:max-w-md">
              <EpdaCustomerSelect
                value={customerUserId}
                selectedLabel={customerLabel}
                suggestName={toShipowner}
                onChange={(id, option) => {
                  setCustomerUserId(id)
                  setCustomerLabel(option?.label ?? null)
                }}
              />
            </div>
          ) : null}

          {!readOnly && linkedInquiryId ? (
            <Badge variant="outline" className="w-fit font-mono text-xs">
              Inquiry #{linkedInquiryId}
            </Badge>
          ) : null}

          {readOnly ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Port area</Label>
                <p className="text-sm font-medium">{selectedArea || '—'}</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Port of call</Label>
                <p className="text-sm font-medium">{port || '—'}</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Document date</Label>
                <p className="text-sm font-medium">{formCreatedDate || '—'}</p>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">EPDA template</Label>
                <p className="text-sm font-medium">
                  {quoteForm === 'QN' ? 'Quy Nhon (QN)' : 'Ho Chi Minh (HCM)'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="portArea">Port area</Label>
                <Select value={selectedArea} onValueChange={(value) => setSelectedArea(value as AreaOption)}>
                  <SelectTrigger id="portArea">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREA_OPTIONS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="portOfCallSelect"
                  className={getCustomerFieldClass('port') ? 'text-emerald-700 dark:text-emerald-400' : undefined}
                >
                  Port of call
                </Label>
                <Select value={port} onValueChange={setPort} disabled={!selectedArea || isLoadingPorts}>
                  <SelectTrigger id="portOfCallSelect" className={getCustomerFieldClass('port')}>
                    <SelectValue
                      placeholder={
                        !selectedArea
                          ? 'Select area first'
                          : isLoadingPorts
                            ? 'Loading ports...'
                            : 'Select port of call'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {portsByArea.map((item) => (
                      <SelectItem key={item.id} value={item.portOfCall as string}>
                        {item.portOfCall}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="formCreatedDate">Document date</Label>
                <DatePicker
                  id="formCreatedDate"
                  value={formCreatedDate}
                  onChange={setFormCreatedDate}
                  placeholder="Select date"
                />
              </div>
            </div>
          )}

          {readOnly ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={isFormBusy}
                className="gap-2 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Preview EPDA
              </Button>
            </div>
          ) : null}
        </div>

        <EpdaSectionNav />

        <div
          ref={formNavRef}
          onKeyDownCapture={readOnly ? undefined : handleFormEnterNavigation}
          className={cn(
            'space-y-2 pb-6 [&_input]:font-medium [&_[role=combobox]]:font-medium',
            readOnly && 'pointer-events-none select-text opacity-95',
          )}
        >
              {isLoadingCargoCatalog && !cargoTypeOptions.length ? (
                <EpdaFormSkeleton rows={4} />
              ) : null}

              {quoteForm === 'QN' ? (
                <CreateInvoiceQnForm
                  values={formValues}
                  handlers={formHandlers}
                  options={formOptions}
                  computed={formComputed}
                  getRequiredState={getRequiredState}
                  getCustomerFieldClass={tracksCustomerFields ? getCustomerFieldClass : undefined}
                />
              ) : (
                <CreateInvoiceHcmForm
                  values={formValues}
                  handlers={formHandlers}
                  options={formOptions}
                  computed={formComputed}
                  getRequiredState={getRequiredState}
                  getCustomerFieldClass={tracksCustomerFields ? getCustomerFieldClass : undefined}
                />
              )}
            </div>

        {!readOnly && showValidationErrors && missingRequiredFields.length > 0 ? (
          <p className="text-sm text-destructive" role="alert">
            Required fields: {missingRequiredFields.map((field) => field.label).join(', ')}
          </p>
        ) : null}
      </div>
    </div>
  )

  const pdfPreview = (
    <PdfPreviewDialog
      open={showPreview}
      onOpenChange={handlePreviewOpenChange}
      html={previewHtml}
      fileName={epdaExportName}
      isGenerating={isPdfGenerating}
    />
  )

  if (embedded) {
    return (
      <>
        {epdaWorksheet}
        {pdfPreview}
      </>
    )
  }

  return (
    <>
      <AdminSection
        description={
          isInquiryDetailFlow && linkedInquiryId ? (
            <>
              <span className="md:hidden">
                Inquiry #{linkedInquiryId} — review customer details and complete EPDA.
              </span>
              <span className="hidden md:inline">
                {`Shipping agency inquiry #${linkedInquiryId} — review customer details and complete EPDA (save draft, preview, issue).`}
              </span>
            </>
          ) : linkedInquiryId ? (
            <>
              <span className="md:hidden">
                Edit EPDA for inquiry #{linkedInquiryId}. Save, preview, then issue.
              </span>
              <span className="hidden md:inline">
                {`Edit EPDA for shipping agency inquiry #${linkedInquiryId}. Save draft, preview, then issue to customer.`}
              </span>
            </>
          ) : (
            'Select a customer, complete EPDA fields, save draft, then issue to customer.'
          )
        }
        actions={editorActions}
      >
        {epdaWorksheet}
      </AdminSection>
      {pdfPreview}
      <EpdaCustomerChangeConfirmDialog
        open={customerChangeDialogOpen}
        onOpenChange={setCustomerChangeDialogOpen}
        changes={pendingCustomerChanges}
        actionLabel={pendingEpdaAction === 'issue' ? 'issue to customer' : 'save draft'}
        onConfirm={() => void handleConfirmCustomerChanges()}
        onRevert={handleRevertCustomerChanges}
      />
    </>
  )
}

