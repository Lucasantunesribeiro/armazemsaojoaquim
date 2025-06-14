import {
  ClientHeroSection,
  ClientAboutSection,
  ClientMenuPreview,
  ClientBlogPreview,
  ClientContactSection,
} from '@/components/ClientComponents'

export default function HomePage() {
  return (
    <>
      <ClientHeroSection />
      <ClientAboutSection />
      <ClientMenuPreview />
      <ClientBlogPreview />
      <ClientContactSection />
    </>
  )
}