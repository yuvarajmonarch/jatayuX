# Bunker - Project Vision

## Core User Problem
*   **Who:** Non-experts (farmers, fishermen, hikers, small business owners) who need to make decisions based on Earth data.
*   **Their Frustration:** They know the data exists but can't access or understand it. Current tools are built for scientists, not for someone on a mobile phone in a field.
*   **Emotional Goal:** To feel empowered, informed, and safe, not confused or overwhelmed by technology.

## Our North Star Metric
*   **Primary:** "Number of confident decisions made per week using Bunker."
*   **Secondary:** "Time from question to actionable insight" (Aim: < 30 seconds).

## What We Are NOT
*   We are not a general-purpose chatbot.
*   We are not a scientific research platform.
*   We are not a social network.

## The Future Vision (Beyond the Hackathon)
*   **Community Layer:** Users can contribute ground-truth data ("The fish are biting here today") and validate AI predictions.
*   **Decentralized Data Network:** A system where data providers are compensated and data integrity is verified on a blockchain-like system.
* 



### **Instructions for Cursor AI: Project "Bunker" Build**


### **1. Project Overview & Core Philosophy**

**Project Name:** Bunker
**Tagline:** The Spatial Intelligence Answer Engine.
**Core Concept:** A single-page application (SPA) that lets users ask natural language questions about any location and receive an AI-powered analysis paired with an interactive map showing real-time satellite, radar, and sensor data.

**Design Philosophy:** **Absolute clarity and zero distraction.** The UI must be minimalist, professional, and feel like a precision instrument. Heavily inspired by Perplexity AI's focused, dark-mode interface.

### **2. Tech Stack & Setup**

*   **Framework:** React (via Vite)
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Maps:** Mapbox GL JS
*   **Icons:** Lucide React
*   **Font:** Inter from Google Fonts

### **3. Design System (Non-Negotiable)**

**Color Palette:**
*   `bg-bunker-primary: #0D0D0D` (main background)
*   `bg-bunker-card: #1A1A1A` (cards, panels)
*   `text-bunker-primary: #FFFFFF` (primary text)
*   `text-bunker-secondary: #A1A1A1` (placeholder, secondary text)
*   `border-bunker: #2D2D2D` (borders)
*   `accent-bunker: #3B82F6` (primary buttons, key interactions)
*   `accent-bunker-hover: #2563EB` (button hover state)

**Typography:**
*   **Font:** `Inter` (import from Google Fonts, default sans-serif)
*   **Weights:** `400` (Body), `500` (Sub-headers), `600` (Headers, Buttons)
*   **Input Text:** Must be large and inviting (e.g., `text-xl`)

**Layout:** Centered, single-column layout on all screens. Use Flexbox for vertical and horizontal centering.

### **4. Application Flow & Components**

The app has three main views controlled by React state (`viewState`).

**A. `AskView` Component (Initial State)**
*   **Purpose:** Get the user's query and location.
*   **UI:**
    *   Full-screen `bg-bunker-primary`.
    *   Centered card (`bg-bunker-card`, rounded, border) containing:
        1.  A text `<input>` with placeholder `"Ask anything or mention a location..."`. It must be borderless and large.
        2.  A location button (📍 icon) to the right. Clicking it triggers `navigator.geolocation.getCurrentPosition`.
            *   **States:** Loading (spinner), Success (icon turns blue), Error (subtle tooltip).
        3.  A prominent "Analyze" button (`accent-bunker`, large, rounded).
*   **Function:** On "Analyze" click, package the query string and coordinates (if available) into an object and transition to the `LoadingView`.

**B. `LoadingView` Component**
*   **Purpose:** Smooth transition while data is fetched.
*   **UI:** A full-screen overlay with a subtle animation (e.g., a rotating globe or orbiting circles). Display a text hint like "Analyzing spatial data...".
*   **Animation:** Use Framer Motion for a 400ms crossfade from `AskView` to this screen.

**C. `ResultsView` Component**
*   **Purpose:** Display the analysis and spatial context.
*   **Layout:** Two-column layout (stacks on mobile).
    *   **Left Column (1/3 width - Analysis Panel):** `bg-bunker-card`, contains:
        *   The user's original query.
        *   An AI-generated summary in a slightly darker box (`bg-gray-900`).
        *   A grid of key data points (e.g., Wave Height: 1.5m).
        *   A visual risk indicator (e.g., a color-coded bar).
    *   **Right Column (2/3 width - Map Panel):** `bg-bunker-card`, contains:
        *   A header ("Spatial Context").
        *   A full-width `div` with `id="map-container"` (height: `24rem`). **This is where Mapbox is initialized.**
        *   Layer toggles (e.g., Satellite, Radar) below the map.
        *   Data attribution text (e.g., "Sources: Sentinel-2, NOAA").
    *   **Header:** Contains a "New Search" button to reset the app state.

### **5. Key Functionality & Logic**

