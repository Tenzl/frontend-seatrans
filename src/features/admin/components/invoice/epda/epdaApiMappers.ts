import type { BuildInvoiceQuoteDataParams } from '@/features/admin/components/invoice/buildInvoiceQuoteData'
import { quoteFormFromStored } from '@/features/admin/components/invoice/epda/quoteFormFromArea'

/** Admin inquiry row from GET /admin/inquiries/shipping-agency/:id */
export type ShippingAgencyAdminInquiry = {
  id: number
  userId?: number
  fullName?: string | null
  email?: string | null
  phone?: string | null
  company?: string | null
  notes?: string | null
  status?: string
  submittedAt?: string
  createdSource?: string | null
  toName?: string | null
  mv?: string | null
  eta?: string | null
  dwt?: string | number | null
  grt?: string | number | null
  loa?: string | number | null
  cargoType?: string | null
  cargoName?: string | null
  cargoNameOther?: string | null
  cargoQuantity?: string | number | null
  portOfCall?: string | null
  dischargeLoadingLocation?: string | null
  frtTaxType?: string | null
  purposeOfCalling?: string | null
  boatHireAmount?: string | number | null
  tallyFeeAmount?: string | number | null
  transportLs?: string | null
  transportQuarantine?: string | null
  quoteForm?: string | null
  berthHours?: string | number | null
  anchorageHours?: string | number | null
  pilotage3rdMiles?: string | number | null
  epdaDocumentDate?: string | null
  shipType?: string | null
  oceanFrtRateUsdPerMt?: string | number | null
  garbageCbmAmount?: string | number | null
  quarantineCargoMode?: string | null
  agencyFeeMode?: string | null
  agencyDiscountPercent?: string | number | null
  agencyLumpsumAmount?: string | number | null
  epdaSnapshot?: Record<string, unknown> | null
}

export type EpdaApiPayload = Record<string, unknown>

const toNum = (value: string | number | null | undefined): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : undefined
}

const toStr = (value: string | number | null | undefined): string | undefined => {
  if (value === null || value === undefined) return undefined
  const s = String(value).trim()
  return s.length > 0 ? s : undefined
}

export function mapAgencyFeeModeToApi(mode: string): string {
  if (mode === 'AGENCY_IN_LUMPSUM') return 'LUMPSUM'
  return mode
}

export function mapAgencyFeeModeFromApi(mode?: string | null): string {
  if (!mode) return 'TARRIF_AGENCY'
  if (mode === 'LUMPSUM') return 'AGENCY_IN_LUMPSUM'
  return mode
}

export function mapQuarantineModeToApi(mode: string): string {
  if (mode === 'BOTH_LEGS') return 'TWO_LEG'
  if (mode === 'OTHER') return 'THREE_LEG'
  return mode
}

export function mapQuarantineModeFromApi(mode?: string | null): string {
  if (!mode) return 'ONE_LEG'
  if (mode === 'TWO_LEG') return 'BOTH_LEGS'
  if (mode === 'THREE_LEG') return 'OTHER'
  return mode
}

export function buildEpdaPatchPayload(
  params: BuildInvoiceQuoteDataParams & {
    boatHireQuarantineAmount: string
    transportQuarantine?: string
  },
): EpdaApiPayload {
  const payload: EpdaApiPayload = {
    shipownerTo: params.toShipowner,
    vesselName: params.mv,
    dwt: toNum(params.dwt),
    grt: toNum(params.grt),
    loa: toNum(params.loa),
    eta: params.eta || undefined,
    cargoType: params.cargoType || undefined,
    cargoName: params.cargoName || undefined,
    quantityTons: toNum(params.cargoQty),
    frtTaxType: params.frtTaxType || undefined,
    purposeOfCalling: params.purposeOfCalling || undefined,
    portOfCall: params.port,
    dischargeLoadingLocation: params.dischargeLoadingLocation,
    quoteForm: params.quoteForm,
    berthHours: toNum(params.berthHours),
    anchorageHours: toNum(params.anchorageHours),
    pilotage3rdMiles:
      params.quoteForm === 'QN'
        ? toNum(params.qnPilotageMiles)
        : toNum(params.pilotageThirdMiles),
    epdaDocumentDate: params.formCreatedDate,
    shipType: params.shipType,
    oceanFrtRateUsdPerMt: toNum(params.oceanFrtRateUsdPerMt),
    garbageCbmAmount: toNum(params.garbageCbmAmount),
    quarantineCargoMode: mapQuarantineModeToApi(params.quarantineCargoMode),
    agencyFeeMode: mapAgencyFeeModeToApi(params.agencyFeeMode),
    agencyDiscountPercent: toNum(params.agencyDiscountPercent),
    agencyLumpsumAmount: toNum(params.agencyLumpsumAmount),
    boatHireAmount: toNum(params.boatHireAmount),
    tallyFeeAmount: toNum(params.tallyFeeAmount),
    transportLs: params.transportLs || undefined,
    transportQuarantine:
      params.transportQuarantine ?? params.boatHireQuarantineAmount ?? undefined,
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined && v !== ''),
  )
}

