export interface NavigationItem {
  readonly name: string
  readonly href: string
  readonly requireAuth?: boolean
}

export type NavigationItems = readonly NavigationItem[] 