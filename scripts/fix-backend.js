const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixBackend() {
    console.log('🔧 Starting Backend Fix...');

    // 1. Storage Buckets
    console.log('\n📦 Checking Storage Buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('❌ Error listing buckets:', listError.message);
    } else {
        const bucketName = 'product-images';
        const exists = buckets.find(b => b.name === bucketName);

        if (!exists) {
            console.log(`   Creating '${bucketName}' bucket...`);
            const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true
            });
            if (createError) {
                console.error(`❌ Failed to create bucket:`, createError.message);
            } else {
                console.log(`✅ Bucket '${bucketName}' created.`);
            }
        } else {
            console.log(`✅ Bucket '${bucketName}' already exists.`);
        }
    }

    // 2. Seed Categories
    console.log('\n🏷️  Seeding Categories...');
    const categories = [
        { name: 'Men', description: "Men's Fashion", image_url: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
        { name: 'Women', description: "Women's Fashion", image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
        { name: 'Accessories', description: 'Fashion Accessories', image_url: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }
    ];

    for (const cat of categories) {
        const { data: existing } = await supabase.from('categories').select('id').eq('name', cat.name).single();
        if (!existing) {
            const { error } = await supabase.from('categories').insert(cat);
            if (error) console.error(`❌ Error inserting ${cat.name}:`, error.message);
            else console.log(`✅ Inserted category: ${cat.name}`);
        } else {
            console.log(`   Category '${cat.name}' already exists.`);
        }
    }

    // 3. Seed Products
    console.log('\n👕 Seeding Products...');

    // Get Category IDs
    const { data: cats } = await supabase.from('categories').select('name, id');
    const catMap = {};
    cats?.forEach(c => catMap[c.name] = c.id);

    const products = [
        {
            name: 'Classic White T-Shirt',
            description: 'A comfortable and versatile white t-shirt made from 100% cotton.',
            price: 29.99,
            stock: 100,
            category: 'Men',
            image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            name: 'Summer Floral Dress',
            description: 'Lightweight floral dress ideal for warm summer days.',
            price: 59.99,
            stock: 75,
            category: 'Women',
            image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            name: 'Leather Watch',
            description: 'Elegant leather watch with a minimalist design.',
            price: 129.99,
            stock: 30,
            category: 'Accessories',
            image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        }
    ];

    for (const prod of products) {
        const { data: existing } = await supabase.from('products').select('id').eq('name', prod.name).single();
        if (!existing && catMap[prod.category]) {
            const { category, ...prodData } = prod;
            prodData.category_id = catMap[prod.category];

            const { error } = await supabase.from('products').insert(prodData);
            if (error) console.error(`❌ Error inserting ${prod.name}:`, error.message);
            else console.log(`✅ Inserted product: ${prod.name}`);
        } else if (existing) {
            console.log(`   Product '${prod.name}' already exists.`);
        }
    }

    console.log('\n✨ Backend Setup Complete!');
}

fixBackend().catch(console.error);
