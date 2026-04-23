'use client'

import { useMemo, useState } from 'react'
import type { Announcement, Category, ShopSettings, ThemeSettings } from '@/types/app'

function isImageUrl(url: string) {
  if (!url) return false
  if (url.startsWith('data:image/')) return true

  try {
    const parsedUrl = new URL(url)
    if (/(via\.placeholder\.com|placehold\.co)$/i.test(parsedUrl.host)) {
      return true
    }
    return /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/i.test(parsedUrl.pathname)
  } catch {
    return /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/i.test(url)
  }
}

function isVideoUrl(url: string) {
  if (!url) return false
  if (url.startsWith('data:video/')) return true

  try {
    return /\.(mp4|webm|mov|m4v|ogg|ogv)$/i.test(new URL(url).pathname)
  } catch {
    return /\.(mp4|webm|mov|m4v|ogg|ogv)$/i.test(url)
  }
}

function renderMediaTile({
  url,
  alt,
  theme,
}: {
  url: string
  alt: string
  theme: ThemeSettings
}) {
  const baseStyle: React.CSSProperties = {
    width: 112,
    height: 112,
    borderRadius: 16,
    background: '#1b1b1b',
    border: `1px solid ${theme.cardBorderColor}`,
    display: 'block',
    overflow: 'hidden',
  }

  if (!url) {
    return <div style={baseStyle} />
  }

  if (isImageUrl(url)) {
    return (
      <img
        src={url}
        alt={alt}
        style={{
          ...baseStyle,
          objectFit: 'cover',
        }}
      />
    )
  }

  if (isVideoUrl(url)) {
    return (
      <video
        src={url}
        playsInline
        muted
        preload="metadata"
        style={{
          ...baseStyle,
          objectFit: 'cover',
          background: '#000',
        }}
      />
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        ...baseStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        textDecoration: 'none',
        color: theme.accentTextColor,
        fontSize: 12,
        fontWeight: 700,
        padding: 12,
      }}
    >
      Open file
    </a>
  )
}

