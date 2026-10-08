import express from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../data/store.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { searchGlobalBooks, getGlobalBookById } from '../services/globalBooksService.js';
import { pushUserToDevice } from '../services/biometricAdmsService.js';
import { sendOtpEmail } from '../services/emailService.js';
import { getFullChaptersForBook } from '../data/fullBookContents.js';
import { streamBookPdf } from '../services/bookPdfService.js';
import { uploadBackupToGoogleDrive, getGoogleDriveBackupStatus } from '../services/googleDriveService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || 'braindock_secret_2026';

// Helper for JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      email: user.email, 
      role: user.role, 
      memberId: user.memberId,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};

// ================= AUTH ROUTES =================

// Dedicated Secure Super Admin Login (Strictly Super Admin Only)
router.post('/admin/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Super Admin email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = store.findUserByEmail(cleanEmail);

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid Super Admin credentials. Please check your email or password.' });
  }

  // Strictly enforce Super Admin role only
  if (user.role !== 'Super Admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Denied: Only Super Admin has authorization to access the Admin ERP Panel. Role-based guest access has been revoked.' 
    });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: 'Super Admin authenticated successfully.',
    token,
    user: {
      name: user.name,
      email: user.email,
      role: 'Super Admin',
      memberId: user.memberId || 'BDL-DIR-001',
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
    }
  });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.findUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      memberId: user.memberId,
      membershipPlan: user.membershipPlan,
      membershipStatus: user.membershipStatus,
      avatar: user.avatar,
      finesDue: user.finesDue || 0,
      phone: user.phone
    }
  });
});

