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

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsClient(true)

    // If AdSense already present, just push
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

    // Check if the script tag exists (e.g., injected by layout.tsx)
    const existingScript = document.querySelector(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    )

    const onReady = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        setIsLoaded(true)
      } catch (err) {
        console.error('AdSense push error:', err)
        setError(true)
      }
    }

    if (existingScript) {
      // wait for load if needed
      if ((existingScript as HTMLScriptElement).async) {
        existingScript.addEventListener('load', onReady, { once: true })
      } else {
        onReady()
      }
      return
    }

    // Fallback: inject the script once
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4112734313230332'
    script.onload = onReady
    script.onerror = () => {
      console.error('Failed to load AdSense script')
      setError(true)
    }
    document.head?.appendChild(script)
  }, [])

  if (!isClient || error) return null

  return (
    <div className={`adsense-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-4112734313230332"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}

// Predefined placements (unchanged)
export function HeaderAd() {
  return (
    <AdSense
      slot="HEADER_AD_SLOT_ID"
      format="horizontal"
      className="mb-6"
      style={{ minHeight: '90px' }}
    />
  )
}

export function SidebarAd() {
  return (
    <AdSense
      slot="SIDEBAR_AD_SLOT_ID"
      format="vertical"
      className="mb-6"
      style={{ minHeight: '250px' }}
    />
  )
}

export function ContentAd() {
  return (
    <AdSense
      slot="CONTENT_AD_SLOT_ID"
      format="rectangle"
      className="my-8 mx-auto"
      style={{ minHeight: '250px', maxWidth: '300px' }}
    />
  )
}

export function FooterAd() {
  return (
    <AdSense
      slot="FOOTER_AD_SLOT_ID"
      format="horizontal"
      className="mt-8"
      style={{ minHeight: '90px' }}
    />
  )
}
