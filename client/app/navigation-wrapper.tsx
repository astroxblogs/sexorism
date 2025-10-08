'use client'

import React, { useState, useEffect, useCallback } from 'react'
import TopNavigation from './components/TopNavigation'
import Footer1 from './components/Footer1'
import LanguageNudge from './components/LanguageNudge'
import { usePathname, useRouter } from 'next/navigation'
 import { getCategories } from './lib/api'


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

  const standalonePages = ['/about', '/contact', '/privacy', '/terms']
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
        <TopNavigation
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          setSearchQuery={setSearchQuery}
          onLogoClick={handleLogoClick}
          categories={categories}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {isStandalonePage || isAdminPage ? <div /> : <Footer1 />}

      {/* Language Nudge - Show on public pages only */}
      {!isStandalonePage && !isAdminPage && <LanguageNudge />}
    </>
  )
}

export default NavigationWrapper