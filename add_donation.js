import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cvflfjrftnteuzfpeiut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmxmanJmdG50ZXV6ZnBlaXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjU3NzcsImV4cCI6MjA4ODAwMTc3N30.-Lt9v1wPdp_TvElBJjNW7l70u2O23ZzbYBtv1vZ0b7Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addDonation() {
    const { data, error } = await supabase.from('donations').insert({
        name: 'Wheelcall LLC (Quasar Alexander) - CEO',
        email: 'quasar@wheelcall.com',
        amount_cents: 55000,
        status: 'completed'
    });

    if (error) {
        console.error('Error adding donation:', error);
    } else {
        console.log('Successfully added in-kind donation:', data);
    }
}

addDonation();
