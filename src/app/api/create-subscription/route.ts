import { NextRequest, NextResponse } from 'next/server';
import { getStripe, SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE SUBSCRIPTION DEBUG START ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { priceId, userId, tier } = body;

    if (!priceId || !userId || !tier) {
      console.log('Missing fields:', { priceId, userId, tier });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Environment check:');
    console.log('- Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('- Supabase service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('- Stripe secret key exists:', !!process.env.STRIPE_SECRET_KEY);

    // Get user profile from Supabase
    console.log('Fetching user profile for:', userId);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'User not found', details: profileError.message },
        { status: 404 }
      );
    }

    if (!profile) {
      console.log('No profile found for user:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Profile found:', { id: profile.id, email: profile.email });

    // Get Stripe instance
    console.log('Creating Stripe instance...');
    const stripe = getStripe();
    console.log('Stripe instance created successfully');

    // Create Stripe customer if doesn't exist
    let customerId = profile.stripe_customer_id;
    console.log('Existing customer ID:', customerId);
    
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
      console.log('New customer created:', customerId);

      // Update profile with customer ID
      console.log('Updating profile with customer ID...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        console.log('Profile updated successfully');
      }
    }

    // Create checkout session
    console.log('Creating checkout session with:', {
      customer: customerId,
      priceId,
      tier,
      userId
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        tier: tier,
      },
    });

    console.log('Checkout session created successfully:', session.id);
    console.log('=== CREATE SUBSCRIPTION DEBUG END ===');

    return NextResponse.json({ sessionId: session.id });
    
  } catch (error: any) {
    console.error('=== SUBSCRIPTION CREATION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    console.error('=== END ERROR DEBUG ===');
    
    return NextResponse.json(
      { 
        error: 'Failed to create subscription',
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}