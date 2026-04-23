import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getRequiredEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) {
      return value
    }
  }

  throw new Error(`${names[0]} is required.`)
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
}

function getSupabaseAdminClient() {
  const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseKey = getRequiredEnv(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Geen bestand' }, { status: 400 })
    }

    const bucket = getRequiredEnv('SUPABASE_STORAGE_BUCKET')
    const supabase = getSupabaseAdminClient()
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filePath = `${Date.now()}-${sanitizeFileName(file.name)}`

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    console.error('Supabase upload error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
