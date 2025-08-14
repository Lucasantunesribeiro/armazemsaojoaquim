// Auto-generated critical CSS component
export const CriticalCSS = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
/* Critical CSS - Above the fold content */
:root {
  --primary: #f59e0b;
  --primary-dark: #d97706;
  --background: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #4a5568;
  --transition-fast: 150ms ease-out;
  --transition-normal: 300ms ease-out;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--background);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Header - Critical for first paint */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

/* Hero Section - Critical for LCP */
.hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  color: white;
  z-index: 2;
  max-width: 800px;
  padding: 2rem;
}

.hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  margin-bottom: 2rem;
  opacity: 0.95;
  line-height: 1.4;
}

/* Buttons - Critical for interaction */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all var(--transition-normal);
  text-decoration: none;
  border: none;
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
}

.btn-primary {
  background-color: white;
  color: var(--primary);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Loading states */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .header {
    height: 70px;
    padding: 0 0.75rem;
  }
  
  .hero-content {
    padding: 1.5rem;
  }
  
  .btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
  }
}

/* Prevent layout shift */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Focus states for accessibility */
.btn:focus,
button:focus,
a:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  html {
    scroll-behavior: auto;
  }
}
`
  }} />
);

export default CriticalCSS;
