import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Images, Download, Trash2, ExternalLink, Camera, Loader, Calendar, Ruler } from 'lucide-react';
import { getCreations, deleteCreation } from '../services/db';
import { deleteFromCloudinary } from '../services/cloudinary';
import { Creation } from '../types';
import { downloadCanvas } from '../utils/canvas';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

export function GalleryPage() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Creation | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    setLoading(true);
    try {
      const data = await getCreations();
      setCreations(data);
    } catch {
      addToast('Failed to load gallery', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (creation: Creation) => {
    if (!confirm('Delete this creation? This cannot be undone.')) return;
    setDeleting(creation.id);
    try {
      // Delete from Cloudinary if possible
      try {
        await deleteFromCloudinary(creation.cloudinaryPublicId);
      } catch {
        // Backend may not be configured
      }
      await deleteCreation(creation.id);
      setCreations((prev) => prev.filter((c) => c.id !== creation.id));
      if (selected?.id === creation.id) setSelected(null);
      addToast('Creation deleted.', 'info');
    } catch {
      addToast('Failed to delete.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (creation: Creation) => {
    try {
      const response = await fetch(creation.cloudinaryUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `snapbooth-${creation.id.slice(0, 8)}.${creation.format}`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('Downloaded!', 'success');
    } catch {
      addToast('Failed to download.', 'error');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(date));
  };

  const LAYOUT_LABELS: Record<string, string> = {
    single: 'Single', '2h': '2 Horizontal', '2v': '2 Vertical',
    '3strip': '3 Strip', '4strip': '4 Strip', '4grid': '4 Grid', '6grid': '6 Grid', custom: 'Custom',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, var(--soft-pink), var(--lavender))',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Images size={22} style={{ color: 'var(--brown)' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0, color: 'var(--brown)' }}>
                My Creations
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--warm-gray)', margin: 0 }}>
                {creations.length} {creations.length === 1 ? 'photo' : 'photos'} saved to cloud
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '5rem 0' }}>
            <Loader size={32} className="animate-spin" style={{ color: 'var(--dusty-rose)' }} />
            <p style={{ color: 'var(--warm-gray)', fontSize: '0.9rem' }}>Loading your creations…</p>
          </div>
        ) : creations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 1rem',
            background: 'var(--white)',
            borderRadius: 24,
            border: '2px dashed rgba(212,160,181,0.3)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--brown)', margin: '0 0 0.75rem' }}>
              No creations yet
            </h2>
            <p style={{ color: 'var(--warm-gray)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Head to the photobooth, capture some moments, and upload them to see them here.
            </p>
            <Link to="/booth">
              <button className="btn-primary">
                <Camera size={16} /> Start Photobooth
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {creations.map((creation) => (
              <div
                key={creation.id}
                className="card"
                style={{
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                }}
                onClick={() => setSelected(creation)}
              >
                {/* Thumbnail */}
                <div style={{
                  aspectRatio: '4/3',
                  overflow: 'hidden',
                  background: 'var(--cream)',
                  position: 'relative',
                }}>
                  <img
                    src={creation.thumbnailUrl}
                    alt="Creation"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Layout badge */}
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: 20, padding: '2px 8px',
                    fontSize: '0.65rem', fontWeight: 600, color: 'var(--brown)',
                  }}>
                    {LAYOUT_LABELS[creation.layout] || creation.layout}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem', color: 'var(--warm-gray)', fontSize: '0.72rem' }}>
                    <Calendar size={11} />
                    <span>{formatDate(creation.uploadedAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--warm-gray)', fontSize: '0.72rem', marginBottom: '0.75rem' }}>
                    <Ruler size={11} />
                    <span>{creation.width} × {creation.height} · {creation.format.toUpperCase()}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn-icon"
                      style={{ flex: 1, borderRadius: 10, padding: '0.4rem' }}
                      onClick={(e) => { e.stopPropagation(); handleDownload(creation); }}
                      data-tooltip="Download"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ flex: 1, borderRadius: 10, padding: '0.4rem' }}
                      onClick={(e) => { e.stopPropagation(); window.open(creation.cloudinaryUrl, '_blank'); }}
                      data-tooltip="Open Original"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(creation); }}
                      style={{
                        flex: 1, borderRadius: 10, padding: '0.4rem',
                        background: 'var(--white)',
                        border: '1px solid rgba(247,221,229,0.8)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                        color: '#e87c7c',
                      }}
                      disabled={deleting === creation.id}
                      data-tooltip="Delete"
                    >
                      {deleting === creation.id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal-box"
            style={{ padding: '1.5rem', maxWidth: 700, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: 'var(--brown)', margin: 0 }}>
                Photo Details
              </h3>
              <button
                className="btn-icon"
                onClick={() => setSelected(null)}
                style={{ padding: '0.4rem' }}
              >
                ✕
              </button>
            </div>
            <img
              src={selected.cloudinaryUrl}
              alt="Creation"
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 12, marginBottom: '1rem' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--warm-gray)' }}>
              <div><strong style={{ color: 'var(--brown)' }}>Layout:</strong> {LAYOUT_LABELS[selected.layout]}</div>
              <div><strong style={{ color: 'var(--brown)' }}>Format:</strong> {selected.format.toUpperCase()}</div>
              <div><strong style={{ color: 'var(--brown)' }}>Dimensions:</strong> {selected.width} × {selected.height}</div>
              <div><strong style={{ color: 'var(--brown)' }}>Uploaded:</strong> {formatDate(selected.uploadedAt)}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDownload(selected)}>
                <Download size={16} /> Download
              </button>
              <button className="btn-secondary" onClick={() => window.open(selected.cloudinaryUrl, '_blank')}>
                <ExternalLink size={16} /> View Original
              </button>
              <button className="btn-danger" onClick={() => handleDelete(selected)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <style>{`
        @media (max-width: 640px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
