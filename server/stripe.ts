import Stripe from 'stripe';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plan product IDs as specified in the requirements
export const STRIPE_PRODUCT_IDS = {
  PLATINUM: 'prod_S2537v7mpccHQI',
  GOLD: 'prod_S252Aj8D5tFfXg',
  STARTER: 'prod_S251guGbh50tje',
  // Enterprise has custom pricing
};

// Pricing intervals
export type PricingInterval = 'month' | 'year' | 'lifetime';

// Plan types
export type PlanType = 'starter' | 'gold' | 'platinum' | 'enterprise';

/**
 * Creates a Stripe checkout session for the specified plan and interval
 */
export async function createCheckoutSession(
  userId: number,
  planType: PlanType,
  interval: PricingInterval,
  successUrl: string,
  cancelUrl: string
) {
  try {
    // Get user information
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    // If it's an enterprise plan, we don't create a checkout session
    if (planType === 'enterprise') {
      throw new Error('Enterprise plans require contacting support');
    }

    // Get the product ID based on the plan type
    const productId = getProductIdForPlan(planType);
    
    // Get or create a customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.username, // Assuming username is email
        name: user.fullName || user.username,
        metadata: {
          userId: user.id.toString(),
        },
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // Get price ID for the selected product and interval
    const price = await getOrCreatePriceId(productId, interval);

    // Create mode based on interval
    const mode: Stripe.Checkout.SessionCreateParams.Mode = 
      interval === 'lifetime' ? 'payment' : 'subscription';

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        planType,
        interval,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Creates a Stripe billing portal session for the user to manage their subscription
 */
export async function createBillingPortalSession(
  userId: number,
  returnUrl: string
) {
  try {
    // Get user information
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.stripeCustomerId) {
      throw new Error('User not found or no Stripe customer ID');
    }

    // Create the portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw error;
  }
}

/**
 * Updates a user's subscription details in the database
 */
export async function updateUserSubscription(
  userId: number,
  subscriptionId: string,
  planType: PlanType,
  interval: PricingInterval,
  status: string
) {
  try {
    await db
      .update(users)
      .set({
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: status,
        planType: planType,
        planInterval: interval,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

/**
 * Cancels a user's subscription
 */
export async function cancelSubscription(userId: number) {
  try {
    // Get user information
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.stripeSubscriptionId) {
      throw new Error('User not found or no active subscription');
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update the user's subscription status
    await db
      .update(users)
      .set({
        subscriptionStatus: 'canceling',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Gets the product ID for the specified plan type
 */
function getProductIdForPlan(planType: PlanType): string {
  switch (planType) {
    case 'platinum':
      return STRIPE_PRODUCT_IDS.PLATINUM;
    case 'gold':
      return STRIPE_PRODUCT_IDS.GOLD;
    case 'starter':
      return STRIPE_PRODUCT_IDS.STARTER;
    default:
      throw new Error(`Invalid plan type: ${planType}`);
  }
}

/**
 * Gets or creates a price ID for the specified product and interval
 * This is a placeholder - in a real implementation, you would store
 * and retrieve price IDs from a database or configuration
 */
async function getOrCreatePriceId(
  productId: string,
  interval: PricingInterval
): Promise<string> {
  try {
    // First, try to find an existing price for this product and interval
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    // Define the price info based on product and interval
    let amount: number;
    let recurringInterval: Stripe.Price.Recurring.Interval | null = null;
    
    // Set price based on productId and interval
    // These prices match the requirements document
    if (productId === STRIPE_PRODUCT_IDS.PLATINUM) {
      if (interval === 'month') {
        amount = 5500; // $55
        recurringInterval = 'month';
      } else if (interval === 'year') {
        amount = 55000; // $550
        recurringInterval = 'year';
      } else {
        // Lifetime
        amount = 99900; // $999
      }
    } else if (productId === STRIPE_PRODUCT_IDS.GOLD) {
      if (interval === 'month') {
        amount = 2900; // $29
        recurringInterval = 'month';
      } else if (interval === 'year') {
        amount = 29000; // $290
        recurringInterval = 'year';
      } else {
        // Lifetime
        amount = 59900; // $599
      }
    } else if (productId === STRIPE_PRODUCT_IDS.STARTER) {
      if (interval === 'month') {
        amount = 1499; // $14.99
        recurringInterval = 'month';
      } else if (interval === 'year') {
        amount = 14999; // $149.99
        recurringInterval = 'year';
      } else {
        // Lifetime
        amount = 29900; // $299
      }
    } else {
      throw new Error(`Invalid product ID: ${productId}`);
    }

    // Look for a matching price
    for (const price of prices.data) {
      // For lifetime (one-time) prices
      if (interval === 'lifetime' && !price.recurring) {
        if (price.unit_amount === amount) {
          return price.id;
        }
      } 
      // For subscription prices
      else if (price.recurring) {
        if (
          price.recurring.interval === recurringInterval &&
          price.unit_amount === amount
        ) {
          return price.id;
        }
      }
    }

    // If no matching price was found, create a new one
    const priceData: Stripe.PriceCreateParams = {
      product: productId,
      unit_amount: amount,
      currency: 'usd',
    };

    // Add recurring data for subscription prices
    if (interval !== 'lifetime' && recurringInterval) {
      priceData.recurring = {
        interval: recurringInterval,
      };
    }

    // Create the price
    const newPrice = await stripe.prices.create(priceData);
    return newPrice.id;
  } catch (error) {
    console.error('Error getting or creating price ID:', error);
    throw error;
  }
}