import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import AskView from './components/AskView';
import LoadingView from './components/LoadingView';
import ResultsView from './components/ResultsView';
import { analyzeQuery, type AnalysisResponse } from './api/analyze';
import { geocodeLocation, extractLocationFromQuery } from './api/geocode';

type ViewState = 'ask' | 'loading' | 'results';

interface QueryData {
  query: string;
  coordinates?: { lat: number; lng: number };
  areaData?: { coordinates: { lat: number; lng: number }[], bounds: any };
}

function App() {
  const [viewState, setViewState] = useState<ViewState>('ask');
  const [queryData, setQueryData] = useState<QueryData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Global error handler to suppress external script errors
  useEffect(() => {
    // Use a more stable approach - only run once and don't modify global objects
    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      if (message.includes('speed.js') || 
          message.includes('playbackRate') || 
          message.includes('Cannot read properties of null') ||
          message.includes('Cannot set properties of null')) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason || '';
      if (message.includes('speed.js') || 
          message.includes('playbackRate')) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleAnalyze = async (query: string, coordinates?: { lat: number; lng: number }, areaData?: { coordinates: { lat: number; lng: number }[], bounds: any }) => {
    try {
      setError(null);
      setViewState('loading');
      
      let finalCoordinates = coordinates;
      
      // If no coordinates provided, try to extract location from query
      if (!finalCoordinates) {
        const extractedLocation = extractLocationFromQuery(query);
        if (extractedLocation) {
          const geocodeResult = await geocodeLocation(extractedLocation);
          if ('lat' in geocodeResult) {
            finalCoordinates = { lat: geocodeResult.lat, lng: geocodeResult.lng };
          } else {
            throw new Error(geocodeResult.message);
          }
        } else {
          // Use default coordinates (Chennai) if no location found
          finalCoordinates = { lat: 13.0827, lng: 80.2707 };
        }
      }

      // Store query data
      const data: QueryData = { query, coordinates: finalCoordinates, areaData };
      setQueryData(data);

      // Analyze the query
      const analysis = await analyzeQuery({
        query,
        coordinates: finalCoordinates,
        areaData
      });

      setAnalysisData(analysis);
      setViewState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
      setViewState('ask');
    }
  };

  const handleNewSearch = () => {
    setViewState('ask');
    setQueryData(null);
    setAnalysisData(null);
    setError(null);
  };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {viewState === 'ask' && (
          <AskView key="ask" onAnalyze={handleAnalyze} />
        )}
        
        {viewState === 'loading' && (
          <LoadingView key="loading" />
        )}
        
        {viewState === 'results' && queryData && analysisData && (
          <ResultsView
            key="results"
            query={queryData.query}
            coordinates={queryData.coordinates}
            analysisData={analysisData}
            onNewSearch={handleNewSearch}
          />
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default App;