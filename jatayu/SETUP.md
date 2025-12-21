# Bunker Setup Guide

Complete setup guide for the Bunker spatial intelligence platform with backend and frontend integration.

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
copy env.example .env

# Add your Gemini API key to .env
GEMINI_API_KEY=your_gemini_api_key_here

# Start backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to main directory
cd ..

# Install dependencies (if not already done)
npm install

# Start frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Windows Users - One-Click Start

Run the `start-dev.bat` file to start both servers automatically.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3001

# Required: Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Mapbox Access Token
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibmlybWFsLTA3IiwiYSI6ImNtZnNqYW91NzBjN2EycXNoYTl6bWx6Ym8ifQ.pckER2f_OX6V10ttE5o3Pw
```

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env` file

## 📋 API Endpoints

### Backend API (Port 3001)

- `POST /api/analyze` - Analyze spatial data
- `POST /api/geocode` - Geocode location names
- `GET /health` - Health check

### Frontend (Port 5173)

- Main application interface
- Automatic backend integration
- Fallback to client-side analysis

## 🎯 Example Usage

### 1. Location Extraction

The system automatically extracts locations from queries:

**Input:** "Is it safe to fish at Tiruvallur today?"
**Process:**
1. Extracts "Tiruvallur" from query
2. Geocodes to coordinates (13.1339, 79.9083)
3. Analyzes fishing conditions
4. Returns AI-powered summary

### 2. Supported Query Types

- **Fishing:** "Is it safe to fish at [location]?"
- **Weather:** "What's the weather like in [location]?"
- **Hiking:** "Hiking conditions near [location]"
- **Driving:** "Driving conditions to [location]"

## 🔍 How It Works

### 1. Query Processing

```
User Query → Location Extraction → Geocoding → Data Fetching → AI Analysis → Results
```

### 2. Data Sources

- **Open-Meteo:** Weather and marine data
- **RainViewer:** Radar imagery
- **Nominatim:** Geocoding (OpenStreetMap)
- **Google Gemini:** AI analysis

### 3. Fallback System

- Backend API → Client-side analysis
- Gemini AI → Rule-based analysis
- Real data → Mock data

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev  # Auto-reload on changes
```

### Frontend Development

```bash
npm run dev  # Vite dev server with HMR
```

### Testing the API

```bash
# Test geocoding
curl -X POST http://localhost:3001/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"location": "Tiruvallur"}'

# Test analysis
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "Is it safe to fish at Tiruvallur today?"}'
```

## 🐛 Troubleshooting

### Backend Issues

1. **Port 3001 already in use:**
   ```bash
   # Change port in .env
   PORT=3002
   ```

2. **Gemini API errors:**
   - Check API key in `.env`
   - Verify API quota limits

3. **External API failures:**
   - Backend includes fallbacks
   - Check internet connection

### Frontend Issues

1. **Backend connection failed:**
   - Ensure backend is running on port 3001
   - Check CORS settings
   - Frontend will fallback to client-side analysis

2. **Mapbox errors:**
   - Map includes fallback component
   - Check browser console for details

## 📊 Features

### ✅ Implemented

- [x] Backend API with Express.js
- [x] Geocoding service (Nominatim)
- [x] Weather data (Open-Meteo)
- [x] Marine data integration
- [x] Radar imagery (RainViewer)
- [x] Gemini AI integration
- [x] Location extraction from queries
- [x] Frontend-backend integration
- [x] Fallback mechanisms
- [x] Error handling
- [x] Real-time data processing

### 🎯 Key Capabilities

- **Smart Location Detection:** Automatically finds locations in queries
- **Multi-Source Data:** Weather, marine, radar, satellite data
- **AI-Powered Analysis:** Intelligent summaries using Gemini
- **Context-Aware Responses:** Different analysis for fishing, hiking, weather
- **Robust Fallbacks:** Works even when services are down
- **Real-Time Updates:** Live data from multiple APIs

## 🚀 Production Deployment

### Backend

```bash
cd backend
npm start  # Production mode
```

### Frontend

```bash
npm run build  # Build for production
npm run preview  # Preview build
```

## 📝 Next Steps

1. **Add your Gemini API key** to `backend/.env`
2. **Start both servers** using `start-dev.bat` or manually
3. **Test with example queries** like "Is it safe to fish at Tiruvallur today?"
4. **Explore different query types** (weather, hiking, driving)

The system is now ready for intelligent spatial analysis! 🎉
