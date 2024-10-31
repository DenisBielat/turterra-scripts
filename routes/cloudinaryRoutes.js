import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dyhvmivey',
    api_key: '482956819452563',
    api_secret: 'PYh1lSt3eXEhn5UsLeLENgSbs9s'
});

// Endpoint to fetch Cloudinary images by species and optionally from physical features folder
router.get('/:species', async (req, res) => {
    const { species } = req.params;
    const { tag } = req.query;  // Add a query parameter for the tag
    const formattedSpecies = species.replace(/\s+/g, '-');
    const assetFolders = [
        `Turtle Species Photos/${formattedSpecies}`,
        `Turtle Species Photos/${formattedSpecies}/physical features`
    ];

    try {
        let allResources = [];

        for (const assetFolder of assetFolders) {
            const options = {
                max_results: 500,
                context: true,
                metadata: true,
            };

            // Add tag to options if provided
            if (tag && assetFolder.includes('physical features')) {
                options.tags = tag;
            }

            const result = await cloudinary.v2.api.resources_by_asset_folder(assetFolder, options);
            allResources = allResources.concat(result.resources);
        }

        if (allResources.length === 0) {
            return res.status(404).json({ error: 'No images found for this species or tag' });
        }

        const processedImages = allResources.map(image => ({
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

        // Sort images to put primary photo first, if applicable
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

export default router;
