export default function handler(req, res) {
  res.status(200).json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
  })
}