export default function ShopTab({
  categories,
  announcements,
  shopSettings,
  theme,
  isAdmin,
}: {
  categories: Category[]
  announcements: Announcement[]
  shopSettings: ShopSettings
  theme: ThemeSettings
  isAdmin: boolean
}) {
  const [openCategories, setOpenCategories] = useState<number[] | null>(null)

  const visibleCategories = useMemo(() => {
    if (isAdmin) {
      return categories
    }

    return categories
      .filter((category) => category.isVisible)
      .map((category) => ({
        ...category,
        products: category.products.filter((product) => product.isVisible),
      }))
  }, [categories, isAdmin])

  const visibleAnnouncements = announcements.filter(
    (announcement) => announcement.isVisible
  )

  const resolvedOpenCategories =
    openCategories ?? (visibleCategories.length > 0 ? [visibleCategories[0].id] : [])

  function toggleCategory(categoryId: number) {
    setOpenCategories((prev) =>
      (prev ?? (visibleCategories.length > 0 ? [visibleCategories[0].id] : [])).includes(categoryId)
        ? (prev ?? (visibleCategories.length > 0 ? [visibleCategories[0].id] : [])).filter((id) => id !== categoryId)
        : [...(prev ?? (visibleCategories.length > 0 ? [visibleCategories[0].id] : [])), categoryId]
    )
  }

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
              {shopSettings.shopName}
            </h2>

            <p
              style={{
                margin: '6px 0 0 0',
                color: theme.mutedTextColor,
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              {shopSettings.shopDescription}
            </p>
          </div>
        </div>
      </div>

      {visibleAnnouncements.length > 0 && (
        <div
          style={{
            background: theme.cardColor,
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
            border: `1px solid ${theme.cardBorderColor}`,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: theme.accentTextColor,
              background: theme.accentColor,
              display: 'inline-block',
              padding: '6px 10px',
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            Latest Announcement
          </div>

          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            {visibleAnnouncements[0].title}
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.45,
              color: theme.mutedTextColor,
              whiteSpace: 'pre-wrap',
            }}
          >
            {visibleAnnouncements[0].body}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {visibleCategories.map((category) => {
          const isCategoryOpen = resolvedOpenCategories.includes(category.id)

          return (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                style={{
                  width: '100%',
                  background: theme.cardColor,
                  color: theme.textColor,
                  border: `1px solid ${theme.cardBorderColor}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: category.isVisible ? 1 : 0.65,
                }}
              >
                <span>
                  {category.title}
                  {isAdmin && !category.isVisible ? ' · hidden' : ''}
                </span>
                <span style={{ fontSize: 14 }}>{isCategoryOpen ? '▲' : '▼'}</span>
              </button>

              {isCategoryOpen && (
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {category.products.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        background: theme.cardColor,
                        borderRadius: 16,
                        padding: 12,
                        border: `1px solid ${theme.cardBorderColor}`,
                        position: 'relative',
                        opacity: product.isVisible ? 1 : 0.75,
                      }}
                    >
                      {isAdmin && !product.isVisible && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.45)',
                            borderRadius: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 8,
                            zIndex: 2,
                            pointerEvents: 'none',
                          }}
                        >
                          <div style={{ fontSize: 34 }}>🙈</div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#fff',
                              background: 'rgba(0,0,0,0.45)',
                              padding: '6px 10px',
                              borderRadius: 8,
                            }}
                          >
                            Hidden for customers
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          alignItems: 'stretch',
                        }}
                      >
                        <div
                          style={{
                            width: 112,
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          {renderMediaTile({
                            url: product.image || product.video || '',
                            alt: product.title,
                            theme,
                          })}

                          {product.video && (
                            <a
                              href={product.video}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: 'rgba(23,59,136,0.18)',
                                color: theme.accentTextColor,
                                border: `1px solid rgba(23,59,136,0.45)`,
                                borderRadius: 999,
                                padding: '8px 10px',
                                fontSize: 12,
                                fontWeight: 700,
                                textDecoration: 'none',
                                textAlign: 'center',
                              }}
                            >
                              Open video
                            </a>
                          )}

                          {!product.video && product.image && !isImageUrl(product.image) && !isVideoUrl(product.image) && (
                            <div
                              style={{
                                color: theme.mutedTextColor,
                                fontSize: 11,
                                textAlign: 'center',
                                lineHeight: 1.35,
                              }}
                            >
                              Extern bestand
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 10,
                          }}
                        >
                          <div>
                            <h4
                              style={{
                                margin: 0,
                                fontSize: 18,
                                lineHeight: 1.15,
                                wordBreak: 'break-word',
                                color: theme.textColor,
                              }}
                            >
                              {product.title}
                            </h4>

                            <p
                              style={{
                                marginTop: 8,
                                marginBottom: 0,
                                color: theme.mutedTextColor,
                                fontSize: 14,
                                lineHeight: 1.45,
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-line',
                              }}
                            >
                              {product.description}
                            </p>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 6,
                            }}
                          >
                            {product.tags.map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  background: theme.accentColor,
                                  color: theme.accentTextColor,
                                  padding: '6px 10px',
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  lineHeight: 1,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {category.products.length === 0 && (
                    <div
                      style={{
                        background: theme.cardColor,
                        borderRadius: 16,
                        padding: 12,
                        border: `1px solid ${theme.cardBorderColor}`,
                        color: theme.mutedTextColor,
                        fontSize: 13,
                      }}
                    >
                      {isAdmin
                        ? 'Geen producten in deze categorie.'
                        : 'Nog geen zichtbare producten in deze categorie.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {visibleCategories.length === 0 && (
          <div
            style={{
              background: theme.cardColor,
              borderRadius: 16,
              padding: 12,
              border: `1px solid ${theme.cardBorderColor}`,
              color: theme.mutedTextColor,
              fontSize: 13,
            }}
          >
            {isAdmin ? 'Nog geen categorieën.' : 'Nog geen zichtbare categorieën.'}
          </div>
        )}
      </div>
    </div>
  )
}
