import Navbar from '@/components/navbar'
import HeroSection from '@/components/hero-section'
import SolutionSection from '@/components/solution-section'
import FeaturesSection from '@/components/features-section'
import ComparisonSection from '@/components/comparison-section'
import CTASection from '@/components/cta-section'
import Footer from '@/components/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <SolutionSection />
      <FeaturesSection />
      <ComparisonSection />
      <CTASection />
      <Footer />
    </div>
  )
} 