import { 
  ClientHeroSection, 
  ClientAboutSection, 
  ClientMenuPreview, 
  ClientBlogPreview, 
  ClientContactSection 
} from '../components/ClientComponents'

export default function HomePage() {
  return (
    <main className="main-content">
      <ClientHeroSection />
      <div className="section-spacing">
        <ClientAboutSection />
      </div>
      <div className="section-spacing">
        <ClientMenuPreview />
      </div>
      <div className="section-spacing">
        <ClientBlogPreview />
      </div>
      <div className="section-spacing">
        <ClientContactSection />
      </div>
    </main>
  )
}