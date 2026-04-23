import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  createAdminSessionValue,
  getAdminAccessCookieName,
  getAdminSessionMaxAge,
  hasValidAdminSession,
  isTelegramAdmin,
  isValidAdminPassword,
} from '@/lib/admin-auth'

function getStatus(telegramUserId: string | null | undefined, cookieValue: string | undefined) {
  const isAdminByTelegram = isTelegramAdmin(telegramUserId)
  const hasPasswordAccess = hasValidAdminSession(cookieValue)

  return {
    isAdminByTelegram,
    hasPasswordAccess,
    canAccessAdmin: isAdminByTelegram || hasPasswordAccess,
  }
}

export async function GET(req: NextRequest) {
  const telegramUserId = req.nextUrl.searchParams.get('telegramUserId')
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(getAdminAccessCookieName())?.value

  return NextResponse.json(getStatus(telegramUserId, cookieValue))
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    password?: string
    telegramUserId?: string | number | null
  }

  const telegramUserId = body.telegramUserId ? String(body.telegramUserId) : null

  if (isTelegramAdmin(telegramUserId)) {
    return NextResponse.json({
      isAdminByTelegram: true,
      hasPasswordAccess: false,
      canAccessAdmin: true,
    })
  }

  if (!isValidAdminPassword(body.password)) {
    return NextResponse.json({ error: 'Onjuist wachtwoord' }, { status: 401 })
  }

  const response = NextResponse.json({
    isAdminByTelegram: false,
    hasPasswordAccess: true,
    canAccessAdmin: true,
  })

  response.cookies.set({
    name: getAdminAccessCookieName(),
    value: createAdminSessionValue(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: getAdminSessionMaxAge(),
  })

  return response
}

export async function DELETE(req: NextRequest) {
  const telegramUserId = req.nextUrl.searchParams.get('telegramUserId')
  const response = NextResponse.json({
    isAdminByTelegram: isTelegramAdmin(telegramUserId),
    hasPasswordAccess: false,
    canAccessAdmin: isTelegramAdmin(telegramUserId),
  })

  response.cookies.set({
    name: getAdminAccessCookieName(),
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })

  return response
}
