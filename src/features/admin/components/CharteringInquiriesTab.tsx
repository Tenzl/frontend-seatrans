"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function CharteringInquiriesTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="chartering"
      serviceLabel="Chartering & Ship Broking"
      isAdmin={true}
      title="Chartering Inquiries"
      description="Manage all chartering and ship broking inquiries"
    />
  )
}
