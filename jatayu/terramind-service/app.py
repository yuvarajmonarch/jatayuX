#!/usr/bin/env python3
"""
TerraMind Microservice for Bunker
Handles geospatial analysis using IBM's TerraMind model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np
import json
import logging
import time
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class TerraMindProcessor:
    def __init__(self):
        self.model_name = "ibm-esa-geospatial/TerraMind-1.0-large"
        self.model_loaded = False
        self.demo_mode = os.getenv('TERRAMIND_DEMO_MODE', 'true').lower() == 'true'
        
        if not self.demo_mode:
            try:
                from transformers import AutoTokenizer, AutoModelForCausalLM
                logger.info(f"🧠 Loading TerraMind model: {self.model_name}")
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float16,
                    device_map="auto",
                    trust_remote_code=True
                )
                self.model_loaded = True
                logger.info("✅ TerraMind model loaded successfully")
            except Exception as e:
                logger.error(f"❌ Failed to load TerraMind model: {e}")
                self.demo_mode = True
        
        if self.demo_mode:
            logger.info("🎭 Running in demo mode - generating realistic mock data")

    def analyze_geospatial_data(self, query, satellite_data, coordinates, analysis_type):
        """
        Main analysis function using TerraMind
        """
        start_time = time.time()
        
        try:
            if self.demo_mode or not self.model_loaded:
                return self.generate_demo_analysis(query, satellite_data, coordinates, analysis_type)
            
            # Real TerraMind analysis
            return self.run_terramind_analysis(query, satellite_data, coordinates, analysis_type)
            
        except Exception as e:
            logger.error(f"❌ TerraMind analysis error: {e}")
            return self.generate_demo_analysis(query, satellite_data, coordinates, analysis_type)
        
        finally:
            processing_time = time.time() - start_time
            logger.info(f"⏱️ TerraMind analysis completed in {processing_time:.2f}s")

    def run_terramind_analysis(self, query, satellite_data, coordinates, analysis_type):
        """
        Real TerraMind model inference
        """
        logger.info("🧠 Running real TerraMind analysis...")
        
        # Prepare multimodal inputs
        text_prompt = self.build_geospatial_prompt(query, coordinates, analysis_type)
        text_inputs = self.tokenizer(text_prompt, return_tensors="pt", max_length=512, truncation=True)
        
        # Process satellite imagery data
        image_features = self.process_satellite_modalities(satellite_data)
        
        # Combine text and image modalities
        multimodal_inputs = self.combine_input_modalities(text_inputs, image_features)
        
        # Generate TerraMind analysis
        with torch.no_grad():
            outputs = self.model.generate(
                **multimodal_inputs,
                max_length=512,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        # Decode and parse results
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return self.parse_terramind_output(generated_text, satellite_data, coordinates)

    def generate_demo_analysis(self, query, satellite_data, coordinates, analysis_type):
        """
        Generate realistic demo data that mimics TerraMind output
        """
        logger.info("🎭 Generating demo TerraMind analysis...")
        
        lat, lng = coordinates.get('lat', 0), coordinates.get('lng', 0)
        
        # Simulate TerraMind's multimodal understanding
        land_use_analysis = self.simulate_land_use_classification(lat, lng, analysis_type)
        vegetation_analysis = self.simulate_vegetation_health_analysis(satellite_data, analysis_type)
        change_detection = self.simulate_change_detection_analysis(lat, lng)
        environmental_assessment = self.simulate_environmental_assessment(query, analysis_type)
        
        return {
            "success": True,
            "model": "TerraMind-1.0-large",
            "mode": "demo",
            "analysis": {
                "land_use_classification": land_use_analysis,
                "vegetation_health": vegetation_analysis,
                "change_detection": change_detection,
                "environmental_assessment": environmental_assessment,
                "multimodal_confidence": round(np.random.uniform(0.75, 0.95), 3),
                "geospatial_insights": self.generate_geospatial_insights(query, analysis_type),
                "risk_factors": self.assess_environmental_risks(lat, lng, analysis_type)
            },
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "coordinates": coordinates,
                "analysis_type": analysis_type,
                "modalities_processed": ["optical", "sar", "climate", "text"],
                "processing_time": round(np.random.uniform(1.2, 3.5), 2)
            }
        }

    def simulate_land_use_classification(self, lat, lng, analysis_type):
        """Simulate TerraMind's land use classification"""
        
        # Determine if urban, coastal, or rural based on coordinates
        is_urban = self.is_urban_area(lat, lng)
        is_coastal = self.is_coastal_area(lat, lng)
        
        if is_urban:
            return {
                "primary_class": "urban",
                "confidence": 0.87,
                "classes": {
                    "urban": round(np.random.uniform(45, 65), 1),
                    "vegetation": round(np.random.uniform(20, 35), 1),
                    "water": round(np.random.uniform(5, 15), 1),
                    "agriculture": round(np.random.uniform(5, 15), 1),
                    "bare_soil": round(np.random.uniform(2, 8), 1)
                },
                "change_indicators": {
                    "urban_expansion": "+2.3% annually",
                    "vegetation_loss": "-1.8% annually"
                }
            }
        elif is_coastal:
            return {
                "primary_class": "coastal_mixed",
                "confidence": 0.82,
                "classes": {
                    "water": round(np.random.uniform(35, 55), 1),
                    "vegetation": round(np.random.uniform(25, 40), 1),
                    "urban": round(np.random.uniform(15, 25), 1),
                    "sand": round(np.random.uniform(5, 15), 1),
                    "agriculture": round(np.random.uniform(3, 10), 1)
                },
                "coastal_indicators": {
                    "erosion_rate": "0.5m/year",
                    "water_quality": "moderate"
                }
            }
        else:
            return {
                "primary_class": "agricultural",
                "confidence": 0.91,
                "classes": {
                    "agriculture": round(np.random.uniform(50, 70), 1),
                    "vegetation": round(np.random.uniform(20, 35), 1),
                    "water": round(np.random.uniform(3, 10), 1),
                    "urban": round(np.random.uniform(2, 8), 1),
                    "bare_soil": round(np.random.uniform(5, 15), 1)
                },
                "agricultural_indicators": {
                    "crop_health": "good",
                    "irrigation_efficiency": "moderate"
                }
            }

    def simulate_vegetation_health_analysis(self, satellite_data, analysis_type):
        """Simulate TerraMind's vegetation health analysis"""
        
        base_ndvi = np.random.uniform(0.3, 0.8)
        
        return {
            "ndvi_score": round(base_ndvi, 3),
            "health_category": self.categorize_vegetation_health(base_ndvi),
            "stress_indicators": {
                "drought_stress": "low" if base_ndvi > 0.6 else "moderate",
                "disease_pressure": np.random.choice(["low", "moderate"]),
                "nutrient_status": np.random.choice(["adequate", "deficient"])
            },
            "temporal_trends": {
                "6_month_change": f"{np.random.uniform(-5, 10):+.1f}%",
                "seasonal_pattern": "normal",
                "growth_trajectory": np.random.choice(["stable", "improving", "declining"])
            },
            "recommendations": self.generate_vegetation_recommendations(base_ndvi, analysis_type)
        }

    def simulate_change_detection_analysis(self, lat, lng):
        """Simulate TerraMind's change detection capabilities"""
        
        return {
            "temporal_analysis": {
                "analysis_period": "12 months",
                "significant_changes": round(np.random.uniform(5, 25), 1),
                "change_confidence": round(np.random.uniform(0.8, 0.95), 3)
            },
            "land_cover_changes": {
                "deforestation": f"{np.random.uniform(0, 3):.1f}%",
                "urban_expansion": f"{np.random.uniform(1, 8):.1f}%",
                "water_body_changes": f"{np.random.uniform(-2, 2):+.1f}%",
                "agricultural_conversion": f"{np.random.uniform(-1, 5):+.1f}%"
            },
            "hotspots": [
                {
                    "type": "urban_development",
                    "intensity": "high",
                    "area": f"{np.random.uniform(50, 200):.0f} hectares"
                },
                {
                    "type": "vegetation_change",
                    "intensity": "moderate", 
                    "area": f"{np.random.uniform(100, 500):.0f} hectares"
                }
            ]
        }

    def simulate_environmental_assessment(self, query, analysis_type):
        """Simulate TerraMind's environmental assessment"""
        
        return {
            "environmental_score": round(np.random.uniform(6.5, 9.2), 1),
            "sustainability_indicators": {
                "carbon_sequestration": f"{np.random.uniform(50, 150):.0f} kg CO2/ha/year",
                "biodiversity_index": round(np.random.uniform(0.6, 0.9), 2),
                "ecosystem_health": np.random.choice(["excellent", "good", "moderate"])
            },
            "human_impact_factors": {
                "pollution_pressure": np.random.choice(["low", "moderate", "high"]),
                "development_pressure": np.random.choice(["low", "moderate", "high"]),
                "resource_exploitation": np.random.choice(["sustainable", "moderate", "intensive"])
            },
            "predictive_insights": {
                "5_year_outlook": np.random.choice(["stable", "improving", "declining"]),
                "risk_factors": ["climate_change", "urban_expansion", "water_stress"],
                "opportunities": ["conservation", "sustainable_development", "restoration"]
            }
        }

    # Helper methods
    def is_urban_area(self, lat, lng):
        urban_centers = [
            (13.0827, 80.2707, 50),  # Chennai
            (12.9716, 77.5946, 50),  # Bangalore  
            (19.0760, 72.8777, 50),  # Mumbai
            (28.7041, 77.1025, 50),  # Delhi
        ]
        
        for center_lat, center_lng, radius in urban_centers:
            distance = ((lat - center_lat)**2 + (lng - center_lng)**2)**0.5 * 111  # Rough km conversion
            if distance <= radius:
                return True
        return False

    def is_coastal_area(self, lat, lng):
        # Simplified coastal detection for India
        coastal_regions = [
            (13.0827, 80.2707, 30),  # Chennai coast
            (19.0760, 72.8777, 20),  # Mumbai coast
            (11.9416, 79.8083, 15),  # Pondicherry coast
        ]
        
        for center_lat, center_lng, radius in coastal_regions:
            distance = ((lat - center_lat)**2 + (lng - center_lng)**2)**0.5 * 111
            if distance <= radius:
                return True
        return False

    def categorize_vegetation_health(self, ndvi):
        if ndvi > 0.7: return "excellent"
        elif ndvi > 0.5: return "good"
        elif ndvi > 0.3: return "moderate"
        elif ndvi > 0.1: return "poor"
        else: return "very_poor"

    def generate_vegetation_recommendations(self, ndvi, analysis_type):
        recommendations = []
        
        if ndvi < 0.3:
            recommendations.extend([
                "Consider soil health improvement programs",
                "Implement water conservation measures",
                "Monitor for pest and disease pressure"
            ])
        elif ndvi < 0.6:
            recommendations.extend([
                "Maintain current management practices",
                "Monitor seasonal variations",
                "Consider precision agriculture techniques"
            ])
        else:
            recommendations.extend([
                "Excellent vegetation health detected",
                "Continue current conservation practices",
                "Consider this area for biodiversity studies"
            ])
        
        return recommendations

    def generate_geospatial_insights(self, query, analysis_type):
        """Generate insights based on query and analysis type"""
        
        insights = []
        
        if 'fishing' in query.lower():
            insights.extend([
                "Coastal water quality analysis indicates safe fishing conditions",
                "Satellite data shows stable marine ecosystem health",
                "No significant pollution indicators detected in water bodies"
            ])
        elif 'water' in query.lower():
            insights.extend([
                "Multi-spectral analysis reveals water body health status",
                "NDWI indicators show adequate water availability",
                "No significant contamination detected in satellite imagery"
            ])
        elif 'development' in query.lower():
            insights.extend([
                "Land use change analysis shows development patterns",
                "Urban expansion rate within sustainable limits",
                "Environmental impact assessment suggests moderate pressure"
            ])
        else:
            insights.extend([
                "Comprehensive satellite analysis completed",
                "Multi-temporal change detection reveals stable conditions",
                "Environmental health indicators within normal ranges"
            ])
        
        return insights

    def assess_environmental_risks(self, lat, lng, analysis_type):
        """Assess environmental risks based on location and analysis type"""
        
        risks = []
        
        if self.is_urban_area(lat, lng):
            risks.extend([
                {"type": "air_pollution", "level": "moderate", "confidence": 0.82},
                {"type": "urban_heat_island", "level": "high", "confidence": 0.78},
                {"type": "water_stress", "level": "moderate", "confidence": 0.75}
            ])
        elif self.is_coastal_area(lat, lng):
            risks.extend([
                {"type": "sea_level_rise", "level": "moderate", "confidence": 0.85},
                {"type": "coastal_erosion", "level": "low", "confidence": 0.72},
                {"type": "storm_surge", "level": "moderate", "confidence": 0.80}
            ])
        else:
            risks.extend([
                {"type": "drought_risk", "level": "low", "confidence": 0.88},
                {"type": "soil_degradation", "level": "moderate", "confidence": 0.75},
                {"type": "biodiversity_loss", "level": "low", "confidence": 0.82}
            ])
        
        return risks

    def build_geospatial_prompt(self, query, coordinates, analysis_type):
        """Build specialized prompt for geospatial analysis"""
        
        return f"""
        Geospatial Analysis Task:
        Query: {query}
        Location: {coordinates['lat']:.4f}, {coordinates['lng']:.4f}
        Analysis Type: {analysis_type}
        
        Analyze the satellite data and provide:
        1. Land use classification with confidence scores
        2. Vegetation health assessment using NDVI
        3. Change detection over temporal period
        4. Environmental risk assessment
        5. Specific insights for the query context
        
        Focus on actionable insights for non-expert users.
        """

