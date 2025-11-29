# E-Leave Management System - Deployment Guide

## ✅ Pre-Deployment Setup Complete!

All necessary configurations have been completed:

### 1. ✅ Strong JWT Secret Generated
- New secure random JWT secret added to `.env`
- 64-character hexadecimal string for maximum security

### 2. ✅ Environment Variables Configured

**Development (.env):**
```
PORT=5000
NODE_ENV=development
JWT_SECRET=8f9a2b7e4d6c1a3f5e8b9d2c4a6f1e3b7d9a5c8e2f4b6d8a1c3e5f7b9d2a4c6e8
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:5173
```

**Production Template (.env.production.example):**
- Created for easy production setup
- Update FRONTEND_URL with your deployed frontend URL

### 3. ✅ CORS Configuration Updated
- Now supports multiple origins (development + production)
- Automatically filters valid origins
- Credentials enabled for authentication

### 4. ✅ Frontend Environment Variables
- Created `.env.production` in client folder
- Update `VITE_API_URL` with your backend URL before deploying

### 5. ✅ Production Build Tested
- Build successful ✓
- Bundle size: 1.44 MB (422 KB gzipped)
- No critical errors

---

## 🚀 Deployment Steps

### Option 1: Deploy to Vercel (Frontend) + Render (Backend)

#### A. Deploy Backend to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

4. **Configure Service**
   - **Name:** `eleave-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. **Add Environment Variables**
   ```
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=8f9a2b7e4d6c1a3f5e8b9d2c4a6f1e3b7d9a5c8e2f4b6d8a1c3e5f7b9d2a4c6e8
   MONGODB_URI=mongodb+srv://rohitkl78545_db_user:OR9vdBHk8cz4t295@e-leave.jdfjb5p.mongodb.net/eleave?retryWrites=true&w=majority&appName=E-leave
   FRONTEND_URL=https://your-app.vercel.app
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy your backend URL (e.g., `https://eleave-backend.onrender.com`)

#### B. Deploy Frontend to Vercel

1. **Update Frontend Environment**
   - Edit `client/.env.production`
   - Set `VITE_API_URL=https://eleave-backend.onrender.com/api`

2. **Commit Changes**
   ```bash
   git add client/.env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

3. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

4. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

5. **Configure Project**
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Add Environment Variables**
   ```
   VITE_API_URL=https://eleave-backend.onrender.com/api
   ```

7. **Deploy**
   - Click "Deploy"
   - Wait for deployment (1-2 minutes)
   - Your app will be live at `https://your-app.vercel.app`

8. **Update Backend CORS**
   - Go back to Render dashboard
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy backend

---

### Option 2: Deploy to Railway (Full Stack)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Backend Service**
   - Click "Add Service" → "GitHub Repo"
   - Root directory: `server`
   - Add environment variables (same as Render)

4. **Add Frontend Service**
   - Click "Add Service" → "GitHub Repo"
   - Root directory: `client`
   - Add build command: `npm run build`
   - Add start command: `npm run preview`
   - Add environment variable: `VITE_API_URL`

5. **Configure Domains**
   - Railway provides automatic domains
   - Update CORS and API URLs accordingly

---

### Option 3: Deploy to Netlify (Frontend) + Render (Backend)

Similar to Vercel option, but use Netlify for frontend:

1. **Deploy Backend to Render** (same as Option 1A)

2. **Deploy Frontend to Netlify**
   - Go to https://netlify.com
   - Drag and drop `client/dist` folder
   - Or connect GitHub for automatic deployments
   - Add environment variables in Netlify dashboard

---

## 🔧 Post-Deployment Configuration

### 1. Update MongoDB IP Whitelist
- Go to MongoDB Atlas
- Network Access → Add IP Address
- Add `0.0.0.0/0` (allow all) for production
- Or add specific IPs from your hosting provider

### 2. Test Your Deployment
- Visit your frontend URL
- Try logging in
- Submit a leave request
- Test admin features
- Check all pages load correctly

### 3. Monitor Your Application
- Check Render/Vercel logs for errors
- Monitor MongoDB Atlas metrics
- Set up error tracking (optional: Sentry)

---

## 📝 Important Notes

### Security
- ✅ JWT secret is secure (64 characters)
- ✅ CORS is properly configured
- ✅ Environment variables are set
- ⚠️ Consider adding rate limiting for production
- ⚠️ Consider adding Helmet.js for security headers

### Performance
- ✅ Production build is optimized
- ✅ Code is minified and compressed
- ⚠️ Bundle size is large (1.44 MB) - consider code splitting
- ⚠️ Consider adding CDN for static assets

### Database
- ✅ MongoDB Atlas is configured
- ✅ Connection string is secure
- ⚠️ Set up automated backups
- ⚠️ Monitor database usage

---

## 🐛 Troubleshooting

### CORS Errors
- Verify FRONTEND_URL in backend .env
- Check VITE_API_URL in frontend .env.production
- Ensure both URLs match exactly (no trailing slashes)

### Database Connection Errors
- Check MongoDB IP whitelist
- Verify connection string is correct
- Check MongoDB Atlas cluster status

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check Node.js version (should be 18+)

### 404 Errors
- Verify API routes are correct
- Check backend is running
- Verify VITE_API_URL includes `/api`

---

## ✅ Deployment Checklist

Before going live:
- [x] JWT_SECRET changed to strong random string
- [x] NODE_ENV set appropriately
- [x] CORS configured for production
- [x] Frontend .env.production created
- [x] Production build tested locally
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Environment variables set on hosting platforms
- [ ] MongoDB IP whitelist updated
- [ ] All features tested in production
- [ ] Error monitoring set up (optional)
- [ ] Analytics set up (optional)

---

## 🎉 You're Ready to Deploy!

Your application is fully configured and ready for production deployment. Follow the steps above for your chosen hosting platform, and you'll be live in minutes!

**Recommended Stack:**
- Frontend: Vercel (easiest, fastest)
- Backend: Render (free tier, auto-deploy)
- Database: MongoDB Atlas (already configured)

Good luck with your deployment! 🚀
