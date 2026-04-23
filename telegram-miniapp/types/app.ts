export type ThemeSettings = {
  backgroundColor: string
  cardColor: string
  cardBorderColor: string
  textColor: string
  mutedTextColor: string
  accentColor: string
  accentTextColor: string
  navColor: string
}

export type ShopSettings = {
  shopName: string
  shopDescription: string
  shopLogoUrl: string
  adminAvatarUrl: string
}

export type LinkItem = {
  id: number
  title: string
  url: string
  subtitle: string
  isVisible: boolean
}

export type Product = {
  id: number
  title: string
  description: string
  image: string
  video?: string
  tags: string[]
  isVisible: boolean
}

export type Category = {
  id: number
  title: string
  products: Product[]
  isVisible: boolean
}

export type Announcement = {
  id: number
  title: string
  body: string
  createdAt: string
  isVisible: boolean
}

export type Tab = 'links' | 'shop' | 'profile'
export type ProfileView =
  | 'menu'
  | 'announcement'
  | 'announcements'
  | 'product'
  | 'links'
  | 'branding'