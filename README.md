# DataWire.cc

A modern OSINT-themed static website showcasing DataWire's intelligence platform for Discord. Built with React, Vite, TailwindCSS.

## Features

- **Clean Dark UI**: Black theme with white and green accents
- **Responsive Design**: Works seamlessly on all devices
- **API Documentation**: Interactive command reference for all bots
- **Owner Bios**: Personal profile pages for team members
- **Navigation**: Clean navbar with routing
- **Discord Integration**: Fixed Discord button overlay (bottom-left)
- **Legal Pages**: Privacy Policy and Terms of Service

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Cloudflare Pages (Recommended)

This site is designed for Cloudflare Pages free tier. It's a pure static site with no backend, so it works perfectly with Cloudflare Pages' static hosting.

1. Push your code to a Git repository (GitHub/GitLab)
2. In Cloudflare Pages dashboard, create a new project
3. Connect your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: 18 or higher
5. Deploy!

**Note**: Cloudflare Pages free tier supports static site builds. The "no console/backend" limitation only applies to server-side functions, which this site doesn't use. This is a client-side React app that builds to static HTML/CSS/JS files.

### Other Static Hosting

The `dist` folder can be hosted on any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## Project Structure

```
datawire-cc/
├── src/
│   ├── components/      # Reusable components (Navbar, Footer)
│   ├── pages/          # Page components (Home, Commands, Bios)
│   ├── data/           # API endpoint data
│   ├── App.jsx         # Main app with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind configuration
└── vite.config.js      # Vite configuration
```

## Customization

### Owner Information

Edit owner details in:
- `src/pages/Owner1Bio.jsx`
- `src/pages/Owner2Bio.jsx`

### Discord Link

Update the Discord link in `src/components/Footer.jsx`

### API Endpoints

Modify endpoint data in `src/data/endpoints.js`

### Theme Colors

Customize colors in `tailwind.config.js` under the `osint` color palette.

## License

© 2024 DataWire.cc. All rights reserved.
