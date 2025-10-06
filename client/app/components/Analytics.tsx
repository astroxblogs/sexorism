'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: object) => void
    dataLayer: any[]
  }
}

export default function Analytics() {
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !isClient) return

    // Check if GA is already loaded to prevent duplicate initialization
    if (typeof window !== 'undefined' && 'gtag' in window && 'dataLayer' in window) {
      return
    }

    try {
      // Google Analytics 4
      const gtagScript = document.createElement('script')
      gtagScript.async = true
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'

      const configScript = document.createElement('script')
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', {
          page_title: document.title,
          page_location: window.location.href,
        });
      `

      // Append to head safely
      const head = document.getElementsByTagName('head')[0]
      if (head) {
        head.appendChild(gtagScript)
        head.appendChild(configScript)
      }

      // Core Web Vitals monitoring
      const reportWebVitals = ({ name, delta, value, id }: any) => {
        if (window.gtag) {
          window.gtag('event', name, {
            event_category: 'Web Vitals',
            event_label: id,
            value: Math.round(name === 'CLS' ? delta * 1000 : delta),
            non_interaction: true,
          })
        }
      }

      // Import and use web-vitals if available
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(reportWebVitals)
        getFID(reportWebVitals)
        getFCP(reportWebVitals)
        getLCP(reportWebVitals)
        getTTFB(reportWebVitals)
      }).catch(() => {
        // web-vitals not available, continue without it
      })

    } catch (error) {
      console.error('Analytics initialization error:', error)
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    // Track page views
    if ('gtag' in window && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pathname + (searchParams?.toString() ? '?' + searchParams.toString() : ''),
      })
    }
  }, [pathname, searchParams, isClient])

  return null
}