*   **Geocoding:** The backend must parse the query string for location names if the user did *not* use the location button.
*   **Map Initialization:** In `ResultsView`, use a `useEffect` hook to initialize the Mapbox map into `#map-container`. Use a dark style (`mapbox://styles/mapbox/dark-v11`).
*   **Data Overlays:** Once data is fetched, add relevant layers to the map (e.g., a marker for the location, radar imagery, satellite tiles).
*   **State Management:** Use React `useState` to manage:
    *   `viewState` ('ask', 'loading', 'results')
    *   `queryData` (null || { query: string, coords: { lat, lng }... })
    *   `isLoading` (boolean)

### **6. Animation Specs**

*   **Library:** Framer Motion.
*   **Transition:** Between all views, use a 400ms opacity fade.
*   **Micro-interactions:** Buttons should have smooth color transition on hover.






























# Bunker UI Implementation Guide

## Design System

### Core Philosophy
- **Clarity First**: Eliminate all non-essential elements
- **Zero Distraction**: Every pixel must serve a purpose
- **Professional Futurism**: Clean, modern, slightly tech-forward aesthetic

### Color Palette
```css
:root {
  --bg-primary: #0D0D0D;      /* Main app background */
  --bg-card: #1A1A1A;         /* Cards, panels, elevated surfaces */
  --text-primary: #FFFFFF;     /* Headers, important text */
  --text-secondary: #A1A1A1;   /* Placeholders, secondary info */
  --accent: #3B82F6;          /* Primary buttons, key interactions */
  --accent-hover: #2563EB;     /* Button hover state */
  --border: #2D2D2D;          /* Subtle borders and dividers */
}
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**:
  - 400 (Regular): Body text
  - 500 (Medium): Sub-headers, captions
  - 600 (Semi-bold): Main headers, primary buttons
- **Scale**: 
  - Input text: 1.25rem (xl)
  - Body: 1rem (base)
  - Headers: 1.5rem (xl) to 2.25rem (3xl)

### Layout Principles
- **Centered Single Column**: All content centered vertically/horizontally
- **Max Width Container**: 2xl (42rem) for main content areas
- **Spacing**: Consistent 4px grid system
- **Border Radius**: Medium (0.5rem) for cards, large (0.75rem) for inputs

## Component Specifications

### 1. AskView Component
**Purpose**: Primary landing and input screen

**Structure**:
```jsx
<div className="min-h-screen bg-bg-primary flex flex-col">
  {/* Header */}
  <header className="p-8 text-center">
    <h1 className="text-3xl font-semibold text-text-primary">Bunker</h1>
    <p className="text-lg text-text-secondary mt-2">Spatial Intelligence for Earth's Data</p>
  </header>

  {/* Main Input Card */}
  <main className="flex flex-grow items-center justify-center px-4">
    <div className="bg-bg-card w-full max-w-2xl rounded-xl p-8 border border-border">
      {/* Input Container */}
      <div className="flex items-center border border-border rounded-lg px-4 py-3 focus-within:border-accent transition-colors">
        <input
          type="text"
          placeholder="Ask anything or mention a location..."
          className="bg-transparent text-xl text-text-primary flex-grow outline-none placeholder:text-text-secondary"
        />
        <LocationButton />
      </div>
      
      {/* Analyze Button */}
      <button className="bg-accent hover:bg-accent-hover text-white font-semibold text-lg mt-6 w-full py-4 rounded-lg transition-colors">
        Analyze
      </button>
    </div>
  </main>
</div>
```

**LocationButton Logic**:
- Click triggers `navigator.geolocation.getCurrentPosition`
- Loading state: Shows spinner icon
- Success: Changes to filled location icon with accent color
- Error: Shows subtle tooltip error message

### 2. LoadingView Component
**Purpose**: Smooth transition between ask and results

**Animation Sequence**:
1. AskView fades out (400ms)
2. LoadingView fades in with rotating globe animation
3. Data fetching occurs in background
4. On completion, LoadingView fades out (400ms)
5. ResultsView fades in (400ms)

**Implementation**:
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-bg-primary flex items-center justify-center"
>
  <GlobeAnimation /> {/* SVG or Lottie animation */}
  <p className="text-text-secondary mt-4">Analyzing spatial data...</p>
</motion.div>
```

### 3. ResultsView Component
**Purpose**: Display analysis and spatial intelligence

