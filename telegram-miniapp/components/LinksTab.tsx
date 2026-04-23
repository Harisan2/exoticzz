import type { LinkItem, ShopSettings, ThemeSettings } from '@/types/app'

export default function LinksTab({
  links,
  shopSettings,
  theme,
}: {
  links: LinkItem[]
  shopSettings: ShopSettings
  theme: ThemeSettings
}) {
  const visibleLinks = links.filter((link) => link.isVisible)

  return (
    <div
      style={{
        paddingBottom: 110,
        maxWidth: 520,
        margin: '0 auto',
        color: theme.textColor,
      }}
    >
      <div
        style={{
          background: theme.cardColor,
          borderRadius: 20,
          padding: 18,
          marginBottom: 18,
          border: `1px solid ${theme.cardBorderColor}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {shopSettings.shopLogoUrl ? (
            <img
              src={shopSettings.shopLogoUrl}
              alt="Shop logo"
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                background: '#2a2a2a',
                flexShrink: 0,
              }}
            />
          )}

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                lineHeight: 1.1,
              }}
            >
              Links
            </h2>

            <p
              style={{
                margin: '6px 0 0 0',
                color: theme.mutedTextColor,
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              Belangrijke links van {shopSettings.shopName}.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visibleLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
              color: theme.textColor,
              background: theme.cardColor,
              border: `1px solid ${theme.cardBorderColor}`,
              borderRadius: 16,
              padding: 16,
              display: 'block',
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              {link.title}
            </div>

            <div
              style={{
                fontSize: 13,
                color: theme.mutedTextColor,
                lineHeight: 1.4,
              }}
            >
              {link.subtitle}
            </div>
          </a>
        ))}

        {visibleLinks.length === 0 && (
          <div
            style={{
              background: theme.cardColor,
              border: `1px solid ${theme.cardBorderColor}`,
              borderRadius: 16,
              padding: 16,
              color: theme.mutedTextColor,
              fontSize: 13,
            }}
          >
            Nog geen zichtbare links.
          </div>
        )}
      </div>
    </div>
  )
}