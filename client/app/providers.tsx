'use client'

import React from 'react'
import { ThemeProvider } from './components/ThemeContext'
import { ShareProvider } from './context/ShareContext'
import { BlogProvider } from './context/BlogContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ShareProvider>
        <BlogProvider>
          {children}
        </BlogProvider>
      </ShareProvider>
    </ThemeProvider>
  )
}