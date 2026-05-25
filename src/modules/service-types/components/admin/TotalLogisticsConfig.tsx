import { Package, Truck, Plane, Ship, Warehouse, FileCheck, Globe, Clock } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface TotalLogisticsProps {
  onNavigateHome?: () => void
}

export function TotalLogistics({ onNavigateHome }: TotalLogisticsProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Total Logistics',
    serviceIcon: Package,
    onNavigateHome,
    serviceTypeId: 4,

    hero: {
      subtitle: 'Total Logistics',
      title: 'Door-to-Door Supply Chain — Sea, Air, Road & Warehouse',
      description:
        "Seatrans handles the complete journey: booking, customs, inland transport, warehousing, and final delivery. One contract, one contact, zero hand-off gaps.",
      image: 'https://picsum.photos/seed/seatrans-page-logistics/1600/900',
    },

    contacts: {
      showEmergencyBadge: false,
      sectionTitle: 'Total Logistics Team',
      sectionDescription:
        'Our logistics coordinators manage your shipment from origin booking to delivered receipt. Reach them directly for quotes, status updates, or shipment exceptions.',
      teams: [
        {
          title: 'Freight Forwarding',
          subtitle: 'Door-to-Door Solutions',
          icon: Package,
          contacts: [
            { name: 'Ta Thi Thao Ly', mobile: '+84.905.812.679' },
          ],
          email: 'ly.tathithao@seatrans.com.vn',
        },
        {
          title: 'Total Logistics',
          subtitle: 'Supply Chain & Warehousing',
          icon: Warehouse,
          contacts: [
            { name: 'Do Duy An', mobile: '+84.935.015.679' },
          ],
          email: 'total.logistics@seatrans.com.vn',
        },
      ],
      stats: [
        { icon: Globe, value: '53', label: 'Countries' },
        { icon: Ship, value: '9.8K+', label: 'TEUs / year' },
        { icon: Clock, value: '24/7', label: 'Shipment support' },
        { icon: Truck, value: '98.4%', label: 'On-time delivery' },
      ],
    },

    services: {
      sectionTitle: 'End-to-End Logistics Services',
      sectionDescription:
        "From factory floor to final warehouse — we manage every link in your supply chain so you can focus on your business.",
      items: [
        {
          name: 'Global Ocean Freight (FCL / LCL)',
          description:
            'Full Container Load and Less-than-Container Load bookings at competitive rates, covering major Asia-Europe and trans-Pacific trade lanes.',
          icon: Ship,
        },
        {
          name: 'Port-to-Port & Door-to-Door',
          description:
            'Flexible origin and destination scope by sea and air — with accepted bookings and carrier confirmation in hand.',
          icon: Globe,
        },
        {
          name: 'Inland Trucking & Ex-Works Pickup',
          description:
            'Factory pickup and last-mile delivery across Vietnam and neighbouring countries, including refrigerated transport.',
          icon: Truck,
        },
        {
          name: 'Warehousing & Packing',
          description:
            'Bonded and commercial storage facilities with pick-and-pack, labelling, repackaging, and palletisation services.',
          icon: Warehouse,
        },
        {
          name: 'Full Customs Formality',
          description:
            'Licensed brokerage for import and export: HS classification, duty calculation, permit applications, and post-clearance audit support.',
          icon: FileCheck,
        },
        {
          name: 'Multimodal & Air Freight',
          description:
            'Integrated sea-air, air-truck, and rail solutions for time-sensitive or high-value cargo that requires multiple transport modes.',
          icon: Plane,
        },
      ],
    },

    form: {
      badgeText: 'Get Best Rates',
      sectionTitle: 'Logistics Rate Request',
      sectionDescription:
        "Describe your shipment below and our team will come back with a competitive door-to-door rate within one business day.",
      submitButtonText: 'Request Quote',
      submitPath: '/inquiries',
      serviceTypeSlug: 'total-logistics',
      fields: [
        { id: 'cargoName', label: 'Cargo description', type: 'text', required: true, placeholder: 'e.g. Garment, machinery parts, consumer goods', gridSpan: 2 },
        { id: 'deliveryTerm', label: 'Delivery term (Incoterms)', type: 'select', required: true, placeholder: 'Select Incoterms', gridSpan: 1, options: ['CY/CY', 'CY/Door', 'Door/CY', 'Door/Door', 'Port/Port'] },
        { id: 'container20', label: "20' containers (qty)", type: 'number', placeholder: '0', gridSpan: 1 },
        { id: 'container40', label: "40' containers (qty)", type: 'number', placeholder: '0', gridSpan: 1 },
        { id: 'loadingPort', label: 'Port of loading', type: 'port', required: true, gridSpan: 1 },
        { id: 'dischargingPort', label: 'Port of discharge', type: 'port', required: true, gridSpan: 1 },
        { id: 'shipmentFrom', label: 'Shipment window — earliest', type: 'date', required: true, gridSpan: 1 },
        { id: 'shipmentTo', label: 'Shipment window — latest', type: 'date', required: true, gridSpan: 1 },
        { id: 'additionalInfo', label: 'Additional requirements', type: 'textarea', placeholder: 'Temperature control, insurance needs, special handling, etc.', gridSpan: 2 },
      ],
      onSubmit: (data) => {
        console.log('Logistics quote request submitted:', data)
      },
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Total Logistics Operations',
      sectionDescription:
        'Warehousing, container loading, customs clearance, and delivery runs — our logistics network in action.',
    },
  }

  return <ServiceTemplate {...config} />
}
