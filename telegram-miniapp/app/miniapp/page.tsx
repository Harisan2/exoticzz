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

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      ready?: () => void
      initDataUnsafe?: {
        user?: {
          id?: number
        }
      }
    }
  }
}

type AppStorage = {
  theme: ThemeSettings
  shopSettings: ShopSettings
  links: LinkItem[]
  categories: Category[]
  announcements: Announcement[]
}

type AdminAccessState = {
  isAdminByTelegram: boolean
  hasPasswordAccess: boolean
  canAccessAdmin: boolean
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

function getTelegramUserId() {
  if (typeof window === 'undefined') {
    return null
  }

  const telegramWindow = window as TelegramWindow
  return telegramWindow.Telegram?.WebApp?.initDataUnsafe?.user?.id
    ? String(telegramWindow.Telegram?.WebApp?.initDataUnsafe?.user?.id)
    : null
}

export default function MiniApp() {
  const [tab, setTab] = useState<Tab>('shop')
  const [profileView, setProfileView] = useState<ProfileView>('menu')

  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [shopSettings, setShopSettings] = useState<ShopSettings>(defaultShopSettings)
  const [links, setLinks] = useState<LinkItem[]>(defaultLinks)
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements)

  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)
  const [telegramUserId, setTelegramUserId] = useState<string | null>(null)
  const [adminAccess, setAdminAccess] = useState<AdminAccessState>({
    isAdminByTelegram: false,
    hasPasswordAccess: false,
    canAccessAdmin: false,
  })
  const [isAdminPromptOpen, setIsAdminPromptOpen] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [adminPasswordError, setAdminPasswordError] = useState('')
  const [isSubmittingAdminPassword, setIsSubmittingAdminPassword] = useState(false)

  async function refreshAdminAccessStatus(nextTelegramUserId: string | null) {
    try {
      const params = new URLSearchParams()

      if (nextTelegramUserId) {
        params.set('telegramUserId', nextTelegramUserId)
      }

      const response = await fetch(`/api/admin/access?${params.toString()}`, {
        cache: 'no-store',
      })

      const data = (await response.json()) as AdminAccessState
      setAdminAccess(data)
      return data
    } catch (error) {
      console.error('Fout bij ophalen admin status:', error)
      return null
    }
  }

  useEffect(() => {
    const detectedTelegramUserId = getTelegramUserId()
    setTelegramUserId(detectedTelegramUserId)
    void refreshAdminAccessStatus(detectedTelegramUserId)
  }, [])

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
    if (!adminAccess.canAccessAdmin && tab === 'profile') {
      setTab('shop')
    }
  }, [adminAccess.canAccessAdmin, tab])

  useEffect(() => {
    if (tab !== 'profile') {
      setProfileView('menu')
    }
  }, [tab])

  function openAdminPrompt() {
    setAdminPasswordError('')
    setAdminPasswordInput('')
    setIsAdminPromptOpen(true)
  }

  async function handleAdminAccessRequest() {
    if (adminAccess.canAccessAdmin) {
      setTab('profile')
      return
    }

    openAdminPrompt()
  }

  async function submitAdminPassword() {
    try {
      setIsSubmittingAdminPassword(true)
      setAdminPasswordError('')

      const response = await fetch('/api/admin/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: adminPasswordInput,
          telegramUserId,
        }),
      })

      const data = (await response.json()) as
        | (AdminAccessState & { error?: string })
        | { error?: string }

      if (!response.ok) {
        throw new Error('error' in data ? data.error || 'Admin toegang mislukt' : 'Admin toegang mislukt')
      }

      setAdminAccess({
        isAdminByTelegram: 'isAdminByTelegram' in data ? data.isAdminByTelegram : false,
        hasPasswordAccess: 'hasPasswordAccess' in data ? data.hasPasswordAccess : true,
        canAccessAdmin: 'canAccessAdmin' in data ? data.canAccessAdmin : true,
      })
      setIsAdminPromptOpen(false)
      setAdminPasswordInput('')
      setTab('profile')
    } catch (error) {
      setAdminPasswordError(error instanceof Error ? error.message : 'Admin toegang mislukt')
    } finally {
      setIsSubmittingAdminPassword(false)
    }
  }

  async function logoutPasswordAccess() {
    try {
      const params = new URLSearchParams()

      if (telegramUserId) {
        params.set('telegramUserId', telegramUserId)
      }

      await fetch(`/api/admin/access?${params.toString()}`, {
        method: 'DELETE',
      })

      const nextState = await refreshAdminAccessStatus(telegramUserId)

      if (!nextState?.canAccessAdmin) {
        setTab('shop')
      }
    } catch (error) {
      console.error('Fout bij uitloggen admin toegang:', error)
    }
  }

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
          isAdmin={adminAccess.canAccessAdmin}
        />
      )}

      {tab === 'profile' && adminAccess.canAccessAdmin && (
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
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
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

              {adminAccess.hasPasswordAccess && !adminAccess.isAdminByTelegram && (
                <button
                  onClick={logoutPasswordAccess}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: theme.mutedTextColor,
                    border: `1px solid ${theme.cardBorderColor}`,
                    borderRadius: 16,
                    padding: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Vergrendel Admin Toegang
                </button>
              )}
            </div>
          )}
        </>
      )}

      {isAdminPromptOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: theme.cardColor,
              border: `1px solid ${theme.cardBorderColor}`,
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 20px 80px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Admin Toegang
            </div>

            <div
              style={{
                color: theme.mutedTextColor,
                fontSize: 14,
                lineHeight: 1.45,
                marginBottom: 14,
              }}
            >
              Deze sectie is beveiligd. Voer het admin wachtwoord in om de profile-tab te openen.
            </div>

            <input
              type="password"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void submitAdminPassword()
                }
              }}
              placeholder="Admin wachtwoord"
              style={{
                width: '100%',
                background: '#0f0f0f',
                color: theme.textColor,
                border: `1px solid ${theme.cardBorderColor}`,
                borderRadius: 14,
                padding: '14px 16px',
                fontSize: 16,
                outline: 'none',
                marginBottom: 12,
              }}
            />

            {adminPasswordError && (
              <div
                style={{
                  color: '#ff8c8c',
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {adminPasswordError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setIsAdminPromptOpen(false)
                  setAdminPasswordError('')
                  setAdminPasswordInput('')
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: theme.mutedTextColor,
                  border: `1px solid ${theme.cardBorderColor}`,
                  borderRadius: 14,
                  padding: '13px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => void submitAdminPassword()}
                disabled={!adminPasswordInput.trim() || isSubmittingAdminPassword}
                style={{
                  flex: 1,
                  background: theme.accentColor,
                  color: theme.accentTextColor,
                  border: 'none',
                  borderRadius: 14,
                  padding: '13px 16px',
                  fontWeight: 700,
                  cursor: !adminPasswordInput.trim() || isSubmittingAdminPassword ? 'not-allowed' : 'pointer',
                  opacity: !adminPasswordInput.trim() || isSubmittingAdminPassword ? 0.6 : 1,
                }}
              >
                {isSubmittingAdminPassword ? 'Controleren...' : 'Open Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav
        current={tab}
        setTab={setTab}
        canAccessAdmin={adminAccess.canAccessAdmin}
        onRequestAdminAccess={() => void handleAdminAccessRequest()}
        theme={theme}
      />
    </div>
  )
}
