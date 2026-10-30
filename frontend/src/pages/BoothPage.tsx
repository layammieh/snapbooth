import React, { useState, useCallback, useRef } from 'react';
import {
  Camera, Download, Undo2, Redo2,
  RefreshCw, SlidersHorizontal, Sticker, Layout,
  Cloud, Loader, Check, ArrowRight, ArrowLeft
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CameraView } from '../components/CameraView';
import { PhotoStrip } from '../components/PhotoStrip';
import { FilterPanel } from '../components/FilterPanel';
import { StickerPanel } from '../components/StickerPanel';
import { LayoutSelector } from '../components/LayoutSelector';
import { ToastContainer } from '../components/ToastContainer';
import { useEditor } from '../hooks/useEditor';
import { useToast } from '../hooks/useToast';
import { renderPhotoStrip, downloadCanvas, getPrintPixels } from '../utils/canvas';
import { uploadToCloudinary } from '../services/cloudinary';
import { saveCreation } from '../services/db';
import { getPhotoCountForLayout, Creation } from '../types';

type BoothStep = 'layout' | 'capture' | 'customize';
type CustomizeTab = 'filters' | 'borders' | 'stickers';
type CountdownOption = 0 | 3 | 5 | 10;

export function BoothPage() {
  const editor = useEditor();
  const { toasts, addToast, removeToast } = useToast();

  const [step, setStep] = useState<BoothStep>('layout');
  const [customizeTab, setCustomizeTab] = useState<CustomizeTab>('filters');
  const [footerText, setFooterText] = useState('Snapbooth');
  const [countdown, setCountdown] = useState<CountdownOption>(3);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const maxPhotos = getPhotoCountForLayout(editor.layout);
  const sampleImage = editor.photos[0]?.dataUrl;

  const handleCapture = useCallback((dataUrl: string) => {
    editor.addPhoto(dataUrl);
    if (editor.photos.length + 1 >= maxPhotos) {
      addToast(`All ${maxPhotos} photos captured! Moving to customization ✨`, 'success');
      setTimeout(() => {
        setStep('customize');
      }, 700);
    }
  }, [editor, maxPhotos, addToast]);

  const handleDownload = useCallback(async (format: 'png' | 'jpeg' = 'png') => {
    if (editor.photos.length === 0) {
      addToast('Capture at least one photo first!', 'warning');
      return;
    }
    setIsExporting(true);
    try {
      const pixels = getPrintPixels(editor.printSettings, editor.layout);
      const dataUrl = await renderPhotoStrip(
        editor.photos.map((p) => p.dataUrl),
        editor.layout,
        editor.filter,
        editor.adjustments,
        editor.stickers,
        editor.background,
        editor.borderWidth,
        editor.borderColor,
        pixels,
        footerText
      );
      const filename = `snapbooth-${Date.now()}.${format}`;
      downloadCanvas(dataUrl, filename, format);
      addToast(`Downloaded photostrip as ${format.toUpperCase()}! 🎉`, 'success');
    } catch {
      addToast('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [editor, footerText, addToast]);

  const handleUpload = useCallback(async () => {
    if (editor.photos.length === 0) {
      addToast('Capture at least one photo first!', 'warning');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const pixels = getPrintPixels(editor.printSettings, editor.layout);
      const dataUrl = await renderPhotoStrip(
        editor.photos.map((p) => p.dataUrl),
        editor.layout,
        editor.filter,
        editor.adjustments,
        editor.stickers,
        editor.background,
        editor.borderWidth,
        editor.borderColor,
        pixels,
        footerText
      );

      const publicId = `snap-${uuidv4().slice(0, 8)}`;
      const result = await uploadToCloudinary(dataUrl, publicId, (p) => setUploadProgress(p));

      const creation: Creation = {
        id: uuidv4(),
        sessionId: uuidv4(),
        cloudinaryPublicId: result.publicId,
        cloudinaryUrl: result.secureUrl,
        thumbnailUrl: result.secureUrl,
        width: result.width,
        height: result.height,
        format: result.format,
        layout: editor.layout,
        uploadedAt: new Date(),
      };

      await saveCreation(creation);
      addToast('Saved to Cloud & Gallery! ☁️', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      addToast(msg.includes('signature') ? 'Backend not configured. Check Cloudinary settings.' : msg, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [editor, addToast]);

  const restartWorkflow = () => {
    editor.resetEditing();
    setStep('layout');
  };

  return (
    <div className="booth-workflow-container">
      {/* Step Stepper Header */}
      <div className="booth-header">
        {/* Step indicators */}
        <div className="booth-stepper">
          {[
            { id: 'layout', label: '1. Choose Layout' },
            { id: 'capture', label: '2. Capture Photos' },
            { id: 'customize', label: '3. Customize & Download' },
          ].map((s, idx) => {
            const isActive = step === s.id;
            const isCompleted =
              (s.id === 'layout' && (step === 'capture' || step === 'customize')) ||
              (s.id === 'capture' && step === 'customize');

            return (
              <React.Fragment key={s.id}>
                {idx > 0 && (
                  <div className="stepper-divider" style={{
                    width: 20,
                    height: 2,
                    background: isCompleted ? 'var(--dusty-rose)' : 'rgba(247,221,229,0.7)',
                    borderRadius: 1,
                  }} />
                )}
                <button
                  onClick={() => {
                    if (s.id === 'layout') setStep('layout');
                    else if (s.id === 'capture') setStep('capture');
                    else if (s.id === 'customize' && editor.photos.length > 0) setStep('customize');
                  }}
                  className="stepper-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: (s.id === 'customize' && editor.photos.length === 0) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 20,
                    color: isActive ? 'var(--brown)' : isCompleted ? 'var(--dusty-rose)' : 'var(--warm-gray)',
                    fontWeight: isActive ? 700 : isCompleted ? 600 : 400,
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    background: isActive ? 'var(--brown)' : isCompleted ? 'var(--soft-pink)' : 'var(--cream)',
                    color: isActive ? '#fff' : isCompleted ? 'var(--brown)' : 'var(--warm-gray)',
                  }}>
                    {isCompleted ? <Check size={12} /> : idx + 1}
                  </span>
                  <span className="stepper-label">{s.label.split('. ')[1]}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Global actions */}
        <div className="booth-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {step === 'capture' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--warm-gray)' }}>Timer:</span>
              {([0, 3, 5, 10] as CountdownOption[]).map((n) => (
                <button
                  key={n}
                  onClick={() => setCountdown(n)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: 6,
                    border: `1.5px solid ${countdown === n ? 'var(--dusty-rose)' : 'rgba(247,221,229,0.7)'}`,
                    background: countdown === n ? 'var(--soft-pink)' : 'transparent',
                    fontSize: '0.75rem',
                    fontWeight: countdown === n ? 700 : 400,
                    cursor: 'pointer',
                    color: countdown === n ? 'var(--brown)' : 'var(--warm-gray)',
                  }}
                >
                  {n === 0 ? 'Off' : `${n}s`}
                </button>
              ))}
            </div>
          )}

          {step === 'customize' && (
            <>
              <button
                className="btn-icon"
                onClick={editor.undo}
                disabled={!editor.canUndo}
                data-tooltip="Undo"
                style={{ opacity: editor.canUndo ? 1 : 0.4 }}
              >
                <Undo2 size={16} />
              </button>
              <button
                className="btn-icon"
                onClick={editor.redo}
                disabled={!editor.canRedo}
                data-tooltip="Redo"
                style={{ opacity: editor.canRedo ? 1 : 0.4 }}
              >
                <Redo2 size={16} />
              </button>
              <button
                className="btn-primary"
                onClick={() => handleDownload('png')}
                disabled={isExporting}
                style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
              >
                <Download size={15} /> Download Photo
              </button>
            </>
          )}

          <button
            className="btn-ghost"
            onClick={restartWorkflow}
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
          >
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Main Step Body */}
      <div className="booth-step-body" style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        {/* STEP 1: LAYOUT SELECTION */}
        {step === 'layout' && (
          <div className="booth-layout-step" style={{
            maxWidth: 920,
            margin: '0 auto',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '0.5rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--brown)', margin: '0 0 0.35rem' }}>
                Select Your Photo Strip Layout
              </h2>
              <p style={{ color: 'var(--warm-gray)', fontSize: '0.9rem', margin: 0 }}>
                Pick your classic vertical photostrip or grid format before taking photos.
              </p>
            </div>

            <div className="card" style={{ width: '100%', padding: '1.25rem 1.5rem', overflow: 'visible' }}>
              <LayoutSelector active={editor.layout} onChange={editor.setLayout} />
            </div>

            <button
              className="btn-primary animate-pulse-glow"
              onClick={() => setStep('capture')}
              style={{
                padding: '0.85rem 2.8rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              Continue to Camera ({maxPhotos} {maxPhotos === 1 ? 'Photo' : 'Photos'})
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: CAPTURE PHOTOS */}
        {step === 'capture' && (
          <div className="booth-capture-grid" style={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '1rem',
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            overflow: 'hidden',
          }}>
            {/* Camera Frame */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <CameraView
                onCapture={handleCapture}
                countdownSeconds={countdown}
                isCapturing={isCapturing}
                onCaptureStart={() => setIsCapturing(true)}
                onCaptureEnd={() => setIsCapturing(false)}
                maxPhotos={maxPhotos}
                currentPhotoCount={editor.photos.length}
                activeFilter={editor.filter}
                adjustments={editor.adjustments}
              />
            </div>

            {/* Live Strip Progress */}
            <div className="card booth-capture-sidebar" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1rem',
              overflowY: 'auto',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--brown)' }}>
                    Your Photo Strip
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--dusty-rose)', fontWeight: 600 }}>
                    {editor.photos.length} / {maxPhotos}
                  </span>
                </div>

                <PhotoStrip
                  photos={editor.photos}
                  layout={editor.layout}
                  background={editor.background}
                  borderWidth={editor.borderWidth}
                  borderColor={editor.borderColor}
                  activeFilter={editor.filter}
                  adjustments={editor.adjustments}
                  footerText={footerText}
                  onRemovePhoto={editor.removePhoto}
                  selectedIndex={editor.selectedPhotoIndex}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {editor.photos.length >= maxPhotos ? (
                  <button
                    className="btn-primary animate-pulse-glow"
                    onClick={() => setStep('customize')}
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                  >
                    Proceed to Customize <ArrowRight size={16} />
                  </button>
                ) : (
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--warm-gray)', margin: 0 }}>
                    Take {maxPhotos - editor.photos.length} more {maxPhotos - editor.photos.length === 1 ? 'photo' : 'photos'} to finish!
                  </p>
                )}

                <button
                  className="btn-ghost"
                  onClick={() => setStep('layout')}
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                >
                  <ArrowLeft size={14} /> Change Layout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CUSTOMIZE & DOWNLOAD */}
        {step === 'customize' && (
          <div className="booth-customize-grid" style={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '1rem',
            maxWidth: 1250,
            margin: '0 auto',
            width: '100%',
            overflow: 'hidden',
          }}>
            {/* Left: Strip Preview and Quick Controls */}
            <div className="card booth-customize-preview" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '1.5rem 1rem',
              overflowY: 'auto',
              maxHeight: '100%',
              background: 'linear-gradient(135deg, rgba(255,249,242,0.8), rgba(247,221,229,0.3))',
            }}>
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                padding: '0.5rem 0',
              }}>
                <PhotoStrip
                  photos={editor.photos}
                  layout={editor.layout}
                  background={editor.background}
                  borderWidth={editor.borderWidth}
                  borderColor={editor.borderColor}
                  activeFilter={editor.filter}
                  adjustments={editor.adjustments}
                  stickers={editor.stickers}
                  selectedStickerId={editor.selectedStickerId}
                  onSelectSticker={editor.selectSticker}
                  onUpdateSticker={editor.updateSticker}
                  onRemoveSticker={editor.removeSticker}
                  footerText={footerText}
                  onFooterTextChange={setFooterText}
                  onRemovePhoto={editor.removePhoto}
                  onEmptySlotClick={() => setStep('capture')}
                  selectedIndex={editor.selectedPhotoIndex}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1rem',
                width: '100%',
                justifyContent: 'center',
                flexWrap: 'wrap',
                flexShrink: 0,
              }}>
                <button
                  className="btn-primary"
                  onClick={() => handleDownload('png')}
                  disabled={isExporting}
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                >
                  <Download size={18} /> Download
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setStep('capture')}
                  style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <Camera size={16} /> Retake Photos
                </button>
              </div>
            </div>

            {/* Right: Customization Controls (Filters, Borders, Stickers) */}
            <div className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
            }}>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                padding: '0.65rem 0.75rem',
                gap: '0.5rem',
                borderBottom: '1.5px solid rgba(212,160,181,0.3)',
                background: 'linear-gradient(180deg, #F5EAE6 0%, #EDE1DC 100%)',
                boxShadow: 'inset 0 1px 3px rgba(81,65,59,0.06)',
              }}>
                {[
                  { id: 'filters', label: 'Filters', icon: <SlidersHorizontal size={15} /> },
                  { id: 'borders', label: 'Borders & Color', icon: <Layout size={15} /> },
                  { id: 'stickers', label: 'Stickers', icon: <Sticker size={15} /> },
                ].map((tab) => {
                  const isActive = customizeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCustomizeTab(tab.id as CustomizeTab)}
                      className={isActive ? 'tab-active' : 'tab-inactive'}
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        border: isActive ? '1.5px solid var(--dusty-rose)' : '1px solid rgba(140,123,117,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        borderRadius: 12,
                        background: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                        color: isActive ? 'var(--brown)' : 'var(--warm-gray)',
                        boxShadow: isActive ? '0 2px 8px rgba(81,65,59,0.12)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ color: isActive ? 'var(--dusty-rose)' : 'inherit', display: 'flex', alignItems: 'center' }}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                {customizeTab === 'filters' && (
                  <FilterPanel
                    sampleImage={sampleImage}
                    activeFilter={editor.filter}
                    adjustments={editor.adjustments}
                    onFilterChange={editor.setFilter}
                    onAdjustmentChange={(k, v) => editor.updateAdjustment(k, v)}
                  />
                )}

                {customizeTab === 'borders' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <p className="section-label">Border Width</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                          type="range"
                          min={0}
                          max={30}
                          value={editor.borderWidth}
                          onChange={(e) => editor.setBorder(parseInt(e.target.value) || 0, editor.borderColor)}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brown)', minWidth: 36 }}>
                          {editor.borderWidth}px
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="section-label">Border Color</p>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        {['#FFFFFF', '#51413B', '#D4A0B5', '#E9E1F5', '#000000', '#FDE8EF', '#D4E8D4', '#E8C47C'].map((c) => (
                          <button
                            key={c}
                            onClick={() => editor.setBorder(editor.borderWidth, c)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: c,
                              border: editor.borderColor === c ? '2.5px solid var(--brown)' : '1.5px solid rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        className="input-field"
                        value={editor.borderColor}
                        onChange={(e) => editor.setBorder(editor.borderWidth, e.target.value)}
                        style={{ height: 38, padding: '2px 6px', width: '100%' }}
                      />
                    </div>

                    <div>
                      <p className="section-label">Background Color</p>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        {['#FFFFFF', '#FFF9F2', '#F7DDE5', '#E9E1F5', '#000000', '#FDE8EF', '#D4E8D4', '#1a1a2e'].map((c) => (
                          <button
                            key={c}
                            onClick={() => editor.setBackground(c)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: c,
                              border: editor.background === c ? '2.5px solid var(--brown)' : '1.5px solid rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        className="input-field"
                        value={editor.background}
                        onChange={(e) => editor.setBackground(e.target.value)}
                        style={{ height: 38, padding: '2px 6px', width: '100%' }}
                      />
                    </div>
                  </div>
                )}

                {customizeTab === 'stickers' && (
                  <StickerPanel
                    stickers={editor.stickers}
                    selectedId={editor.selectedStickerId}
                    onAddSticker={editor.addSticker}
                    onUpdateSticker={editor.updateSticker}
                    onRemoveSticker={editor.removeSticker}
                    onSelectSticker={editor.selectSticker}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
