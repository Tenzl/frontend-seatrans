import { Ship, Clock, Users, Shield, FileText, Award, Anchor, MapPin, TrendingUp } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface ShippingAgencyProps {
  onNavigateHome?: () => void
}

export function ShippingAgency({ onNavigateHome }: ShippingAgencyProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Shipping Agency',
    serviceIcon: Ship,
    onNavigateHome,
    serviceTypeId: 1,

    hero: {
      subtitle: 'Shipping Agency',
      title: 'Full Vessel Husbandry — From Berth Approach to Departure',
      description:
        'Seatrans handles every port call detail on your behalf — port clearance, crew logistics, cash disbursements, and 24/7 emergency coordination across major Vietnamese ports.',
      image: 'https://picsum.photos/seed/seatrans-page-shipping/1600/900',
    },

    contacts: {
      showEmergencyBadge: true,
      sectionTitle: 'Reach the Shipping Agency Desk',
      sectionDescription:
        'Our port operations team monitors vessel movements around the clock. Direct contact lines are available for urgent matters at any hour.',
      teams: [
        {
          title: 'Shipping Agency',
          subtitle: 'Vessel Operations & Husbandry',
          icon: Ship,
          contacts: [
            { name: 'Duc Tuyen', mobile: '+84.914.282.649' },
            { name: 'Le Hung', mobile: '+84.128.231.0497' },
          ],
          email: 'ship.agency@seatrans.com.vn',
        },
        {
          title: 'Operations Center',
          subtitle: '24/7 On-Call Support',
          icon: Clock,
          contacts: [
            { name: 'Do Duy An', mobile: '+84.935.015.679' },
          ],
          email: 'operation@seatrans.com.vn',
        },
      ],
      stats: [
        { icon: Clock, value: '24/7', label: 'On-call coverage' },
        { icon: TrendingUp, value: '< 2 hrs', label: 'Response time' },
        { icon: MapPin, value: '6 ports', label: 'VN coverage' },
        { icon: Ship, value: '2,500+', label: 'Vessels handled' },
      ],
    },

    services: {
      sectionTitle: 'Shipping Agency Services',
      sectionDescription:
        'We cover the full lifecycle of a port call — pre-arrival planning through final departure documentation.',
      items: [
        {
          name: 'Full Husbandry Agency',
          description:
            'End-to-end port operations: berth booking, port authority coordination, pre-arrival notices, and final port clearance.',
          icon: Ship,
        },
        {
          name: 'Protecting Agency',
          description:
            'Independent oversight for shipowners and charterers — ensuring compliance and safeguarding your interests throughout the port call.',
          icon: Shield,
        },
        {
          name: 'Visa & Crew Change',
          description:
            'Immigration liaison, work permit applications, repatriation flights, and crew boarding coordination.',
          icon: Users,
        },
        {
          name: 'Cash To Master Delivery',
          description:
            'Secure and traceable fund delivery to vessel masters, with full documentation and signature receipt.',
          icon: FileText,
        },
        {
          name: 'Repair, Engineering & Cleaning',
          description:
            'Technical service coordination: certified repair crews, underwater surveys, hold cleaning, and inspection support.',
          icon: Award,
        },
        {
          name: 'Bunkering & Provision Supply',
          description:
            'Competitive fuel sourcing and provisions delivery, timed precisely to your vessel schedule.',
          icon: Anchor,
        },
      ],
    },

    form: {
      badgeText: 'Port D/A Inquiry',
      sectionTitle: 'Port Disbursement Account Inquiry',
      sectionDescription:
        'Submit your vessel details and we will prepare a detailed cost estimate for your upcoming port call.',
      submitButtonText: 'Submit Inquiry',
      submitPath: '/inquiries',
      serviceTypeSlug: 'shipping-agency',
      sections: [
        {
          title: 'Trade & Port',
          fields: [
            { id: 'frtTaxType', label: 'Freight tax (import / export)', type: 'select', required: true, options: ['Import', 'Export'], gridSpan: 1, helperText: 'Export cargo may incur freight tax; import typically does not.', enableSearch: false },
            { id: 'purposeOfCalling', label: 'Purpose of calling', type: 'select', required: true, options: ['NHAP_XUAT', 'NHAP_CHUYEN_CANG', 'CHUYEN_CANG_XUAT', 'CHUYEN_CANG_CHUYEN_CANG', 'MUC_DICH_KHAC'], gridSpan: 1, enableSearch: false },
            { id: 'portArea', label: 'Area', type: 'select', required: true, options: ['NORTHERN', 'MIDDLE', 'SOUTHERN'], gridSpan: 1, enableSearch: false },
            { id: 'portOfCall', label: 'Port of call', type: 'port', required: true, placeholder: 'Select port of call', gridSpan: 1 },
            { id: 'dischargeLoadingLocation', label: 'Operation at', type: 'select', required: true, options: ['Berth', 'Anchorage'], gridSpan: 1, enableSearch: false },
          ],
        },
        {
          title: 'Party & Vessel',
          fields: [
            { id: 'to', label: 'To (Shipowner / Principal)', type: 'text', required: true, placeholder: 'Owner or principal name', gridSpan: 1 },
            { id: 'mv', label: 'Vessel Name', type: 'mv-prefix', required: true, placeholder: 'MV Your Vessel', gridSpan: 1 },
            { id: 'grt', label: 'GRT', type: 'number', placeholder: 'Gross tonnage', gridSpan: 1 },
            { id: 'dwt', label: 'DWT', type: 'number', placeholder: 'Deadweight (MT)', gridSpan: 1 },
            { id: 'loa', label: 'LOA (m)', type: 'number', placeholder: 'Length overall', gridSpan: 1 },
            { id: 'eta', label: 'ETA', type: 'date', required: false, placeholder: 'dd/mm/yyyy', gridSpan: 1 },
          ],
        },
        {
          title: 'Cargo',
          fields: [
            { id: 'cargoType', label: 'Cargo type', type: 'select', required: true, placeholder: 'Select cargo type', gridSpan: 1 },
            { id: 'cargoName', label: 'Cargo name', type: 'select', required: true, placeholder: 'Select cargo name', gridSpan: 1 },
            { id: 'cargoNameOther', label: 'Cargo name (specify)', type: 'text', placeholder: 'Enter cargo name', gridSpan: 2, showWhen: { field: 'cargoName', value: 'OTHER' } },
            { id: 'quantityTons', label: 'Quantity (MT)', type: 'number', required: true, placeholder: 'e.g. 12,500', gridSpan: 1 },
          ],
        },
        {
          title: 'Service options',
          fields: [
            { id: 'boatHireAmount', label: 'Boat-hire for agency (USD)', type: 'number', placeholder: '0', gridSpan: 1, required: false, showWhen: { field: 'dischargeLoadingLocation', value: 'Anchorage' } },
            { id: 'tallyFeeAmount', label: "Ship's side tally fee (USD)", type: 'number', placeholder: '0', gridSpan: 1, required: false, showWhen: { field: 'cargoType', value: 'IN_BAG_PACK' } },
            { id: 'transportLs', label: 'Taxi / courier / communication (USD)', type: 'number', placeholder: '0', gridSpan: 2 },
            { id: 'transportQuarantine', label: 'Transport for quarantine formality (optional)', type: 'number', placeholder: '0', gridSpan: 2 },
          ],
        },
      ],
      fields: [],
      onSubmit: (data) => {
        console.log('Port D/A inquiry submitted:', data)
      },
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Shipping Agency Operations',
      sectionDescription:
        'Port calls, crew changes, cargo operations — a look inside our shipping agency work across Vietnamese ports.',
    },
  }

  return <ServiceTemplate {...config} />
}
