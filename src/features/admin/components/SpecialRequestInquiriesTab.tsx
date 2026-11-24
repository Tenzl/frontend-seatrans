"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function SpecialRequestInquiriesTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="special-request"
      serviceLabel="Special Request"
      isAdmin={true}
      title="Special Request Inquiries"
      description="Manage all special request inquiries"
    />
  )
}
