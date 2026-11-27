import Navbar from "@/components/layout/Navbar";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
