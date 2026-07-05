import { Incident } from '../types'

export let incidents: Incident[] = [
  {
    id: '1',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'Contenedor desbordado en Av. Corrientes',
    lat: -34.6037,
    lng: -58.3816,
    zoneId: '1',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'DAMAGE',
    status: 'IN_PROGRESS',
    description: 'Banco roto en plaza Palermo',
    lat: -34.5711,
    lng: -58.4233,
    zoneId: '2',
    createdAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    type: 'LITTERING',
    status: 'RESOLVED',
    description: 'Acumulación de residuos en Recoleta',
    lat: -34.5875,
    lng: -58.3974,
    zoneId: '3',
    createdAt: '2024-01-13T08:15:00Z'
  },
  {
    id: '4',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'Tacho de basura lleno en Av. Santa Fe',
    lat: -34.5942,
    lng: -58.3932,
    zoneId: '2',
    createdAt: '2024-01-15T11:45:00Z'
  },
  {
    id: '5',
    type: 'DAMAGE',
    status: 'REPORTED',
    description: 'Contenedor con puerta rota en Belgrano',
    lat: -34.5628,
    lng: -58.4544,
    zoneId: '4',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '6',
    type: 'LITTERING',
    status: 'IN_PROGRESS',
    description: 'Residuos tirados en Av. Caballito',
    lat: -34.6175,
    lng: -58.4355,
    zoneId: '5',
    createdAt: '2024-01-14T16:30:00Z'
  },
  {
    id: '7',
    type: 'OTHER',
    status: 'REPORTED',
    description: 'Fuerte olor en contenedor de Microcentro',
    lat: -34.6085,
    lng: -58.3735,
    zoneId: '1',
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '8',
    type: 'OVERFLOW',
    status: 'RESOLVED',
    description: 'Contenedor desbordado en Palermo Soho',
    lat: -34.5885,
    lng: -58.4265,
    zoneId: '2',
    createdAt: '2024-01-12T10:15:00Z'
  },
  {
    id: '9',
    type: 'DAMAGE',
    status: 'IN_PROGRESS',
    description: 'Banco sin asiento en Recoleta',
    lat: -34.5912,
    lng: -58.3908,
    zoneId: '3',
    createdAt: '2024-01-13T15:45:00Z'
  },
  {
    id: '10',
    type: 'LITTERING',
    status: 'REPORTED',
    description: 'Bolsas de basura rotas en Belgrano',
    lat: -34.5585,
    lng: -58.4612,
    zoneId: '4',
    createdAt: '2024-01-15T08:30:00Z'
  },
  {
    id: '11',
    type: 'OVERFLOW',
    status: 'IN_PROGRESS',
    description: 'Contenedor lleno en Caballito Centro',
    lat: -34.6205,
    lng: -58.4382,
    zoneId: '5',
    createdAt: '2024-01-14T11:20:00Z'
  },
  {
    id: '12',
    type: 'OTHER',
    status: 'RESOLVED',
    description: 'Grafiti en contenedor de Microcentro',
    lat: -34.6025,
    lng: -58.3785,
    zoneId: '1',
    createdAt: '2024-01-11T09:45:00Z'
  },
  {
    id: '13',
    type: 'DAMAGE',
    status: 'REPORTED',
    description: 'Contenedor con ruedas rotas en Palermo',
    lat: -34.5795,
    lng: -58.4185,
    zoneId: '2',
    createdAt: '2024-01-15T13:10:00Z'
  },
  {
    id: '14',
    type: 'LITTERING',
    status: 'IN_PROGRESS',
    description: 'Residuos electrónicos abandonados en Recoleta',
    lat: -34.5865,
    lng: -58.3955,
    zoneId: '3',
    createdAt: '2024-01-14T08:50:00Z'
  },
  {
    id: '15',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'Tacho desbordado en Av. Cabildo',
    lat: -34.5555,
    lng: -58.4555,
    zoneId: '4',
    createdAt: '2024-01-15T14:25:00Z'
  },
  {
    id: '16',
    type: 'DAMAGE',
    status: 'RESOLVED',
    description: 'Banco pintado en Caballito',
    lat: -34.6195,
    lng: -58.4415,
    zoneId: '5',
    createdAt: '2024-01-10T16:00:00Z'
  },
  {
    id: '17',
    type: 'OTHER',
    status: 'REPORTED',
    description: 'Contenedor sin tapa en Microcentro',
    lat: -34.6065,
    lng: -58.3765,
    zoneId: '1',
    createdAt: '2024-01-15T10:55:00Z'
  },
  {
    id: '18',
    type: 'OVERFLOW',
    status: 'IN_PROGRESS',
    description: 'Desbordamiento en plaza Palermo',
    lat: -34.5735,
    lng: -58.4295,
    zoneId: '2',
    createdAt: '2024-01-14T12:40:00Z'
  },
  {
    id: '19',
    type: 'LITTERING',
    status: 'REPORTED',
    description: 'Basura acumulada en esquina de Recoleta',
    lat: -34.5895,
    lng: -58.3925,
    zoneId: '3',
    createdAt: '2024-01-15T07:20:00Z'
  },
  {
    id: '20',
    type: 'DAMAGE',
    status: 'IN_PROGRESS',
    description: 'Contenedor volcado en Belgrano',
    lat: -34.5615,
    lng: -58.4585,
    zoneId: '4',
    createdAt: '2024-01-14T09:15:00Z'
  },
  {
    id: '21',
    type: 'OVERFLOW',
    status: 'RESOLVED',
    description: 'Tacho lleno en Caballito',
    lat: -34.6185,
    lng: -58.4365,
    zoneId: '5',
    createdAt: '2024-01-12T14:30:00Z'
  },
  {
    id: '22',
    type: 'OTHER',
    status: 'REPORTED',
    description: 'Mal olor persistente en Av. Corrientes',
    lat: -34.6045,
    lng: -58.3805,
    zoneId: '1',
    createdAt: '2024-01-15T11:15:00Z'
  },
  {
    id: '23',
    type: 'LITTERING',
    status: 'IN_PROGRESS',
    description: 'Residuos en vía pública de Palermo',
    lat: -34.5765,
    lng: -58.4215,
    zoneId: '2',
    createdAt: '2024-01-14T15:55:00Z'
  },
  {
    id: '24',
    type: 'DAMAGE',
    status: 'REPORTED',
    description: 'Banco con astillas en Recoleta',
    lat: -34.5875,
    lng: -58.3945,
    zoneId: '3',
    createdAt: '2024-01-15T09:40:00Z'
  },
  {
    id: '25',
    type: 'OVERFLOW',
    status: 'IN_PROGRESS',
    description: 'Contenedor desbordado en Belgrano',
    lat: -34.5595,
    lng: -58.4625,
    zoneId: '4',
    createdAt: '2024-01-14T10:05:00Z'
  },
  {
    id: '26',
    type: 'OTHER',
    status: 'RESOLVED',
    description: 'Contenedor con plagas en Caballito',
    lat: -34.6215,
    lng: -58.4395,
    zoneId: '5',
    createdAt: '2024-01-11T13:25:00Z'
  },
  {
    id: '27',
    type: 'LITTERING',
    status: 'REPORTED',
    description: 'Papeles y cartones en Microcentro',
    lat: -34.6015,
    lng: -58.3755,
    zoneId: '1',
    createdAt: '2024-01-15T08:10:00Z'
  },
  {
    id: '28',
    type: 'OVERFLOW',
    status: 'IN_PROGRESS',
    description: 'Tacho desbordado en Palermo Hollywood',
    lat: -34.5825,
    lng: -58.4275,
    zoneId: '2',
    createdAt: '2024-01-14T17:30:00Z'
  },
  {
    id: '29',
    type: 'DAMAGE',
    status: 'REPORTED',
    description: 'Contenedor oxidado en Recoleta',
    lat: -34.5905,
    lng: -58.3885,
    zoneId: '3',
    createdAt: '2024-01-15T12:50:00Z'
  },
  {
    id: '30',
    type: 'LITTERING',
    status: 'RESOLVED',
    description: 'Residuos de construcción en Belgrano',
    lat: -34.5575,
    lng: -58.4595,
    zoneId: '4',
    createdAt: '2024-01-10T11:40:00Z'
  },
  {
    id: '31',
    type: 'OVERFLOW',
    status: 'REPORTED',
    description: 'Contenedor lleno en Caballito Norte',
    lat: -34.6155,
    lng: -58.4345,
    zoneId: '5',
    createdAt: '2024-01-15T13:35:00Z'
  },
  {
    id: '32',
    type: 'OTHER',
    status: 'IN_PROGRESS',
    description: 'Contenedor bloqueado en Microcentro',
    lat: -34.6075,
    lng: -58.3825,
    zoneId: '1',
    createdAt: '2024-01-14T14:45:00Z'
  },
  {
    id: '33',
    type: 'DAMAGE',
    status: 'REPORTED',
    description: 'Banco sin respaldo en Palermo',
    lat: -34.5745,
    lng: -58.4245,
    zoneId: '2',
    createdAt: '2024-01-15T10:20:00Z'
  },
  {
    id: '34',
    type: 'LITTERING',
    status: 'IN_PROGRESS',
    description: 'Vidrios rotos en Recoleta',
    lat: -34.5885,
    lng: -58.3965,
    zoneId: '3',
    createdAt: '2024-01-14T09:30:00Z'
  },
  {
    id: '35',
    type: 'OVERFLOW',
    status: 'RESOLVED',
    description: 'Tacho desbordado en Belgrano Sur',
    lat: -34.5635,
    lng: -58.4565,
    zoneId: '4',
    createdAt: '2024-01-12T16:15:00Z'
  },
  {
    id: '36',
    type: 'OTHER',
    status: 'REPORTED',
    description: 'Contenedor con abejas en Caballito',
    lat: -34.6225,
    lng: -58.4425,
    zoneId: '5',
    createdAt: '2024-01-15T11:05:00Z'
  },
  {
    id: '37',
    type: 'DAMAGE',
    status: 'IN_PROGRESS',
    description: 'Contenedor con bisagras rotas en Microcentro',
    lat: -34.6035,
    lng: -58.3775,
    zoneId: '1',
    createdAt: '2024-01-14T13:50:00Z'
  },
  {
    id: '38',
    type: 'LITTERING',
    status: 'REPORTED',
    description: 'Bolsas de residuos en Palermo',
    lat: -34.5785,
    lng: -58.4195,
    zoneId: '2',
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '39',
    type: 'OVERFLOW',
    status: 'IN_PROGRESS',
    description: 'Contenedor desbordado en Recoleta Norte',
    lat: -34.5855,
    lng: -58.3915,
    zoneId: '3',
    createdAt: '2024-01-14T11:40:00Z'
  },
  {
    id: '40',
    type: 'OTHER',
    status: 'RESOLVED',
    description: 'Contenedor con pintura fresca en Belgrano',
    lat: -34.5605,
    lng: -58.4635,
    zoneId: '4',
    createdAt: '2024-01-11T15:20:00Z'
  }
]
