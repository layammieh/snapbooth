# Snapbooth

A Korean-style web photobooth studio. Capture, customize, and print your moments.

## 🌸 Features

- 📸 **Live Webcam Photobooth** with countdown timer
- 🎨 **12 Filters** + adjustable brightness, saturation, contrast, etc.
- ✨ **Stickers & Text** overlays with drag/resize
- 📐 **8 Photo Layouts** (strips, grids, single)
- 🖨️ **Custom Print Sizes** at up to 300 DPI
- ☁️ **Cloudinary Cloud Storage** with signed uploads
- 📱 **Fully Responsive** — desktop, tablet, mobile
- 💾 **IndexedDB** local caching

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### Setup

1. **Clone / navigate** to the project directory

2. **Backend setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Cloudinary credentials
   npm install
   npm run dev
   ```

3. **Frontend setup:**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit VITE_API_URL if backend runs on different port
   npm install
   npm run dev
   ```

4. Open **http://localhost:5173**

### Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Copy your **Cloud Name**, **API Key**, and **API Secret**
4. Paste them into `backend/.env`

> ⚠️ Never expose your API Secret in frontend code. The backend handles signatures securely.

## 📁 Project Structure

```
snapbooth/
├── frontend/               # React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route pages
│       ├── hooks/          # Custom React hooks
│       ├── services/       # Cloudinary, IndexedDB
│       ├── utils/          # Canvas rendering, print math
│       └── types/          # TypeScript definitions
└── backend/                # Node.js + Express
    └── src/
        ├── routes/         # API routes
        ├── controllers/    # Business logic
        ├── config/         # Cloudinary config
        └── middleware/     # Error handling
```

## 🎨 Design

- **Color Palette:** Cream, Soft Pink, Lavender, Brown
- **Fonts:** Playfair Display (headings) + DM Sans (body)
- **Style:** Korean photobooth studio aesthetic — minimalist, cute, playful

## 🖨️ Print Sizes Supported

| Label | Dimensions |
|-------|-----------|
| 2×2"  | 2 × 2 inches |
| 2×3"  | 2 × 3 inches |
| 3×4"  | 3 × 4 inches |
| 4×6"  | 4 × 6 inches |
| 5×7"  | 5 × 7 inches |
| 6×8"  | 6 × 8 inches |
| Custom | Any size |

DPI options: 150, 200, 300

## 📝 License

MIT