router.post('/auth/register', (req, res) => {
  const { name, email, password, phone, membershipPlan = 'Basic Student' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const existing = store.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const newUser = store.addUser({
    name,
    email,
    password,
    phone,
    role: 'Member',
    membershipPlan,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  });

  const token = generateToken(newUser);
  res.status(201).json({
    success: true,
    message: 'Account created successfully! Welcome to Brain Dock Library.',
    token,
    user: newUser
  });
});

// Forgot Password - Request 6-digit OTP Code (Climate Hero Style)
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
  }

  const result = store.requestPasswordResetOtp(email);
  if (!result.success) {
    return res.status(404).json(result);
  }

  // Dispatch OTP email via Nodemailer
  let emailDispatched = false;
  try {
    const mailRes = await sendOtpEmail({
      to: result.email,
      studentName: result.userName,
      otpCode: result.code,
      phone: 'Account Recovery',
      seatNumber: null
    });
    emailDispatched = !!mailRes?.success;
  } catch (err) {
    console.error('[FORGOT_PASSWORD_MAIL_FAIL]', err.message);
  }

  console.log(`[USER_RESET_OTP] Code ${result.code} generated for ${result.userName} (${result.email}) | Sent: ${emailDispatched}`);

  const maskedEmail = result.email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`);
  res.json({
    success: true,
    message: emailDispatched
      ? `A 6-digit password reset code has been sent to ${maskedEmail}.`
      : `Reset verification code generated for ${maskedEmail}.`,
    maskedEmail
  });
});

// Reset Password - Verify OTP Code & Set New Password
router.post('/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required.' });
  }
  const result = store.resetPasswordWithOtp(email, code, newPassword);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

router.get('/auth/me', authMiddleware, (req, res) => {
  const user = store.findUserById(req.user.memberId) || store.findUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
});

router.put('/auth/profile', authMiddleware, (req, res) => {
  const user = store.findUserById(req.user.memberId) || store.findUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { name, phone, address, avatar, gender } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (avatar) user.avatar = avatar;
  if (gender) user.gender = gender;

  res.json({ success: true, message: 'Profile updated successfully', user });
});
// ================= BOOKS ROUTES =================
router.get('/books', (req, res) => {
  const books = store.getAllBooks(req.query);
  res.json({
    success: true,
    count: books.length,
    data: books,
    categories: [...new Set(store.books.map(b => b.category))],
    languages: ['All Languages', ...new Set(store.books.map(b => b.language).filter(Boolean))],
    eras: ['All Eras', ...new Set(store.books.map(b => b.era).filter(Boolean))]
  });
});

// Global World Archive Search (Internet Archive + Open Library 30M+ Books)
router.get('/books/global-search', async (req, res) => {
  try {
    const query = req.query.search || req.query.q || '';
    const language = req.query.language || 'All';
    const limit = parseInt(req.query.limit) || 24;

    if (!query || query.trim().length === 0) {
      return res.json({ success: true, count: 0, data: [], source: 'Global World Archive' });
    }

    const results = await searchGlobalBooks(query, { language, limit });
    res.json({
      success: true,
      count: results.length,
      data: results,
      source: 'Global World Archive (Open Library + Internet Archive)'
    });
  } catch (err) {
    console.error('Global search error:', err);
    res.status(500).json({ success: false, message: 'Global search error', error: err.message });
  }
});

// Live Search Autocomplete Suggestions API
router.get('/books/suggestions', async (req, res) => {
  try {
    const q = (req.query.q || req.query.search || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const qLower = q.toLowerCase();

    // 1. Local matching books (Instant response)
    const localMatches = store.books.filter(b => {
      return (
        b.title?.toLowerCase().includes(qLower) ||
        b.author?.toLowerCase().includes(qLower) ||
        b.originalScriptTitle?.toLowerCase().includes(qLower) ||
        b.originalAuthor?.toLowerCase().includes(qLower) ||
        b.category?.toLowerCase().includes(qLower) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(qLower)))
      );
    }).slice(0, 5).map(b => ({
      type: 'book',
      source: 'vault',
      title: b.title,
      subtitle: b.originalScriptTitle ? `${b.originalScriptTitle} • By ${b.author}` : `By ${b.author}`,
      author: b.author,
      category: b.category,
      language: b.language,
      bookId: b.bookId,
      coverImage: b.coverImage,
      isDigitalArchive: b.isDigitalArchive
    }));

    // 2. Fast live global suggestions (1.2s timeout)
    let globalMatches = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=key,title,author_name,cover_i,first_publish_year,language&limit=5`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (olRes.ok) {
        const olJson = await olRes.json();
        const docs = olJson.docs || [];
        globalMatches = docs.map(d => ({
          type: 'book',
          source: 'global',
          title: d.title,
          subtitle: `By ${(d.author_name || []).slice(0, 2).join(', ') || 'World Literature'} (${d.first_publish_year || 'Global Edition'})`,
          author: (d.author_name || [])[0] || 'World Author',
          category: 'World Catalog',
          language: d.language?.[0] || 'Global',
          bookId: `OL-${d.key?.replace('/works/', '') || Math.random().toString(36).substring(7)}`,
          coverImage: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-S.jpg` : null,
          isDigitalArchive: true
        }));
      }
    } catch (e) {
      // Ignore network timeout; local matches still respond instantly
    }

    // Deduplicate suggestions by normalized title
    const seen = new Set();
    const finalSuggestions = [];

    for (const item of [...localMatches, ...globalMatches]) {
      const key = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (key && !seen.has(key)) {
        seen.add(key);
        finalSuggestions.push(item);
      }
    }

    res.json({
      success: true,
      query: q,
      suggestions: finalSuggestions.slice(0, 8)
    });
  } catch (err) {
    res.status(500).json({ success: false, suggestions: [], error: err.message });
  }
});

router.get('/books/:id', async (req, res) => {
  let book = store.getBookById(req.params.id);
  
  if (!book && (req.params.id.startsWith('IA-') || req.params.id.startsWith('OL-'))) {
    book = await getGlobalBookById(req.params.id);
  }

  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

  // Clean description of HTML tags
  const stripHtml = (html) => {
    if (!html) return '';
    return String(html)
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const cleanDescription = stripHtml(book.description || '');

  // Detect and preserve live embed flipbook reader
  let embedReaderUrl = book.embedReaderUrl || null;
  let pdfUrl = book.pdfUrl || null;

  if (book.bookId?.startsWith('IA-')) {
    const iaId = book.bookId.replace('IA-', '');
    embedReaderUrl = `https://archive.org/embed/${iaId}`;
    pdfUrl = pdfUrl || `https://archive.org/download/${iaId}/${iaId}.pdf`;
  } else if (!pdfUrl) {
    pdfUrl = `http://localhost:5000/api/books/${book.bookId}/pdf`;
  }

  const chapters = getFullChaptersForBook(book);
  const enrichedBook = {
    ...book,
    description: cleanDescription,
    embedReaderUrl,
    pdfUrl,
    chapters,
    pdfPages: chapters.length * 15 + 10,
    downloadPdfFilename: book.downloadPdfFilename || `${(book.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_')}_Complete_Edition.pdf`
  };

  const similarBooks = store.books
    .filter(b => (b.category === book.category || b.language === book.language) && b.bookId !== book.bookId)
    .slice(0, 4);

  res.json({ success: true, data: enrichedBook, similarBooks });
});

// Download Complete Book PDF Document (Real Multi-Page A4 PDF)
router.get('/books/:id/pdf', async (req, res) => {
  let book = store.getBookById(req.params.id);
  if (!book && (req.params.id.startsWith('IA-') || req.params.id.startsWith('OL-'))) {
    book = await getGlobalBookById(req.params.id);
  }
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

  const chapters = getFullChaptersForBook(book);
  try {
    streamBookPdf(book, chapters, res);
  } catch (err) {
    console.error('Error generating PDF:', err.message);
    res.status(500).json({ success: false, message: 'Failed to generate PDF document.' });
  }
});

router.post('/books', authMiddleware, (req, res) => {
  const newBook = store.addBook(req.body);
  store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'Book Added',
    module: 'Book Management',
    details: `Added new book: ${newBook.title} (${newBook.isbn})`,
    timestamp: new Date()
  });
  res.status(201).json({ success: true, message: 'Book cataloged successfully', data: newBook });
});

