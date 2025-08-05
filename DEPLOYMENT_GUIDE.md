# SiteMe Deployment Guide

## Manual Build Completed Successfully ✅

Your SiteMe application has been successfully built for manual deployment using the Node.js adapter.

## Build Output

The build process created the following structure in the `build/` directory:

```
build/
├── client/          # Static assets (CSS, JS, images)
├── server/          # Server-side code
├── index.js         # Main server entry point
├── handler.js       # Request handler
└── env.js          # Environment configuration
```

## How to Deploy

### Option 1: Local Testing

1. **Preview the build locally:**
   ```bash
   npm run preview
   ```
   This will start a local server to test your production build.

### Option 2: Manual Server Deployment

1. **Copy the entire `build/` folder to your server**

2. **Install Node.js dependencies on your server:**
   ```bash
   npm install --production
   ```

3. **Set up environment variables:**
   Create a `.env` file with your Supabase credentials:
   ```
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   TOGETHER_API_KEY=your_together_api_key
   ```

4. **Start the server:**
   ```bash
   cd build
   node index.js
   ```
   
   Or use PM2 for production:
   ```bash
   pm2 start build/index.js --name "siteme"
   ```

### Option 3: Platform Deployment

This build is compatible with:
- **Heroku**: Deploy the entire project folder
- **Railway**: Deploy the entire project folder
- **DigitalOcean App Platform**: Deploy the entire project folder
- **AWS/GCP/Azure**: Deploy to any Node.js hosting service
- **VPS**: Copy build folder and run with Node.js

## Environment Variables Required

Make sure these environment variables are set in your deployment environment:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `TOGETHER_API_KEY`
- `PORT` (optional, defaults to 3000)

## Database Setup

Before deploying, make sure you've run the database setup script in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the `complete-database-setup.sql` script

## Build Details

- **Adapter**: @sveltejs/adapter-node
- **Output**: Node.js server application
- **Dynamic Routes**: Fully supported (e.g., `/u/[username]`, `/dashboard/editor/[siteId]`)
- **API Routes**: Included (e.g., `/api/together`)
- **Static Assets**: Optimized and bundled

## Troubleshooting

If you encounter issues:

1. **Check Node.js version**: Ensure you're using Node.js 18+ 
2. **Verify environment variables**: All required variables must be set
3. **Database connection**: Ensure Supabase is properly configured
4. **Port conflicts**: Change the PORT environment variable if needed

## Success! 🎉

Your SiteMe application is now ready for production deployment. The build process resolved all dynamic route issues and created a fully functional Node.js server application.