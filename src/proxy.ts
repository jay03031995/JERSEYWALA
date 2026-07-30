import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RSC_VARY = 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept-Encoding'

function noStore(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0')
  res.headers.set('Vary', RSC_VARY)
  return res
}

function withRscVary(res: NextResponse): NextResponse {
  const existing = res.headers.get('Vary')
  res.headers.set('Vary', existing && existing.includes('RSC') ? existing : RSC_VARY)
  return res
}

function isProtected(pathname: string): boolean {
  return (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/checkout')
  )
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Non-protected pages: just fix the cache key so RSC and HTML variants
  // don't share a slot in the upstream CDN.
  if (!isProtected(pathname)) {
    return withRscVary(NextResponse.next({ request }))
  }

  // From here on, we know the path is auth-related — do the Supabase work.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return noStore(NextResponse.next({ request }))
  }

  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    return noStore(NextResponse.next({ request }))
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return noStore(NextResponse.redirect(new URL('/auth/login', request.url)))
    }
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        return noStore(NextResponse.redirect(new URL('/', request.url)))
      }
    } catch {
      return noStore(NextResponse.redirect(new URL('/', request.url)))
    }
  }

  if (pathname.startsWith('/account') || pathname.startsWith('/orders')) {
    if (!user) {
      return noStore(NextResponse.redirect(new URL('/auth/login', request.url)))
    }
  }

  return noStore(supabaseResponse)
}

export const config = {
  matcher: [
    // Run on every page request EXCEPT next-static assets, files with an
    // extension under /api, and our public files (icons, robots, sitemap,
    // feed). That way RSC vs HTML cache keys are kept distinct everywhere.
    '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|feed.xml).*)',
  ],
}
