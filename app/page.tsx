import HeroSection from '../components/sections/HeroSection'
import AboutSection from '../components/sections/AboutSection'
import MenuPreview from '../components/sections/MenuPreview'
import BlogPreview from '../components/sections/BlogPreview'
import ContactSection from '../components/sections/ContactSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <MenuPreview />
      <BlogPreview />
      <ContactSection />
    </>
  )
}