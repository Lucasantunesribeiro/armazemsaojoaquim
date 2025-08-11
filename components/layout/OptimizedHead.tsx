import Head from 'next/head'

export default function OptimizedHead() {
  return (
    <Head>
      {/* DNS prefetch and preconnect for external resources */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        as="style"
        onLoad={(e) => {
          const target = e.target as HTMLLinkElement;
          target.onload = null;
          target.rel = 'stylesheet';
        }}
      />
      <noscript>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </noscript>
      
      {/* Preload Playfair Display for headings */}
      <link
        rel="preload"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
        as="style"
        onLoad={(e) => {
          const target = e.target as HTMLLinkElement;
          target.onload = null;
          target.rel = 'stylesheet';
        }}
      />
      <noscript>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
        />
      </noscript>
      
      {/* Critical CSS for above-the-fold content */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Critical CSS - Above the fold */
          body {
            font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
          }
          
          .hero-section {
            min-height: 100vh;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }
          
          /* Loading spinner */
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #f59e0b;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </Head>
  )
}