**Layout**:
```jsx
<div className="min-h-screen bg-bg-primary p-6">
  {/* Header */}
  <header className="flex justify-between items-center mb-8">
    <h2 className="text-2xl font-semibold text-text-primary">Bunker</h2>
    <button className="text-text-secondary hover:text-text-primary transition-colors">
      New Search
    </button>
  </header>

  {/* Two-column layout */}
  <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
    
    {/* Analysis Panel (Left) */}
    <div className="bg-bg-card rounded-xl p-6 lg:w-1/3 border border-border">
      <h3 className="text-lg font-medium text-text-primary mb-4">Your Analysis</h3>
      
      {/* Query Recap */}
      <p className="text-text-secondary mb-4">"{userQuery}"</p>
      
      {/* AI Summary */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <p className="text-text-primary">Based on current conditions, fishing conditions are 
          <strong className="text-accent"> fair</strong>. Be aware of moderate winds.
        </p>
      </div>
      
      {/* Data Points Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <DataPoint label="Wave Height" value="1.5m" />
        <DataPoint label="Wind Speed" value="18 km/h" />
        <DataPoint label="Water Temp" value="28°C" />
        <DataPoint label="Visibility" value="Good" />
      </div>
      
      {/* Risk Indicator */}
      <RiskIndicator level="medium" />
    </div>

    {/* Map Panel (Right) */}
    <div className="bg-bg-card rounded-xl p-4 lg:w-2/3 border border-border">
      <h3 className="text-lg font-medium text-text-primary mb-4">Spatial Context</h3>
      
      {/* Map Container */}
      <div id="map-container" className="h-96 w-full rounded-lg overflow-hidden">
        {/* Mapbox instance rendered here */}
      </div>
      
      {/* Map Controls */}
      <div className="flex gap-2 mt-3">
        <LayerToggle label="Satellite" />
        <LayerToggle label="Radar" />
        <LayerToggle label="Traffic" />
      </div>
      
      {/* Attribution */}
      <p className="text-text-secondary text-sm mt-3">
        Data sources: Sentinel-2, NOAA, OpenStreetMap
      </p>
    </div>
  </div>
</div>
```

## Animation Specifications

### Page Transitions
- **Duration**: 400ms for all cross-fades
- **Easing**: `ease-in-out` for smooth natural motion
- **Sequence**:
  - Current view fades out → loading appears → results fade in

### Micro-interactions
- **Button Hover**: Smooth color transition (200ms)
- **Input Focus**: Subtle border glow effect
- **Location Success**: Icon fill animation with accent color
- **Data Loading**: Skeleton screens for map and analytics

## Implementation Notes

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bunker: {
          primary: '#0D0D0D',
          card: '#1A1A1A',
          textPrimary: '#FFFFFF',
          textSecondary: '#A1A1A1',
          accent: '#3B82F6',
          accentHover: '#2563EB',
          border: '#2D2D2D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  }
}
```

### Required Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "framer-motion": "^10.16.4",
    "mapbox-gl": "^2.15.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/mapbox-gl": "^2.7.10",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5"
  }
}
```

### Performance Considerations
- Implement virtual scrolling for large result sets
- Use React.memo for expensive components
- Lazy load map components until needed
- Implement debouncing for search queries
- Cache API responses where appropriate

This implementation guide provides a complete foundation for building the Bunker UI with the specified design system and user experience requirements.


# UX Rationale & Design Principles

## Principle 1: Minimal Cognitive Load
*   **Why:** Our users are busy and in the field. They cannot afford to think about the UI.
*   **Implementation:**
    *   One input field. One primary button.
    *   No navigation bars, no settings menus on the main screen.
    * **The map is the answer, not just a visualization.**

## Principle 2: Build Trust Through Transparency
*   **Why:** Users' livelihoods depend on this information. They need to trust it.
*   **Implementation:**
    *   Always show sources (e.g., "Data: NOAA").
    *   The AI summary must be concise and directly supported by the data on the map.
    *   If confidence is low, the UI should indicate it (e.g., "Low confidence: limited satellite data available").

## Principle 3: Resilience is a Feature
*   **Why:** Users might have poor or no internet connectivity.
*   **Implementation:**
    *   Design for offline-first where possible.
    *   Cache previous queries and results locally.
    *   The UI should clearly show connection status (e.g., "Using cached data from 2 hours ago").

    # API Mock Responses & Data Structures

## Mock POST /api/analyze Request
```json
{
  "query": "Is it safe to fish at Marina Beach today?",
  "coordinates": { "lat": 13.0827, "lng": 80.2707 }
}


{
  "summary": "Fishing conditions are FAIR. Waves are 1.2m with moderate winds from the SW. No precipitation expected.",
  "riskLevel": "medium",
  "dataPoints": [
    { "label": "Wave Height", "value": 1.2, "unit": "m" },
    { "label": "Wind Speed", "value": 18, "unit": "km/h" },
    { "label": "Water Temp", "value": 28, "unit": "°C" }
  ],
  "spatialData": {
    "center": [80.2707, 13.0827],
    "zoom": 12,
    "layers": [
      {
        "id": "wave-height",
        "type": "heatmap",
        "source": "noaa",
        "url": "https://api.noaa.gov/wave-data/...",
        "visible": true
      },
      {
        "id": "satellite-imagery",
        "type": "raster",
        "source": "sentinel-2",
        "url": "https://sentinel-cogs.s3.us-west-2.amazonaws.com/...",
        "visible": true
      }
    ]
  },
  "sources": ["NOAA", "Sentinel-2", "OpenStreetMap"]
}

{
  "error": "LocationNotFound",
  "message": "Could not resolve 'Marina Beach' to a specific location. Please be more specific or use your current location.",
  "code": 404
}