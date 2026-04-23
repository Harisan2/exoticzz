'use client'

import type { Tab, ThemeSettings } from '@/types/app'

export default function BottomNav({
  current,
  setTab,
  canAccessAdmin,
  onRequestAdminAccess,
  theme,
}: {
  current: Tab
  setTab: (tab: Tab) => void
  canAccessAdmin: boolean
  onRequestAdminAccess: () => void
  theme: ThemeSettings
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: theme.navColor,
        padding: 12,
        borderRadius: 20,
        display: 'flex',
        gap: 20,
        border: `1px solid ${theme.cardBorderColor}`,
      }}
    >
      <button
        onClick={() => setTab('links')}
        style={{
          background: 'transparent',
          color: current === 'links' ? theme.textColor : theme.mutedTextColor,
          border: 'none',
          fontWeight: current === 'links' ? 'bold' : 'normal',
          cursor: 'pointer',
        }}
      >
        Links
      </button>

      <button
        onClick={() => setTab('shop')}
        style={{
          background: 'transparent',
          color: current === 'shop' ? theme.textColor : theme.mutedTextColor,
          border: 'none',
          fontWeight: current === 'shop' ? 'bold' : 'normal',
          cursor: 'pointer',
        }}
      >
        Shop
      </button>

      {canAccessAdmin ? (
        <button
          onClick={() => setTab('profile')}
          style={{
            background: 'transparent',
            color: current === 'profile' ? theme.textColor : theme.mutedTextColor,
            border: 'none',
            fontWeight: current === 'profile' ? 'bold' : 'normal',
            cursor: 'pointer',
          }}
        >
          Profile
        </button>
      ) : (
        <button
          onClick={onRequestAdminAccess}
          style={{
            background: 'transparent',
            color: theme.mutedTextColor,
            border: 'none',
            fontWeight: 'normal',
            cursor: 'pointer',
          }}
        >
          Admin
        </button>
      )}
    </div>
  )
}
