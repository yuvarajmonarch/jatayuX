// API integration with backend services
import BunkerAPIClient from './client';

export interface AnalysisResponse {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  dataPoints: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  spatialData: {
    center: [number, number];
    zoom: number;
    layers: Array<{
      id: string;
      type: string;
      source: string;
      url: string;
      visible: boolean;
      opacity?: number;
    }>;
  };
  sources: string[];
  metadata?: {
    timestamp: string;
    coordinates: { lat: number; lng: number };
    elevation?: number;
    analysisType: string;
  };
  // New comprehensive satellite data from backend
  satelliteAnalysis?: {
    landUseChange: string;
    areasAnalyzed: string;
    analysisType: string;
  };
  ndviVegetationAnalysis?: {
    totalChange: string;
    vegetationChange: string;
    urbanChange: string;
    waterChange: string;
    changeIntensity: string;
    validPixels: number;
    ndviComparison?: {
      before: {
        mean: number;
        median: number;
        max: number;
        min: number;
      };
      after: {
        mean: number;
        median: number;
        max: number;
        min: number;
      };
    };
    landUseDistribution?: Array<{
      type: string;
      value: number;
    }>;
  };
  keyInsights?: Array<{
    type: string;
    description: string;
    confidence: string;
  }>;
  changeDetectionData?: any;
  // NEW: TerraMind geospatial insights (optional, non-breaking)
  terraMindInsights?: {
    landUseClassification?: {
      primary_class: string;
      confidence: number;
      classes: {
        urban: number;
        vegetation: number;
        water: number;
        agriculture: number;
        bare_soil: number;
      };
      change_indicators?: {
        urban_expansion: string;
        vegetation_loss: string;
      };
    };
    vegetationHealth?: {
      ndvi_score: string;
      health_category: string;
      stress_indicators: {
        drought_stress: string;
        disease_pressure: string;
      };
      temporal_trends: {
        six_month_change: string;
        growth_trajectory: string;
      };
    };
    changeDetectionAI?: {
      temporal_analysis: {
        analysis_period: string;
        significant_changes: string;
        change_confidence: number;
      };
      land_cover_changes: {
        deforestation: string;
        urban_expansion: string;
        water_body_changes: string;
      };
    };
    environmentalAssessment?: {
      environmental_score: string;
      sustainability_indicators: {
        carbon_sequestration: string;
        biodiversity_index: string;
        ecosystem_health: string;
      };
    };
    geospatialInsights?: string[];
    confidence: number;
    processingTime?: string;
    model: string;
  };
}

// Export AnalysisData as an alias for AnalysisResponse for backward compatibility
export type AnalysisData = AnalysisResponse;

export interface AnalyzeRequest {
  query: string;
  coordinates?: { lat: number; lng: number };
  areaData?: { coordinates: { lat: number; lng: number }[], bounds: any };
}

export const analyzeQuery = async (request: AnalyzeRequest): Promise<AnalysisResponse> => {
  try {
    // Use backend API
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Analysis failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Backend API error, falling back to client:', error);
    
    // Fallback to client-side analysis
    const result = await BunkerAPIClient.analyzeQuery(request);
    return result;
  }
};
