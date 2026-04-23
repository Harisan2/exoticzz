'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  Announcement,
  Category,
  LinkItem,
  Product,
  ProfileView,
  ShopSettings,
  ThemeSettings,
} from '@/types/app'

async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const text = await res.text()
  let data: { error?: string; url?: string } = {}

  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    throw new Error(data.error || text || 'Upload failed')
  }

  return data.url as string
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/i.test(url)
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v|ogg|ogv)$/i.test(url)
}

export default function ProfileTab({
  view,
  setView,
  shopSettings,
  setShopSettings,
  theme,
  setTheme,
  categories,
  links,
  announcements,
  setLinks,
  setCategories,
  setAnnouncements,
}: {
  view: ProfileView
  setView: (view: ProfileView) => void
  shopSettings: ShopSettings
  setShopSettings: React.Dispatch<React.SetStateAction<ShopSettings>>
  theme: ThemeSettings
  setTheme: React.Dispatch<React.SetStateAction<ThemeSettings>>
  categories: Category[]
  links: LinkItem[]
  announcements: Announcement[]
  setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>
}) {
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null)

  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const [productTitle, setProductTitle] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productImage, setProductImage] = useState('')
  const [productVideo, setProductVideo] = useState('')
  const [productTags, setProductTags] = useState('')
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [editingProductCategoryId, setEditingProductCategoryId] = useState<number | null>(null)

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategoryTitle, setEditingCategoryTitle] = useState('')

  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false)
  const [isUploadingProductVideo, setIsUploadingProductVideo] = useState(false)

  const [savedImageDataUrl, setSavedImageDataUrl] = useState('')
  const [savedVideoDataUrl, setSavedVideoDataUrl] = useState('')

  const imagePreviewUrl = useMemo(() => {
    if (savedImageDataUrl) return savedImageDataUrl
    return productImage.trim()
  }, [savedImageDataUrl, productImage])

  const videoPreviewUrl = useMemo(() => {
    if (savedVideoDataUrl) return savedVideoDataUrl
    return productVideo.trim()
  }, [savedVideoDataUrl, productVideo])

  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkSubtitle, setLinkSubtitle] = useState('')
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null)

  const [brandingForm, setBrandingForm] = useState({
    shopName: shopSettings.shopName,
    shopDescription: shopSettings.shopDescription,
    shopLogoUrl: shopSettings.shopLogoUrl,
    adminAvatarUrl: shopSettings.adminAvatarUrl,
    backgroundColor: theme.backgroundColor,
    cardColor: theme.cardColor,
    cardBorderColor: theme.cardBorderColor,
    textColor: theme.textColor,
    mutedTextColor: theme.mutedTextColor,
    accentColor: theme.accentColor,
    accentTextColor: theme.accentTextColor,
    navColor: theme.navColor,
  })

  const [brandingLogoPreview, setBrandingLogoPreview] = useState('')
  const [brandingAvatarPreview, setBrandingAvatarPreview] = useState('')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    if (view === 'branding') {
      setBrandingForm({
        shopName: shopSettings.shopName,
        shopDescription: shopSettings.shopDescription,
        shopLogoUrl: shopSettings.shopLogoUrl,
        adminAvatarUrl: shopSettings.adminAvatarUrl,
        backgroundColor: theme.backgroundColor,
        cardColor: theme.cardColor,
        cardBorderColor: theme.cardBorderColor,
        textColor: theme.textColor,
        mutedTextColor: theme.mutedTextColor,
        accentColor: theme.accentColor,
        accentTextColor: theme.accentTextColor,
        navColor: theme.navColor,
      })
      setBrandingLogoPreview('')
      setBrandingAvatarPreview('')
    }
  }, [view, shopSettings, theme])

  useEffect(() => {
    if (view === 'product') {
      if (!selectedCategoryId && categories.length > 0) {
        setSelectedCategoryId(String(categories[0].id))
      }
    }
  }, [view, categories, selectedCategoryId])

  async function handleImageFileChange(file: File | null) {
    if (!file) {
      setSavedImageDataUrl('')
      return
    }

    try {
      setIsUploadingProductImage(true)
      const uploadedUrl = await uploadFile(file)
      setProductImage(uploadedUrl)
      setSavedImageDataUrl(uploadedUrl)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Product image upload mislukt')
    } finally {
      setIsUploadingProductImage(false)
    }
  }

  async function handleVideoFileChange(file: File | null) {
    if (!file) {
      setSavedVideoDataUrl('')
      return
    }

    try {
      setIsUploadingProductVideo(true)
      const uploadedUrl = await uploadFile(file)
      setProductVideo(uploadedUrl)
      setSavedVideoDataUrl(uploadedUrl)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Product video upload mislukt')
    } finally {
      setIsUploadingProductVideo(false)
    }
  }

  async function handleBrandingLogoFileChange(file: File | null) {
    if (!file) {
      setBrandingLogoPreview('')
      return
    }

    try {
      setIsUploadingLogo(true)
      const uploadedUrl = await uploadFile(file)
      setBrandingLogoPreview(uploadedUrl)
      setBrandingForm((prev) => ({ ...prev, shopLogoUrl: uploadedUrl }))
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Shop logo upload mislukt')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  async function handleBrandingAvatarFileChange(file: File | null) {
    if (!file) {
      setBrandingAvatarPreview('')
      return
    }

    try {
      setIsUploadingAvatar(true)
      const uploadedUrl = await uploadFile(file)
      setBrandingAvatarPreview(uploadedUrl)
      setBrandingForm((prev) => ({ ...prev, adminAvatarUrl: uploadedUrl }))
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Admin avatar upload mislukt')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  function resetAnnouncementForm() {
    setAnnouncementTitle('')
    setAnnouncementBody('')
    setEditingAnnouncementId(null)
  }

  function resetLinkForm() {
    setLinkTitle('')
    setLinkUrl('')
    setLinkSubtitle('')
    setEditingLinkId(null)
  }

  function resetProductForm() {
    setSelectedCategoryId(categories.length > 0 ? String(categories[0].id) : '')
    setNewCategoryTitle('')
    setProductTitle('')
    setProductDescription('')
    setProductImage('')
    setProductVideo('')
    setProductTags('')
    setSavedImageDataUrl('')
    setSavedVideoDataUrl('')
    setEditingProductId(null)
    setEditingProductCategoryId(null)
  }

  function resetCategoryEdit() {
    setEditingCategoryId(null)
    setEditingCategoryTitle('')
  }

  function saveBranding() {
    setShopSettings({
      shopName: brandingForm.shopName,
      shopDescription: brandingForm.shopDescription,
      shopLogoUrl: brandingLogoPreview || brandingForm.shopLogoUrl,
      adminAvatarUrl: brandingAvatarPreview || brandingForm.adminAvatarUrl,
    })

    setTheme({
      backgroundColor: brandingForm.backgroundColor,
      cardColor: brandingForm.cardColor,
      cardBorderColor: brandingForm.cardBorderColor,
      textColor: brandingForm.textColor,
      mutedTextColor: brandingForm.mutedTextColor,
      accentColor: brandingForm.accentColor,
      accentTextColor: brandingForm.accentTextColor,
      navColor: brandingForm.navColor,
    })

    setBrandingLogoPreview('')
    setBrandingAvatarPreview('')
    setView('menu')
  }

  function addOrUpdateAnnouncement() {
    if (!announcementTitle.trim() || !announcementBody.trim()) return

    if (editingAnnouncementId !== null) {
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === editingAnnouncementId
            ? {
                ...announcement,
                title: announcementTitle.trim(),
                body: announcementBody.trim(),
              }
            : announcement
        )
      )
      resetAnnouncementForm()
      return
    }

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title: announcementTitle.trim(),
      body: announcementBody.trim(),
      createdAt: new Date().toISOString(),
      isVisible: true,
    }

    setAnnouncements((prev) => [newAnnouncement, ...prev])
    resetAnnouncementForm()
  }

  function startEditAnnouncement(announcement: Announcement) {
    setAnnouncementTitle(announcement.title)
    setAnnouncementBody(announcement.body)
    setEditingAnnouncementId(announcement.id)
  }

  function toggleAnnouncementVisibility(announcementId: number) {
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === announcementId
          ? { ...announcement, isVisible: !announcement.isVisible }
          : announcement
      )
    )
  }

  function deleteAnnouncement(announcementId: number) {
    const confirmed = window.confirm('Weet je zeker dat je deze announcement wilt verwijderen?')
    if (!confirmed) return

    setAnnouncements((prev) =>
      prev.filter((announcement) => announcement.id !== announcementId)
    )

    if (editingAnnouncementId === announcementId) {
      resetAnnouncementForm()
    }
  }

  function addOrUpdateLink() {
    if (!linkTitle.trim() || !linkUrl.trim()) return

    if (editingLinkId !== null) {
      setLinks((prev) =>
        prev.map((link) =>
          link.id === editingLinkId
            ? {
                ...link,
                title: linkTitle.trim(),
                url: linkUrl.trim(),
                subtitle: linkSubtitle.trim(),
              }
            : link
        )
      )
      resetLinkForm()
      return
    }

    const newLink: LinkItem = {
      id: Date.now(),
      title: linkTitle.trim(),
      url: linkUrl.trim(),
      subtitle: linkSubtitle.trim(),
      isVisible: true,
    }

    setLinks((prev) => [newLink, ...prev])
    resetLinkForm()
  }

  function startEditLink(link: LinkItem) {
    setLinkTitle(link.title)
    setLinkUrl(link.url)
    setLinkSubtitle(link.subtitle)
    setEditingLinkId(link.id)
  }

  function toggleLinkVisibility(linkId: number) {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, isVisible: !link.isVisible } : link
      )
    )
  }

  function deleteLink(linkId: number) {
    const confirmed = window.confirm('Weet je zeker dat je deze link wilt verwijderen?')
    if (!confirmed) return

    setLinks((prev) => prev.filter((link) => link.id !== linkId))

    if (editingLinkId === linkId) {
      resetLinkForm()
    }
  }

  function addOrUpdateProduct() {
    const finalCategoryTitle = newCategoryTitle.trim()
    const hasExistingCategory = selectedCategoryId.trim() !== ''
    const hasNewCategory = finalCategoryTitle !== ''

    if (!productTitle.trim()) return
    if (!hasExistingCategory && !hasNewCategory) return

    const parsedTags = productTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const finalImage =
      savedImageDataUrl ||
      productImage.trim() ||
      'https://via.placeholder.com/110x110?text=Product'

    const finalVideo = savedVideoDataUrl || productVideo.trim() || undefined

    if (editingProductId !== null && editingProductCategoryId !== null) {
      setCategories((prev) => {
        let updated = prev.map((category) => ({
          ...category,
          products: category.products.filter((product) => product.id !== editingProductId),
        }))

        let targetCategoryId = editingProductCategoryId

        if (hasNewCategory) {
          const existingByName = updated.find(
            (category) => category.title.toLowerCase() === finalCategoryTitle.toLowerCase()
          )

          if (existingByName) {
            targetCategoryId = existingByName.id
          } else {
            const newCategory: Category = {
              id: Date.now() + 1,
              title: finalCategoryTitle,
              products: [],
              isVisible: true,
            }
            updated = [newCategory, ...updated]
            targetCategoryId = newCategory.id
          }
        } else if (selectedCategoryId) {
          targetCategoryId = Number(selectedCategoryId)
        }

        return updated.map((category) =>
          category.id === targetCategoryId
            ? {
                ...category,
                products: [
                  {
                    id: editingProductId,
                    title: productTitle.trim(),
                    description: productDescription.trim(),
                    image: finalImage,
                    video: finalVideo,
                    tags: parsedTags,
                    isVisible:
                      categories
                        .flatMap((c) => c.products)
                        .find((p) => p.id === editingProductId)?.isVisible ?? true,
                  },
                  ...category.products,
                ],
              }
            : category
        )
      })

      resetProductForm()
      return
    }

    const newProduct: Product = {
      id: Date.now(),
      title: productTitle.trim(),
      description: productDescription.trim(),
      image: finalImage,
      video: finalVideo,
      tags: parsedTags,
      isVisible: true,
    }

    setCategories((prev) => {
      if (hasNewCategory) {
        const existingByName = prev.find(
          (category) => category.title.toLowerCase() === finalCategoryTitle.toLowerCase()
        )

        if (existingByName) {
          return prev.map((category) =>
            category.id === existingByName.id
              ? { ...category, products: [newProduct, ...category.products] }
              : category
          )
        }

        const newCategory: Category = {
          id: Date.now() + 1,
          title: finalCategoryTitle,
          products: [newProduct],
          isVisible: true,
        }

        return [newCategory, ...prev]
      }

      return prev.map((category) =>
        String(category.id) === selectedCategoryId
          ? { ...category, products: [newProduct, ...category.products] }
          : category
      )
    })

    resetProductForm()
  }

  function startEditProduct(categoryId: number, product: Product) {
    setEditingProductId(product.id)
    setEditingProductCategoryId(categoryId)
    setSelectedCategoryId(String(categoryId))
    setNewCategoryTitle('')
    setProductTitle(product.title)
    setProductDescription(product.description)
    setProductImage(product.image)
    setProductVideo(product.video || '')
    setProductTags(product.tags.join(', '))
    setSavedImageDataUrl('')
    setSavedVideoDataUrl('')
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id)
    setEditingCategoryTitle(category.title)
  }

  function saveCategoryEdit() {
    if (editingCategoryId === null || !editingCategoryTitle.trim()) return

    setCategories((prev) =>
      prev.map((category) =>
        category.id === editingCategoryId
          ? { ...category, title: editingCategoryTitle.trim() }
          : category
      )
    )

    resetCategoryEdit()
  }

  function toggleProductVisibility(categoryId: number, productId: number) {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              products: category.products.map((product) =>
                product.id === productId
                  ? { ...product, isVisible: !product.isVisible }
                  : product
              ),
            }
          : category
      )
    )
  }

  function deleteProduct(categoryId: number, productId: number) {
    const confirmed = window.confirm('Weet je zeker dat je dit product wilt verwijderen?')
    if (!confirmed) return

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              products: category.products.filter((product) => product.id !== productId),
            }
          : category
      )
    )

    if (editingProductId === productId) {
      resetProductForm()
    }
  }

  function toggleCategoryVisibility(categoryId: number) {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, isVisible: !category.isVisible }
          : category
      )
    )
  }

  function deleteCategory(categoryId: number) {
    const confirmed = window.confirm('Weet je zeker dat je deze categorie wilt verwijderen?')
    if (!confirmed) return

    setCategories((prev) => prev.filter((category) => category.id !== categoryId))

    if (editingProductCategoryId === categoryId) {
      resetProductForm()
    }

    if (editingCategoryId === categoryId) {
      resetCategoryEdit()
    }
  }

  if (view === 'branding') {
    const currentLogoPreview = brandingLogoPreview || brandingForm.shopLogoUrl
    const currentAvatarPreview = brandingAvatarPreview || brandingForm.adminAvatarUrl

    return (
      <div style={{ paddingBottom: 110, maxWidth: 520, margin: '0 auto', color: theme.textColor }}>
        <div
          style={{
            background: theme.cardColor,
            borderRadius: 20,
            padding: 18,
            marginBottom: 18,
            border: `1px solid ${theme.cardBorderColor}`,
          }}
        >
          <button onClick={() => setView('menu')} style={backButtonStyle(theme)}>
            ← Back
          </button>

          <h2 style={{ margin: 0, fontSize: 24 }}>Branding & Theme</h2>
          <p style={descriptionStyle(theme)}>
            Hier beheer je shopnaam, avatars, logo en kleuren.
          </p>
        </div>

        <div style={panelStyle(theme)}>
          <input
            value={brandingForm.shopName}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, shopName: e.target.value }))}
            placeholder="Shop name"
            style={inputStyle(theme)}
          />

          <textarea
            rows={4}
            value={brandingForm.shopDescription}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, shopDescription: e.target.value }))}
            placeholder="Shop description"
            style={textareaStyle(theme)}
          />

          <input
            value={brandingForm.shopLogoUrl}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, shopLogoUrl: e.target.value }))}
            placeholder="Shop logo URL"
            style={inputStyle(theme)}
          />

          <label style={uploadLabelStyle(theme)}>
            {isUploadingLogo ? 'Uploading shop logo...' : 'Upload Shop Logo'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => void handleBrandingLogoFileChange(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </label>

          {currentLogoPreview ? (
            <img
              src={currentLogoPreview}
              alt="Shop logo preview"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `1px solid ${theme.cardBorderColor}`,
                alignSelf: 'center',
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: theme.navColor,
                border: `1px solid ${theme.cardBorderColor}`,
                alignSelf: 'center',
              }}
            />
          )}

          <input
            value={brandingForm.adminAvatarUrl}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, adminAvatarUrl: e.target.value }))}
            placeholder="Admin avatar URL"
            style={inputStyle(theme)}
          />

          <label style={uploadLabelStyle(theme)}>
            {isUploadingAvatar ? 'Uploading admin avatar...' : 'Upload Admin Avatar'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => void handleBrandingAvatarFileChange(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </label>

          {currentAvatarPreview ? (
            <img
              src={currentAvatarPreview}
              alt="Admin avatar preview"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `1px solid ${theme.cardBorderColor}`,
                alignSelf: 'center',
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: theme.navColor,
                border: `1px solid ${theme.cardBorderColor}`,
                alignSelf: 'center',
              }}
            />
          )}

          <input
            value={brandingForm.backgroundColor}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, backgroundColor: e.target.value }))}
            placeholder="Background color"
            style={inputStyle(theme)}
          />

          <input
            value={brandingForm.cardColor}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, cardColor: e.target.value }))}
            placeholder="Card color"
            style={inputStyle(theme)}
          />

          <input
            value={brandingForm.cardBorderColor}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, cardBorderColor: e.target.value }))}
            placeholder="Border color"
            style={inputStyle(theme)}
          />

          <input
            value={brandingForm.textColor}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, textColor: e.target.value }))}
            placeholder="Text color"
            style={inputStyle(theme)}
          />

          <input
            value={brandingForm.mutedTextColor}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, mutedTextColor: e.target.value }))}
            placeholder="Muted text color"
            style={inputStyle(theme)}
          />

          <input
            value={brandingForm.accentColor}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, accentColor: e.target.value }))}
            placeholder="Accent color"
            style={inputStyle(theme)}
          />

          <input
            value={brandingForm.accentTextColor}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, accentTextColor: e.target.value }))}
            placeholder="Accent text color"
            style={inputStyle(theme)}
          />

          <input
            value={brandingForm.navColor}
            onChange={(e) => setBrandingForm((prev) => ({ ...prev, navColor: e.target.value }))}
            placeholder="Nav color"
            style={inputStyle(theme)}
          />

          <button onClick={saveBranding} style={saveButtonStyle(theme)}>
            Save Changes
          </button>
        </div>
      </div>
    )
  }

  if (view === 'announcements') {
    return (
      <div style={{ paddingBottom: 110, maxWidth: 520, margin: '0 auto', color: theme.textColor }}>
        <HeaderCard
          title="Announcements"
          text="Voeg announcements toe en beheer zichtbaarheid op één plek."
          onBack={() => setView('menu')}
          theme={theme}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={panelStyle(theme)}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {editingAnnouncementId !== null ? 'Edit Announcement' : 'Add Announcement'}
            </div>

            <input
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="Titel"
              style={inputStyle(theme)}
            />

            <textarea
              rows={6}
              value={announcementBody}
              onChange={(e) => setAnnouncementBody(e.target.value)}
              placeholder="Bericht"
              style={textareaStyle(theme)}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={addOrUpdateAnnouncement} style={saveButtonStyle(theme)}>
                {editingAnnouncementId !== null ? 'Save Changes' : 'Publish Announcement'}
              </button>

              {editingAnnouncementId !== null && (
                <button onClick={resetAnnouncementForm} style={cancelButtonStyle(theme)}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                style={{
                  background: theme.cardColor,
                  border: `1px solid ${theme.cardBorderColor}`,
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                  {announcement.title}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: theme.mutedTextColor,
                    marginBottom: 8,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {announcement.body}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: theme.mutedTextColor,
                    marginBottom: 10,
                  }}
                >
                  {announcement.isVisible ? 'Announcement visible' : 'Announcement hidden'}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => startEditAnnouncement(announcement)} style={smallActionButtonStyle(theme)}>
                    Edit
                  </button>

                  <button onClick={() => toggleAnnouncementVisibility(announcement.id)} style={smallActionButtonStyle(theme)}>
                    {announcement.isVisible ? 'Hide' : 'Show'}
                  </button>

                  <button onClick={() => deleteAnnouncement(announcement.id)} style={smallDeleteButtonStyle()}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <div
                style={{
                  background: theme.cardColor,
                  border: `1px solid ${theme.cardBorderColor}`,
                  borderRadius: 16,
                  padding: 14,
                  color: theme.mutedTextColor,
                  fontSize: 13,
                }}
              >
                Nog geen announcements beschikbaar.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (view === 'product') {
    return (
      <div style={{ paddingBottom: 110, maxWidth: 520, margin: '0 auto', color: theme.textColor }}>
        <HeaderCard
          title="Products"
          text="Voeg producten toe en beheer categorieën en zichtbaarheid op één plek."
          onBack={() => setView('menu')}
          theme={theme}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={panelStyle(theme)}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {editingProductId !== null ? 'Edit Product' : 'Add Product'}
            </div>

            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={inputStyle(theme)}
            >
              {categories.length === 0 ? (
                <option value="">Geen categorieën</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.title}
                  </option>
                ))
              )}
            </select>

            <input
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
              placeholder="Of maak nieuwe categorie"
              style={inputStyle(theme)}
            />

            <input
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="Product titel"
              style={inputStyle(theme)}
            />

            <textarea
              rows={4}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Omschrijving"
              style={textareaStyle(theme)}
            />

            <input
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
              placeholder="Afbeelding URL (optioneel)"
              style={inputStyle(theme)}
            />

            <label style={uploadLabelStyle(theme)}>
              {isUploadingProductImage ? 'Uploading product image...' : 'Upload Bestand'}
              <input
                type="file"
                accept="*/*"
                onChange={(e) => void handleImageFileChange(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
            </label>

            {imagePreviewUrl &&
              (isImageUrl(imagePreviewUrl) ? (
                <img
                  src={imagePreviewUrl}
                  alt="Image preview"
                  style={{
                    width: '100%',
                    maxHeight: 240,
                    objectFit: 'cover',
                    borderRadius: 14,
                    border: `1px solid ${theme.cardBorderColor}`,
                  }}
                />
              ) : isVideoUrl(imagePreviewUrl) ? (
                <video
                  src={imagePreviewUrl}
                  controls
                  playsInline
                  style={{
                    width: '100%',
                    maxHeight: 280,
                    borderRadius: 14,
                    border: `1px solid ${theme.cardBorderColor}`,
                    background: '#000',
                  }}
                />
              ) : (
                <a
                  href={imagePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: theme.accentColor, wordBreak: 'break-all' }}
                >
                  Open geupload bestand
                </a>
              ))}

            <input
              value={productVideo}
              onChange={(e) => setProductVideo(e.target.value)}
              placeholder="Video URL (optioneel)"
              style={inputStyle(theme)}
            />

            <label style={uploadLabelStyle(theme)}>
              {isUploadingProductVideo ? 'Uploading product video...' : 'Upload Bestand'}
              <input
                type="file"
                accept="*/*"
                onChange={(e) => void handleVideoFileChange(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
            </label>

            {videoPreviewUrl &&
              (isVideoUrl(videoPreviewUrl) ? (
                <video
                  src={videoPreviewUrl}
                  controls
                  playsInline
                  style={{
                    width: '100%',
                    maxHeight: 280,
                    borderRadius: 14,
                    border: `1px solid ${theme.cardBorderColor}`,
                    background: '#000',
                  }}
                />
              ) : isImageUrl(videoPreviewUrl) ? (
                <img
                  src={videoPreviewUrl}
                  alt="Video field preview"
                  style={{
                    width: '100%',
                    maxHeight: 240,
                    objectFit: 'cover',
                    borderRadius: 14,
                    border: `1px solid ${theme.cardBorderColor}`,
                  }}
                />
              ) : (
                <a
                  href={videoPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: theme.accentColor, wordBreak: 'break-all' }}
                >
                  Open geupload bestand
                </a>
              ))}

            <input
              value={productTags}
              onChange={(e) => setProductTags(e.target.value)}
              placeholder="Tags, gescheiden door komma"
              style={inputStyle(theme)}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={addOrUpdateProduct} style={saveButtonStyle(theme)}>
                {editingProductId !== null ? 'Save Changes' : 'Save Product'}
              </button>

              {editingProductId !== null && (
                <button onClick={resetProductForm} style={cancelButtonStyle(theme)}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  background: theme.cardColor,
                  border: `1px solid ${theme.cardBorderColor}`,
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    marginBottom: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    {editingCategoryId === category.id ? (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <input
                          value={editingCategoryTitle}
                          onChange={(e) => setEditingCategoryTitle(e.target.value)}
                          style={inputStyle(theme)}
                          placeholder="Category name"
                        />
                        <button onClick={saveCategoryEdit} style={smallActionButtonStyle(theme)}>
                          Save
                        </button>
                        <button onClick={resetCategoryEdit} style={smallDeleteButtonStyle()}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{category.title}</div>
                        <div style={{ fontSize: 13, color: theme.mutedTextColor }}>
                          {category.isVisible ? 'Category visible' : 'Category hidden'}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {editingCategoryId !== category.id && (
                      <button onClick={() => startEditCategory(category)} style={smallActionButtonStyle(theme)}>
                        Edit Category
                      </button>
                    )}

                    <button onClick={() => toggleCategoryVisibility(category.id)} style={smallActionButtonStyle(theme)}>
                      {category.isVisible ? 'Hide Category' : 'Show Category'}
                    </button>

                    <button onClick={() => deleteCategory(category.id)} style={smallDeleteButtonStyle()}>
                      Delete Category
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {category.products.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        border: `1px solid ${theme.cardBorderColor}`,
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        {product.title}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: theme.mutedTextColor,
                          marginBottom: 10,
                        }}
                      >
                        {product.isVisible ? 'Visible' : 'Hidden'}
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => startEditProduct(category.id, product)} style={smallActionButtonStyle(theme)}>
                          Edit
                        </button>

                        <button onClick={() => toggleProductVisibility(category.id, product.id)} style={smallActionButtonStyle(theme)}>
                          {product.isVisible ? 'Hide' : 'Show'}
                        </button>

                        <button onClick={() => deleteProduct(category.id, product.id)} style={smallDeleteButtonStyle()}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {category.products.length === 0 && (
                    <div
                      style={{
                        color: theme.mutedTextColor,
                        fontSize: 13,
                      }}
                    >
                      Geen producten in deze categorie.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div
                style={{
                  background: theme.cardColor,
                  border: `1px solid ${theme.cardBorderColor}`,
                  borderRadius: 16,
                  padding: 14,
                  color: theme.mutedTextColor,
                  fontSize: 13,
                }}
              >
                Nog geen categorieën beschikbaar.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (view === 'links') {
    return (
      <div style={{ paddingBottom: 110, maxWidth: 520, margin: '0 auto', color: theme.textColor }}>
        <HeaderCard
          title="Links"
          text="Voeg links toe en beheer zichtbaarheid op één plek."
          onBack={() => setView('menu')}
          theme={theme}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={panelStyle(theme)}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {editingLinkId !== null ? 'Edit Link' : 'Add Link'}
            </div>

            <input
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Link titel"
              style={inputStyle(theme)}
            />

            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              style={inputStyle(theme)}
            />

            <input
              value={linkSubtitle}
              onChange={(e) => setLinkSubtitle(e.target.value)}
              placeholder="Korte omschrijving"
              style={inputStyle(theme)}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={addOrUpdateLink} style={saveButtonStyle(theme)}>
                {editingLinkId !== null ? 'Save Changes' : 'Save Link'}
              </button>

              {editingLinkId !== null && (
                <button onClick={resetLinkForm} style={cancelButtonStyle(theme)}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {links.map((link) => (
              <div
                key={link.id}
                style={{
                  background: theme.cardColor,
                  border: `1px solid ${theme.cardBorderColor}`,
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                  {link.title}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: theme.mutedTextColor,
                    marginBottom: 6,
                    wordBreak: 'break-all',
                  }}
                >
                  {link.url}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: theme.mutedTextColor,
                    marginBottom: 10,
                  }}
                >
                  {link.isVisible ? 'Link visible' : 'Link hidden'}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => startEditLink(link)} style={smallActionButtonStyle(theme)}>
                    Edit
                  </button>

                  <button onClick={() => toggleLinkVisibility(link.id)} style={smallActionButtonStyle(theme)}>
                    {link.isVisible ? 'Hide' : 'Show'}
                  </button>

                  <button onClick={() => deleteLink(link.id)} style={smallDeleteButtonStyle()}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {links.length === 0 && (
              <div
                style={{
                  background: theme.cardColor,
                  border: `1px solid ${theme.cardBorderColor}`,
                  borderRadius: 16,
                  padding: 14,
                  color: theme.mutedTextColor,
                  fontSize: 13,
                }}
              >
                Nog geen links beschikbaar.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 110, maxWidth: 520, margin: '0 auto', color: theme.textColor }}>
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
          {shopSettings.adminAvatarUrl ? (
            <img
              src={shopSettings.adminAvatarUrl}
              alt="Admin avatar"
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
              Beheer jouw app, styling en content.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ActionButton
          title="Branding & Theme"
          text="Pas shopnaam, logo, avatar en hoofdkleuren aan."
          onClick={() => setView('branding')}
          theme={theme}
        />

        <ActionButton
          title="Announcements"
          text="Voeg announcements toe en beheer zichtbaarheid."
          onClick={() => setView('announcements')}
          theme={theme}
        />

        <ActionButton
          title="Products"
          text="Voeg producten toe en beheer categorieën en zichtbaarheid."
          onClick={() => setView('product')}
          theme={theme}
        />

        <ActionButton
          title="Links"
          text="Voeg links toe en beheer zichtbaarheid."
          onClick={() => setView('links')}
          theme={theme}
        />
      </div>
    </div>
  )
}

function HeaderCard({
  title,
  text,
  onBack,
  theme,
}: {
  title: string
  text: string
  onBack: () => void
  theme: ThemeSettings
}) {
  return (
    <div
      style={{
        background: theme.cardColor,
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,
        border: `1px solid ${theme.cardBorderColor}`,
      }}
    >
      <button onClick={onBack} style={backButtonStyle(theme)}>
        ← Back
      </button>

      <h2 style={{ margin: 0, fontSize: 24 }}>{title}</h2>
      <p style={descriptionStyle(theme)}>{text}</p>
    </div>
  )
}

function ActionButton({
  title,
  text,
  onClick,
  theme,
}: {
  title: string
  text: string
  onClick: () => void
  theme: ThemeSettings
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: theme.cardColor,
        color: theme.textColor,
        border: `1px solid ${theme.cardBorderColor}`,
        borderRadius: 16,
        padding: 16,
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: theme.mutedTextColor, lineHeight: 1.4 }}>{text}</div>
    </button>
  )
}

function panelStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    background: theme.cardColor,
    border: `1px solid ${theme.cardBorderColor}`,
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }
}

function backButtonStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    marginBottom: 14,
    background: 'transparent',
    border: 'none',
    color: theme.mutedTextColor,
    fontSize: 14,
    cursor: 'pointer',
    padding: 0,
  }
}

function descriptionStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    marginTop: 8,
    color: theme.mutedTextColor,
    fontSize: 13,
    lineHeight: 1.4,
  }
}

function inputStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    background: theme.navColor,
    border: `1px solid ${theme.cardBorderColor}`,
    borderRadius: 12,
    padding: 14,
    color: theme.textColor,
    fontSize: 14,
    outline: 'none',
  }
}

function textareaStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    background: theme.navColor,
    border: `1px solid ${theme.cardBorderColor}`,
    borderRadius: 12,
    padding: 14,
    color: theme.textColor,
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
  }
}

function saveButtonStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    background: theme.accentColor,
    color: theme.accentTextColor,
    border: 'none',
    borderRadius: 12,
    padding: 14,
    fontWeight: 700,
    cursor: 'pointer',
  }
}

function cancelButtonStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    background: theme.navColor,
    color: theme.textColor,
    border: `1px solid ${theme.cardBorderColor}`,
    borderRadius: 12,
    padding: 14,
    fontWeight: 700,
    cursor: 'pointer',
  }
}

function smallActionButtonStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    background: theme.accentColor,
    color: theme.accentTextColor,
    border: 'none',
    borderRadius: 10,
    padding: '10px 12px',
    fontWeight: 700,
    cursor: 'pointer',
  }
}

function smallDeleteButtonStyle(): React.CSSProperties {
  return {
    background: '#5a1f1f',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 12px',
    fontWeight: 700,
    cursor: 'pointer',
  }
}

function uploadLabelStyle(theme: ThemeSettings): React.CSSProperties {
  return {
    background: theme.navColor,
    border: `1px dashed ${theme.cardBorderColor}`,
    borderRadius: 12,
    padding: 14,
    color: theme.textColor,
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: 700,
  }
}
