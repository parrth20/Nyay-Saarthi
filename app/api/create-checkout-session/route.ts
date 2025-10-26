import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user_id,
      name,
      email,
      phone,
      issue,
      documents,
      plan,
      amount,
      date,
      time,
    } = body;

    // ✅ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    // ✅ Store payment in Supabase (pending)
    const supabase = createClient();
    await supabase.from("payments").insert([
      {
        user_id,
        name,
        email,
        phone,
        issue,
        documents,
        plan_name: plan.name,
        amount,
        date,
        time,
        payment_status: "pending",
        session_id: session.id,
      },
    ]);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
