import { supabase } from './supabase';

export async function ensureBusinessExists(userId: string, businessName?: string) {
  // Check if business already exists
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingBusiness) {
    console.log('Business already exists:', existingBusiness.id);
    return existingBusiness;
  }

  console.log('Creating new business for user:', userId);

  // Create business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      name: businessName || 'My Septic Company',
      user_id: userId,
      industry: 'Septic Services',
      avg_job_value: 575,
    })
    .select()
    .single();

  if (businessError) {
    console.error('Error creating business:', businessError);
    throw businessError;
  }

  console.log('Business created:', business.id);

  // Create default services
  const defaultServices = [
    { name: 'Emergency Pumping', price_min: 400, price_max: 600, urgency_level: 'Emergency', duration_minutes: 120 },
    { name: 'Routine Pumping', price_min: 250, price_max: 400, urgency_level: 'Flexible', duration_minutes: 90 },
    { name: 'Septic Inspection', price_min: 150, price_max: 250, urgency_level: 'Same Day', duration_minutes: 60 },
    { name: 'Drain Field Repair', price_min: 800, price_max: 1500, urgency_level: 'Emergency', duration_minutes: 240 },
    { name: 'System Installation', price_min: 3000, price_max: 8000, urgency_level: 'Flexible', duration_minutes: 480 },
  ];

  await supabase.from('services').insert(
    defaultServices.map(service => ({
      ...service,
      business_id: business.id,
    }))
  );

  console.log('Default services created');

  return business;
}
