export interface PartyMenuConfig {
  minOrderPerPerson: number
  modificationDeadlineDays: number
  managerPhone: string
  posterConfig: {
    cafe: {
      token: string
      baseUrl: string
    }
    park: {
      token: string
      baseUrl: string
    }
  }
  notion: {
    token: string
    databaseId: string
  }
  slack: {
    webhookUrl: string
  }
}

export const PARTY_MENU_CONFIG: Omit<
  PartyMenuConfig,
  'posterConfig' | 'notion' | 'slack'
> = {
  minOrderPerPerson: 50, // GEL
  modificationDeadlineDays: 1,
  managerPhone: '+995 XXX XXX XXX',
}

export const LOCATIONS = {
  cafe: 'cafe',
  park: 'park',
  // Notion location values
  'Gymnasia Lisi': 'Gymnasia Lisi',
  'Sports Park': 'Sports Park',
  'Lisi Lake': 'Lisi Lake',
  Vake: 'Vake',
  Other: 'Other',
} as const

export type Location = (typeof LOCATIONS)[keyof typeof LOCATIONS]
