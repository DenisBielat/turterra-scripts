import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

router.get('/species/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Looking up species with slug:', slug);

    // Clean the slug to match database format
    const cleanSlug = slug.toLowerCase().trim();
    
    const { data, error } = await supabase
      .from('turtle_species')
      .select('id, species_common_name')
      .eq('slug', cleanSlug)
      .limit(1);  // Add limit to ensure we only get one result
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message 
      });
    }
    
    if (!data || data.length === 0) {
      console.log('No species found for slug:', cleanSlug);
      return res.status(404).json({ 
        error: 'Species not found',
        details: `No species found with slug: ${cleanSlug}`
      });
    }
    
    // Return the first match
    console.log('Found species:', data[0]);
    res.json(data[0]);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

router.get('/data', async (req, res) => {
  try {
    const { data, error } = await supabase.from('turtle_species_physical_features').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/feature-keys', async (req, res) => {
  try {
    const { data, error } = await supabase.from('turtle_species_physical_features_key').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
