"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function LogisticsInquiriesTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="total-logistic"
      serviceLabel="Total Logistics"
      isAdmin={true}
      title="Total Logistics Inquiries"
      description="Manage all total logistics service inquiries"
    />
  )
}
