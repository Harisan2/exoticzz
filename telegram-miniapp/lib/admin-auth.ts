import { createHash, timingSafeEqual } from 'node:crypto'

const ADMIN_ACCESS_COOKIE = 'telegram-miniapp-admin-access'
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required.`)
  }

  return value
}

export function getAdminPassword() {
  return getRequiredEnv('ADMIN_PASSWORD')
}

export function getAdminTelegramIds() {
  const raw = process.env.ADMIN_TELEGRAM_IDS?.trim()

  if (!raw) {
    return []
  }

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

export function isTelegramAdmin(telegramUserId: string | null | undefined) {
  if (!telegramUserId) {
    return false
  }

  return getAdminTelegramIds().includes(String(telegramUserId))
}

export function getAdminAccessCookieName() {
  return ADMIN_ACCESS_COOKIE
}

export function getAdminSessionMaxAge() {
  return ADMIN_SESSION_MAX_AGE
}

export function createAdminSessionValue() {
  return hashValue(getAdminPassword())
}

export function hasValidAdminSession(cookieValue: string | undefined) {
  if (!cookieValue) {
    return false
  }

  const actual = Buffer.from(cookieValue)
  const expected = Buffer.from(createAdminSessionValue())

  if (actual.length !== expected.length) {
    return false
  }

  return timingSafeEqual(actual, expected)
}

export function isValidAdminPassword(password: string | null | undefined) {
  if (!password) {
    return false
  }

  const actual = Buffer.from(password)
  const expected = Buffer.from(getAdminPassword())

  if (actual.length !== expected.length) {
    return false
  }

  return timingSafeEqual(actual, expected)
}
