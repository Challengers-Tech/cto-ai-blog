import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

export function Celebration() {
  const [showBanner, setShowBanner] = useState(false)
  const [hasCelebrated, setHasCelebrated] = useState(false)

  useEffect(() => {
    const checkFirstSale = async () => {
      try {
        const res = await fetch('/api/analytics')
        const logs = await res.json()
        const firstSale = logs.find((l: any) => l.event === 'sale' || l.event === 'transaction')
        
        if (firstSale && !hasCelebrated) {
          // Trigger confetti!
          const duration = 7 * 1000
          const animationEnd = Date.now() + duration
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 }

          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
              return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
          }, 250)

          setHasCelebrated(true)
          setShowBanner(true)
          
          // Auto-hide banner after 10 seconds
          setTimeout(() => setShowBanner(false), 10000)
        }
      } catch (err) {
        console.error("Failed to check for first sale:", err)
      }
    }

    // Check periodically
    const checkInterval = setInterval(checkFirstSale, 5000)
    checkFirstSale() // Initial check

    return () => clearInterval(checkInterval)
  }, [hasCelebrated])

  if (!showBanner) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <div style={{
        backgroundColor: '#161616',
        padding: '3rem',
        borderRadius: '24px',
        border: '2px solid #10b981',
        textAlign: 'center',
        boxShadow: '0 0 100px rgba(16, 185, 129, 0.3)',
        animation: 'scaleUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        maxWidth: '90%'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💰</div>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', color: '#fff', fontWeight: '800' }}>FIRST SALE!</h1>
        <p style={{ fontSize: '1.25rem', color: '#aaa', margin: '0 0 2rem 0', maxWidth: '400px' }}>
          Congratulations! Your first transaction has been successfully recorded on Swarms.Guide.
        </p>
        <button 
          onClick={() => setShowBanner(false)}
          style={{
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '1rem 2.5rem',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
