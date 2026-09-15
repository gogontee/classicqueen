import Header from '../src/components/Layout/Header'
import MobileBottomTab from '../src/components/Layout/MobileBottomTab'
import Footer from '../src/components/Layout/Footer'
import '../src/styles/globals.css'

export const metadata = {
  title: 'Classic Queen International - World Class Pageantry',
  description:
    'Celebrating beauty, grace, and empowerment through world-class pageantry competition.',

  // ---------------- Favicons / icons ----------------
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/android-icon-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon-precomposed.png',
      },
      {
        rel: 'msapplication-TileImage',
        url: '/ms-icon-144x144.png',
      },
      { rel: 'icon', type: 'image/png', url: '/android-icon-36x36.png', sizes: '36x36' },
      { rel: 'icon', type: 'image/png', url: '/android-icon-48x48.png', sizes: '48x48' },
      { rel: 'icon', type: 'image/png', url: '/android-icon-72x72.png', sizes: '72x72' },
      { rel: 'icon', type: 'image/png', url: '/android-icon-96x96.png', sizes: '96x96' },
      { rel: 'icon', type: 'image/png', url: '/android-icon-144x144.png', sizes: '144x144' },
      { rel: 'icon', type: 'image/png', url: '/android-icon-192x192.png', sizes: '192x192' },
    ],
  },

  // ---------------- Web App Manifest ----------------
  manifest: '/site.webmanifest',

  // ---------------- Misc MS meta ----------------
  other: {
    'msapplication-TileColor': '#BF953F',
    'msapplication-config': '/browserconfig.xml',
  },
}

// Next.js App Router: theme-color belongs in the viewport export,
// not in metadata. This is what colors the mobile browser chrome.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#D2B48C',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-brown-50">
        <Header />
        <main className="flex-grow pb-16 lg:pb-0">{children}</main>
        <Footer />
        <MobileBottomTab />
      </body>
    </html>
  )
}