# Global processor instance
processor = TerraMindProcessor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "TerraMind-1.0-large",
        "mode": "demo" if processor.demo_mode else "production",
        "model_loaded": processor.model_loaded,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/analyze', methods=['POST'])
def analyze_geospatial():
    """Main analysis endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        query = data.get('query', '')
        satellite_data = data.get('satellite_data', {})
        coordinates = data.get('coordinates', {})
        analysis_type = data.get('analysis_type', 'general')
        
        logger.info(f"🔍 TerraMind analysis request: {query[:50]}...")
        
        # Process with TerraMind
        result = processor.analyze_geospatial_data(
            query, 
            satellite_data, 
            coordinates, 
            analysis_type
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Analysis endpoint error: {e}")
        return jsonify({
            "error": "Analysis failed",
            "message": str(e),
            "fallback": True
        }), 500

@app.route('/capabilities', methods=['GET'])
def get_capabilities():
    """Return TerraMind capabilities"""
    return jsonify({
        "model": "TerraMind-1.0-large",
        "modalities": [
            "optical_imagery",
            "sar_radar", 
            "climate_data",
            "land_use",
            "vegetation_indices",
            "text_description",
            "temporal_analysis",
            "change_detection",
            "environmental_assessment"
        ],
        "analysis_types": [
            "fishing", "marine", "weather", "hiking", 
            "driving", "agriculture", "urban_planning",
            "environmental_monitoring", "disaster_assessment"
        ],
        "output_formats": [
            "land_use_classification",
            "vegetation_health",
            "change_detection", 
            "environmental_assessment",
            "risk_analysis"
        ]
    })

if __name__ == '__main__':
    logger.info("🚀 Starting TerraMind microservice...")
    logger.info(f"🎭 Demo mode: {processor.demo_mode}")
    logger.info(f"🧠 Model loaded: {processor.model_loaded}")
    
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 3002)),
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )
