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
    
    // Add logging to debug
    console.log('Looking up species with slug:', slug);
    
    const { data, error } = await supabase
      .from('turtle_species')
      .select('id, species_common_name')  // Added species_common_name for verification
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No species found for slug:', slug);
      return res.status(404).json({ error: 'Species not found' });
    }
    
    // Add logging for successful lookup
    console.log('Found species:', data);
    
    res.json(data);
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
