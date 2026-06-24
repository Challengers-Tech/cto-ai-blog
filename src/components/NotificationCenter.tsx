import { useState } from 'react'
import bellIcon from '../assets/notification-bell.svg'
import bellDotIcon from '../assets/notification-bell-dot.svg'

interface Notification {
  id: string
  title: string
  date: string
  read: boolean
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'New Swarm Boilerplate available: Customer Support', date: '2026-06-18', read: false },
  { id: '2', title: 'Chapter 7: Building a Marketing & Content Swarm is live!', date: '2026-06-17', read: true },
  { id: '3', title: 'Welcome to Swarms.Guide', date: '2026-06-15', read: true },
]

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const unreadCount = notifications.filter(n => !n.read).length

  const toggleMenu = () => setIsOpen(!isOpen)
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={toggleMenu}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px'
        }}
      >
        <img 
          src={unreadCount > 0 ? bellDotIcon : bellIcon} 
          alt="Notifications" 
          style={{ width: '24px', height: '24px' }}
        />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            border: '2px solid #1a1a1a'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: '320px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 1000,
          padding: '1.25rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Updates</h3>
            <button 
              onClick={markAllAsRead}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}
            >
              Mark all as read
            </button>
          </div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No new notifications</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ 
                  marginBottom: '0.75rem', 
                  padding: '0.75rem', 
                  backgroundColor: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: n.read ? '1px solid transparent' : '1px solid rgba(59, 130, 246, 0.2)',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: n.read ? '400' : '600', lineHeight: '1.4' }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.4rem' }}>{n.date}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
