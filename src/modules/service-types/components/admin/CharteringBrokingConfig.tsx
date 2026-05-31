import { Anchor, Ship, Package, Globe, Truck, TreePine, Wheat, Mountain, FileText } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface CharteringBrokingProps {
  onNavigateHome?: () => void
}

export function CharteringBroking({ onNavigateHome }: CharteringBrokingProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Chartering & Broking',
    serviceIcon: Anchor,
    onNavigateHome,
    serviceTypeId: 3,

    hero: {
      subtitle: 'Chartering & Broking',
      title: 'Competitive Tonnage Fixtures Across Asia-Pacific Trade Routes',
      description:
        "Backed by a trusted shipowner network, Seatrans consistently arranges suitable vessels at competitive freight rates — fixing cargo on time from Vietnam to China, Korea, and beyond.",
      image: 'https://picsum.photos/seed/seatrans-page-chartering/1600/900',
    },

    contacts: {
      showEmergencyBadge: false,
      sectionTitle: 'Chartering & Broking Desk',
      sectionDescription:
        'Our chartering team tracks live vessel positions daily. Send your cargo requirement and we will return with a shortlist of tonnage within hours.',
      teams: [
        {
          title: 'Chartering & Broking',
          subtitle: 'Vessel Fixture & Cargo Operations',
          icon: Anchor,
          contacts: [
            { name: 'Phan Duy Cong', mobile: '+84.905.001.077' },
            { name: 'Do Duy An', mobile: '+84.935.015.679' },
          ],
          email: 'chartering@seatrans.com.vn',
        },
      ],
      stats: [
        { icon: Ship, value: '130+', label: 'Active vessels' },
        { icon: Globe, value: '17', label: 'Trade routes' },
        { icon: Package, value: '480K+', label: 'MT / year' },
        { icon: FileText, value: '97.1%', label: 'On-time fixtures' },
      ],
    },

    services: {
      sectionTitle: 'Cargo & Tonnage Arrangements',
      sectionDescription:
        'We specialize in bulk and breakbulk commodities across key intra-Asia corridors — with direct access to qualified vessel owners on each route.',
      items: [
        {
          name: 'Tapioca Chip',
          description:
            '7–20K MT per shipment from Vietnamese ports to Shatian, Fangcheng, Lianyungang, Rizhao, and Qingdao.',
          icon: Package,
        },
        {
          name: 'Wood-Chip',
          description:
            '8–15K BDMT per shipment from Vietnam to China and Korea on purpose-built chip carriers.',
          icon: TreePine,
        },
        {
          name: 'Wood-Pellets',
          description:
            '8–15K MT per shipment from Vietnam to Kunsan and Pyeongtaek, South Korea under long-term charter arrangements.',
          icon: TreePine,
        },
        {
          name: 'Fertilizer in Bulk',
          description:
            '5–10K MT per shipment from Fuzhou (CN) and Nagoya (JP) to Vietnamese agricultural ports.',
          icon: Wheat,
        },
        {
          name: 'Sand & Ore in Bulk',
          description:
            '7–10K MT per shipment from Vietnamese mining ports to Huanghua, Qingdao, and Taichung.',
          icon: Mountain,
        },
        {
          name: 'Round Logs',
          description:
            '3–5K CBM per shipment from Papua New Guinea and Malaysian ports to Vietnamese processing facilities.',
          icon: TreePine,
        },
        {
          name: 'Domestic Sea Transport',
          description:
            'Coastal feeder services within Vietnam — connecting Hai Phong, Da Nang, Quy Nhon, and Ho Chi Minh City.',
          icon: Truck,
        },
      ],
    },

    form: {
      badgeText: 'Tonnage Inquiry',
      sectionTitle: 'Vessel / Tonnage Order',
      sectionDescription:
        'Tell us your cargo requirement and laycan window. We will identify and propose suitable tonnage with competitive freight rates.',
      submitButtonText: 'Submit Cargo Order',
      submitPath: '/inquiries',
      serviceTypeSlug: 'chartering-ship-broking',
      fields: [
        { id: 'loadingArea', label: 'Loading area', type: 'select', required: true, options: ['NORTHERN', 'MIDDLE', 'SOUTHERN'], gridSpan: 1, enableSearch: false },
        { id: 'loadingPort', label: 'Port of loading', type: 'port', required: true, gridSpan: 1, placeholder: 'Select port of loading' },
        { id: 'dischargingArea', label: 'Discharging area', type: 'select', required: true, options: ['NORTHERN', 'MIDDLE', 'SOUTHERN'], gridSpan: 1, enableSearch: false },
        { id: 'dischargingPort', label: 'Port of discharge', type: 'port', required: true, gridSpan: 1, placeholder: 'Select port of discharge' },
        { id: 'cargoQuantity', label: 'Cargo type & quantity (MT)', type: 'number', required: true, placeholder: 'e.g. 15,000', gridSpan: 2 },
        { id: 'laycanFrom', label: 'Laycan — opening date', type: 'date', required: true, gridSpan: 1 },
        { id: 'laycanTo', label: 'Laycan — closing date', type: 'date', required: true, gridSpan: 1 },
        { id: 'otherInfo', label: 'Additional terms / notes', type: 'textarea', placeholder: 'Vessel size preference, freight basis, special cargo conditions…', gridSpan: 2 },
      ],
      onSubmit: (data) => {
        console.log('Tonnage order submitted:', data)
      },
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Chartering Operations',
      sectionDescription:
        'Bulk cargo loading, vessel fixtures, and trade route coverage across the Asia-Pacific region.',
    },
  }

  return <ServiceTemplate {...config} />
}
