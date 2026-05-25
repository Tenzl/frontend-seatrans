import { Package, Truck, Plane, Ship, Globe, CheckCircle, Clock, Warehouse } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface FreightForwardingProps {
  onNavigateHome?: () => void
}

export function FreightForwarding({ onNavigateHome }: FreightForwardingProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Freight Forwarding',
    serviceIcon: Package,
    onNavigateHome,
    serviceTypeId: 2,

    hero: {
      subtitle: 'Freight Forwarding',
      title: 'Sea, Air & Land — End-to-End Cargo Movement',
      description:
        'From FCL container bookings to customs clearance and last-mile delivery, Seatrans moves your cargo on time across 50+ countries with a single point of contact.',
      image: 'https://picsum.photos/seed/seatrans-page-freight/1600/900',
    },

    contacts: {
      showEmergencyBadge: false,
      sectionTitle: 'Freight Operations Team',
      sectionDescription:
        'Get in touch with our logistics specialists for a rate quote, booking confirmation, or tracking update on your active shipments.',
      teams: [
        {
          title: 'Freight Operations',
          subtitle: 'Air, Sea & Land Logistics',
          icon: Package,
          contacts: [
            { name: 'Thi Thao Ly', mobile: '+84.905.812.679' },
            { name: 'Van Hoang Minh', mobile: '+84.903.417.852' },
          ],
          email: 'freight@seatrans.com.vn',
        },
      ],
      stats: [
        { icon: Globe, value: '53', label: 'Countries served' },
        { icon: Package, value: '11.4K+', label: 'Shipments / year' },
        { icon: Clock, value: '24/7', label: 'Booking support' },
        { icon: Truck, value: '96.3%', label: 'On-time delivery' },
      ],
    },

    services: {
      sectionTitle: 'Freight Forwarding Solutions',
      sectionDescription:
        'Whether it is a single pallet or a full charter consignment, we source the right carrier, route, and documentation for your cargo.',
      items: [
        {
          name: 'Ocean Freight — FCL & LCL',
          description:
            'Full Container Load and Less-than-Container Load bookings with preferred-rate carrier contracts across major trade lanes.',
          icon: Ship,
        },
        {
          name: 'Air Freight',
          description:
            'Express and consolidation air cargo via hub-and-spoke networks for time-critical shipments worldwide.',
          icon: Plane,
        },
        {
          name: 'Road & Inland Transport',
          description:
            'Domestic trucking, cross-border haulage, and ex-works pickup across Vietnam and neighbouring markets.',
          icon: Truck,
        },
        {
          name: 'Customs Clearance',
          description:
            'Licensed customs brokerage: HS classification, duty drawback, permit handling, and full documentation.',
          icon: CheckCircle,
        },
        {
          name: 'Warehousing & Distribution',
          description:
            'Bonded and commercial warehouse space with pick-and-pack, cross-docking, and real-time inventory reporting.',
          icon: Warehouse,
        },
        {
          name: 'Project & Oversized Cargo',
          description:
            'Heavy-lift and out-of-gauge solutions — breakbulk, RoRo, and flat-rack planning for complex project moves.',
          icon: Globe,
        },
      ],
    },

    form: {
      badgeText: 'Request a Rate',
      sectionTitle: 'Freight Quote Inquiry',
      sectionDescription:
        "Fill in your shipment details below and our team will respond with a competitive rate within one business day.",
      submitButtonText: 'Request Quote',
      submitPath: '/inquiries',
      serviceTypeSlug: 'freight-forwarding',
      fields: [
        { id: 'cargoName', label: 'Cargo description', type: 'text', required: true, placeholder: 'e.g. Steel coils, consumer electronics', gridSpan: 2 },
        { id: 'deliveryTerm', label: 'Delivery term (Incoterms)', type: 'select', required: true, placeholder: 'Select Incoterms', gridSpan: 1, options: ['CY/CY', 'CY/Door', 'Door/CY', 'Door/Door', 'Port/Port'] },
        { id: 'container20', label: "20' containers (qty)", type: 'number', placeholder: '0', gridSpan: 1 },
        { id: 'container40', label: "40' containers (qty)", type: 'number', placeholder: '0', gridSpan: 1 },
        { id: 'loadingPort', label: 'Port of loading', type: 'port', required: true, gridSpan: 1 },
        { id: 'dischargingPort', label: 'Port of discharge', type: 'port', required: true, gridSpan: 1 },
        { id: 'shipmentFrom', label: 'Shipment window — earliest', type: 'date', required: true, gridSpan: 1 },
        { id: 'shipmentTo', label: 'Shipment window — latest', type: 'date', required: true, gridSpan: 1 },
        { id: 'additionalInfo', label: 'Additional requirements', type: 'textarea', placeholder: 'Hazmat status, temperature control, special handling, etc.', gridSpan: 2 },
      ],
      onSubmit: (data) => {
        console.log('Freight inquiry submitted:', data)
      },
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Freight Operations in the Field',
      sectionDescription:
        'Container yards, customs checks, and cross-border hauls — our freight forwarding work across Asia.',
    },
  }

  return <ServiceTemplate {...config} />
}
