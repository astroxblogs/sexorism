'use client'

import React from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './components/ThemeContext'
import { ShareProvider } from './context/ShareContext'
import { BlogProvider } from './context/BlogContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ShareProvider>
        <BlogProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </BlogProvider>
      </ShareProvider>
    </ThemeProvider>
  )
}