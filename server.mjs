import express from 'express';
import fetch from 'node-fetch';
//import cloudinary from 'cloudinary/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
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

// Helper function to format the common name
function formatCommonName(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Hardcoded endpoint to fetch Cloudinary images for a specific turtle
app.get('/cloudinary/test', async (req, res) => {
    const hardcodedSpecies = 'big-headed-pantanal-swamp-turtle';
    const folderPath = `turtle-species-photos/${hardcodedSpecies}`;
    console.log(`Searching in hardcoded folder: ${folderPath}`);
    
    try {
        console.log('Attempting to fetch resources from Cloudinary using search API...');
        const result = await cloudinary.search
            .expression(`folder:${folderPath}`)
            .with_field('context')
            .with_field('metadata')
            .max_results(500)
            .execute();

        console.log('Cloudinary Search API response received.');
        console.log(`Total resources fetched: ${result.resources ? result.resources.length : 0}`);
        
        if (!result.resources || result.resources.length === 0) {
            console.log('No resources found. Cloudinary response:', JSON.stringify(result, null, 2));
            return res.status(404).json({ error: 'No images found for this turtle' });
        }

        // Log the public IDs and metadata
        console.log('All fetched resource public_ids and metadata:');
        result.resources.forEach(resource => {
            console.log('Public ID:', resource.public_id);
            console.log('Metadata:', resource.metadata);
        });

        // Separate images where 'Primary Photo' metadata is 'True'
        const imagesWithPrimaryPhoto = result.resources.filter(image => 
            image.metadata && 
            image.metadata.primary_photo &&
            image.metadata.primary_photo.toLowerCase() === 'true'
        );

        const imagesWithoutPrimaryPhoto = result.resources.filter(image => 
            !image.metadata || 
            !image.metadata.primary_photo ||
            image.metadata.primary_photo.toLowerCase() !== 'true'
        );

        // Combine the arrays, placing images with 'Primary Photo' set to 'True' first
        const sortedImages = [...imagesWithPrimaryPhoto, ...imagesWithoutPrimaryPhoto];

        console.log(`Returning ${sortedImages.length} images`);
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
