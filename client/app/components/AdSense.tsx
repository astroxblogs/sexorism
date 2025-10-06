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
    // Only run on client side and after component mounts
    if (typeof window === 'undefined') return

    setIsClient(true)

    // Check if AdSense is already available
    if (window.adsbygoogle) {
      setIsLoaded(true)
      return
    }

    // Load AdSense script
    const loadAdSense = () => {
      if (window.adsbygoogle && !isLoaded) {
        setIsLoaded(true)
        try {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (err) {
          console.error('AdSense initialization error:', err)
          setError(true)
        }
      }
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]')
    if (existingScript) {
      loadAdSense()
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000'

    script.onload = () => {
      loadAdSense()
    }

    script.onerror = () => {
      console.error('Failed to load AdSense script')
      setError(true)
    }

    // Append to head
    if (document.head) {
      document.head.appendChild(script)
    }

    return () => {
      // Cleanup if needed
    }
  }, [isLoaded])

  // Don't render AdSense on server side or if there's an error
  if (!isClient || error) {
    return null; // Hide ads completely when not configured
  }

  return (
    <div className={`adsense-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}

// Predefined ad components for common placements
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