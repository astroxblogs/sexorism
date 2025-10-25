'use client'

import { useEffect, useState, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdSenseProps {
  slot: string
  style?: React.CSSProperties
  className?: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
}

/** Read a cookie on the client safely */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : null
}

/** Decide which site we are on: 'main' (.com) or 'in' (.in) */
function detectSiteId(): 'main' | 'in' {
  // Primary source: middleware-set cookie
  const byCookie = getCookie('SITE_ID')
  if (byCookie === 'main' || byCookie === 'in') return byCookie as 'main' | 'in'

  // Fallback: hostname check
  if (typeof window !== 'undefined') {
    const host = (window.location.host || '').toLowerCase()
    if (host.endsWith('innvibs.com')) return 'main'
    if (host.endsWith('innvibs.in')) return 'in'
  }
  // Default safe fallback: treat as .com
  return 'main'
}

export default function AdSense({
  slot,
  style = {},
  className = '',
  format = 'auto',
  responsive = true
}: AdSenseProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)

  // Determine site once on mount
  const [siteId, setSiteId] = useState<'main' | 'in'>('main')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsClient(true)
    setSiteId(detectSiteId())
  }, [])

  // ---- MAIN SITE (.com) → Google AdSense (existing behavior) ----
  useEffect(() => {
    if (!isClient) return
    if (siteId !== 'main') return // skip AdSense on .in

    // If AdSense is already present, try push immediately
    if (window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        setIsLoaded(true)
      } catch (err) {
        console.error('AdSense initialization error:', err)
        setError(true)
      }
      return
    }

    // Check if script tag is already in DOM (layout.tsx also loads it on .com)
    const existingScript = document.querySelector(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    )
    if (existingScript) {
      // When it finishes, push
      const onLoad = () => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
          setIsLoaded(true)
        } catch (err) {
          console.error('AdSense push error:', err)
          setError(true)
        }
      }
      if ((existingScript as HTMLScriptElement).async) {
        existingScript.addEventListener('load', onLoad, { once: true })
      } else {
        onLoad()
      }
      return
    }

    // Fallback: load script ourselves (kept from your original component)
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    // ✅ Use your real publisher ID here; safe even if layout already loaded (we guard above)
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4112734313230332'

    script.onload = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        setIsLoaded(true)
      } catch (err) {
        console.error('AdSense initialization error:', err)
        setError(true)
      }
    }

    script.onerror = () => {
      console.error('Failed to load AdSense script')
      setError(true)
    }

    document.head?.appendChild(script)

    // No cleanup needed
  }, [isClient, siteId])

  // ---- IN SITE (.in) → Alternate ad network (optional, via env) ----
  useEffect(() => {
    if (!isClient) return
    if (siteId !== 'in') return

    const altScript = (process.env.NEXT_PUBLIC_ALT_AD_SCRIPT || '').trim()
    if (!altScript) {
      // No alternate script configured → fail silently (no ads)
      return
    }

    // If already present, don't inject again
    const existing = document.querySelector(`script[src="${altScript}"]`)
    if (existing) return

    const s = document.createElement('script')
    s.async = true
    s.src = altScript
    s.onload = () => {
      // Some networks need a global hydrate call; leave no-op here for safety.
      // If your provider requires an explicit init, you can call it here.
    }
    s.onerror = () => {
      console.error('Failed to load alternate ad script:', altScript)
    }
    document.head?.appendChild(s)
  }, [isClient, siteId])

  // Never render on server, or if AdSense errored on .com
  if (!isClient || error) {
    return null
  }

  // ---- Render containers per site ----
  if (siteId === 'main') {
    // Google AdSense container (unchanged, but with your real client)
    return (
      <div className={`adsense-container ${className}`} ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            ...style
          }}
          data-ad-client="ca-pub-4112734313230332"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive.toString()}
        />
      </div>
    )
  }

  // siteId === 'in' → render a generic container the alternate script can fill
  // Many networks look for a specific class and a data-attr with slot/placement id.
  const dataKey = (process.env.NEXT_PUBLIC_ALT_AD_DATA_KEY || 'slot').trim()
  const altClass = (process.env.NEXT_PUBLIC_ALT_AD_CONTAINER_CLASS || 'alt-ad').trim()

  // Build props with dynamic data-* key (e.g., data-slot="..."):
  const dataAttrName = `data-${dataKey}`
  const altProps: Record<string, any> = {
    className: `${altClass} ${className}`.trim(),
    style: { display: 'block', ...style },
  }
  altProps[dataAttrName] = slot

  return <div {...altProps} />
}

// Predefined ad components for common placements (unchanged)
export function HeaderAd() {
  return (
    <AdSense
      slot="HEADER_AD_SLOT_ID" // Replace with your actual slot ID
      format="horizontal"
      className="mb-6"
      style={{ minHeight: '90px' }}
    />
  )
}

export function SidebarAd() {
  return (
    <AdSense
      slot="SIDEBAR_AD_SLOT_ID" // Replace with your actual slot ID
      format="vertical"
      className="mb-6"
      style={{ minHeight: '250px' }}
    />
  )
}

export function ContentAd() {
  return (
    <AdSense
      slot="CONTENT_AD_SLOT_ID" // Replace with your actual slot ID
      format="rectangle"
      className="my-8 mx-auto"
      style={{ minHeight: '250px', maxWidth: '300px' }}
    />
  )
}

export function FooterAd() {
  return (
    <AdSense
      slot="FOOTER_AD_SLOT_ID" // Replace with your actual slot ID
      format="horizontal"
      className="mt-8"
      style={{ minHeight: '90px' }}
    />
  )
}
