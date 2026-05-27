import { API_CONFIG } from '@/shared/config/api.config'
import type { EpdaApiPayload } from '@/features/admin/components/invoice/epda/epdaApiMappers'
import type { ShippingAgencyAdminInquiry } from '@/features/admin/components/invoice/epda/epdaApiMappers'
import { apiClient } from '@/shared/utils/apiClient'
import { unwrapApiResponse } from '@/shared/utils/apiUnwrap'

export const shippingAgencyEpdaService = {
  async createInternalInquiry(body: EpdaApiPayload): Promise<ShippingAgencyAdminInquiry> {
    const response = await apiClient.post(API_CONFIG.INQUIRIES.ADMIN_SHIPPING_AGENCY_CREATE, body)
    return unwrapApiResponse<ShippingAgencyAdminInquiry>(response)
  },

  async updateEpda(inquiryId: number, body: EpdaApiPayload): Promise<ShippingAgencyAdminInquiry> {
    const response = await apiClient.patch(
      API_CONFIG.INQUIRIES.ADMIN_SHIPPING_AGENCY_EPDA(inquiryId),
      body,
    )
    return unwrapApiResponse<ShippingAgencyAdminInquiry>(response)
  },

  async issueEpda(
    inquiryId: number,
    epdaSnapshot: Record<string, unknown>,
    internalNotes?: string,
  ): Promise<ShippingAgencyAdminInquiry> {
    const response = await apiClient.post(
      API_CONFIG.INQUIRIES.ADMIN_SHIPPING_AGENCY_EPDA_ISSUE(inquiryId),
      { epdaSnapshot, internalNotes },
    )
    return unwrapApiResponse<ShippingAgencyAdminInquiry>(response)
  },
}
