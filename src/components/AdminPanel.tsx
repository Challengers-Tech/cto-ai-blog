import { useEffect, useState } from 'react'
import statsIcon from '../assets/admin-stats.svg'

interface LogEvent {
  event: string
  properties: any
  timestamp: string
}

interface BlogPost {
  filename: string
  title: string
  status: 'published' | 'draft'
  mtime: string
}

interface Product {
  id: string
  name: string
  description: string
  amount_cents: number
  interval: string
  status: 'active' | 'inactive'
}

interface ProductsResponse {
  stripeConnected: boolean
  onboardingUrl: string
  catalog: Product[]
}

interface RevenueResponse {
  stripeConnected: boolean
  balance: {
    available: { amount: number; currency: string }[]
    pending: { amount: number; currency: string }[]
  }
  transactions: any[]
  revenue_summary: {
    all_time_earnings_cents: number
    pending_earnings_cents: number
    refunded_cents: number
  }
}

export function AdminPanel() {
  const [excludeMe, setExcludeMe] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('exclude_analytics') !== 'false' : true
  })

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'blog' | 'revenue'>('overview')
  const [logs, setLogs] = useState<LogEvent[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('exclude_analytics', excludeMe ? 'true' : 'false')
    }
  }, [excludeMe])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, postsRes, productsRes, revenueRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/blog'),
          fetch('/api/products'),
          fetch('/api/revenue')
        ])

        const [logsData, postsData, productsJson, revenueJson] = await Promise.all([
          logsRes.json(),
          postsRes.json(),
          productsRes.json(),
          revenueRes.json()
        ])

        setLogs(logsData)
        setPosts(postsData)
        setProductsData(productsJson)
        setRevenueData(revenueJson)
      } catch (err) {
        console.error("Failed to fetch admin data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: '#646cff', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        Loading Swarms.Guide Business Hub...
      </div>
    )
  }

  // Aggregate stats
  const totalClicks = logs.filter(l => l.event === 'cta_click' || l.event === 'nav_click').length
  const variantACount = logs.filter(l => l.properties?.variant === 'A').length
  const variantBCount = logs.filter(l => l.properties?.variant === 'B').length
  const scrollDeepCount = logs.filter(l => l.event === 'scroll_deep').length
  const downloadsCount = logs.filter(l => l.event === 'template_download').length

  const variantAClicks = logs.filter(l => l.event === 'cta_click' && l.properties?.variant === 'A').length
  const variantBClicks = logs.filter(l => l.event === 'cta_click' && l.properties?.variant === 'B').length

  const ctrA = variantACount > 0 ? ((variantAClicks / variantACount) * 100).toFixed(1) : '0.0'
  const ctrB = variantBCount > 0 ? ((variantBClicks / variantBCount) * 100).toFixed(1) : '0.0'

  return (
    <div style={{ padding: '2.5rem', backgroundColor: '#0b0b0f', borderRadius: '24px', marginTop: '2rem', border: '1px solid #1f1f2e', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #1f1f2e', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#161622', padding: '12px', borderRadius: '12px', border: '1px solid #2d2d3f' }}>
            <img src={statsIcon} alt="" style={{ width: '28px', height: '28px', display: 'block' }} />
          </div>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Swarms.Guide Business Hub</h2>
            <p style={{ margin: '4px 0 0', color: '#8b8b9f', fontSize: '0.9rem' }}>Real-time product, content, and revenue tracking</p>
          </div>
        </div>
        
        {/* Onboarding Alert and Exclude Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b8b9f', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#12121a', padding: '8px 16px', borderRadius: '12px', border: '1px solid #1f1f2e', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={excludeMe} 
              onChange={(e) => setExcludeMe(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#646cff' }}
            />
            🛡️ Exclude My Actions (Owner Mode)
          </label>

          {productsData && !productsData.stripeConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '8px 16px', borderRadius: '12px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '500' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              Stripe Integration Required
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', backgroundColor: '#12121a', padding: '6px', borderRadius: '12px', width: 'fit-content', border: '1px solid #1f1f2e' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s', backgroundColor: activeTab === 'overview' ? '#646cff' : 'transparent', color: activeTab === 'overview' ? '#fff' : '#8b8b9f' }}
        >
          📈 Overview & Analytics
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s', backgroundColor: activeTab === 'products' ? '#646cff' : 'transparent', color: activeTab === 'products' ? '#fff' : '#8b8b9f' }}
        >
          📦 Business Products
        </button>
        <button 
          onClick={() => setActiveTab('blog')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s', backgroundColor: activeTab === 'blog' ? '#646cff' : 'transparent', color: activeTab === 'blog' ? '#fff' : '#8b8b9f' }}
        >
          ✍️ Blog Content Hub
        </button>
        <button 
          onClick={() => setActiveTab('revenue')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s', backgroundColor: activeTab === 'revenue' ? '#646cff' : 'transparent', color: activeTab === 'revenue' ? '#fff' : '#8b8b9f' }}
        >
          💰 Revenue & Ledger
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metric Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#8b8b9f', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Views</div>
                <span style={{ fontSize: '1.2rem' }}>👁️</span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', marginTop: '0.5rem' }}>{variantACount + variantBCount}</div>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#8b8b9f', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Clicks</div>
                <span style={{ fontSize: '1.2rem' }}>🖱️</span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', marginTop: '0.5rem' }}>{totalClicks}</div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#8b8b9f', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Downloads</div>
                <span style={{ fontSize: '1.2rem' }}>📥</span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#646cff', marginTop: '0.5rem' }}>{downloadsCount}</div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#8b8b9f', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deep Scrolls</div>
                <span style={{ fontSize: '1.2rem' }}>📜</span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', marginTop: '0.5rem' }}>{scrollDeepCount}</div>
            </div>
          </div>

          {/* A/B Test Results */}
          <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e', marginBottom: '2.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>Active Headings A/B Test Performance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #1f1f2e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#8b8b9f' }}>Variant A (Control)</span>
                  <span style={{ backgroundColor: '#2a2a3a', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Default</span>
                </div>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1rem', minHeight: '40px' }}>"Build Autonomous Swarms to Run Your Business"</div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Views</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>{variantACount}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Clicks</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>{variantAClicks}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>CTR</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{ctrA}%</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(100, 108, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(100, 108, 255, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#646cff' }}>Variant B (Experimental)</span>
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Active</span>
                </div>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1rem', minHeight: '40px' }}>"Scale From Simple AI Chats to Autonomous Multi-Agent Swarms"</div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Views</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>{variantBCount}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Clicks</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>{variantBClicks}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>CTR</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{ctrB}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Stream */}
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>Recent User Interactions</h3>
            <div style={{ maxHeight: '350px', overflowY: 'auto', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f1f2e', backgroundColor: '#0f0f18' }}>
                    <th style={{ padding: '1rem', color: '#8b8b9f', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Event</th>
                    <th style={{ padding: '1rem', color: '#8b8b9f', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Variant</th>
                    <th style={{ padding: '1rem', color: '#8b8b9f', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Data / Details</th>
                    <th style={{ padding: '1rem', color: '#8b8b9f', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice().reverse().map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #161622', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '1rem', color: log.event === 'sale' ? '#10b981' : '#fff', fontWeight: log.event === 'sale' ? 'bold' : 'normal' }}>
                        {log.event.replace('_', ' ')}
                      </td>
                      <td style={{ padding: '1rem', color: '#8b8b9f' }}>{log.properties?.variant || '—'}</td>
                      <td style={{ padding: '1rem', color: '#666', fontSize: '0.85rem' }}>{JSON.stringify(log.properties)}</td>
                      <td style={{ padding: '1rem', color: '#555', fontVariantNumeric: 'tabular-nums' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && productsData && (
        <div>
          <div style={{ backgroundColor: '#13131f', padding: '1.5rem', borderRadius: '16px', border: '1px solid #1f1f2e', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.2rem' }}>Business Monetization Catalog</h3>
            <p style={{ margin: 0, color: '#8b8b9f', fontSize: '0.9rem' }}>These products are configured to monetize the core manual content of Swarms.Guide.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {productsData.catalog.map((product) => (
              <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>{product.name}</h4>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.05)', color: '#8b8b9f' }}>{product.interval}</span>
                  </div>
                  <p style={{ margin: '8px 0 0', color: '#8b8b9f', fontSize: '0.85rem', lineHeight: '1.4' }}>{product.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>${(product.amount_cents / 100).toFixed(2)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '600' }}>Inactive (Needs Onboarding)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', backgroundColor: 'rgba(245, 158, 11, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Ready to accept payments?</h4>
              <p style={{ margin: '4px 0 0', color: '#8b8b9f', fontSize: '0.85rem' }}>Complete Stripe Connect onboarding on the Finance tab in headquarters to generate payment checkouts for these tiers.</p>
            </div>
            <a 
              href={productsData.onboardingUrl}
              target="_blank"
              style={{ display: 'inline-block', backgroundColor: '#646cff', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', transition: 'background-color 0.2s', fontSize: '0.9rem' }}
            >
              Go to Finance Onboarding
            </a>
          </div>
        </div>
      )}

      {/* BLOG CONTENT TAB */}
      {activeTab === 'blog' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: '#13131f', padding: '1.5rem', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.2rem' }}>Educational Chapters & Curation</h3>
              <p style={{ margin: 0, color: '#8b8b9f', fontSize: '0.9rem' }}>We draft educational assets daily and curate the absolute best to publish live as official Swarms.Guide pages.</p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>Published Chapters</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{posts.filter(p => p.status === 'published').length}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>Active Drafts</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>{posts.filter(p => p.status === 'draft').length}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f1f2e', backgroundColor: '#0f0f18' }}>
                  <th style={{ padding: '1rem', color: '#8b8b9f', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Article / Chapter Title</th>
                  <th style={{ padding: '1rem', color: '#8b8b9f', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Filename</th>
                  <th style={{ padding: '1rem', color: '#8b8b9f', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '1rem', color: '#8b8b9f', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #161622' }}>
                    <td style={{ padding: '1rem', color: '#fff', fontWeight: '600' }}>{post.title}</td>
                    <td style={{ padding: '1rem', color: '#8b8b9f', fontFamily: 'monospace', fontSize: '0.85rem' }}>{post.filename}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold', 
                        backgroundColor: post.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 108, 255, 0.1)', 
                        color: post.status === 'published' ? '#10b981' : '#646cff' 
                      }}>
                        {post.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#555', fontSize: '0.85rem' }}>{new Date(post.mtime).toLocaleDateString()}</td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No articles found. Running the generator...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVENUE TAB */}
      {activeTab === 'revenue' && revenueData && (
        <div>
          {/* Revenue Summaries */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
              <div style={{ fontSize: '0.8rem', color: '#8b8b9f', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Balance</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#fff', marginTop: '0.5rem' }}>$0.00</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Stripe Managed Account</div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
              <div style={{ fontSize: '0.8rem', color: '#8b8b9f', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Balance</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#8b8b9f', marginTop: '0.5rem' }}>$0.00</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>In Transit</div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '16px', border: '1px solid #1f1f2e' }}>
              <div style={{ fontSize: '0.8rem', color: '#8b8b9f', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>All-Time Earnings</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#10b981', marginTop: '0.5rem' }}>$0.00</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>From paid sponsorships & boilerplates</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#13131f', padding: '2rem', borderRadius: '16px', border: '1px solid #1f1f2e', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔒</span>
            <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Stripe Integration Needed</h3>
            <p style={{ color: '#8b8b9f', margin: '0 auto 1.5rem', maxWidth: '500px', fontSize: '0.9rem', lineHeight: '1.5' }}>
              To receive payments, issue invoices, and track your business's live finances here, please connect your bank account on the **Finance** tab in headquarters.
            </p>
            <a 
              href="/business/bf098211-edda-4ae6-bf5c-440e8ceed1af/finance"
              target="_blank"
              style={{ display: 'inline-block', backgroundColor: '#646cff', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Complete Stripe Connection
            </a>
          </div>
        </div>
      )}

    </div>
  )
}
