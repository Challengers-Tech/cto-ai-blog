import { useState, useEffect, useRef } from 'react'
import swarmIcon from './assets/swarm-icon.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { getABVariant, AB_COPY } from './utils/abTest'
import { trackEvent } from './utils/analytics'
import { NotificationCenter } from './components/NotificationCenter'
import { Celebration } from './components/Celebration'
import { AdminPanel } from './components/AdminPanel'
import { Footer } from './components/Footer'

interface BlogPost {
  filename: string
  title: string
  status: 'published' | 'draft'
  mtime: string
}

function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const m = (window as any).mermaid
    if (!m) return

    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
    
    try {
      m.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' })
      
      const renderPromise = m.render(id, chart)
      if (renderPromise && typeof renderPromise.then === 'function') {
        renderPromise.then(({ svg }: any) => {
          setSvg(svg)
          setError(false)
        }).catch((err: any) => {
          console.error("Mermaid rendering failed:", err)
          setError(true)
        })
      } else {
        setSvg(renderPromise)
        setError(false)
      }
    } catch (err) {
      console.error("Mermaid initialization or rendering failed:", err)
      setError(true)
    }
  }, [chart])

  if (svg && !error) {
    return (
      <div 
        style={{ 
          backgroundColor: '#09090d', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          margin: '1.5rem 0', 
          border: '1px solid #1f1f2e',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflowX: 'auto'
        }}
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    )
  }

  return (
    <div 
      ref={ref} 
      className="mermaid" 
      style={{ 
        backgroundColor: '#09090d', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        margin: '1.5rem 0', 
        border: '1px solid #1f1f2e',
        whiteSpace: 'pre',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        color: '#f87171',
        overflowX: 'auto'
      }}
    >
      {chart}
    </div>
  )
}

