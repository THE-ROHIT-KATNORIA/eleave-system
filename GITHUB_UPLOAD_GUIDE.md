# Upload Code to GitHub - Simple Steps

## Step 1: Create GitHub Repository (2 minutes)

1. Go to https://github.com
2. Click the "+" icon (top right) → "New repository"
3. Fill in:
   - **Repository name:** `e-leave-management`
   - **Description:** "E-Leave Management System - Full Stack Application"
   - **Visibility:** Choose Public or Private
   - **DO NOT** check "Add a README file" (we already have one)
   - **DO NOT** add .gitignore (we already have one)
4. Click "Create repository"
5. **Keep this page open** - you'll need the commands shown

---

## Step 2: Upload Your Code (3 minutes)

### Open Terminal/Command Prompt in Your Project Folder

**Windows:**
- Open your project folder: `D:\E_LEAVE KIRO`
- Type `cmd` in the address bar and press Enter
- OR right-click in folder → "Open in Terminal"

### Run These Commands One by One:

```bash
# 1. Initialize Git (if not already done)
git init

# 2. Add all files
git add .

# 3. Commit your code
git commit -m "Initial commit - E-Leave Management System"

# 4. Set main branch
git branch -M main

# 5. Add GitHub remote (REPLACE with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/e-leave-management.git

# 6. Push to GitHub
git push -u origin main
```

**Important:** In step 5, replace `YOUR_USERNAME` with your actual GitHub username!

---

## Step 3: Verify Upload (1 minute)

1. Go back to your GitHub repository page
2. Refresh the page
3. You should see all your files uploaded!

---

## 🎉 Done! Your Code is on GitHub!

Now you can proceed with deployment to Vercel + Render.

---

## Troubleshooting

### Problem: "git: command not found"
**Solution:** Install Git from https://git-scm.com/download/win

### Problem: "Permission denied"
**Solution:** You need to authenticate with GitHub
- Option 1: Use GitHub Desktop (easier)
- Option 2: Set up SSH keys
- Option 3: Use Personal Access Token

### Problem: "Repository already exists"
**Solution:** 
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/e-leave-management.git
git push -u origin main
```

---

## Alternative: Use GitHub Desktop (Easier!)

If you prefer a visual interface:

1. Download GitHub Desktop: https://desktop.github.com
2. Install and sign in with your GitHub account
3. Click "Add" → "Add Existing Repository"
4. Select your project folder: `D:\E_LEAVE KIRO`
5. Click "Publish repository"
6. Choose name and visibility
7. Click "Publish repository"

Done! Much easier!

---

## Next Steps

After uploading to GitHub:
1. ✅ Code is backed up
2. ✅ Ready to deploy to Vercel
3. ✅ Ready to deploy to Render
4. ✅ Can collaborate with others

Follow **DEPLOY_VERCEL_RENDER.md** for deployment steps!
