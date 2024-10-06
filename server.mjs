import express from 'express';
import fetch from 'node-fetch';
import cloudinary from 'cloudinary/cloudinary.js';

const app = express();

const webflowApiToken = process.env.WEBFLOW_API_TOKEN;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

// Middleware to add CORS headers
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });

// CORS configuration
const corsOptions = {
  origin: ['https://www.turterra.com', 'https://turterra.com'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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
        
        // Log the raw response data
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
            metadata: true, // Ensure structured metadata is included
        });

        console.log(`Total resources fetched: ${result.resources.length}`);

        // Filter images based on 'image_use' metadata
        const filteredImages = result.resources.filter(image => 
            image.metadata &&
            image.metadata.image_use &&
            image.metadata.image_use.includes('turtle_profile___slider')
        );

        console.log(`Filtered images for turtle_profile___slider: ${filteredImages.length}`);

        // Separate images where 'Primary Photo' metadata is 'True'
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

        // Combine the arrays, placing images with 'Primary Photo' set to 'True' first
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



// Endpoint to fetch physical feature descriptions by species
app.get('/physical-feature-descriptions/:species', async (req, res) => {
    const { species } = req.params;
    console.log(`Received request for physical feature descriptions of species: "${species}"`);
    
    // Replace with your actual collection ID for Physical Feature Descriptions
    const collectionId = '66a0588095271acf6788490b';
    
    try {
        const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
            headers: {
                'Authorization': `Bearer ${webflowApiToken}`,
                'accept-version': '1.0.0'
            }
        });

        let data = await response.json();
        if (!response.ok) {
            throw new Error(`Error fetching data: ${data.msg}`);
        }

        console.log(`Fetched ${data.items.length} items from collection`);
        
        const speciesItem = data.items.find(item => {
            console.log(`Checking item slug: ${item.fieldData?.slug} against "${species}"`);
            return item.fieldData?.slug === species;
        });

        if (!speciesItem) {
            throw new Error(`No physical feature descriptions found for species: ${species}`);
        }

        // Extract the relevant fields
        const descriptions = {
            eyes_and_face: speciesItem.fieldData['eyes-and-face'],
            neck: speciesItem.fieldData.neck,
            skin_and_limbs: speciesItem.fieldData['skin-and-limbs'],
            shell_top: speciesItem.fieldData['shell-top'],
            shell_bottom: speciesItem.fieldData['shell-bottom'],
            coloration: speciesItem.fieldData.coloration,
            male_specific: speciesItem.fieldData['male-specific'],
            female_specific: speciesItem.fieldData['female-specific'],
            hatchling: speciesItem.fieldData.hatchling
        };

        console.log(`Successfully fetched physical feature descriptions for species: ${species}`);
        console.log("Descriptions:", descriptions);
        res.json(descriptions);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching physical feature descriptions', details: error.message });
    }
});

app.get('/turtle-physical-feature-attributes/:speciesId', async (req, res) => {
    const { speciesId } = req.params;
    const attributesCollectionId = '66a022bd3a568364adf0a95d';

    try {
        const attributesResponse = await fetch(
            `https://api.webflow.com/v2/collections/${attributesCollectionId}/items?limit=100&fields[associated-turtle-species]=${speciesId}`,
            {
                headers: {
                    'Authorization': `Bearer ${webflowApiToken}`,
                    'accept-version': '1.0.0'
                }
            }
        );

        let attributesData = await attributesResponse.json();
        if (!attributesResponse.ok) {
            throw new Error(`Error fetching attributes data: ${attributesData.msg}`);
        }

        const filteredItems = attributesData.items.filter(item => 
            item.fieldData['associated-turtle-species'] && 
            item.fieldData['associated-turtle-species'].includes(speciesId)
        );

        // Fetch the collection schema for attribute type text
        const schemaResponse = await fetch(`https://api.webflow.com/v2/collections/${attributesCollectionId}`, {
            headers: {
                'Authorization': `Bearer ${webflowApiToken}`,
                'accept-version': '1.0.0'
            }
        });

        const schemaData = await schemaResponse.json();
        if (!schemaResponse.ok) {
            throw new Error(`Error fetching schema data: ${schemaData.msg}`);
        }

        const attributeTypeField = schemaData.fields.find(field => field.slug === 'attribute-type');
        const attributeTypeChoices = attributeTypeField.validations.options;

        const filteredItemsWithTextValues = filteredItems.map(item => ({
            ...item,
            fieldData: {
                ...item.fieldData,
                'attribute-type-text': attributeTypeChoices.find(choice => choice.id === item.fieldData['attribute-type'])?.name || 'Unknown'
            }
        }));

        res.json(filteredItemsWithTextValues);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching turtle attributes', details: error.message });
    }
});

export default app;
