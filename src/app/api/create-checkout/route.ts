// app/api/create-checkout/route.ts - LIVE MODE COMPATIBLE
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const STRIPE_PRICES = {
  basic: 'price_1RmSFZF9hnElfa3Lgqj8eqXc',
  pro: 'price_1RmSFXF9hnElfa3LmgGO7AVq',
  business: 'price_1RmSFVF9hnElfa3LX2UcQDYl',
  enterprise: 'price_1RmSF6F9hnElfa3LlGFkeBUI',
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { userId, tier } = await request.json();

    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'User ID and tier are required' },
        { status: 400 }
      );
    }

    // Validate tier and get price ID
    if (!(tier in STRIPE_PRICES)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const priceId = STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES];

    // Get user profile using service role (bypassing RLS for this operation)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'User profile not found', details: profileError?.message },
        { status: 404 }
      );
    }

    // For live mode: Always create a new customer to avoid test/live conflicts
    // We'll let Stripe create the customer during checkout and update our database via webhook
    let customerId = profile.stripe_customer_id;

    // Check if the existing customer ID is from test mode or doesn't exist in live mode
    if (customerId) {
      try {
        // Try to retrieve the customer to see if it exists in live mode
        await stripe.customers.retrieve(customerId);
        console.log('Existing customer found in live mode:', customerId);
      } catch (error: any) {
        if (error.code === 'resource_missing') {
          console.log('Customer not found in live mode, will create new one');
          customerId = null; // Reset so we create a new one
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    // Create new customer if none exists or if old one was from test mode
    if (!customerId) {
      console.log('Creating new customer for live mode...');
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Update profile with new live Stripe customer ID
      await supabase
        .from('profiles')
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      console.log('Created new customer and updated profile:', customerId);
    }

    // Create Stripe checkout session
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
      success_url: `${request.headers.get('origin')}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: tier,
        },
      },
    });

    console.log('Checkout session created successfully:', session.id);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message 
      },
      { status: 500 }
    );
  }
}