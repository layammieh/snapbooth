import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255,249,242,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(247,221,229,0.5)',
      boxShadow: '0 2px 20px rgba(81,65,59,0.06)',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #F7DDE5, #D4A0B5)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(212,160,181,0.4)',
          }}>
            <Camera size={18} color="white" />
          </div>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: '1.3rem',
            color: 'var(--brown)',
            letterSpacing: '-0.02em',
          }}>
            Snap<span style={{ color: 'var(--dusty-rose)' }}>booth</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden-mobile">
          <Link
            to="/"
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: location.pathname === '/' ? 600 : 400,
              color: location.pathname === '/' ? 'var(--brown)' : 'var(--warm-gray)',
              background: location.pathname === '/' ? 'var(--soft-pink)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Home
          </Link>
          <Link to="/booth">
            <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              <Camera size={15} /> Start Photobooth
            </button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="btn-icon show-mobile"
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'none' }}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div style={{
          background: 'var(--white)',
          borderTop: '1px solid rgba(247,221,229,0.5)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: location.pathname === '/' ? 600 : 400,
              color: location.pathname === '/' ? 'var(--brown)' : 'var(--warm-gray)',
              background: location.pathname === '/' ? 'var(--soft-pink)' : 'transparent',
            }}
          >
            Home
          </Link>
          <Link to="/booth" onClick={() => setIsOpen(false)}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Camera size={16} /> Start Photobooth
            </button>
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