router.put('/books/:id', authMiddleware, (req, res) => {
  const updated = store.updateBook(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, message: 'Book updated successfully', data: updated });
});

router.delete('/books/:id', authMiddleware, (req, res) => {
  const deleted = store.deleteBook(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, message: 'Book removed from catalogue', data: deleted });
});

// ================= ISSUES & RETURNS =================
router.get('/issues', (req, res) => {
  const { memberId, status } = req.query;
  let results = [...store.issues];
  if (memberId) results = results.filter(i => i.memberId === memberId);
  if (status) results = results.filter(i => i.status === status);
  res.json({ success: true, count: results.length, data: results });
});

router.post('/issues/issue', authMiddleware, (req, res) => {
  const { bookId, memberId, days } = req.body;
  const result = store.issueBook({ bookId, memberId, issuedBy: req.user.name, days });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

router.post('/issues/return', authMiddleware, (req, res) => {
  const { issueId } = req.body;
  const result = store.returnBook(issueId);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

router.post('/issues/renew', authMiddleware, (req, res) => {
  const { issueId } = req.body;
  const result = store.renewBook(issueId);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// ================= RESERVATIONS =================
router.get('/reservations', (req, res) => {
  const { memberId } = req.query;
  let results = [...store.reservations];
  if (memberId) results = results.filter(r => r.memberId === memberId);
  res.json({ success: true, count: results.length, data: results });
});

router.post('/reservations', authMiddleware, (req, res) => {
  const { bookId } = req.body;
  const result = store.reserveBook({ bookId, memberId: req.user.memberId });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// ================= STUDY ROOMS =================
router.get('/rooms', (req, res) => {
  res.json({ success: true, data: store.rooms, bookings: store.roomBookings });
});

router.post('/rooms/book', authMiddleware, (req, res) => {
  const { roomId, date, timeSlot, purpose } = req.body;
  const result = store.bookRoom({ roomId, memberId: req.user.memberId, date, timeSlot, purpose });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// ================= SEATS =================
router.get('/seats', (req, res) => {
  const seats102 = store.get102Seats();
  res.json({ 
    success: true, 
    data: seats102, 
    bookings: store.seatBookings,
    summary: {
      total: seats102.length,
      available: seats102.filter(s => s.status === 'Available').length,
      occupied: seats102.filter(s => s.status === 'Occupied' || s.status === 'Expired').length,
      reserved: seats102.filter(s => s.status === 'Reserved').length
    }
  });
});

router.post('/seats/book', (req, res) => {
  const { seatNumber, name, phone, address, timeSlot, date } = req.body;
  if (!seatNumber) {
    return res.status(400).json({ success: false, message: 'Seat number is required.' });
  }

  // If user provided direct booking fields (Name, Phone, Address)
  if (name && phone && address) {
    const result = store.bookDirectSeat({
      seatNumber: Number(seatNumber),
      name: String(name).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      timeSlot: timeSlot || 'Morning Session (08:00 AM - 01:00 PM)',
      amount: 849
    });

    if (!result.success) return res.status(400).json(result);

    // Push to physical biometric device (TimeWatch)
    if (result.admission) {
      pushUserToDevice({
        pin: result.admission.biometricEnrollmentId || result.admission.seatNumber,
        name: result.admission.studentName
      });
    }

    return res.json(result);
  }

  // Fallback for authenticated user session
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      const user = store.findUserById(decoded.memberId) || store.findUserByEmail(decoded.email);
      if (user) {
        const result = store.bookDirectSeat({
          seatNumber: Number(seatNumber),
          name: user.name,
          phone: user.phone || '9876543210',
          address: user.address || 'Brain Dock Library Member',
          timeSlot: timeSlot || 'Morning Session (08:00 AM - 01:00 PM)',
          amount: 849
        });

        if (!result.success) return res.status(400).json(result);

        if (result.admission) {
          pushUserToDevice({
            pin: result.admission.biometricEnrollmentId || result.admission.seatNumber,
            name: result.admission.studentName
          });
        }

        return res.json(result);
      }
    } catch (err) {
      // ignore token error
    }
  }

  return res.status(400).json({
    success: false,
    message: 'Full Name, Mobile Number, and Address are required to reserve your desk.'
  });
});

// ================= LOCKERS =================
router.get('/lockers', (req, res) => {
  res.json({ success: true, data: store.lockers });
});

router.post('/lockers/assign', authMiddleware, (req, res) => {
  const { lockerNumber, memberId, pinCode } = req.body;
  const locker = store.lockers.find(l => l.lockerNumber === lockerNumber);
  const user = store.findUserById(memberId);
  if (!locker || !user) return res.status(400).json({ success: false, message: 'Invalid locker or member' });

  locker.status = 'Allocated';
  locker.assignedUserName = user.name;
  locker.assignedMemberId = user.memberId;
  locker.pinCode = pinCode || '1234';
  locker.startDate = new Date();
  locker.expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  res.json({ success: true, message: 'Locker allocated successfully', locker });
});

// ================= MEMBERSHIP PLANS =================
router.get('/memberships/plans', (req, res) => {
  res.json({ success: true, data: store.plans });
});

router.post('/memberships/subscribe', authMiddleware, (req, res) => {
  const { planCode, paymentMethod } = req.body;
  const plan = store.plans.find(p => p.code === planCode);
  const user = store.findUserById(req.user.memberId);
  if (!plan || !user) return res.status(400).json({ success: false, message: 'Invalid plan or user' });

  user.membershipPlan = plan.name;
  user.membershipStatus = 'Active';
  user.membershipValidUntil = new Date(Date.now() + (plan.durationDays || 365) * 24 * 60 * 60 * 1000);

  const payment = store.recordPayment({
    memberId: user.memberId,
    purpose: `Membership Upgrade (${plan.name})`,
    amount: plan.price,
    paymentMethod: paymentMethod || 'UPI'
  });

  res.json({ success: true, message: `Successfully upgraded to ${plan.name}`, plan, payment });
});

// ================= EVENTS =================
router.get('/events', (req, res) => {
  res.json({ success: true, data: store.events, registrations: store.eventRegistrations });
});

router.post('/events/register', authMiddleware, (req, res) => {
  const { eventId } = req.body;
  const result = store.registerForEvent({ eventId, memberId: req.user.memberId });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// ================= ANNOUNCEMENTS =================
router.get('/announcements', (req, res) => {
  res.json({ success: true, data: store.announcements });
});

router.post('/announcements', authMiddleware, (req, res) => {
  const newAnn = {
    announcementId: `ANN-2026-${Math.floor(10 + Math.random()*90)}`,
    title: req.body.title,
    category: req.body.category || 'General',
    content: req.body.content,
    priority: req.body.priority || 'Normal',
    publishedBy: req.user.name,
    isPinned: Boolean(req.body.isPinned),
    createdAt: new Date()
  };
  store.announcements.unshift(newAnn);
  res.status(201).json({ success: true, data: newAnn });
});

// ================= NOTIFICATIONS =================
router.get('/notifications', authMiddleware, (req, res) => {
  const userNotifs = store.notifications.filter(n => n.memberId === req.user.memberId || !n.memberId);
  res.json({ success: true, data: userNotifs, unreadCount: userNotifs.filter(n => !n.isRead).length });
});

router.put('/notifications/read-all', authMiddleware, (req, res) => {
  store.notifications.forEach(n => {
    if (n.memberId === req.user.memberId || !n.memberId) n.isRead = true;
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ================= PAYMENTS & FINES =================
router.get('/payments', (req, res) => {
  const { memberId } = req.query;
  let results = [...store.payments];
  if (memberId) results = results.filter(p => p.memberId === memberId);
  res.json({ success: true, data: results });
});

router.post('/payments/pay-fine', authMiddleware, (req, res) => {
  const { amount, paymentMethod } = req.body;
  const user = store.findUserById(req.user.memberId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.finesDue = Math.max(0, (user.finesDue || 0) - Number(amount));
  const payment = store.recordPayment({
    memberId: user.memberId,
    purpose: 'Late Fine Settlement',
    amount: Number(amount),
    paymentMethod: paymentMethod || 'UPI'
  });

  res.json({ success: true, message: 'Fine cleared successfully', payment, remainingFine: user.finesDue });
});

// ================= CONTACT MESSAGES =================
router.post('/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const msg = {
    id: `msg-${Date.now()}`,
    name,
    email,
    phone,
    subject,
    message,
    status: 'New',
    createdAt: new Date()
  };
  store.contactMessages.unshift(msg);
  res.status(201).json({ success: true, message: 'Thank you! Your inquiry has been received. Our concierge team will reach out within 2 hours.' });
});

router.get('/contact', authMiddleware, (req, res) => {
  res.json({ success: true, data: store.contactMessages });
});

// ================= CLOUDINARY UPLOAD ENDPOINT =================
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // Upload to Cloudinary using stream / buffer
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'braindock/uploads',
      resource_type: 'auto'
    });

    res.json({
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

// ================= ADMIN REPORTS & ANALYTICS =================
router.get('/reports/dashboard-stats', (req, res) => {
  const totalBooks = store.books.reduce((acc, b) => acc + (b.totalCopies || 1), 0);
  const availableBooks = store.books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const issuedBooks = store.issues.filter(i => i.status === 'Issued' || i.status === 'Overdue').length;
  const overdueBooks = store.issues.filter(i => i.status === 'Overdue').length;
  const totalMembers = store.users.filter(u => u.role === 'Member').length;
  const activeMembers = store.users.filter(u => u.role === 'Member' && u.membershipStatus === 'Active').length;
  const totalRevenue = store.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingFines = store.users.reduce((acc, u) => acc + (u.finesDue || 0), 0);

  res.json({
    success: true,
    data: {
      totalBooks,
      availableBooks,
      issuedBooks,
      overdueBooks,
      totalMembers,
      activeMembers,
      totalRevenue,
      pendingFines,
      studySeats: store.seats.length,
      availableSeats: store.seats.filter(s => s.status === 'Available').length,
      dailyVisitors: 342,
      digitalResources: 18450
    },
    charts: {
      monthlyIssues: [
        { month: 'Apr', count: 120 },
        { month: 'May', count: 155 },
        { month: 'Jun', count: 190 },
        { month: 'Jul', count: 240 },
        { month: 'Aug', count: 310 },
        { month: 'Sep', count: 420 }
      ],
      categoryDistribution: [
        { name: 'Computer Science & AI', count: 42 },
        { name: 'Literature & Philosophy', count: 28 },
        { name: 'Business & Finance', count: 24 },
        { name: 'Quantum & Physics', count: 18 },
        { name: 'Medical & Neuroscience', count: 15 }
      ],
      revenueTrend: [
        { month: 'Apr', revenue: 42000 },
        { month: 'May', revenue: 58000 },
        { month: 'Jun', revenue: 74000 },
        { month: 'Jul', revenue: 91000 },
        { month: 'Aug', revenue: 112000 },
        { month: 'Sep', revenue: 148500 }
      ]
    }
  });
});

// Members management for admin
router.get('/admin/members', authMiddleware, (req, res) => {
  res.json({ success: true, data: store.users });
});

router.put('/admin/members/:memberId/status', authMiddleware, (req, res) => {
  const user = store.findUserById(req.params.memberId);
  if (!user) return res.status(404).json({ success: false, message: 'Member not found' });
  user.membershipStatus = req.body.status || 'Active';
  res.json({ success: true, message: `Member status updated to ${user.membershipStatus}`, user });
});

// Audit Logs
router.get('/admin/audit-logs', authMiddleware, (req, res) => {
  res.json({ success: true, data: store.auditLogs });
});

// Public content endpoints
router.get('/content/testimonials', (req, res) => {
  res.json({ success: true, data: store.testimonials });
});

router.get('/content/faqs', (req, res) => {
  res.json({ success: true, data: store.faqs });
});

// Homepage Stats Banner (Show/Hide and Editable Metrics)
router.get('/content/homepage-stats', (req, res) => {
  res.json({ success: true, data: store.getHomepageStats() });
});

router.post('/content/homepage-stats', (req, res) => {
  const updated = store.updateHomepageStats(req.body);
  res.json({ success: true, message: 'Homepage stats updated successfully', data: updated });
});

router.put('/content/homepage-stats', (req, res) => {
  const updated = store.updateHomepageStats(req.body);
  res.json({ success: true, message: 'Homepage stats updated successfully', data: updated });
});

// Homepage Features & Amenities (Engineered for Concentration & Clarity)
router.get('/content/features', (req, res) => {
  res.json({ success: true, data: store.getHomepageFeatures() });
});

router.post('/content/features', (req, res) => {
  const updated = store.updateHomepageFeatures(req.body);
  res.json({ success: true, message: 'Features updated successfully', data: updated });
});

router.put('/content/features', (req, res) => {
  const updated = store.updateHomepageFeatures(req.body);
  res.json({ success: true, message: 'Features updated successfully', data: updated });
});

router.post('/content/features/add', (req, res) => {
  const updated = store.addHomepageFeature(req.body);
  res.json({ success: true, message: 'New facility added successfully', data: updated });
});

router.delete('/content/features/:id', (req, res) => {
  const updated = store.deleteHomepageFeature(req.params.id);
  res.json({ success: true, message: 'Facility removed successfully', data: updated });
});

// ================= OWNER DESK & 102-SEAT ADMISSION SUITE =================
// Verify Owner Master Passkey / PIN
router.post('/owner/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (pin === '2026' || pin === '1234' || pin === 'braindock123') {
    return res.json({ success: true, authorized: true, message: 'Owner master access granted' });
  }
  return res.status(401).json({ success: false, authorized: false, message: 'Invalid Owner Access PIN' });
});

// Export Full Database Backup (JSON)
router.get('/owner/backup', (req, res) => {
  const backup = {
    version: '1.0',
    libraryName: 'Brain Dock Library',
    exportedAt: new Date().toISOString(),
    admissions: store.admissions || [],
    receipts: store.receipts || [],
    ownerSeats: store.ownerSeats || [],
    biometricLogs: store.biometricLogs || [],
    homepageStats: store.homepageStats,
    homepageFeatures: store.homepageFeatures
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="BrainDock_Backup_${new Date().toISOString().split('T')[0]}.json"`);
  res.json({ success: true, data: backup });
});

// Restore Database from Backup (JSON)
router.post('/owner/restore', (req, res) => {
  const { backup } = req.body;
  if (!backup) {
    return res.status(400).json({ success: false, message: 'Invalid backup file payload.' });
  }

  const result = store.restoreBackup(backup);
  res.json(result);
});

// Google Drive Backup Status
router.get('/owner/backup/google-drive/status', (req, res) => {
  const status = getGoogleDriveBackupStatus();
  res.json({ success: true, data: status });
});

// Trigger Instant Backup to Google Drive
router.post('/owner/backup/google-drive', async (req, res) => {
  const result = await uploadBackupToGoogleDrive();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// Overview Stats for 102 Seats & Financials
router.get('/owner/stats', (req, res) => {
  const stats = store.getOwnerStats();
  res.json({ success: true, data: stats });
});

// Get all 102 seats with live occupant & fee details
router.get('/owner/seats', (req, res) => {
  const seats = store.get102Seats();
  res.json({ success: true, count: seats.length, data: seats });
});

// Get single seat detail
router.get('/owner/seats/:seatNumber', (req, res) => {
  const seat = store.getSeatByNumber(req.params.seatNumber);
  if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });
  res.json({ success: true, data: seat });
});

// Get admissions with optional filtering: filter=pending|paid|expiring|expired|active
router.get('/owner/admissions', (req, res) => {
  const { filter, search } = req.query;
  const admissions = store.getAdmissions({ filter, search });
  res.json({ success: true, count: admissions.length, data: admissions });
});

// Create new admission & allocate seat & generate receipt
router.post('/owner/admissions', (req, res) => {
  const result = store.createAdmission(req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }

  // Push User ID & Name directly to physical TimeWatch machine
  if (result.admission) {
    pushUserToDevice({
      pin: result.admission.biometricEnrollmentId || result.admission.seatNumber,
      name: result.admission.studentName
    });
  }

  res.status(201).json({ 
    success: true, 
    message: 'Student admission successfully processed! User ID & Name dispatched to TimeWatch machine.', 
    data: result.admission, 
    receipt: result.receipt 
  });
});

// Update an existing student admission form
router.put('/owner/admissions/:id', (req, res) => {
  const result = store.updateAdmission(req.params.id, req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }

  // Push updated name to machine if studentName changed
  if (result.admission) {
    pushUserToDevice({
      pin: result.admission.biometricEnrollmentId || result.admission.seatNumber,
      name: result.admission.studentName
    });
  }

  res.json({
    success: true,
    message: result.message,
    data: result.admission
  });
});

// Delete an admission form & vacate seat
router.delete('/owner/admissions/:id', (req, res) => {
  const result = store.deleteAdmission(req.params.id);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Manual Push / Sync Student to TimeWatch Machine
router.post('/owner/sync-student-to-device', (req, res) => {
  const { pin, name } = req.body;
  if (!pin || !name) {
    return res.status(400).json({ success: false, message: 'PIN and Name are required' });
  }
  pushUserToDevice({ pin, name });
  res.json({
    success: true,
    message: `Student "${name}" (PIN ${pin}) queued for automatic push to TimeWatch machine! Ready to enroll fingerprint on device.`
  });
});

// Collect pending fee payment
router.put('/owner/admissions/:id/pay', (req, res) => {
  const result = store.collectPendingFee(req.params.id, req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({ 
    success: true, 
    message: 'Fee payment recorded successfully!', 
    data: result.admission, 
    receipt: result.receipt 
  });
});

// Renew membership validity
router.put('/owner/admissions/:id/renew', (req, res) => {
  const result = store.renewAdmission(req.params.id, req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({ 
    success: true, 
    message: 'Membership renewed successfully!', 
    data: result.admission, 
    receipt: result.receipt 
  });
});

// ================= MEMBERSHIP EXPIRY NOTIFICATION ENGINE (LAST 3 DAYS DAILY) =================
// Get all students expiring in the next 3 days (or already expired)
router.get('/owner/expiry-reminders', (req, res) => {
  const list = store.getUpcomingExpiries();
  res.json({ 
    success: true, 
    count: list.length, 
    pendingTodayCount: list.filter(item => !item.alreadySentToday).length,
    data: list 
  });
});

// Send/Record individual student daily WhatsApp reminder
router.post('/owner/expiry-reminders/:id/send', (req, res) => {
  const result = store.sendExpiryReminder(req.params.id);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Batch send/record for all due students today
router.post('/owner/expiry-reminders/send-all-due', (req, res) => {
  const list = store.getUpcomingExpiries();
  const dueList = list.filter(item => !item.alreadySentToday);
  const results = [];
  
  for (const item of dueList) {
    const res = store.sendExpiryReminder(item.admissionId);
    if (res.success) results.push(res);
  }
  
  res.json({
    success: true,
    message: `Recorded daily reminder dispatch for ${results.length} student(s).`,
    dispatchedCount: results.length,
    items: results
  });
});

// Vacate seat
router.delete('/owner/seats/:seatNumber/vacate', (req, res) => {
  const result = store.vacateSeat(req.params.seatNumber, req.body?.reason);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Get fee receipt for printing
router.get('/owner/receipts/:receiptNumber', (req, res) => {
  const receipt = store.getReceipt(req.params.receiptNumber);
  if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
  res.json({ success: true, data: receipt });
});

// ==============================================================
// TIMEWATCH BIOMETRIC HARDWARE & ATTENDANCE ENDPOINTS
// ==============================================================

// Get biometric punch logs
router.get('/biometric/logs', (req, res) => {
  const { search, filter, date } = req.query;
  const logs = store.getBiometricLogs({ search, filter, date });
  res.json({ success: true, count: logs.length, data: logs });
});

// Get biometric live stats and hardware state
router.get('/biometric/stats', (req, res) => {
  const stats = store.getBiometricStats();
  res.json({ success: true, data: stats });
});

// Process a biometric punch (Simulated or Real Hardware Webhook)
router.post('/biometric/punch', (req, res) => {
  const { grId, seatNumber, studentPhone, method, overridePunchType } = req.body;
  const result = store.processBiometricPunch({ grId, seatNumber, studentPhone, method, overridePunchType });
  res.status(result.granted ? 200 : 403).json(result);
});

// Clear all dummy admissions and attendance logs (Owner Reset to Live State)
router.post('/owner/clear-all-data', (req, res) => {
  store.clearAllData();
  res.json({ 
    success: true, 
    message: 'All dummy admissions and attendance logs successfully removed! All 102 seats are now Available and ready for real student admissions & machine punches.' 
  });
});

// Clear biometric logs only
router.post('/biometric/clear-logs', (req, res) => {
  store.biometricLogs = [];
  res.json({ success: true, message: 'Biometric punch logs cleared.' });
});


// ==============================================================
// STUDENT SELF-SERVICE PORTAL (PHONE + OTP LOGIN & DASHBOARD)
// ==============================================================

// Request OTP for student registered email (Strictly Email OTP)
router.post('/student/auth/send-otp', async (req, res) => {
  const { email, identifier } = req.body;
  const target = (email || identifier || '').trim();
  if (!target || !target.includes('@')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please enter your registered student email address. Mobile OTP login has been disabled; login is strictly via Email OTP.' 
    });
  }

  const result = store.requestStudentOtp(target);
  if (!result.success) {
    return res.status(404).json(result);
  }

  // Dispatch OTP email via Nodemailer (Gmail SMTP)
  let emailDispatched = false;
  let targetEmail = result.studentEmail;

  if (targetEmail) {
    try {
      const emailRes = await sendOtpEmail({
        to: targetEmail,
        studentName: result.studentName,
        otpCode: result.otp,
        phone: result.phone,
        seatNumber: result.seatNumber
      });
      emailDispatched = !!emailRes?.success;
    } catch (err) {
      console.error('[EMAIL_OTP_DISPATCH_FAIL]', err.message);
    }
  }

  console.log(`[STUDENT_OTP_GENERATED] Student: ${result.studentName} | Email: ${targetEmail || 'None'} | Code: ${result.otp} | Sent: ${emailDispatched}`);

  const maskedEmail = targetEmail 
    ? targetEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`)
    : null;

  res.json({
    success: true,
    emailDispatched,
    studentEmail: targetEmail,
    maskedEmail,
    message: emailDispatched
      ? `6-Digit OTP code has been sent directly to your registered email (${maskedEmail})! Please check your inbox or spam folder.`
      : (targetEmail 
          ? `Verification code generated for ${maskedEmail}.` 
          : `Student has no registered email. Code: ${result.otp}`),
    otp: result.otp,
    phone: result.phone,
    studentName: result.studentName
  });
});

// Verify OTP and log in student
router.post('/student/auth/verify-otp', (req, res) => {
  const { email, identifier, otp } = req.body;
  const target = (email || identifier || '').trim();
  if (!target || !otp) {
    return res.status(400).json({ success: false, message: 'Registered email address and 6-digit OTP code are required.' });
  }
  const result = store.verifyStudentOtp(target, otp);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Get student study summary and desk details by phone or GR ID
router.get('/student/summary/:query', (req, res) => {
  const summary = store.getStudentByPhoneOrGr(req.params.query);
  if (!summary) {
    return res.status(404).json({ success: false, message: 'Student admission not found.' });
  }
  res.json({ success: true, data: summary });
});

export default router;
