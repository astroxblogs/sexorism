'use client'

import React, { useState, useEffect, useCallback } from 'react'
import TopNavigation from './components/TopNavigation'
import Footer1 from './components/Footer1'
import LanguageNudge from './components/LanguageNudge'
import { usePathname, useRouter } from 'next/navigation'
import { getCategories } from './lib/api'
//  import AdSense from './components/AdSense' // ✅ AD: domain-aware

interface NavigationWrapperProps {
  children: React.ReactNode
}

const NavigationWrapper: React.FC<NavigationWrapperProps> = ({ children }) => {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const standalonePages = ['/about', '/contact', '/privacy', '/terms', '/sitemap'];
  const adminPages = ['/cms/admin-dashboard', '/cms/login', '/cms']
  const isStandalonePage = isClient && pathname && standalonePages.includes(pathname)
  const isAdminPage = isClient && pathname && adminPages.some(page => pathname.startsWith(page))

  const fetchCategories = useCallback(async () => {
    if (categories.length > 0) return; // Prevent multiple calls

    try {
      const data = await getCategories()        // uses axios instance with language attached
      if (data) setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [categories.length])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setSearchQuery('')
    // Navigation logic will be handled by the component
  }

  const handleLogoClick = () => {
    setActiveCategory('all')
    setSearchQuery('')
    // Navigate to home page with reload when logo is clicked
    if (isClient && typeof window !== 'undefined') {
      if (pathname === '/') {
        // If already on home page, force reload
        window.location.href = '/'
      } else {
        // Navigate to home page
        router.push('/')
      }
    }
  }

  return (
    <>
      {!isStandalonePage && !isAdminPage && (
        <>
          <TopNavigation
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            setSearchQuery={setSearchQuery}
            onLogoClick={handleLogoClick}
            categories={categories}
          />
          {/* AD SLOT: Below-Nav Leaderboard (global, public pages only) */}
          {/* <div className="mx-auto max-w-screen-xl px-3 mt-2 empty:hidden">
           <AdSense slot="global_below_nav_leaderboard" className="ad-slot ad-slot--leaderboard w-full" />
         </div> */}
        </>
      )}

      {/* Use global theme background instead of hard-coded red tint */}
      <main className="block w-full min-h-[200px] bg-[var(--color-bg-primary)]">
        {children}
      </main>

      {/* AD SLOT: Below-Main Leaderboard (before footer on public pages) */}
      {/* {!isStandalonePage && !isAdminPage && (
       <div className="mx-auto max-w-screen-xl px-3 my-6 empty:hidden">
         <AdSense slot="global_below_main_leaderboard" className="ad-slot ad-slot--leaderboard w-full" />
       </div>
     )} */}

      {isStandalonePage || isAdminPage ? <div /> : <Footer1 />}

      {/* Language Nudge - Show on public pages only */}
      {!isStandalonePage && !isAdminPage && <LanguageNudge />}
    </>
  )
}

export default NavigationWrapper
