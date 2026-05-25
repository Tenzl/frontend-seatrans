"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function FreightForwardingInquiriesTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="freight-forwarding"
      serviceLabel="Freight Forwarding"
      isAdmin={true}
      description="Manage all freight forwarding service inquiries"
    />
  )
}
