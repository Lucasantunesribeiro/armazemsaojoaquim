export interface NavigationItem {
  readonly name: string
  readonly href: string
  readonly requireAuth?: boolean
  readonly external?: boolean
}

export type NavigationItems = readonly NavigationItem[] 