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
    const { data, error } = await supabase
      .from('turtle_species')
      .select('id, species_common_name')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Species not found' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/data/:speciesId', async (req, res) => {
  try {
    const { speciesId } = req.params;
    const { data, error } = await supabase
      .from('turtle_species_physical_features')
      .select('*')
      .eq('species_id', speciesId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Physical features not found' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/feature-keys', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('turtle_species_physical_features_key')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
