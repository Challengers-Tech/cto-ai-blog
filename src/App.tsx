import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { getABVariant, AB_COPY } from './utils/abTest'
import { trackEvent } from './utils/analytics'

function App() {
  const [count, setCount] = useState(0)
  const variant = getABVariant()
  const copy = AB_COPY[variant]

  useEffect(() => {
    // Track initial page view and variant assignment
    trackEvent('page_view', { variant })

    // Track scrolls
    const handleScroll = () => {
      if (window.scrollY > 300) {
        trackEvent('scroll_deep', { variant, scrollY: window.scrollY })
        window.removeEventListener('scroll', handleScroll)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [variant])

  const handleCTAClick = () => {
    trackEvent('cta_click', { 
      variant, 
      label: copy.cta 
    })
    // In a real app, this would navigate to a sign-up or guide page
    console.log(`[Navigation] Transitioning to swarms world with variant: ${variant}`)
  }

  const handleTemplateDownload = () => {
    trackEvent('template_download', { variant })
    console.log("Downloading swarm boilerplate...")
  }

  return (
    <>
      <nav style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Swarms.Guide</div>
        <div>
          <button onClick={() => trackEvent('nav_click', { item: 'docs' })}>Docs</button>
          <button onClick={() => trackEvent('nav_click', { item: 'blog' })}>Blog</button>
        </div>
      </nav>

      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="Swarms.Guide Hero" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>{copy.headline}</h1>
          <p>{copy.subheadline}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            type="button"
            className="cta-button"
            style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            onClick={handleCTAClick}
          >
            {copy.cta}
          </button>
          
          <button
            type="button"
            style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem', backgroundColor: '#242424', color: 'white', border: '1px solid #646cff', borderRadius: '8px', cursor: 'pointer' }}
            onClick={handleTemplateDownload}
          >
            Get Boilerplates
          </button>
        </div>

        <p style={{ marginTop: '2rem' }}>
          Interactive counter for testing HMR and interaction tracking:
        </p>
        <button
          type="button"
          className="counter"
          onClick={() => {
            setCount((count) => count + 1)
            trackEvent('counter_click', { count: count + 1, variant })
          }}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Learn the Swarm Way</h2>
          <p>Go beyond simple prompts to autonomous loops.</p>
          <ul>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); trackEvent('resource_click', { type: 'sequential' }); }}>
                Sequential Topologies
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); trackEvent('resource_click', { type: 'hierarchical' }); }}>
                Hierarchical Swarms
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Community</h2>
          <p>Connect with other autonomous business owners.</p>
          <ul>
            <li>
              <a href="https://github.com/Challengers-Tech/cto-ai-blog" target="_blank">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer" style={{ height: '500px' }}>
        <p>Scroll down to trigger the "deep scroll" analytics event...</p>
      </section>
    </>
  )
}

export default App
