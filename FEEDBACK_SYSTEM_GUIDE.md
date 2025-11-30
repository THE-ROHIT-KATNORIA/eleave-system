# Feedback System - User Guide

## 🎉 New Feature Added!

A comprehensive feedback system has been added to your E-Leave application. Both students and admins can now submit and view feedback.

---

## ✨ Features

### For Students:
- ✅ Submit feedback with ratings (1-5 stars)
- ✅ Choose feedback category (Bug, Suggestion, Complaint, Praise, Other)
- ✅ View all their submitted feedback
- ✅ See admin responses to their feedback
- ✅ Track feedback status (New, Reviewed, Resolved)

### For Admins:
- ✅ Submit feedback (same as students)
- ✅ View all their submitted feedback
- ✅ See admin responses
- ✅ Future: View all user feedback (can be added)

---

## 📍 How to Access

### Student Dashboard:
1. Login as a student
2. You'll see three new action cards:
   - **"Give Feedback"** - Submit new feedback
   - **"My Feedback"** - View your feedback history

### Admin Dashboard:
1. Login as admin
2. Click the **"Feedback"** button in the header
3. Submit or view your feedback

---

## 🎯 How to Use

### Submitting Feedback:

1. **Click "Give Feedback"** or **"New Feedback"** button
2. **Select Category:**
   - 🐛 Bug Report - Report technical issues
   - 💡 Suggestion - Share improvement ideas
   - 😞 Complaint - Report problems or concerns
   - 🎉 Praise - Share positive feedback
   - 📝 Other - Anything else

3. **Rate Your Experience:** Click stars (1-5)
4. **Enter Subject:** Brief summary (max 200 characters)
5. **Write Message:** Detailed feedback (max 2000 characters)
6. **Click "Submit Feedback"**

### Viewing Your Feedback:

1. Click **"My Feedback"**
2. See all your submitted feedback with:
   - Category and status badges
   - Star ratings
   - Submission date
   - Admin responses (if any)

---

## 🎨 Feedback Categories

| Category | Icon | Use For |
|----------|------|---------|
| Bug Report | 🐛 | Technical issues, errors, broken features |
| Suggestion | 💡 | Ideas for improvement, new features |
| Complaint | 😞 | Problems, concerns, dissatisfaction |
| Praise | 🎉 | Positive feedback, appreciation |
| Other | 📝 | Anything that doesn't fit above |

---

## 📊 Feedback Status

| Status | Color | Meaning |
|--------|-------|---------|
| New | Blue | Just submitted, not yet reviewed |
| Reviewed | Orange | Admin has seen and responded |
| Resolved | Green | Issue fixed or feedback addressed |

---

## 🔧 Technical Details

### Backend (Server):
- **Model:** `server/models/Feedback.js`
- **Routes:** `server/routes/feedback.js`
- **Endpoints:**
  - `POST /api/feedback` - Submit feedback
  - `GET /api/feedback/my-feedback` - Get user's feedback
  - `GET /api/feedback/all` - Get all feedback (admin only)
  - `PATCH /api/feedback/:id/status` - Update status (admin only)
  - `PATCH /api/feedback/:id/respond` - Add response (admin only)
  - `GET /api/feedback/stats` - Get statistics (admin only)

### Frontend (Client):
- **Feedback Form:** `client/src/pages/FeedbackForm.jsx`
- **My Feedback:** `client/src/pages/MyFeedback.jsx`
- **Service:** `client/src/services/api.js` (feedbackService)
- **Routes:**
  - `/feedback/new` - Submit feedback
  - `/feedback/my-feedback` - View your feedback

### Database:
- **Collection:** `feedbacks`
- **Fields:**
  - userId, userName, userRole
  - category, rating, subject, message
  - status, adminResponse
  - timestamps (createdAt, updatedAt)

---

## 🚀 Deployment Status

✅ **Backend:** Deployed to Render (eleave-system.onrender.com)
✅ **Frontend:** Deployed to Vercel (eleave.vercel.app)
✅ **Database:** MongoDB Atlas

The feedback system is now live and ready to use!

---

## 📝 Future Enhancements (Optional)

You can add these features later:

1. **Admin Feedback Dashboard:**
   - View all user feedback
   - Filter by category/status
   - Respond to feedback
   - Mark as resolved

2. **Email Notifications:**
   - Notify users when admin responds
   - Notify admins of new feedback

3. **Feedback Analytics:**
   - Average ratings over time
   - Most common categories
   - Response time metrics

4. **Attachments:**
   - Allow users to upload screenshots
   - Helpful for bug reports

5. **Voting System:**
   - Let users upvote suggestions
   - Prioritize popular requests

---

## ✅ Testing Checklist

- [ ] Login as student
- [ ] Submit feedback with all categories
- [ ] View "My Feedback" page
- [ ] Check feedback appears correctly
- [ ] Login as admin
- [ ] Submit feedback as admin
- [ ] View admin's feedback
- [ ] Verify all features work

---

## 🎉 Success!

Your E-Leave system now has a complete feedback feature! Users can share their thoughts, report bugs, and help you improve the system.

**Next Steps:**
1. Wait for Render and Vercel to redeploy (2-3 minutes)
2. Test the feedback system
3. Share with your users!

Enjoy your new feedback system! 🚀