function renderMarkdown(md: string) {
  if (!md) return null;
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let inMermaidBlock = false;
  let codeContent: string[] = [];
  let listItems: string[] = [];

  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} style={{ paddingLeft: '1.5rem', margin: '1rem 0', listStyleType: 'disc' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.4rem', color: '#ccc' }}>
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const parseInline = (text: string): React.ReactNode[] | string => {
    if (!text) return '';
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    
    // Match bold **text** or inline code `code`
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchStr = match[0];
      
      if (matchStart > lastIdx) {
        parts.push(text.substring(lastIdx, matchStart));
      }
      
      if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        parts.push(
          <strong key={matchStart} style={{ color: '#fff', fontWeight: 'bold' }}>
            {matchStr.slice(2, -2)}
          </strong>
        );
      } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
        parts.push(
          <code key={matchStart} style={{ backgroundColor: '#1d1d2b', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: '#60a5fa', fontSize: '0.9em' }}>
            {matchStr.slice(1, -1)}
          </code>
        );
      }
      
      lastIdx = regex.lastIndex;
    }
    
    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }
    
    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Code Block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock || inMermaidBlock) {
        // End of code block
        const codeText = codeContent.join('\n');
        if (inMermaidBlock) {
          elements.push(
            <Mermaid key={`mermaid-${i}`} chart={codeText} />
          );
          inMermaidBlock = false;
        } else {
          elements.push(
            <pre 
              key={`code-${i}`} 
              style={{ 
                backgroundColor: '#13131f', 
                padding: '1.2rem', 
                borderRadius: '8px', 
                overflowX: 'auto', 
                border: '1px solid #1f1f2e', 
                fontFamily: 'Consolas, Monaco, monospace', 
                fontSize: '0.9rem', 
                color: '#60a5fa', 
                margin: '1.5rem 0' 
              }}
            >
              <code>{codeText}</code>
            </pre>
          );
          inCodeBlock = false;
        }
        codeContent = [];
      } else {
        // Start of code block
        if (line.trim().startsWith('```mermaid')) {
          inMermaidBlock = true;
        } else {
          inCodeBlock = true;
        }
      }
      continue;
    }

    if (inCodeBlock || inMermaidBlock) {
      codeContent.push(line);
      continue;
    }

    // Detect Bullet Lists
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.substring(2));
      continue;
    } else {
      flushList(i);
    }

    // Detect Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 
          key={`h1-${i}`} 
          style={{ 
            color: '#fff', 
            fontSize: '2rem', 
            marginTop: '2rem', 
            marginBottom: '1rem', 
            fontWeight: '800', 
            borderBottom: '1px solid #1f1f2e', 
            paddingBottom: '0.5rem' 
          }}
        >
          {parseInline(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 
          key={`h2-${i}`} 
          style={{ 
            color: '#fff', 
            fontSize: '1.5rem', 
            marginTop: '1.8rem', 
            marginBottom: '0.8rem', 
            fontWeight: '700' 
          }}
        >
          {parseInline(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 
          key={`h3-${i}`} 
          style={{ 
            color: '#fff', 
            fontSize: '1.2rem', 
            marginTop: '1.5rem', 
            marginBottom: '0.6rem', 
            fontWeight: '600' 
          }}
        >
          {parseInline(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed === '---') {
      elements.push(
        <hr key={`hr-${i}`} style={{ border: 'none', borderTop: '1px solid #1f1f2e', margin: '2rem 0' }} />
      );
    } else if (trimmed === '') {
      continue;
    } else {
      // Normal Paragraph
      elements.push(
        <p 
          key={`p-${i}`} 
          style={{ 
            color: '#bbb', 
            margin: '1rem 0', 
            fontSize: '1.05rem', 
            lineHeight: '1.7',
            wordBreak: 'break-word'
          }}
        >
          {parseInline(line)}
        </p>
      );
    }
  }

  flushList('end');
  return elements;
}

function App() {
  const [adminVisible, setAdminVisible] = useState(false)
  const [activeView, setActiveView] = useState<'home' | 'docs' | 'blog'>('home')
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState<boolean>(false)

  const variant = getABVariant()
  const copy = AB_COPY[variant]

  // Load mermaid script dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      const m = (window as any).mermaid;
      if (m) {
        m.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Trigger mermaid render when content is loaded or changed
  useEffect(() => {
    if (selectedFile && !loadingContent && fileContent) {
      setTimeout(() => {
        const m = (window as any).mermaid;
        if (m) {
          try {
            m.contentLoaded();
          } catch (err) {
            console.error("Mermaid rendering failed:", err);
          }
        }
      }, 150);
    }
  }, [fileContent, selectedFile, loadingContent]);

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

  // Fetch blog posts list
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blog')
        const data = await res.json()
        setBlogPosts(data)
      } catch (err) {
        console.error("Failed to fetch posts:", err)
      }
    }
    fetchPosts()
  }, [])

  // Fetch selected file content
  useEffect(() => {
    if (!selectedFile) return
    const fetchContent = async () => {
      setLoadingContent(true)
      try {
        const res = await fetch(`/api/blog-content?file=${encodeURIComponent(selectedFile)}`)
        const data = await res.json()
        setFileContent(data.content || 'No content found')
      } catch (err) {
        console.error("Failed to fetch file content:", err)
        setFileContent('Error loading content')
      } finally {
        setLoadingContent(false)
      }
    }
    fetchContent()
  }, [selectedFile])

  const handleCTAClick = () => {
    trackEvent('cta_click', { 
      variant, 
      label: copy.cta 
    })
    console.log(`[Navigation] Transitioning to swarms world with variant: ${variant}`)
    
    // MOCK a sale for testing the celebration
    if (confirm("MOCK SALE: Do you want to record a test transaction for Variant " + variant + "?")) {
      trackEvent('sale', { variant, amount: 49.00 })
      alert("Sale recorded in analytics_log.json. Refresh page to see celebration if it was the first one.")
    }
  }

  const handleTemplateDownload = () => {
    trackEvent('template_download', { variant })
    console.log("Downloading swarm boilerplate...")
  }

  // Filter posts based on view (only published posts shown to public)
  const publishedDocs = blogPosts.filter(
    (p) => p.status === 'published' && p.filename.match(/^\d+/)
  )
  const publishedBlogs = blogPosts.filter(
    (p) => p.status === 'published' && !p.filename.match(/^\d+/) && p.filename !== '00-outline.md'
  )

  return (
    <>
      {adminVisible && <Celebration />}
      <nav style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', backgroundColor: '#09090d' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.03em', cursor: 'pointer' }} onClick={() => { setAdminVisible(false); setActiveView('home'); }}>Swarms.Guide</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: activeView === 'docs' ? '#646cff' : '#888', cursor: 'pointer', fontSize: '1rem', fontWeight: activeView === 'docs' ? 'bold' : 'normal' }} onClick={() => { setAdminVisible(false); setActiveView('docs'); setSelectedFile(null); setFileContent(''); trackEvent('nav_click', { item: 'docs' }); }}>Docs</button>
          <button style={{ background: 'none', border: 'none', color: activeView === 'blog' ? '#646cff' : '#888', cursor: 'pointer', fontSize: '1rem', fontWeight: activeView === 'blog' ? 'bold' : 'normal' }} onClick={() => { setAdminVisible(false); setActiveView('blog'); setSelectedFile(null); setFileContent(''); trackEvent('nav_click', { item: 'blog' }); }}>Blog</button>
          <button 
            style={{ 
              backgroundColor: '#161622', 
              color: '#646cff', 
              border: '1px solid #2d2d3f', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }} 
            onClick={() => setAdminVisible(!adminVisible)}
          >
            {adminVisible ? '🌐 Public Site' : '💼 Owner Hub'}
          </button>
          <NotificationCenter />
        </div>
      </nav>

      {adminVisible ? (
        <section id="admin">
          <button onClick={() => setAdminVisible(false)} style={{ margin: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '4px' }}>Close Admin</button>
          <AdminPanel />
        </section>
      ) : (
        <>
          {activeView === 'home' && (
            <>
              <section id="center">
                <div className="hero">
                  <img src={heroImg} className="base" width="170" height="179" alt="Swarms.Guide Hero" />
                  <img src={swarmIcon} className="swarm-logo" alt="Swarm icon" />
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
                    className="secondary-cta"
                    onClick={handleTemplateDownload}
                  >
                    Get Boilerplates
                  </button>
                </div>
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
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('docs'); trackEvent('resource_click', { type: 'sequential' }); }}>
                        Sequential Topologies
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('docs'); trackEvent('resource_click', { type: 'hierarchical' }); }}>
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
              <section id="spacer" style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button 
                  onClick={() => setAdminVisible(true)} 
                  style={{ opacity: 0.1, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                >
                  Admin
                </button>
              </section>
            </>
          )}

          {/* DOCS OR BLOG VIEW */}
          {(activeView === 'docs' || activeView === 'blog') && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', padding: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left', minHeight: '80vh' }}>
              
              {/* Sidebar */}
              <aside style={{ borderRight: '1px solid #222', paddingRight: '1.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                  {activeView === 'docs' ? '📖 Masterclass Guides' : '✍️ Blog Articles'}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(activeView === 'docs' ? publishedDocs : publishedBlogs).map((post) => (
                    <li key={post.filename}>
                      <button
                        onClick={() => { setSelectedFile(post.filename); trackEvent('article_view', { filename: post.filename }); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: selectedFile === post.filename ? '#646cff' : '#888',
                          fontWeight: selectedFile === post.filename ? 'bold' : 'normal',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: selectedFile === post.filename ? 'rgba(100, 108, 255, 0.05)' : 'transparent',
                          transition: 'all 0.15s',
                          fontSize: '0.95rem'
                        }}
                      >
                        {post.title.replace(/^Chapter \d+:\s*/, '')}
                      </button>
                    </li>
                  ))}
                  {(activeView === 'docs' ? publishedDocs : publishedBlogs).length === 0 && (
                    <p style={{ color: '#555', fontSize: '0.9rem' }}>No articles available yet.</p>
                  )}
                </ul>
              </aside>

              {/* Reader Area */}
              <main style={{ paddingLeft: '1rem', color: '#ccc', lineHeight: '1.6' }}>
                {selectedFile ? (
                  loadingContent ? (
                    <div style={{ color: '#666', textAlign: 'center', padding: '4rem' }}>Loading guide content...</div>
                  ) : (
                    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {/* Render title nicely */}
                      <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
                        {selectedFile.replace(/^\d+-/, '').replace('.md', '').replace(/-/g, ' ').toUpperCase()}
                      </h2>
                      <div className="markdown-body" style={{ color: '#bbb', fontSize: '1.05rem' }}>
                        {renderMarkdown(fileContent)}
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ padding: '6rem 2rem', textAlign: 'center', border: '1px dashed #222', borderRadius: '12px' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>📖</span>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>Please select an article from the sidebar to begin reading.</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>Core educational guides are 100% free and unrestricted.</p>
                  </div>
                )}
              </main>

            </div>
          )}
          <Footer />
        </>
      )}
    </>
  )
}

export default App
