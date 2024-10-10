import express from 'express';
import fetch from 'node-fetch';
import cloudinary from 'cloudinary/cloudinary.js';
import cors from 'cors';

const app = express();

const webflowApiToken = '45a980c49c20f88d84ec607ca7c1ded5d2c78d2e02d0ce398a4f13d1b11e7d60';

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dyhvmivey',
  api_key: '482956819452563',
  api_secret: 'PYh1lSt3eXEhn5UsLeLENgSbs9s'
});

// CORS configuration
app.use(cors({
  origin: ['https://www.turterra.com', 'https://turterra.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Endpoint to fetch all items from a collection
app.get('/webflow/:collectionId', async (req, res) => {
    const { collectionId } = req.params;
    const { limit, fields } = req.query;
    
    let url = `https://api.webflow.com/v2/collections/${collectionId}/items`;
    if (limit || fields) {
        url += '?';
        if (limit) url += `limit=${limit}&`;
        if (fields) {
            Object.entries(fields).forEach(([key, value]) => {
                url += `fields[${key}]=${value}&`;
            });
        }
        url = url.slice(0, -1); // Remove trailing '&' or '?'
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${webflowApiToken}`,
                'accept-version': '1.0.0'
            }
        });

        let data = await response.json();
        if (!response.ok) {
            throw new Error(`Error fetching data: ${data.msg}`);
        }
        
        console.log('Raw Webflow API response:', JSON.stringify(data, null, 2));
        
        res.json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching data from Webflow API', details: error.message });
    }
});

// Endpoint to fetch a specific item
app.get('/webflow/:collectionId/:itemId', async (req, res) => {
    const { collectionId, itemId } = req.params;
    console.log(`Received request for collectionId: ${collectionId}, itemId: ${itemId}`);
    try {
        const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`, {
            headers: {
                'Authorization': `Bearer ${webflowApiToken}`,
                'accept-version': '1.0.0'
            }
        });

        let data = await response.json();
        if (!response.ok) {
            throw new Error(`Error fetching data: ${data.msg}`);
        }
        console.log(`Successfully fetched data for itemId: ${itemId} in collectionId: ${collectionId}`, data);
        res.json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching data from Webflow API', details: error.message });
    }
});

// Endpoint to fetch Cloudinary images by species
app.get('/cloudinary/:species', async (req, res) => {
    const { species } = req.params;
    console.log(`Received request for species: ${species}`);
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: `Turtle Species Photos/${species}/`,
            max_results: 500,
            context: true,
            metadata: true,
        });

        console.log(`Total resources fetched: ${result.resources.length}`);

        const filteredImages = result.resources.filter(image => 
            image.metadata &&
            image.metadata.image_use &&
            image.metadata.image_use.includes('turtle_profile___slider')
        );

        console.log(`Filtered images for turtle_profile___slider: ${filteredImages.length}`);

        const imagesWithPrimaryPhoto = filteredImages.filter(image => 
            image.metadata && 
            image.metadata['Primary Photo'] &&
            image.metadata['Primary Photo'].toLowerCase() === 'true'
        );

        const imagesWithoutPrimaryPhoto = filteredImages.filter(image => 
            !image.metadata || 
            !image.metadata['Primary Photo'] ||
            image.metadata['Primary Photo'].toLowerCase() !== 'true'
        );

        const sortedImages = [...imagesWithPrimaryPhoto, ...imagesWithoutPrimaryPhoto];

        res.json(sortedImages);
    } catch (error) {
        console.error('Cloudinary fetch error:', error);
        res.status(500).json({ 
            error: 'Error fetching data from Cloudinary', 
            details: error.message 
        });
    }
});

export default app;