export function buildInternalCreatePayload(
  customerUserId: number,
  params: BuildInvoiceQuoteDataParams & {
    boatHireQuarantineAmount: string
  },
  notes?: string,
): EpdaApiPayload {
  return {
    customerUserId,
    notes,
    shipownerTo: params.toShipowner,
    vesselName: params.mv,
    dwt: toNum(params.dwt),
    grt: toNum(params.grt),
    loa: toNum(params.loa),
    eta: params.eta || undefined,
    cargoType: params.cargoType || undefined,
    cargoName: params.cargoName || undefined,
    frtTaxType: params.frtTaxType || undefined,
    purposeOfCalling: params.purposeOfCalling || undefined,
    portOfCall: params.port,
    dischargeLoadingLocation: params.dischargeLoadingLocation,
    quoteForm: params.quoteForm,
    epdaDocumentDate: params.formCreatedDate,
    shipType: params.shipType,
    berthHours: toNum(params.berthHours) ?? 96,
    anchorageHours: toNum(params.anchorageHours) ?? 24,
    pilotage3rdMiles:
      params.quoteForm === 'QN'
        ? toNum(params.qnPilotageMiles) ?? 5
        : toNum(params.pilotageThirdMiles) ?? 17,
    oceanFrtRateUsdPerMt: toNum(params.oceanFrtRateUsdPerMt),
    garbageCbmAmount: toNum(params.garbageCbmAmount) ?? 1,
    quarantineCargoMode: mapQuarantineModeToApi(params.quarantineCargoMode),
    agencyFeeMode: mapAgencyFeeModeToApi(params.agencyFeeMode),
    agencyDiscountPercent: toNum(params.agencyDiscountPercent),
    agencyLumpsumAmount: toNum(params.agencyLumpsumAmount),
  }
}

export function applyAdminInquiryToForm(
  inquiry: ShippingAgencyAdminInquiry,
  setters: {
    setFormCreatedDate: (v: string) => void
    setToShipowner: (v: string) => void
    setMv: (v: string) => void
    setDwt: (v: string) => void
    setGrt: (v: string) => void
    setLoa: (v: string) => void
    setEta: (v: string) => void
    setCargoQty: (v: string) => void
    setFrtTaxType: (v: string) => void
    setPort: (v: string) => void
    setDischargeLoadingLocation: (v: string) => void
    setPurposeOfCalling: (v: string) => void
    setBerthHours: (v: string) => void
    setAnchorageHours: (v: string) => void
    setPilotageThirdMiles: (v: string) => void
    setQnPilotageMiles: (v: string) => void
    setShipType: (v: string) => void
    setOceanFrtRateUsdPerMt: (v: string) => void
    setGarbageCbmAmount: (v: string) => void
    setQuarantineCargoMode: (v: string) => void
    setAgencyFeeMode: (v: string) => void
    setAgencyDiscountPercent: (v: string) => void
    setAgencyLumpsumAmount: (v: string) => void
    setBoatHireAmount: (v: string) => void
    setBoatHireQuarantineAmount: (v: string) => void
    setTallyFeeAmount: (v: string) => void
    setTransportLs: (v: string) => void
  },
) {
  const form = quoteFormFromStored(inquiry.quoteForm)
  setters.setFormCreatedDate(
    toStr(inquiry.epdaDocumentDate) ??
      new Date().toISOString().split('T')[0],
  )
  setters.setToShipowner(toStr(inquiry.toName) ?? '')
  setters.setMv(toStr(inquiry.mv) ?? '')
  setters.setDwt(toStr(inquiry.dwt) ?? '')
  setters.setGrt(toStr(inquiry.grt) ?? '')
  setters.setLoa(toStr(inquiry.loa) ?? '')
  setters.setEta(toStr(inquiry.eta) ?? '')
  setters.setCargoQty(toStr(inquiry.cargoQuantity) ?? '')
  setters.setFrtTaxType(toStr(inquiry.frtTaxType) ?? '')
  setters.setPort(toStr(inquiry.portOfCall) ?? '')
  setters.setDischargeLoadingLocation(toStr(inquiry.dischargeLoadingLocation) ?? '')
  setters.setPurposeOfCalling(toStr(inquiry.purposeOfCalling) ?? '')
  setters.setBerthHours(toStr(inquiry.berthHours) ?? '96')
  setters.setAnchorageHours(toStr(inquiry.anchorageHours) ?? '24')
  const pilotage = toStr(inquiry.pilotage3rdMiles) ?? (form === 'QN' ? '5' : '17')
  setters.setPilotageThirdMiles(pilotage)
  setters.setQnPilotageMiles(pilotage)
  setters.setShipType(toStr(inquiry.shipType) ?? 'BULK_SHIP')
  setters.setOceanFrtRateUsdPerMt(toStr(inquiry.oceanFrtRateUsdPerMt) ?? '')
  setters.setGarbageCbmAmount(toStr(inquiry.garbageCbmAmount) ?? '1')
  setters.setQuarantineCargoMode(mapQuarantineModeFromApi(inquiry.quarantineCargoMode))
  setters.setAgencyFeeMode(mapAgencyFeeModeFromApi(inquiry.agencyFeeMode))
  setters.setAgencyDiscountPercent(toStr(inquiry.agencyDiscountPercent) ?? '')
  setters.setAgencyLumpsumAmount(toStr(inquiry.agencyLumpsumAmount) ?? '')
  setters.setBoatHireAmount(toStr(inquiry.boatHireAmount) ?? '')
  setters.setBoatHireQuarantineAmount(toStr(inquiry.transportQuarantine) ?? '')
  setters.setTallyFeeAmount(toStr(inquiry.tallyFeeAmount) ?? '')
  setters.setTransportLs(toStr(inquiry.transportLs) ?? '')
}
