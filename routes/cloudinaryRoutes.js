import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dyhvmivey',
    api_key: '482956819452563',
    api_secret: 'PYh1lSt3eXEhn5UsLeLENgSbs9s'
});

// Endpoint to fetch Cloudinary images by species
router.get('/:species', async (req, res) => {
    const { species } = req.params;
    const formattedSpecies = species.replace(/\s+/g, '-');
    const assetFolder = `Turtle Species Photos/${formattedSpecies}`;
    
    try {
        const result = await cloudinary.v2.api.resources_by_asset_folder(assetFolder, {
            max_results: 500,
            context: true,
            metadata: true,
        });

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

        res.json(processedImages);
    } catch (error) {
        console.error('Cloudinary fetch error:', error);
        res.status(500).json({ 
            error: 'Error fetching data from Cloudinary', 
            details: error.message 
        });
    }
});

// Endpoint to fetch Cloudinary images from physical features folder by species
router.get('/:species/physical-features', async (req, res) => {
    const { species } = req.params;
    const formattedSpecies = species.replace(/\s+/g, '-');
    const assetFolder = `Turtle Species Photos/${formattedSpecies}/physical-features`;

    try {
        const result = await cloudinary.v2.api.resources_by_asset_folder(assetFolder, {
            max_results: 500,
            context: true,
            metadata: true,
        });

        if (result.resources.length === 0) {
            return res.status(404).json({ error: 'No images found for this species in physical features folder' });
        }

        const processedImages = result.resources.map(image => ({
            public_id: image.public_id,
            secure_url: image.secure_url,
            tags: image.tags || [],  // Include tags associated with each image
            metadata: {
                primary_photo: image.metadata?.primary_photo === 'true',
                life_stage: image.metadata?.life_stage || '',
                asset_type: image.metadata?.asset_type || '',
                credits_basic: image.metadata?.credits_basic || ''
            }
        }));

        res.json(processedImages);
    } catch (error) {
        console.error('Cloudinary fetch error:', error);
        res.status(500).json({ 
            error: 'Error fetching data from Cloudinary', 
            details: error.message 
        });
    }
});


export default router;
