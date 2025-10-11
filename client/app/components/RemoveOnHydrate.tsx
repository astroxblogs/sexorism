'use client'

import { useEffect } from 'react'

export default function RemoveOnHydrate({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId)
    if (el && el.parentElement) el.parentElement.removeChild(el)
  }, [targetId])
  return null
}
