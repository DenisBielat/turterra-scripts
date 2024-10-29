import express from 'express';
import fetch from 'node-fetch';
import cloudinary from 'cloudinary/cloudinary.js';
import supabaseRoutes from './supabaseRoutes.mjs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const webflowApiToken = '45a980c49c20f88d84ec607ca7c1ded5d2c78d2e02d0ce398a4f13d1b11e7d60';

// CORS configuration
const corsOptions = {
  origin: ['https://www.turterra.com', 'https://turterra.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Serve static files with CORS headers
app.use('/icons', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.turterra.com');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(join(__dirname, 'icons')));

app.use('/supabase', supabaseRoutes);

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dyhvmivey',
  api_key: '482956819452563',
  api_secret: 'PYh1lSt3eXEhn5UsLeLENgSbs9s'
});

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
    const formattedSpecies = species.replace(/\s+/g, '-');
    const assetFolder = `Turtle Species Photos/${formattedSpecies}`;
    console.log(`Searching in asset folder: ${assetFolder}`);
    
    try {
        console.log('Attempting to fetch resources from Cloudinary...');
        const result = await cloudinary.v2.api.resources_by_asset_folder(assetFolder, {
            max_results: 500,
            context: true,
            metadata: true,
        });

        console.log(`Total resources fetched: ${result.resources.length}`);

        if (result.resources.length === 0) {
            return res.status(404).json({ error: 'No images found for this species' });
        }

        const processedImages = result.resources.map(image => ({
            public_id: image.public_id,
            secure_url: image.secure_url,
            metadata: {
                primary_photo: image.metadata?.primary_photo === 'true',
                life_stage: image.metadata?.life_stage || '',
                asset_type: image.metadata?.asset_type || '',
                credits_basic: image.metadata?.credits_basic || ''
            }
        }));

        // Sort images to put primary photo first
        processedImages.sort((a, b) => (b.metadata.primary_photo ? 1 : 0) - (a.metadata.primary_photo ? 1 : 0));

        console.log(`Returning ${processedImages.length} processed images`);
        res.json(processedImages);
    } catch (error) {
        console.error('Cloudinary fetch error:', error);
        res.status(500).json({ 
            error: 'Error fetching data from Cloudinary', 
            details: error.message 
        });
    }
});

export default app;
