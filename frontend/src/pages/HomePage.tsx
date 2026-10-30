import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Cloud, Printer, Smartphone, Star, Download, Sparkles, Heart } from 'lucide-react';

const FEATURES = [
  {
    icon: <Camera size={24} />,
    title: 'Live Webcam Capture',
    desc: 'Take snapshots directly from your browser with customizable 3s, 5s, or 10s timers.',
    color: '#F7DDE5',
  },
  {
    icon: <Sparkles size={24} />,
    title: 'Aesthetic Filters & Stickers',
    desc: '12 vintage Korean studio filters, resizable stickers, and interactive text captions.',
    color: '#E9E1F5',
  },
  {
    icon: <Printer size={24} />,
    title: 'Classic Portrait Layouts',
    desc: 'Single, 2-Vertical, 3-Strip, 4-Strip, and multi-photo collage grid formats.',
    color: '#FFF9F2',
  },
  {
    icon: <Download size={24} />,
    title: 'Direct Instant Download',
    desc: 'One-click high-resolution PNG export with crisp photostrip borders and date stamps.',
    color: '#F7DDE5',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Fully Responsive',
    desc: 'Works seamlessly across mobile phones, tablets, and full desktop displays.',
    color: '#E9E1F5',
  },
  {
    icon: <Heart size={24} />,
    title: 'Zero Clutter Studio',
    desc: 'No account or setup needed — pick your layout, take your pictures, and save.',
    color: '#FFF9F2',
  },
];

const STRIP_DEMO = [
  { filter: 'brightness(1.1) saturate(1.2)', emoji: '🌸' },
  { filter: 'sepia(0.5) saturate(1.3)', emoji: '✨' },
  { filter: 'grayscale(1) contrast(1.1)', emoji: '🎀' },
  { filter: 'hue-rotate(20deg) saturate(1.2)', emoji: '💕' },
];

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      heroRef.current.style.transform = `translateY(${y * 0.3}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #FFF9F2 0%, #FDE8EF 40%, #E9E1F5 100%)',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${120 + i * 60}px`,
              height: `${120 + i * 60}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(247,221,229,0.4)' : 'rgba(233,225,245,0.3)'} 0%, transparent 70%)`,
              top: `${[10, 60, 20, 70, 30, 80][i]}%`,
              left: `${[5, 80, 50, 10, 90, 40][i]}%`,
              transform: 'translate(-50%, -50%)',
              animation: `float ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
            }} />
          ))}
        </div>

        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '4rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center',
          width: '100%',
        }} className="hero-grid">
          {/* Left - text */}
          <div className="animate-fade-in">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--white)',
              border: '1px solid rgba(247,221,229,0.8)',
              borderRadius: '50px',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              color: 'var(--dusty-rose)',
              fontWeight: 600,
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <Star size={12} fill="currentColor" /> Korean-Style Photobooth Studio
            </div>

            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--brown)',
              margin: '0 0 1.25rem',
              letterSpacing: '-0.02em',
            }}>
              Your moments,<br />
              <span style={{
                background: 'linear-gradient(135deg, #D4A0B5, #9b8ec4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                your style.
              </span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--warm-gray)',
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: '2rem',
            }}>
              Create aesthetic Korean-style photo strips with live filters, borders, and stickers. 
              Customize your strip in 3 quick steps and download instantly in high resolution.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/booth">
                <button className="btn-primary animate-pulse-glow" style={{ padding: '0.95rem 2.2rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={20} /> Launch Photobooth
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(247,221,229,0.5)',
            }}>
              {[
                { value: '12', label: 'Filters' },
                { value: '8', label: 'Layouts' },
                { value: '300', label: 'DPI Export' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: 'var(--brown)',
                    lineHeight: 1,
                  }}>
                    {stat.value}<span style={{ color: 'var(--dusty-rose)' }}>+</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - demo strips */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
          }} className="animate-slide-right">
            {/* Photo strip mockup */}
            <div
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '10px 8px',
                boxShadow: '0 20px 60px rgba(81,65,59,0.2), 0 8px 25px rgba(212,160,181,0.3)',
                transform: 'rotate(-3deg)',
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              {STRIP_DEMO.map((item, i) => (
                <div key={i} style={{
                  width: 120,
                  height: 90,
                  background: `linear-gradient(135deg, #F7DDE5, #E9E1F5)`,
                  marginBottom: i < 3 ? 6 : 0,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(${45 + i * 30}deg, rgba(247,221,229,0.8), rgba(233,225,245,0.6))`,
                  }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>{item.emoji}</span>
                </div>
              ))}
              <div style={{
                textAlign: 'center',
                marginTop: 8,
                fontSize: '0.6rem',
                color: 'var(--mauve)',
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}>
                ✨ SNAPBOOTH ✨
              </div>
            </div>

            {/* Second strip */}
            <div
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '10px 8px',
                boxShadow: '0 20px 60px rgba(81,65,59,0.2)',
                transform: 'rotate(2deg)',
                animation: 'float 3.5s ease-in-out 0.5s infinite',
              }}
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{
                  width: 100,
                  height: 100,
                  background: `linear-gradient(${120 + i * 40}deg, #E9E1F5, #F7DDE5)`,
                  marginBottom: i < 2 ? 6 : 0,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                }}>
                  {['🌸', '💫', '🎀'][i]}
                </div>
              ))}
              <div style={{
                textAlign: 'center',
                marginTop: 8,
                fontSize: '0.6rem',
                color: 'var(--mauve)',
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}>
                💝 MEMORIES 💝
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          opacity: 0.5,
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--mauve)', letterSpacing: '0.05em' }}>scroll</div>
          <div style={{
            width: 1,
            height: 40,
            background: 'linear-gradient(to bottom, var(--mauve), transparent)',
            animation: 'bounce 1.5s ease-in-out infinite',
          }} />
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '6rem 1.5rem',
        background: 'var(--white)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
              color: 'var(--dusty-rose)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              Everything you need
            </p>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--brown)',
              margin: 0,
            }}>
              A complete photobooth studio
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: '1.75rem',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: feature.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  color: 'var(--brown)',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--brown)',
                  margin: '0 0 0.6rem',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--warm-gray)',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(135deg, #F7DDE5 0%, #E9E1F5 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📸</div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            color: 'var(--brown)',
            margin: '0 0 1rem',
          }}>
            Ready to capture memories?
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--warm-gray)',
            marginBottom: '2rem',
            lineHeight: 1.65,
          }}>
            Start your photobooth session now. No installation required — 
            just open your browser and start shooting!
          </p>
          <Link to="/booth">
            <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
              <Camera size={20} /> Start Photobooth
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--brown)',
        color: 'rgba(255,249,242,0.7)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <Camera size={20} color="var(--soft-pink)" />
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--soft-pink)',
            }}>
              Snapbooth
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
            Your moments, your style.
          </p>
          <p style={{ fontSize: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            Made with <Heart size={12} fill="var(--soft-pink)" color="var(--soft-pink)" /> for beautiful memories
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
