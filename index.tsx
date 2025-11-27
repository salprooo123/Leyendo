import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4a1a3fc8/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint - create new user with username
app.post("/make-server-4a1a3fc8/signup", async (c) => {
  try {
    const { email, password, username } = await c.req.json();
    
    if (!email || !password || !username) {
      return c.json({ error: "Email, password, and username are required" }, 400);
    }

    // Check if username is already taken
    const existingUsername = await kv.get(`username:${username}`);
    if (existingUsername) {
      return c.json({ error: "Username already taken" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Save user data to KV store
    const userId = data.user.id;
    await kv.set(`users:${userId}`, {
      id: userId,
      username,
      email,
      photoUrl: '',
      reviewCount: 0
    });

    // Reserve the username
    await kv.set(`username:${username}`, userId);

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Error in signup endpoint: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Get current user data
app.get("/make-server-4a1a3fc8/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user data from KV store
    const userData = await kv.get(`users:${user.id}`);
    
    if (!userData) {
      // Create user data if it doesn't exist (for OAuth users)
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
      const newUserData = {
        id: user.id,
        username,
        email: user.email || '',
        photoUrl: user.user_metadata?.avatar_url || '',
        reviewCount: 0
      };
      await kv.set(`users:${user.id}`, newUserData);
      return c.json(newUserData);
    }

    return c.json(userData);
  } catch (error) {
    console.log(`Error getting user data: ${error}`);
    return c.json({ error: "Internal server error while fetching user" }, 500);
  }
});

// Create a new review
app.post("/make-server-4a1a3fc8/reviews", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { bookTitle, author, genre, review, rating } = await c.req.json();

    if (!bookTitle || !author || !genre || !review || !rating) {
      return c.json({ error: "All fields are required" }, 400);
    }

    if (rating < 1 || rating > 10) {
      return c.json({ error: "Rating must be between 1 and 10" }, 400);
    }

    // Get user data
    const userData = await kv.get(`users:${user.id}`);
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    // Create review
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reviewData = {
      id: reviewId,
      bookTitle,
      author,
      genre,
      review,
      rating: Number(rating),
      userId: user.id,
      username: userData.username,
      createdAt: new Date().toISOString()
    };

    await kv.set(`reviews:${reviewId}`, reviewData);

    // Update user review count
    userData.reviewCount = (userData.reviewCount || 0) + 1;
    await kv.set(`users:${user.id}`, userData);

    // Add to user's reviews list
    const userReviews = await kv.get(`user_reviews:${user.id}`) || [];
    userReviews.push(reviewId);
    await kv.set(`user_reviews:${user.id}`, userReviews);

    return c.json({ success: true, review: reviewData });
  } catch (error) {
    console.log(`Error creating review: ${error}`);
    return c.json({ error: "Internal server error while creating review" }, 500);
  }
});

// Get all reviews
app.get("/make-server-4a1a3fc8/reviews", async (c) => {
  try {
    const reviews = await kv.getByPrefix("reviews:");
    
    // Sort by createdAt descending
    const sortedReviews = reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ reviews: sortedReviews });
  } catch (error) {
    console.log(`Error fetching reviews: ${error}`);
    return c.json({ error: "Internal server error while fetching reviews" }, 500);
  }
});

// Get top users by review count
app.get("/make-server-4a1a3fc8/top-users", async (c) => {
  try {
    const users = await kv.getByPrefix("users:");
    
    // Sort by reviewCount descending
    const sortedUsers = users
      .filter(user => user.reviewCount > 0)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 10); // Top 10 users

    return c.json({ users: sortedUsers });
  } catch (error) {
    console.log(`Error fetching top users: ${error}`);
    return c.json({ error: "Internal server error while fetching top users" }, 500);
  }
});

Deno.serve(app.fetch);