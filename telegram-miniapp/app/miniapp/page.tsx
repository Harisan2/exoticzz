'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import LinksTab from '@/components/LinksTab'
import ShopTab from '@/components/ShopTab'
import ProfileTab from '@/components/ProfileTab'
import type {
  Announcement,
  Category,
  LinkItem,
  ProfileView,
  ShopSettings,
  Tab,
  ThemeSettings,
} from '@/types/app'

const STORAGE_KEY = 'telegram-miniapp-state'

type AppStorage = {
  theme: ThemeSettings
  shopSettings: ShopSettings
  links: LinkItem[]
  categories: Category[]
  announcements: Announcement[]
}

const defaultTheme: ThemeSettings = {
  backgroundColor: '#14181f',
  cardColor: '#111111',
  cardBorderColor: '#1d1d1d',
  textColor: '#ffffff',
  mutedTextColor: '#9f9f9f',
  accentColor: '#173b88',
  accentTextColor: '#d7e4ff',
  navColor: '#0f0f0f',
}

const defaultShopSettings: ShopSettings = {
  shopName: 'My Shop',
  shopDescription: 'Hier komt jouw shopnaam, korte info en zakelijke tekst.',
  shopLogoUrl: '',
  adminAvatarUrl: '',
}

const defaultLinks: LinkItem[] = [
  {
    id: 1,
    title: 'Instagram',
    url: 'https://instagram.com',
    subtitle: 'Volg updates en content',
    isVisible: true,
  },
  {
    id: 2,
    title: 'Telegram Channel',
    url: 'https://t.me',
    subtitle: 'Bekijk announcements en posts',
    isVisible: true,
  },
  {
    id: 3,
    title: 'Support Chat',
    url: 'https://t.me',
    subtitle: 'Neem direct contact op',
    isVisible: true,
  },
]

const defaultCategories: Category[] = [
  {
    id: 1,
    title: 'Category 1',
    isVisible: true,
    products: [
      {
        id: 101,
        title: 'Product 1',
        description: 'Korte omschrijving van product 1. Hier kun je extra info zetten.',
        image: 'https://via.placeholder.com/110x110?text=Product+1',
        video: '',
        tags: ['Top rated', 'Popular'],
        isVisible: true,
      },
      {
        id: 102,
        title: 'Product 2',
        description: 'Korte omschrijving van product 2. Hier kun je extra info zetten.',
        image: 'https://via.placeholder.com/110x110?text=Product+2',
        video: '',
        tags: ['Budget hit', 'New'],
        isVisible: true,
      },
    ],
  },
  {
    id: 2,
    title: 'Category 2',
    isVisible: true,
    products: [
      {
        id: 201,
        title: 'Product 3',
        description: 'Korte omschrijving van product 3. Hier kun je extra info zetten.',
        image: 'https://via.placeholder.com/110x110?text=Product+3',
        video: '',
        tags: ['Featured', 'Limited'],
        isVisible: true,
      },
    ],
  },
]

const defaultAnnouncements: Announcement[] = []

function normalizeStorageData(parsed: Partial<AppStorage>) {
  const normalizedLinks = (parsed.links ?? defaultLinks).map((link) => ({
    ...link,
    isVisible: link.isVisible ?? true,
  }))

  const normalizedCategories = (parsed.categories ?? defaultCategories).map((category) => ({
    ...category,
    isVisible: category.isVisible ?? true,
    products: (category.products ?? []).map((product) => ({
      ...product,
      isVisible: product.isVisible ?? true,
      video: product.video ?? '',
    })),
  }))

  const normalizedAnnouncements = (parsed.announcements ?? defaultAnnouncements).map(
    (announcement) => ({
      ...announcement,
      isVisible: announcement.isVisible ?? true,
    })
  )

  return {
    theme: { ...defaultTheme, ...(parsed.theme ?? {}) },
    shopSettings: { ...defaultShopSettings, ...(parsed.shopSettings ?? {}) },
    links: normalizedLinks,
    categories: normalizedCategories,
    announcements: normalizedAnnouncements,
  }
}

export default function MiniApp() {
  const isAdmin = true

  const [tab, setTab] = useState<Tab>('shop')
  const [profileView, setProfileView] = useState<ProfileView>('menu')

  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [shopSettings, setShopSettings] = useState<ShopSettings>(defaultShopSettings)
  const [links, setLinks] = useState<LinkItem[]>(defaultLinks)
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements)

  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppStorage>
        const normalized = normalizeStorageData(parsed)

        setTheme(normalized.theme)
        setShopSettings(normalized.shopSettings)
        setLinks(normalized.links)
        setCategories(normalized.categories)
        setAnnouncements(normalized.announcements)
      }
    } catch (error) {
      console.error('Fout bij laden van localStorage:', error)
    } finally {
      setHasLoadedStorage(true)
    }
  }, [])

  useEffect(() => {
    if (!hasLoadedStorage) return

    const dataToStore: AppStorage = {
      theme,
      shopSettings,
      links,
      categories,
      announcements,
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore))
    } catch (error) {
      console.error('Fout bij opslaan in localStorage:', error)
    }
  }, [theme, shopSettings, links, categories, announcements, hasLoadedStorage])

  useEffect(() => {
    if (!isAdmin && tab === 'profile') {
      setTab('shop')
    }
  }, [isAdmin, tab])

  useEffect(() => {
    if (tab !== 'profile') {
      setProfileView('menu')
    }
  }, [tab])

  function resetAppData() {
    const confirmed = window.confirm('Weet je zeker dat je alle opgeslagen app-data wilt resetten?')

    if (!confirmed) return

    localStorage.removeItem(STORAGE_KEY)
    setTheme(defaultTheme)
    setShopSettings(defaultShopSettings)
    setLinks(defaultLinks)
    setCategories(defaultCategories)
    setAnnouncements(defaultAnnouncements)
    setTab('shop')
    setProfileView('menu')
  }

  if (!hasLoadedStorage) {
    return (
      <div
        style={{
          background: defaultTheme.backgroundColor,
          color: defaultTheme.textColor,
          minHeight: '100vh',
          padding: 20,
        }}
      >
        Laden...
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 20,
        paddingBottom: 100,
        background: theme.backgroundColor,
        minHeight: '100vh',
        color: theme.textColor,
      }}
    >
      {tab === 'links' && (
        <LinksTab
          links={links}
          shopSettings={shopSettings}
          theme={theme}
        />
      )}

      {tab === 'shop' && (
        <ShopTab
          categories={categories}
          announcements={announcements}
          shopSettings={shopSettings}
          theme={theme}
          isAdmin={isAdmin}
        />
      )}

      {tab === 'profile' && isAdmin && (
        <>
          <ProfileTab
            view={profileView}
            setView={setProfileView}
            shopSettings={shopSettings}
            setShopSettings={setShopSettings}
            theme={theme}
            setTheme={setTheme}
            categories={categories}
            links={links}
            announcements={announcements}
            setLinks={setLinks}
            setCategories={setCategories}
            setAnnouncements={setAnnouncements}
          />

          {profileView === 'menu' && (
            <div
              style={{
                maxWidth: 520,
                margin: '12px auto 0 auto',
              }}
            >
              <button
                onClick={resetAppData}
                style={{
                  width: '100%',
                  background: '#5a1f1f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  padding: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Reset App Data
              </button>
            </div>
          )}
        </>
      )}

      <BottomNav
        current={tab}
        setTab={setTab}
        isAdmin={isAdmin}
        theme={theme}
      />
    </div>
  )
}
