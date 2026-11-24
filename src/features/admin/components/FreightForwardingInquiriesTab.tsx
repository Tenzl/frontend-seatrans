"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function FreightForwardingInquiriesTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="freight-forwarding"
      serviceLabel="Freight Forwarding"
      isAdmin={true}
      title="Freight Forwarding Inquiries"
      description="Manage all freight forwarding service inquiries"
    />
  )
}
