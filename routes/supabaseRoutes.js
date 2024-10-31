// supabaseRoutes.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// New endpoint to get physical features for a specific species
router.get('/species/:speciesId/features', async (req, res) => {
  try {
    // Get the feature keys/structure first
    const { data: featureKeys, error: keysError } = await supabase
      .from('turtle_species_physical_features_key')
      .select('*');
    
    if (keysError) throw keysError;

    // Get the actual feature values for this species
    const { data: featureValues, error: valuesError } = await supabase
      .from('turtle_species_physical_features')
      .select('*')
      .eq('species_id', req.params.speciesId)
      .single();
    
    if (valuesError) throw valuesError;

    // Transform the data into the required structure
    const categories = new Map();
    
    // First, create all main categories
    featureKeys.forEach(key => {
      if (!categories.has(key.category)) {
        categories.set(key.category, {
          name: key.category,
          features: []
        });
      }
    });

    // Then, add features to their categories
    featureKeys.forEach(key => {
      // Skip sub-features for now
      if (key.parent_feature) return;

      const feature = {
        name: key.physical_feature,
        value: featureValues[key.physical_feature.toLowerCase().replace(/\//g, '_')] || 'N/A',
        subFeatures: []
      };

      // Find and add any sub-features
      const subFeatures = featureKeys.filter(k => k.parent_feature === key.id);
      subFeatures.forEach(sub => {
        const subFeatureValue = featureValues[sub.physical_feature.toLowerCase().replace(/\//g, '_')] || 'N/A';
        // Handle array values (like colors)
        const displayValue = Array.isArray(subFeatureValue) 
          ? subFeatureValue.join(', ')
          : subFeatureValue;

        feature.subFeatures.push({
          name: sub.physical_feature,
          value: displayValue
        });
      });

      categories.get(key.category).features.push(feature);
    });

    // Convert Map to array for final response
    const response = {
      categories: Array.from(categories.values())
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
