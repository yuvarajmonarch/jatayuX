const express = require('express');
const geocodeService = require('../services/geocodeService');

const router = express.Router();

/**
 * POST /api/geocode
 * Geocode a location string to coordinates
 */
router.post('/', async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || typeof location !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Location string is required'
      });
    }

    const coordinates = await geocodeService.geocodeLocation(location.trim());

    res.json({
      success: true,
      data: coordinates
    });

  } catch (error) {
    console.error('Geocode route error:', error.message);
    
    res.status(404).json({
      error: 'Location Not Found',
      message: error.message
    });
  }
});

/**
 * GET /api/geocode?q=location
 * Geocode via query parameter (alternative endpoint)
 */
router.get('/', async (req, res) => {
  try {
    const { q: location } = req.query;

    if (!location) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Query parameter "q" is required'
      });
    }

    const coordinates = await geocodeService.geocodeLocation(location.trim());

    res.json({
      success: true,
      data: coordinates
    });

  } catch (error) {
    console.error('Geocode route error:', error.message);
    
    res.status(404).json({
      error: 'Location Not Found',
      message: error.message
    });
  }
});

module.exports = router;
