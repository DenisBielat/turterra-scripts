// supabaseRoutes.mjs
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Get all data from a table
router.get('/data', async (req, res) => {
    try {
        // Replace 'your_table' with your actual table name
        const { data, error } = await supabase
            .from('your_table')
            .select('*')
        
        if (error) throw error
        
        res.json(data);
    } catch (error) {
        console.error('Supabase fetch error:', error);
        res.status(500).json({ 
            error: 'Error fetching data from Supabase', 
            details: error.message 
        });
    }
});

// Add more Supabase-related routes here
router.get('/data/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('your_table')
            .select('*')
            .eq('id', req.params.id)
            .single()
        
        if (error) throw error
        
        res.json(data);
    } catch (error) {
        console.error('Supabase fetch error:', error);
        res.status(500).json({ 
            error: 'Error fetching data from Supabase', 
            details: error.message 
        });
    }
});

export default router;
