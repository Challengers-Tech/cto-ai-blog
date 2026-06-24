import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ 
      backgroundColor: '#09090d', 
      borderTop: '1px solid #1f1f2e', 
      padding: '4rem 2rem 2rem', 
      marginTop: '4rem',
      color: '#8b8b9f'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Swarms.Guide</h2>
            <p style={{ lineHeight: '1.6', maxWidth: '300px' }}>
              The definitive living manual for modern business automation. Scaling founders from chatting to orchestrating.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '1.2rem' }}>Platform</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#fff')} onMouseOut={(e) => (e.currentTarget.style.color = 'inherit')}>Docs</a></li>
                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#fff')} onMouseOut={(e) => (e.currentTarget.style.color = 'inherit')}>Blog</a></li>
                <li><a href="https://github.com/Challengers-Tech/cto-ai-blog" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#fff')} onMouseOut={(e) => (e.currentTarget.style.color = 'inherit')}>GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '1.2rem' }}>Resources</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Boilerplates</a></li>
                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Benchmarks</a></li>
                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Newsletter</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid #14141d', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem' }}>
          <p>© {new Date().getFullYear()} Swarms.Guide. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
