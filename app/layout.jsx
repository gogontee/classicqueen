import Header from '../src/components/Layout/Header'
import MobileBottomTab from '../src/components/Layout/MobileBottomTab'
import Footer from '../src/components/Layout/Footer'
import '../src/styles/globals.css'

export const metadata = {
  title: 'Classic Queen International - World Class Pageantry',
  description: 'Celebrating beauty, grace, and empowerment through world-class pageantry competition.',
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