export const metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
}

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
