"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function ShippingAgencyInquiriesTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="shipping-agency"
      serviceLabel="Shipping Agency"
      isAdmin={true}
      title="Shipping Agency Inquiries"
      description="Manage all shipping agency service inquiries"
    />
  )
}
