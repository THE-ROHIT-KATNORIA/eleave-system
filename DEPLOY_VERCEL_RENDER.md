# Deploy E-Leave System to Vercel + Render

## 🎯 Simple Deployment Guide (15 minutes)

---

## STEP 1: Push Your Code to GitHub (5 minutes)

### 1.1 Create GitHub Repository
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name it: `e-leave-management`
4. Make it **Public** or **Private**
5. Click "Create repository"

### 1.2 Push Your Code
Open terminal in your project root and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/e-leave-management.git

# Push to GitHub
git push -u origin main
```

✅ **Done!** Your code is now on GitHub.

---

## STEP 2: Deploy Backend to Render (5 minutes)

### 2.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with **GitHub** (easiest option)
4. Authorize Render to access your repositories

### 2.2 Create Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. Click "Connect" next to your `e-leave-management` repository
4. If you don't see it, click "Configure account" and grant access

### 2.3 Configure Backend Service
Fill in these settings:

**Basic Settings:**
- **Name:** `eleave-backend` (or any name you like)
- **Region:** Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch:** `main`
- **Root Directory:** `server`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Plan:**
- Select **Free** plan

### 2.4 Add Environment Variables
Scroll down to "Environment Variables" section and add these:

Click "Add Environment Variable" for each:

```
PORT = 5000
```

```
NODE_ENV = production
```

```
JWT_SECRET = 8f9a2b7e4d6c1a3f5e8b9d2c4a6f1e3b7d9a5c8e2f4b6d8a1c3e5f7b9d2a4c6e8
```

```
MONGODB_URI = mongodb+srv://rohitkl78545_db_user:OR9vdBHk8cz4t295@e-leave.jdfjb5p.mongodb.net/eleave?retryWrites=true&w=majority&appName=E-leave
```

```
FRONTEND_URL = https://your-app.vercel.app
```
*(We'll update this after deploying frontend)*

### 2.5 Deploy
1. Click "Create Web Service" button at the bottom
2. Wait 2-3 minutes for deployment
3. You'll see logs scrolling - wait for "Live" status
4. **Copy your backend URL** (e.g., `https://eleave-backend.onrender.com`)

✅ **Done!** Backend is live.

---

## STEP 3: Update Frontend Configuration (1 minute)

### 3.1 Update API URL
1. Open `client/.env.production` file
2. Replace the URL with your Render backend URL:

```
VITE_API_URL=https://eleave-backend.onrender.com/api
```
*(Replace with YOUR actual Render URL + /api)*

### 3.2 Commit and Push
```bash
git add client/.env.production
git commit -m "Update production API URL"
git push origin main
```

✅ **Done!** Frontend is configured.

---

## STEP 4: Deploy Frontend to Vercel (4 minutes)

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### 4.2 Import Project
1. Click "Add New..." → "Project"
2. Find your `e-leave-management` repository
3. Click "Import"

### 4.3 Configure Project
**Framework Preset:** Vite (should auto-detect)

**Root Directory:** 
- Click "Edit" next to Root Directory
- Type: `client`
- Click "Continue"

**Build Settings:**
- Build Command: `npm run build` (auto-filled)
- Output Directory: `dist` (auto-filled)
- Install Command: `npm install` (auto-filled)

### 4.4 Add Environment Variable
Click "Environment Variables" dropdown:

**Key:** `VITE_API_URL`  
**Value:** `https://eleave-backend.onrender.com/api`  
*(Use YOUR Render URL)*

Click "Add"

### 4.5 Deploy
1. Click "Deploy" button
2. Wait 1-2 minutes
3. You'll see "Congratulations!" when done
4. Click "Visit" to see your live site
5. **Copy your Vercel URL** (e.g., `https://e-leave-management.vercel.app`)

✅ **Done!** Frontend is live!

---

## STEP 5: Update Backend CORS (2 minutes)

### 5.1 Update Render Environment Variable
1. Go back to Render dashboard
2. Click on your `eleave-backend` service
3. Click "Environment" in left sidebar
4. Find `FRONTEND_URL` variable
5. Click "Edit" (pencil icon)
6. Update value to your Vercel URL: `https://e-leave-management.vercel.app`
7. Click "Save Changes"

### 5.2 Redeploy Backend
1. Render will automatically redeploy
2. Wait 1-2 minutes
3. Check logs show "Live" status

✅ **Done!** CORS is configured.

---

## STEP 6: Update MongoDB IP Whitelist (1 minute)

### 6.1 Allow All IPs (Easiest for Production)
1. Go to https://cloud.mongodb.com
2. Click on your cluster
3. Click "Network Access" in left sidebar
4. Click "Add IP Address"
5. Click "ALLOW ACCESS FROM ANYWHERE"
6. Click "Confirm"

✅ **Done!** Database is accessible.

---

## STEP 7: Test Your Deployment (2 minutes)

### 7.1 Visit Your Site
Go to your Vercel URL: `https://your-app.vercel.app`

### 7.2 Test Features
1. ✅ Register a new account
2. ✅ Login
3. ✅ Submit a leave request
4. ✅ Check leave status
5. ✅ Test admin features (if you have admin account)

### 7.3 Check for Errors
- Open browser console (F12)
- Look for any red errors
- If you see CORS errors, double-check Step 5

✅ **Done!** Everything works!

---

## 🎉 CONGRATULATIONS!

Your E-Leave Management System is now **LIVE** on the internet!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://eleave-backend.onrender.com`

---

## 📱 Share Your App

Share your Vercel URL with anyone:
- Students can register and submit leaves
- Admins can approve/reject requests
- Works on mobile, tablet, and desktop

---

## 🔄 Future Updates

When you make changes to your code:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

**Automatic Deployment:**
- Vercel will automatically redeploy frontend (1-2 min)
- Render will automatically redeploy backend (2-3 min)

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to backend"
**Solution:** 
- Check VITE_API_URL in Vercel environment variables
- Make sure it ends with `/api`
- Redeploy frontend

### Problem: "CORS error"
**Solution:**
- Check FRONTEND_URL in Render environment variables
- Make sure it matches your Vercel URL exactly
- Redeploy backend

### Problem: "Database connection failed"
**Solution:**
- Check MongoDB IP whitelist includes `0.0.0.0/0`
- Verify MONGODB_URI in Render environment variables

### Problem: "Page not found"
**Solution:**
- Check Root Directory is set to `client` in Vercel
- Check Root Directory is set to `server` in Render

---

## 💡 Pro Tips

1. **Custom Domain:** 
   - Buy a domain (e.g., from Namecheap)
   - Add it in Vercel settings
   - Update FRONTEND_URL in Render

2. **Monitor Your App:**
   - Check Render logs for backend errors
   - Check Vercel logs for frontend errors
   - Monitor MongoDB Atlas metrics

3. **Free Tier Limits:**
   - Render: 750 hours/month (enough for 1 app)
   - Vercel: Unlimited bandwidth
   - MongoDB: 512MB storage

4. **Keep Your App Awake:**
   - Render free tier sleeps after 15 min of inactivity
   - First request after sleep takes 30-60 seconds
   - Consider using a service like UptimeRobot to ping your app

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured
- [ ] MongoDB IP whitelist updated
- [ ] All features tested
- [ ] No console errors

---

**Need Help?**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.atlas.mongodb.com

**You're all set! 🚀**
