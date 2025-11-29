# Upload Your Code to GitHub - Simple Guide

## Option 1: Using GitHub Desktop (Easiest - Recommended)

### Step 1: Install GitHub Desktop
1. Go to https://desktop.github.com/
2. Download GitHub Desktop for Windows
3. Install it (just click Next, Next, Finish)

### Step 2: Sign In
1. Open GitHub Desktop
2. Click "Sign in to GitHub.com"
3. Enter your GitHub username and password
4. If you don't have an account, click "Create your free account"

### Step 3: Create Repository on GitHub
1. Go to https://github.com
2. Click "+" icon (top right) → "New repository"
3. **Repository name:** `e-leave-management`
4. **Description:** "E-Leave Management System - Full Stack Application"
5. **Public** or **Private** (your choice)
6. **DON'T** check "Add a README" (we already have one)
7. Click "Create repository"
8. **Keep this page open** - you'll need it

### Step 4: Add Your Project to GitHub Desktop
1. In GitHub Desktop, click "File" → "Add local repository"
2. Click "Choose..." button
3. Navigate to your project folder: `D:\E_LEAVE KIRO`
4. Click "Select Folder"
5. You'll see a message "This directory does not appear to be a Git repository"
6. Click "create a repository" link

### Step 5: Initialize Repository
1. **Name:** `e-leave-management`
2. **Description:** "E-Leave Management System"
3. **Git Ignore:** None (we already have .gitignore)
4. **License:** MIT (optional)
5. Click "Create Repository"

### Step 6: Make First Commit
1. You'll see all your files listed
2. In the bottom left:
   - **Summary:** `Initial commit - E-Leave Management System`
   - **Description:** `Full-stack leave management application with React, Node.js, and MongoDB`
3. Click "Commit to main"

### Step 7: Publish to GitHub
1. Click "Publish repository" button (top)
2. **Name:** `e-leave-management`
3. **Description:** "E-Leave Management System"
4. Choose **Public** or **Private**
5. **Uncheck** "Keep this code private" if you want it public
6. Click "Publish repository"
7. Wait 1-2 minutes for upload

### Step 8: Verify Upload
1. Go to https://github.com/YOUR_USERNAME/e-leave-management
2. You should see all your files!

✅ **Done! Your code is on GitHub!**

---

## Option 2: Using GitHub Web Interface (No Installation)

### Step 1: Create Repository
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `e-leave-management`
4. Click "Create repository"

### Step 2: Upload Files
1. Click "uploading an existing file"
2. Drag and drop your entire project folder
3. Or click "choose your files" and select all files
4. **Note:** This method has a 100MB limit per file
5. Add commit message: "Initial commit"
6. Click "Commit changes"

⚠️ **Warning:** This method is slower and may timeout with large projects. Use GitHub Desktop instead.

---

## Option 3: Install Git and Use Command Line

### Step 1: Install Git
1. Go to https://git-scm.com/download/win
2. Download Git for Windows
3. Install with default settings
4. Restart your computer

### Step 2: Configure Git
Open Command Prompt and run:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Initialize and Push
```bash
cd "D:\E_LEAVE KIRO"
git init
git add .
git commit -m "Initial commit - E-Leave Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/e-leave-management.git
git push -u origin main
```

---

## 🎯 Recommended: Use GitHub Desktop

**Why?**
- ✅ No command line needed
- ✅ Visual interface
- ✅ Easy to use
- ✅ Handles large files
- ✅ Built-in conflict resolution

---

## After Uploading to GitHub

### Next Steps:
1. ✅ Code is on GitHub
2. 📝 Open `DEPLOY_VERCEL_RENDER.md`
3. 🚀 Follow deployment steps
4. 🌐 Your app will be live in 15 minutes!

---

## 🐛 Troubleshooting

### Problem: "Repository already exists"
**Solution:** 
- Use a different name
- Or delete the existing repository on GitHub first

### Problem: "File too large"
**Solution:**
- Make sure `.gitignore` is working
- Don't upload `node_modules` folders
- Use GitHub Desktop instead of web interface

### Problem: "Authentication failed"
**Solution:**
- Use GitHub Desktop (easier authentication)
- Or create a Personal Access Token on GitHub

---

## 📞 Need Help?

1. **GitHub Desktop Help:** https://docs.github.com/en/desktop
2. **GitHub Guides:** https://guides.github.com/
3. **Video Tutorial:** Search "GitHub Desktop tutorial" on YouTube

---

**Once your code is on GitHub, you're ready to deploy! 🚀**

Go to `DEPLOY_VERCEL_RENDER.md` for the next steps.
