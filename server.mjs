import express from 'express';
import fetch from 'node-fetch';
import cloudinary from 'cloudinary/cloudinary.js';
// import { v2 as cloudinary } from 'cloudinary';
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

  // Construct the folder path with a trailing slash
  const folderPath = `Turtle Species Photos/${species}/`;
  console.log(`Searching in folder: ${folderPath}`);

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath, // Include the trailing slash
      delimiter: '/',     // Exclude resources in subfolders
      max_results: 500,
      context: true,
      metadata: true,     // Ensure structured metadata is included
    });

    console.log(`Total resources fetched: ${result.resources.length}`);

    // Use all images without filtering by 'image_use'
    const images = result.resources;

    // Separate images where 'Primary Photo' metadata is 'True'
    const imagesWithPrimaryPhoto = images.filter(
      (image) =>
        image.metadata &&
        image.metadata['Primary Photo'] &&
        image.metadata['Primary Photo'].toLowerCase() === 'true'
    );

    const imagesWithoutPrimaryPhoto = images.filter(
      (image) =>
        !image.metadata ||
        !image.metadata['Primary Photo'] ||
        image.metadata['Primary Photo'].toLowerCase() !== 'true'
    );

    // Combine the arrays, placing images with 'Primary Photo' set to 'True' first
    const sortedImages = [...imagesWithPrimaryPhoto, ...imagesWithoutPrimaryPhoto];

    res.json(sortedImages);
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    res.status(500).json({
      error: 'Error fetching data from Cloudinary',
      details: error.message,
    });
  }
});

app.get('/cloudinary/single-image', async (req, res) => {
    const publicId = 'multi-2_glo1nq';

    try {
        console.log(`Attempting to fetch single image with public_id: ${publicId}`);
        const result = await cloudinary.api.resource(publicId, {
            colors: true,
            image_metadata: true,
            context: true,
            metadata: true
        });

        console.log('Cloudinary API response received for single image.');
        console.log('Image details:', JSON.stringify(result, null, 2));

        res.json(result);
    } catch (error) {
        console.error('Cloudinary fetch error:', error);
        res.status(500).json({ 
            error: 'Error fetching single image from Cloudinary', 
            details: error.message 
        });
    }
});

export default app;
