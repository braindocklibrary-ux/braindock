import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  seedUsers,
  seedBooks,
  seedMembershipPlans,
  seedStudyRooms,
  seedSeats,
  seedLockers,
  seedEvents,
  seedAnnouncements,
  seedIssues,
  seedPayments,
  seedTestimonials,
  seedFaqs
} from './seedData.js';
import { generateInitial102SeatsAndAdmissions } from './ownerSeatsData.js';
import { ancientWorldClassics } from './ancientClassicsData.js';
import { getFullChaptersForBook } from './fullBookContents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSIST_FILE = path.join(__dirname, 'savedData.json');

class DataStore {
  constructor() {
    this.users = [...seedUsers];
    this.books = [...seedBooks, ...ancientWorldClassics].map(b => {
      const fullChapters = getFullChaptersForBook(b);
      return {
        ...b,
        chapters: fullChapters,
        isDigitalArchive: true,
        isDigital: true,
        hasPdf: true,
        pdfPages: fullChapters.length * 15 + 10,
        pdfUrl: `http://localhost:5000/api/books/${b.bookId}/pdf`,
        downloadPdfFilename: `${(b.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_')}_Complete_Edition.pdf`,
        status: 'Online Available'
      };
    });
    this.plans = [...seedMembershipPlans];
    this.rooms = [...seedStudyRooms];
    this.roomBookings = [];
    this.seats = [...seedSeats];
    this.seatBookings = [];

    // Initialize 102 Dedicated Library Seats & Admissions + TIMEWATCH Biometrics
    const { seats: ownerSeats, admissions, receipts, initialBiometricLogs } = generateInitial102SeatsAndAdmissions();
    this.ownerSeats = ownerSeats;
    this.admissions = admissions;
    this.receipts = receipts;
    this.biometricLogs = [...(initialBiometricLogs || [])];

    // Homepage Refined Statistics Section (Default hidden as per user request)
    this.homepageStats = {
      isVisible: false,
      items: [
        { id: '1', number: '45,000+', label: 'Physical Volumes' },
        { id: '2', number: '12,800+', label: 'Active Members' },
        { id: '3', number: '250+', label: 'Study Seats' },
        { id: '4', number: '1,400+', label: 'Daily Visitors' },
        { id: '5', number: '18,500+', label: 'Research Journals' }
      ]
    };

    // Features & Amenities Section (Engineered for Concentration & Clarity)
    this.homepageFeatures = {
      badge: 'The Brain Dock Difference',
      title: 'Engineered for Concentration & Clarity',
      subtitle: 'We removed the noise, slow checkouts, and visual clutter to build a reading ecosystem focused purely on comprehension.',
      items: [
        {
          id: 'feat-1',
          icon: 'Laptop',
          title: 'Personal Dedicated Desk',
          description: 'Your own fixed study desk reserved 24/7 with personal multi-plug power sockets, soft-reading LED lamp, and partition privacy.',
          tag: 'Personal Desk'
        },
        {
          id: 'feat-2',
          icon: 'Lock',
          title: 'Personal Secure Locker',
          description: 'Spacious individual lock & key locker for safe storage of heavy reference books, laptops, bags, and study notes.',
          tag: 'Personal Locker'
        },
        {
          id: 'feat-3',
          icon: 'Armchair',
          title: 'Ergonomic Revolving Chair',
          description: '360° revolving executive mesh chairs with breathable backrest, adjustable height, and lumbar support for fatigue-free 12+ hour study sessions.',
          tag: 'Revolving Chair'
        },
        {
          id: 'feat-4',
          icon: 'Coffee',
          title: 'Hygienic Pantry Area',
          description: 'Dedicated clean pantry & refreshment lounge equipped with chilled RO drinking water, hot tea/coffee station, dining tables, and microwave.',
          tag: 'Pantry Area'
        },
        {
          id: 'feat-5',
          icon: 'VolumeX',
          title: 'Acoustic Soundproofing & AC',
          description: 'Calibrated acoustic sound-dampening walls, double-glazed glass, and strict whisper policies ensuring pin-drop silence below 40dB.',
          tag: 'Silent Zone'
        },
        {
          id: 'feat-6',
          icon: 'Wifi',
          title: 'Wi-Fi 7 Gigabit High-Speed Mesh',
          description: 'Low-latency symmetrical fiber mesh internet with seamless roaming and unlimited bandwidth for video lectures and research.',
          tag: 'Gigabit Mesh'
        },
        {
          id: 'feat-7',
          icon: 'Clock',
          title: '24/7 Biometric Smart Punch',
          description: 'High-speed fingerprint and smart terminal access for round-the-clock entry with real-time student study hours tracking.',
          tag: '24/7 Access'
        },
        {
          id: 'feat-8',
          icon: 'ShieldCheck',
          title: 'CCTV Surveillance & Safety',
          description: 'Full HD CCTV camera coverage with dedicated campus security, female scholar safety protocols, and emergency assistance.',
          tag: '100% Secure'
        }
      ]
    };

    // Load persisted state from disk
    try {
      if (fs.existsSync(PERSIST_FILE)) {
        const saved = JSON.parse(fs.readFileSync(PERSIST_FILE, 'utf8'));
        if (saved.admissions && saved.admissions.length > 0) this.admissions = saved.admissions;
        if (saved.receipts && saved.receipts.length > 0) this.receipts = saved.receipts;
        if (saved.ownerSeats && saved.ownerSeats.length > 0) this.ownerSeats = saved.ownerSeats;
        if (saved.biometricLogs && saved.biometricLogs.length > 0) this.biometricLogs = saved.biometricLogs;
        if (saved.homepageStats) this.homepageStats = saved.homepageStats;
        if (saved.homepageFeatures) this.homepageFeatures = saved.homepageFeatures;
      }
      // Ensure all admissions have a consistent grId and biometricEnrollmentId
      (this.admissions || []).forEach(a => {
        if (!a.grId) a.grId = `GR-${String(a.seatNumber).padStart(3, '0')}`;
        if (!a.biometricEnrollmentId) a.biometricEnrollmentId = Number(a.seatNumber);
      });
      // Retroactively link past biometricLogs to enrolled students if matching seat or PIN
      (this.biometricLogs || []).forEach(log => {
        const logNum = log.seatNumber ? Number(log.seatNumber) : (log.biometricEnrollmentId ? Number(log.biometricEnrollmentId) : null);
        if (logNum) {
          const matchStudent = this.admissions.find(a => Number(a.seatNumber) === logNum || Number(a.biometricEnrollmentId) === logNum);
          if (matchStudent) {
            log.seatNumber = matchStudent.seatNumber;
            log.studentName = matchStudent.studentName;
            log.studentPhone = matchStudent.studentPhone;
            log.grId = matchStudent.grId;
            log.biometricEnrollmentId = matchStudent.biometricEnrollmentId || matchStudent.seatNumber;
          }
        }
      });
    } catch (e) {
      console.error('Error loading persisted data:', e.message);
    }
    this.studentOtps = {};
    this.lockers = [...seedLockers];
    this.events = [...seedEvents];
    this.eventRegistrations = [];
    this.announcements = [...seedAnnouncements];
    this.issues = [...seedIssues];
    this.reservations = [];
    this.payments = [...seedPayments];
    this.notifications = [
      {
        id: 'notif-1',
        memberId: 'BDL-MEM-8842',
        title: 'Welcome to Brain Dock Library',
        message: 'Your Premium Scholar membership is active. Enjoy 24/7 access and research facilities.',
        type: 'general',
        link: '/membership-card',
        isRead: false,
        createdAt: new Date()
      },
      {
        id: 'notif-2',
        memberId: 'BDL-MEM-8842',
        title: 'Book Due Reminder',
        message: 'Designing Data-Intensive Applications is due in 11 days. You can renew online anytime.',
        type: 'due_reminder',
        link: '/my-books',
        isRead: false,
        createdAt: new Date()
      }
    ];
    this.contactMessages = [];
    this.auditLogs = [
      {
        id: 'aud-001',
        actorName: 'Dr. Keval Patel',
        actorRole: 'Super Admin',
        action: 'System Initialized',
        module: 'Core System',
        details: 'Initial library configuration deployed with 24/7 operational nodes.',
        timestamp: new Date()
      }
    ];
    this.testimonials = [...seedTestimonials];
    this.faqs = [...seedFaqs];
  }

  // Users
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(memberId) {
    return this.users.find(u => u.memberId === memberId);
  }

  addUser(userData) {
    const newUser = {
      ...userData,
      memberId: userData.memberId || `BDL-MEM-${Math.floor(1000 + Math.random() * 9000)}`,
      membershipStatus: userData.membershipStatus || 'Active',
      finesDue: userData.finesDue || 0,
      createdAt: new Date()
    };
    this.users.unshift(newUser);
    return newUser;
  }

  requestPasswordResetOtp(email) {
    if (!email) return { success: false, message: 'Email address is required.' };
    const user = this.findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'This email is not registered with Brain Dock Library.' };
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.passwordResetOtps = this.passwordResetOtps || {};
    this.passwordResetOtps[email.toLowerCase()] = {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
      userName: user.name
    };
    return {
      success: true,
      code,
      userName: user.name,
      email: user.email
    };
  }

  resetPasswordWithOtp(email, code, newPassword) {
    if (!email || !code || !newPassword) {
      return { success: false, message: 'Email, verification code, and new password are required.' };
    }
    const record = this.passwordResetOtps ? this.passwordResetOtps[email.toLowerCase()] : null;
    if (!record) {
      return { success: false, message: 'No reset request found for this email. Please request a new code.' };
    }
    if (Date.now() > record.expiresAt) {
      delete this.passwordResetOtps[email.toLowerCase()];
      return { success: false, message: 'Verification code has expired. Please request a fresh code.' };
    }
    if (String(record.code) !== String(code).trim()) {
      return { success: false, message: 'Invalid verification code. Please check and try again.' };
    }
    const user = this.findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }
    user.password = newPassword;
    delete this.passwordResetOtps[email.toLowerCase()];
    return { success: true, message: 'Password has been reset successfully! You can now log in with your new password.' };
  }

  // Books & Multilingual Old World Digital Library
  getAllBooks(query = {}) {
    let result = [...this.books];

    if (query.category && query.category !== 'All') {
      result = result.filter(b => b.category.toLowerCase() === query.category.toLowerCase());
    }

    if (query.language && query.language !== 'All') {
      result = result.filter(b => b.language && b.language.toLowerCase() === query.language.toLowerCase());
    }

    if (query.era && query.era !== 'All') {
      result = result.filter(b => b.era && b.era.toLowerCase() === query.era.toLowerCase());
    }

    if (query.isDigital === 'true') {
      result = result.filter(b => b.isDigitalArchive || b.hasPdf);
    }

    if (query.search) {
      const q = query.search.trim().toLowerCase();
      result = result.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.originalScriptTitle && b.originalScriptTitle.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.originalAuthor && b.originalAuthor.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q)) ||
        (b.bookId && b.bookId.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.language && b.language.toLowerCase().includes(q)) ||
        (b.era && b.era.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (query.status && query.status !== 'All') {
      result = result.filter(b => b.status === query.status);
    }

    if (query.sort) {
      if (query.sort === 'newest') result.sort((a,b) => b.publicationYear - a.publicationYear);
      if (query.sort === 'popular') result.sort((a,b) => (b.rating || 0) - (a.rating || 0));
      if (query.sort === 'title') result.sort((a,b) => a.title.localeCompare(b.title));
      if (query.sort === 'author') result.sort((a,b) => a.author.localeCompare(b.author));
      if (query.sort === 'ancient') result.sort((a,b) => a.publicationYear - b.publicationYear);
    }

    return result;
  }

  getBookById(id) {
    const book = this.books.find(b => b.bookId === id || b._id === id);
    if (!book) return null;
    const chapters = getFullChaptersForBook(book);
    return {
      ...book,
      chapters,
      pdfPages: chapters.length * 15 + 10,
      pdfUrl: `http://localhost:5000/api/books/${book.bookId}/pdf`,
      downloadPdfFilename: `${(book.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_')}_Complete_Edition.pdf`
    };
  }

  addBook(book) {
    const chapters = getFullChaptersForBook(book);
    const newBook = {
      ...book,
      bookId: book.bookId || `BDL-BK-${String(this.books.length + 1).padStart(3, '0')}`,
      chapters,
      isDigitalArchive: true,
      hasPdf: true,
      pdfPages: chapters.length * 15 + 10,
      pdfUrl: `http://localhost:5000/api/books/${book.bookId || 'new'}/pdf`,
      downloadPdfFilename: `${(book.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_')}_Complete_Edition.pdf`,
      totalCopies: Number(book.totalCopies) || 5,
      availableCopies: Number(book.availableCopies ?? book.totalCopies) || 5,
      status: book.status || 'Available',
      rating: book.rating || 4.8,
      reviewsCount: book.reviewsCount || 0,
      createdAt: new Date()
    };
    this.books.unshift(newBook);
    return newBook;
  }

  updateBook(id, data) {
    const idx = this.books.findIndex(b => b.bookId === id);
    if (idx !== -1) {
      this.books[idx] = { ...this.books[idx], ...data };
      return this.books[idx];
    }
    return null;
  }

  deleteBook(id) {
    const idx = this.books.findIndex(b => b.bookId === id);
    if (idx !== -1) {
      return this.books.splice(idx, 1)[0];
    }
    return null;
  }

  // Issue / Return
  issueBook({ bookId, memberId, issuedBy = 'Librarian Desk', days = 14 }) {
    const book = this.getBookById(bookId);
    const user = this.findUserById(memberId);
    if (!book || !user) return { success: false, message: 'Invalid Book or Member ID' };
    if (book.availableCopies <= 0) return { success: false, message: 'No copies available right now' };

    book.availableCopies -= 1;
    if (book.availableCopies === 0) book.status = 'Issued';

    const issueRecord = {
      issueId: `ISS-${Date.now().toString().slice(-6)}`,
      bookId: book.bookId,
      bookTitle: book.title,
      bookCover: book.coverImage,
      userName: user.name,
      memberId: user.memberId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      status: 'Issued',
      renewalsCount: 0,
      maxRenewals: 2,
      fineAmount: 0,
      finePaid: false,
      issuedBy
    };
    this.issues.unshift(issueRecord);

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      memberId: user.memberId,
      title: 'Book Issued Successfully',
      message: `You have successfully issued "${book.title}". Please return or renew by ${new Date(issueRecord.dueDate).toLocaleDateString()}.`,
      type: 'book_issued',
      link: '/my-books',
      isRead: false,
      createdAt: new Date()
    });

    return { success: true, data: issueRecord };
  }

  returnBook(issueId) {
    const issue = this.issues.find(i => i.issueId === issueId);
    if (!issue) return { success: false, message: 'Issue record not found' };
    issue.status = 'Returned';
    issue.returnDate = new Date();

    const book = this.getBookById(issue.bookId);
    if (book) {
      book.availableCopies += 1;
      book.status = 'Available';
    }

    return { success: true, data: issue };
  }

  renewBook(issueId) {
    const issue = this.issues.find(i => i.issueId === issueId);
    if (!issue) return { success: false, message: 'Issue record not found' };
    if (issue.renewalsCount >= (issue.maxRenewals || 2)) {
      return { success: false, message: 'Maximum renewal limit reached' };
    }
    issue.renewalsCount += 1;
    issue.dueDate = new Date(new Date(issue.dueDate).getTime() + 14 * 24 * 60 * 60 * 1000);
    return { success: true, data: issue };
  }

  // Reservations
  reserveBook({ bookId, memberId }) {
    const book = this.getBookById(bookId);
    const user = this.findUserById(memberId);
    if (!book || !user) return { success: false, message: 'Invalid Book or Member' };

    const reservation = {
      reservationId: `RES-${Date.now().toString().slice(-6)}`,
      bookId: book.bookId,
      bookTitle: book.title,
      userName: user.name,
      memberId: user.memberId,
      reservationDate: new Date(),
      status: 'Pending',
      queuePosition: this.reservations.filter(r => r.bookId === book.bookId && r.status === 'Pending').length + 1
    };
    this.reservations.unshift(reservation);
    return { success: true, data: reservation };
  }

  // Room Booking
  bookRoom({ roomId, memberId, date, timeSlot, purpose }) {
    const room = this.rooms.find(r => r.roomId === roomId);
    const user = this.findUserById(memberId);
    if (!room || !user) return { success: false, message: 'Invalid Room or Member' };

    const booking = {
      bookingId: `RMB-${Date.now().toString().slice(-6)}`,
      roomId: room.roomId,
      roomName: room.name,
      userName: user.name,
      memberId: user.memberId,
      date,
      timeSlot,
      purpose: purpose || 'Deep Focus Study Session',
      status: 'Confirmed',
      createdAt: new Date()
    };
    this.roomBookings.unshift(booking);

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      memberId: user.memberId,
      title: 'Study Room Confirmed',
      message: `Your booking for ${room.name} on ${date} (${timeSlot}) has been confirmed!`,
      type: 'room_booking',
      link: '/study-rooms',
      isRead: false,
      createdAt: new Date()
    });

    return { success: true, data: booking };
  }

  // Seat Booking
  bookSeat({ seatNumber, memberId, date, timeSlot }) {
    const seat = this.seats.find(s => s.seatNumber === seatNumber);
    const user = this.findUserById(memberId);
    if (!seat || !user) return { success: false, message: 'Invalid Seat or Member' };
    if (seat.status === 'Occupied' || seat.status === 'Maintenance') {
      return { success: false, message: 'Seat is currently not available' };
    }

    seat.status = 'Occupied';
    seat.currentOccupant = user.name;

    const booking = {
      bookingId: `STB-${Date.now().toString().slice(-6)}`,
      seatNumber: seat.seatNumber,
      zone: seat.zone,
      userName: user.name,
      memberId: user.memberId,
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || 'Morning Session (08:00 AM - 01:00 PM)',
      status: 'Active',
      createdAt: new Date()
    };
    this.seatBookings.unshift(booking);

    return { success: true, data: booking };
  }

  // Direct Online Desk Booking (With Name, Mobile, Address, WhatsApp links, and instant ERP sync)
  bookDirectSeat({ seatNumber, name, phone, address, timeSlot, amount = 849 }) {
    const seatNum = Number(seatNumber);
    // Find in 102 seats matrix
    const ownerSeat = this.ownerSeats.find(s => s.seatNumber === seatNum);
    if (!ownerSeat) return { success: false, message: `Desk #${seatNum} not found in 102 seats matrix.` };
    if (ownerSeat.status === 'Occupied') {
      return { success: false, message: `Desk #${seatNum} is already occupied by ${ownerSeat.occupant?.studentName || 'another student'}.` };
    }

    // Call createAdmission so it creates full admission, receipt, and updates ownerSeats
    const admResult = this.createAdmission({
      seatNumber: seatNum,
      studentName: name.trim(),
      studentPhone: phone.trim(),
      whatsAppNumber: phone.trim(),
      address: address.trim(),
      shift: timeSlot || 'Morning Session (08:00 AM - 01:00 PM)',
      totalFee: Number(amount) || 849,
      paidAmount: Number(amount) || 849,
      paymentMode: 'Online Website Booking',
      targetExam: 'Self Study / General Reading',
      notes: 'Direct Booking via 3D Interactive Map'
    });

    if (!admResult.success) {
      return admResult;
    }

    const admission = admResult.admission;

    // Also update legacy this.seats if present
    const legacySeat = this.seats.find(s => s.seatNumber === seatNum);
    if (legacySeat) {
      legacySeat.status = 'Occupied';
      legacySeat.currentOccupant = name.trim();
    }

    // Create booking record for this.seatBookings
    const booking = {
      bookingId: `STB-${String(seatNum).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      admissionId: admission.admissionId,
      receiptNumber: admission.receiptNumber,
      seatNumber: seatNum,
      zone: ownerSeat.zone,
      userName: name.trim(),
      userPhone: phone.trim(),
      userAddress: address.trim(),
      date: new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || 'Morning Session (08:00 AM - 01:00 PM)',
      amount: Number(amount) || 849,
      status: 'Active',
      createdAt: new Date()
    };
    this.seatBookings.unshift(booking);

    // Prepare WhatsApp Message for User
    const cleanUserPhone = String(phone).replace(/\D/g, '');
    const fullUserPhone = cleanUserPhone.startsWith('91') ? cleanUserPhone : `91${cleanUserPhone.slice(-10)}`;
    const userMsg = `🎉 *Brain Dock Library - Desk Reservation Confirmed!* 📚\n\nDear *${name.trim()}*,\nYour study desk has been successfully reserved!\n\n📌 *Desk Number:* Desk #${seatNum}\n🏠 *Address:* ${address.trim()}\n📱 *Mobile:* ${phone.trim()}\n🎫 *Pass ID:* ${admission.admissionId}\n\n✨ *Included Amenities:*\n• 24/7 Silent AC Reading Sanctuary\n• High-Speed USB-C & AC Charging Socket\n• Warm Dimmable LED Reading Lamp\n• Biometric Attendance & Personal Locker\n• Gigabit Fiber WiFi & RO Water\n\n📍 *Brain Dock Library & Study Sanctuary*\nHelpline: +91 63 5600 6100\nThank you!`;
    const userWhatsAppUrl = `https://api.whatsapp.com/send?phone=${fullUserPhone}&text=${encodeURIComponent(userMsg)}`;

    // Prepare WhatsApp Message for Admin / Owner
    const adminPhone = '916356006100'; // Library Director Helpline
    const adminMsg = `🚨 *NEW DESK BOOKING RECEIVED (Website 3D Map)* 🏛️\n\nA new student has reserved a desk online:\n\n📌 *Desk Number:* Desk #${seatNum}\n👤 *Student Name:* ${name.trim()}\n📱 *Mobile:* ${phone.trim()}\n🏠 *Address:* ${address.trim()}\n🎫 *Admission ID:* ${admission.admissionId}\n🧾 *Receipt:* ${admission.receiptNumber}\n📅 *Date:* ${new Date().toISOString().split('T')[0]}\n\nThis student is now live in your Admin ERP Panel.`;
    const adminWhatsAppUrl = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(adminMsg)}`;

    // Add high-priority notification for Admin Panel
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Desk #${seatNum} Booked: ${name.trim()}`,
      message: `${name.trim()} (+91 ${phone.trim()}) from ${address.trim()} reserved Desk #${seatNum} for ₹849/mo.`,
      type: 'SEAT_BOOKING',
      timestamp: new Date(),
      read: false
    });

    this.saveState();

    return {
      success: true,
      message: `Desk #${seatNum} successfully reserved for ${name.trim()}!`,
      data: {
        bookingId: booking.bookingId,
        admissionId: admission.admissionId,
        receiptNumber: admission.receiptNumber,
        seatNumber: seatNum,
        zone: ownerSeat.zone,
        userName: name.trim(),
        userPhone: phone.trim(),
        userAddress: address.trim(),
        timeSlot,
        amount: Number(amount) || 849,
        userWhatsAppUrl,
        adminWhatsAppUrl
      },
      admission
    };
  }

  // Event Registration
  registerForEvent({ eventId, memberId }) {
    const event = this.events.find(e => e.eventId === eventId);
    const user = this.findUserById(memberId);
    if (!event || !user) return { success: false, message: 'Invalid Event or Member' };
    if (event.registeredSeats >= event.totalSeats) {
      return { success: false, message: 'Event is fully booked' };
    }

    event.registeredSeats += 1;
    const reg = {
      registrationId: `EVR-${Date.now().toString().slice(-6)}`,
      eventId: event.eventId,
      eventTitle: event.title,
      userName: user.name,
      memberId: user.memberId,
      userEmail: user.email,
      ticketCode: `BDL-TKT-${Math.floor(100000 + Math.random()*900000)}`,
      status: 'Confirmed',
      createdAt: new Date()
    };
    this.eventRegistrations.unshift(reg);
    return { success: true, data: reg };
  }

  // Payments
  recordPayment({ memberId, purpose, amount, paymentMethod }) {
    const user = this.findUserById(memberId);
    const payment = {
      transactionId: `TXN-BDL-${Math.floor(10000 + Math.random() * 90000)}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userName: user ? user.name : 'Library Member',
      memberId: memberId,
      purpose,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'UPI',
      status: 'Success',
      date: new Date()
    };
    this.payments.unshift(payment);
    return payment;
  }

  // ================= 102-SEAT OWNER DESK & ADMISSION SYSTEM =================
  get102Seats() {
    const now = new Date();
    // Recalculate live days remaining for occupied seats
    this.ownerSeats.forEach(seat => {
      if (seat.occupant && seat.occupant.endDate) {
        const end = new Date(seat.occupant.endDate);
        const days = Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        seat.occupant.daysRemaining = days;
        if (days < 0 && seat.status !== 'Maintenance') {
          seat.status = 'Expired';
        }
      }
    });
    return this.ownerSeats;
  }

  getSeatByNumber(seatNum) {
    const num = Number(seatNum);
    return this.ownerSeats.find(s => s.seatNumber === num);
  }

  getAdmissions({ filter, search } = {}) {
    let list = [...this.admissions];
    const now = new Date();

    // Update days remaining
    list.forEach(adm => {
      const end = new Date(adm.endDate);
      adm.daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (adm.daysRemaining < 0 && adm.status === 'Active') {
        adm.status = 'Expired';
      }
    });

    if (filter === 'pending') {
      list = list.filter(a => a.feeStatus === 'Pending' || a.pendingFee > 0);
    } else if (filter === 'paid') {
      list = list.filter(a => a.feeStatus === 'Paid' && a.pendingFee === 0);
    } else if (filter === 'expiring') {
      list = list.filter(a => a.daysRemaining >= 0 && a.daysRemaining <= 5 && a.status !== 'Vacated');
    } else if (filter === 'expired') {
      list = list.filter(a => a.status === 'Expired' || a.daysRemaining < 0);
    } else if (filter === 'active') {
      list = list.filter(a => a.status === 'Active' && a.daysRemaining >= 0);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(a => 
        a.studentName.toLowerCase().includes(q) ||
        a.studentPhone.includes(q) ||
        String(a.seatNumber).includes(q) ||
        a.admissionId.toLowerCase().includes(q) ||
        (a.targetExam && a.targetExam.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getAdmissionById(admissionId) {
    return this.admissions.find(a => a.admissionId === admissionId);
  }

  createAdmission(data) {
    const seatNum = Number(data.seatNumber);
    const seat = this.ownerSeats.find(s => s.seatNumber === seatNum);
    if (!seat) return { success: false, message: `Seat ${seatNum} not found in 102 seats matrix` };
    if (seat.status === 'Occupied') {
      return { success: false, message: `Seat ${seatNum} is already occupied by ${seat.occupant?.studentName}` };
    }

    const totalFee = Number(data.totalFee || 1500);
    const paidAmount = Number(data.paidAmount || 0);
    const pendingFee = Math.max(0, totalFee - paidAmount);
    const feeStatus = pendingFee === 0 ? 'Paid' : (paidAmount > 0 ? 'Pending' : 'Pending');

    const startDate = data.startDate || new Date().toISOString().split('T')[0];
    const durationMonths = Number(data.durationMonths || 1);
    const startObj = new Date(startDate);
    const endObj = new Date(startObj);
    endObj.setMonth(endObj.getMonth() + durationMonths);
    const endDate = data.endDate || endObj.toISOString().split('T')[0];

    const daysRemaining = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
    const admissionId = `BDL-ADM-${String(seatNum).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;
    const receiptNumber = `BDL-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const biometricId = data.biometricEnrollmentId ? Number(data.biometricEnrollmentId) : seatNum;
    const grId = data.grId || `GR-${String(seatNum).padStart(3, '0')}`;

    const newAdmission = {
      admissionId,
      receiptNumber,
      grId,
      seatNumber: seatNum,
      biometricEnrollmentId: biometricId,
      seatLabel: `Seat ${String(seatNum).padStart(2, '0')}`,
      zone: seat.zone,
      floor: seat.floor,
      
      // 01 PERSONAL DETAILS
      studentName: data.studentName.trim(),
      parentsName: (data.parentsName || '').trim(),
      dob: data.dob || '',
      gender: data.gender || 'Male',
      studentPhone: data.studentPhone.trim(),
      whatsAppNumber: (data.whatsAppNumber || data.studentPhone || '').trim(),
      studentEmail: (data.studentEmail || '').trim(),
      address: data.address || '',
      city: data.city || '',
      pinCode: data.pinCode || '',

      // 02 EDUCATION / PROFESSIONAL DETAILS
      qualification: data.qualification || '',
      institution: data.institution || '',
      course: data.course || '',
      yearSemester: data.yearSemester || '',
      occupation: data.occupation || data.targetExam || '',
      targetExam: data.targetExam || data.occupation || 'General Reading & Study',

      // 03 LIBRARY MEMBERSHIP DETAILS
      membershipType: data.membershipType || 'Monthly',
      shift: data.shift || 'Full Day (24x7)',
      plan: data.plan || `${durationMonths} Month(s)`,
      startDate,
      endDate,
      daysRemaining,
      lockerNumber: data.lockerNumber || '',

      // 04 EMERGENCY CONTACT DETAILS
      emergencyName: data.emergencyName || data.guardianName || '',
      emergencyRelation: data.emergencyRelation || 'Parent',
      emergencyPhone: data.emergencyPhone || data.guardianPhone || '',
      guardianPhone: data.guardianPhone || data.emergencyPhone || '',

      // 05 IDENTITY / DOCUMENT DETAILS
      idProofType: data.idProofType || 'Aadhaar Card',
      idProofNo: data.idProofNo || data.aadhaarNo || '',
      aadhaarNo: data.aadhaarNo || data.idProofNo || '',
      photoAttached: !!data.studentPhoto,
      studentPhoto: data.studentPhoto || '', // compressed image data URL

      totalFee,
      paidAmount,
      pendingFee,
      feeDueDate: pendingFee > 0 ? (data.feeDueDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]) : null,
      feeStatus,
      paymentMode: data.paymentMode || 'UPI',
      transactionRef: data.transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
      notes: data.notes || '',
      status: 'Active',
      createdAt: new Date()
    };

    // Retroactively link any past biometric punches with this PIN to this student
    if (this.biometricLogs && this.biometricLogs.length > 0) {
      this.biometricLogs.forEach(log => {
        if (String(log.biometricEnrollmentId) === String(biometricId) || String(log.seatNumber) === String(seatNum)) {
          log.studentName = newAdmission.studentName;
          log.studentPhone = newAdmission.studentPhone;
          log.seatNumber = seatNum;
          log.zone = newAdmission.zone;
          log.floor = newAdmission.floor;
          log.accessResult = newAdmission.feeStatus === 'Paid' ? 'GRANTED' : 'DENIED';
          log.reason = 'Live Machine Punch - Active Admission';
        }
      });
    }

    // Update Seat in 102 Matrix
    seat.status = 'Occupied';
    seat.occupant = {
      admissionId,
      receiptNumber,
      grId,
      biometricEnrollmentId: biometricId,
      studentName: newAdmission.studentName,
      studentPhone: newAdmission.studentPhone,
      studentEmail: newAdmission.studentEmail,
      studentPhoto: newAdmission.studentPhoto,
      targetExam: newAdmission.targetExam,
      shift: newAdmission.shift,
      startDate: newAdmission.startDate,
      endDate: newAdmission.endDate,
      daysRemaining,
      feeStatus,
      totalFee,
      paidAmount,
      pendingFee,
      feeDueDate: newAdmission.feeDueDate,
      lockerNumber: newAdmission.lockerNumber
    };

    // Create Official Receipt
    const receiptRecord = {
      receiptNumber,
      admissionId,
      date: new Date().toISOString().split('T')[0],
      studentName: newAdmission.studentName,
      studentPhone: newAdmission.studentPhone,
      aadhaarNo: newAdmission.aadhaarNo,
      seatNumber: seatNum,
      seatLabel: newAdmission.seatLabel,
      zone: seat.zone,
      shift: newAdmission.shift,
      plan: newAdmission.plan,
      validFrom: newAdmission.startDate,
      validTo: newAdmission.endDate,
      totalFee,
      amountPaid: paidAmount,
      pendingDue: pendingFee,
      feeDueDate: newAdmission.feeDueDate,
      feeStatus,
      paymentMode: newAdmission.paymentMode,
      transactionRef: newAdmission.transactionRef,
      authorizedBy: 'Dr. Keval Patel (Director / Owner)'
    };

    this.admissions.unshift(newAdmission);
    this.receipts.unshift(receiptRecord);

    // Record in global ledger
    this.payments.unshift({
      transactionId: newAdmission.transactionRef,
      invoiceNumber: receiptNumber,
      userName: newAdmission.studentName,
      memberId: admissionId,
      purpose: `Seat #${seatNum} Library Admission`,
      amount: paidAmount,
      paymentMethod: newAdmission.paymentMode,
      status: 'Success',
      date: new Date()
    });

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorName: 'Library Owner',
      actorRole: 'Owner Desk',
      action: 'New Admission Enrolled',
      module: '102-Seat Admission Desk',
      details: `Enrolled ${newAdmission.studentName} on Seat #${seatNum} (${newAdmission.shift}). Fee: ₹${totalFee}, Paid: ₹${paidAmount}`,
      timestamp: new Date()
    });

    this.saveState();
    return { success: true, admission: newAdmission, receipt: receiptRecord };
  }

  collectPendingFee(admissionId, { amount, paymentMode, transactionRef, notes }) {
    const adm = this.admissions.find(a => a.admissionId === admissionId);
    if (!adm) return { success: false, message: 'Admission record not found' };

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return { success: false, message: 'Invalid payment amount' };
    }

    adm.paidAmount += payAmount;
    adm.pendingFee = Math.max(0, adm.totalFee - adm.paidAmount);
    adm.feeStatus = adm.pendingFee === 0 ? 'Paid' : 'Pending';
    if (adm.pendingFee === 0) adm.feeDueDate = null;

    // Sync seat occupant
    const seat = this.ownerSeats.find(s => s.seatNumber === adm.seatNumber);
    if (seat && seat.occupant) {
      seat.occupant.paidAmount = adm.paidAmount;
      seat.occupant.pendingFee = adm.pendingFee;
      seat.occupant.feeStatus = adm.feeStatus;
      seat.occupant.feeDueDate = adm.feeDueDate;
    }

    // Generate supplementary fee receipt
    const receiptNumber = `BDL-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReceipt = {
      receiptNumber,
      admissionId: adm.admissionId,
      date: new Date().toISOString().split('T')[0],
      studentName: adm.studentName,
      studentPhone: adm.studentPhone,
      aadhaarNo: adm.aadhaarNo,
      seatNumber: adm.seatNumber,
      seatLabel: adm.seatLabel,
      zone: adm.zone,
      shift: adm.shift,
      plan: `${adm.plan} (Balance Fee Clearance)`,
      validFrom: adm.startDate,
      validTo: adm.endDate,
      totalFee: adm.totalFee,
      amountPaid: payAmount,
      pendingDue: adm.pendingFee,
      feeDueDate: adm.feeDueDate,
      feeStatus: adm.feeStatus,
      paymentMode: paymentMode || 'Cash',
      transactionRef: transactionRef || `CASH-${Date.now().toString().slice(-6)}`,
      authorizedBy: 'Dr. Keval Patel (Director / Owner)'
    };
    this.receipts.unshift(newReceipt);

    // Record in global payments
    this.payments.unshift({
      transactionId: newReceipt.transactionRef,
      invoiceNumber: receiptNumber,
      userName: adm.studentName,
      memberId: adm.admissionId,
      purpose: `Pending Fee Clearance (Seat #${adm.seatNumber})`,
      amount: payAmount,
      paymentMethod: paymentMode || 'Cash',
      status: 'Success',
      date: new Date()
    });

    return { success: true, admission: adm, receipt: newReceipt };
  }

  renewAdmission(admissionId, { months, totalFee, paidAmount, paymentMode, transactionRef }) {
    const adm = this.admissions.find(a => a.admissionId === admissionId);
    if (!adm) return { success: false, message: 'Admission record not found' };

    const renewMonths = Number(months || 1);
    const fee = Number(totalFee || 1500);
    const paid = Number(paidAmount || fee);
    const pending = Math.max(0, fee - paid);

    // Push end date forward from current end date (or today if already expired)
    const currentEnd = new Date(adm.endDate);
    const baseDate = currentEnd > new Date() ? currentEnd : new Date();
    baseDate.setMonth(baseDate.getMonth() + renewMonths);
    adm.endDate = baseDate.toISOString().split('T')[0];

    adm.totalFee += fee;
    adm.paidAmount += paid;
    adm.pendingFee = Math.max(0, adm.totalFee - adm.paidAmount);
    adm.feeStatus = adm.pendingFee === 0 ? 'Paid' : 'Pending';
    adm.status = 'Active';

    // Update days remaining
    const days = Math.ceil((baseDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
    adm.daysRemaining = days;

    // Sync seat
    const seat = this.ownerSeats.find(s => s.seatNumber === adm.seatNumber);
    if (seat) {
      seat.status = 'Occupied';
      if (seat.occupant) {
        seat.occupant.endDate = adm.endDate;
        seat.occupant.daysRemaining = days;
        seat.occupant.totalFee = adm.totalFee;
        seat.occupant.paidAmount = adm.paidAmount;
        seat.occupant.pendingFee = adm.pendingFee;
        seat.occupant.feeStatus = adm.feeStatus;
      }
    }

    const receiptNumber = `BDL-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReceipt = {
      receiptNumber,
      admissionId: adm.admissionId,
      date: new Date().toISOString().split('T')[0],
      studentName: adm.studentName,
      studentPhone: adm.studentPhone,
      aadhaarNo: adm.aadhaarNo,
      seatNumber: adm.seatNumber,
      seatLabel: adm.seatLabel,
      zone: adm.zone,
      shift: adm.shift,
      plan: `Renewal for ${renewMonths} Month(s)`,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: adm.endDate,
      totalFee: fee,
      amountPaid: paid,
      pendingDue: pending,
      feeDueDate: pending > 0 ? new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] : null,
      feeStatus: pending === 0 ? 'Paid' : 'Pending',
      paymentMode: paymentMode || 'UPI',
      transactionRef: transactionRef || `UPI/RNW-${Date.now().toString().slice(-6)}`,
      authorizedBy: 'Dr. Keval Patel (Director / Owner)'
    };
    // Reset reminder status upon successful renewal so no further warnings are sent
    adm.lastReminderSentDate = null;
    adm.reminderLogs = adm.reminderLogs || [];
    adm.reminderLogs.push({
      action: 'Renewed',
      renewedAt: new Date().toISOString(),
      newEndDate: adm.endDate
    });

    this.saveState();
    return { success: true, admission: adm, receipt: newReceipt };
  }

  // Check Upcoming Expiries (Last 3 Days Daily Notification Engine)
  getUpcomingExpiries() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const list = [];

    for (const adm of this.admissions) {
      if (adm.status === 'Vacated') continue;
      
      const end = new Date(adm.endDate);
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Notification window: 3 days prior or already expired (diffDays <= 3)
      if (diffDays <= 3) {
        const alreadySentToday = adm.lastReminderSentDate === todayStr;
        const cleanPhone = (adm.studentPhone || '').replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`;

        const expiryLabel = diffDays < 0 
          ? `EXPIRED ${Math.abs(diffDays)} day(s) ago` 
          : diffDays === 0 
            ? 'EXPIRES TODAY' 
            : `expiring in ${diffDays} day(s)`;

        const reminderMessage = `🔔 *Brain Dock Library - Membership Renewal Alert* 📚\n\nDear *${adm.studentName}*,\n\nYour library membership for *Seat #${adm.seatNumber}* is ${expiryLabel} on *${adm.endDate}*.\n\n⚠️ *Seat Protection Notice:*\nTo ensure your personal seat is retained and your 24/7 biometric attendance access continues without disruption, please renew your membership at the library desk today.\n\n📌 *Seat:* Seat #${adm.seatNumber} (${adm.shift || 'Full Day'})\n📅 *Valid Till:* ${adm.endDate}\n💰 *Renewal Plan:* ₹${adm.totalFee || 1500} / Month\n\n📍 *Brain Dock Library & Study Sanctuary*\nHelpline: +91 63 5600 6100\nThank you!`;

        const whatsAppUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(reminderMessage)}`;

        list.push({
          admissionId: adm.admissionId,
          studentName: adm.studentName,
          studentPhone: adm.studentPhone,
          fullPhone,
          seatNumber: adm.seatNumber,
          shift: adm.shift,
          endDate: adm.endDate,
          daysRemaining: diffDays,
          isExpired: diffDays < 0,
          alreadySentToday,
          lastReminderSentDate: adm.lastReminderSentDate || null,
          reminderMessage,
          whatsAppUrl
        });
      }
    }

    list.sort((a, b) => a.daysRemaining - b.daysRemaining);
    return list;
  }

  // Record dispatch of daily reminder message
  sendExpiryReminder(admissionId) {
    const adm = this.admissions.find(a => a.admissionId === admissionId);
    if (!adm) return { success: false, message: 'Student admission not found' };

    const todayStr = new Date().toISOString().split('T')[0];
    adm.lastReminderSentDate = todayStr;
    adm.reminderLogs = adm.reminderLogs || [];
    adm.reminderLogs.push({
      action: 'Reminder Sent',
      sentAt: new Date().toISOString(),
      daysRemaining: adm.daysRemaining,
      channel: 'WhatsApp'
    });

    this.saveState();

    const cleanPhone = (adm.studentPhone || '').replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`;
    const end = new Date(adm.endDate);
    const diffDays = Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const expiryLabel = diffDays < 0 
      ? `EXPIRED ${Math.abs(diffDays)} day(s) ago` 
      : diffDays === 0 
        ? 'EXPIRES TODAY' 
        : `expiring in ${diffDays} day(s)`;

    const reminderMessage = `🔔 *Brain Dock Library - Membership Renewal Alert* 📚\n\nDear *${adm.studentName}*,\n\nYour library membership for *Seat #${adm.seatNumber}* is ${expiryLabel} on *${adm.endDate}*.\n\n⚠️ *Seat Protection Notice:*\nTo ensure your personal seat is retained and your 24/7 biometric attendance access continues without disruption, please renew your membership at the library desk today.\n\n📌 *Seat:* Seat #${adm.seatNumber} (${adm.shift || 'Full Day'})\n📅 *Valid Till:* ${adm.endDate}\n💰 *Renewal Plan:* ₹${adm.totalFee || 1500} / Month\n\n📍 *Brain Dock Library & Study Sanctuary*\nHelpline: +91 63 5600 6100\nThank you!`;

    const whatsAppUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(reminderMessage)}`;

    return {
      success: true,
      message: `Daily reminder recorded for ${adm.studentName}.`,
      whatsAppUrl,
      phone: fullPhone,
      studentName: adm.studentName
    };
  }

  updateAdmission(admissionId, data) {
    const adm = this.admissions.find(a => a.admissionId === admissionId);
    if (!adm) return { success: false, message: 'Admission record not found' };

    // If seat number changed, handle seat reallocation
    const newSeatNum = data.seatNumber ? Number(data.seatNumber) : adm.seatNumber;
    if (newSeatNum !== adm.seatNumber) {
      const oldSeat = this.ownerSeats.find(s => s.seatNumber === adm.seatNumber);
      const newSeat = this.ownerSeats.find(s => s.seatNumber === newSeatNum);
      if (newSeat && newSeat.status === 'Occupied' && newSeat.occupant?.admissionId !== admissionId) {
        return { success: false, message: `Seat #${newSeatNum} is already occupied by ${newSeat.occupant?.studentName}!` };
      }
      if (oldSeat) {
        oldSeat.status = 'Available';
        oldSeat.occupant = null;
      }
      if (newSeat) {
        newSeat.status = 'Occupied';
      }
      adm.seatNumber = newSeatNum;
      adm.seatLabel = `Seat ${String(newSeatNum).padStart(2, '0')}`;
      if (newSeat) {
        adm.zone = newSeat.zone;
        adm.floor = newSeat.floor;
      }
    }

    // 01 Personal Details
    if (data.studentName !== undefined) adm.studentName = data.studentName.trim();
    if (data.parentsName !== undefined) adm.parentsName = data.parentsName.trim();
    if (data.dob !== undefined) adm.dob = data.dob;
    if (data.gender !== undefined) adm.gender = data.gender;
    if (data.studentPhone !== undefined) adm.studentPhone = data.studentPhone.trim();
    if (data.whatsAppNumber !== undefined) adm.whatsAppNumber = data.whatsAppNumber.trim();
    if (data.studentEmail !== undefined) adm.studentEmail = data.studentEmail.trim();
    if (data.address !== undefined) adm.address = data.address;
    if (data.city !== undefined) adm.city = data.city;
    if (data.pinCode !== undefined) adm.pinCode = data.pinCode;

    // 02 Education / Professional
    if (data.qualification !== undefined) adm.qualification = data.qualification;
    if (data.institution !== undefined) adm.institution = data.institution;
    if (data.course !== undefined) adm.course = data.course;
    if (data.yearSemester !== undefined) adm.yearSemester = data.yearSemester;
    if (data.occupation !== undefined) adm.occupation = data.occupation;
    if (data.targetExam !== undefined) adm.targetExam = data.targetExam;

    // 03 Library Membership
    if (data.membershipType !== undefined) adm.membershipType = data.membershipType;
    if (data.shift !== undefined) adm.shift = data.shift;
    if (data.plan !== undefined) adm.plan = data.plan;
    if (data.startDate !== undefined) adm.startDate = data.startDate;
    if (data.endDate !== undefined) {
      adm.endDate = data.endDate;
      adm.daysRemaining = Math.ceil((new Date(adm.endDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
    }
    if (data.lockerNumber !== undefined) adm.lockerNumber = data.lockerNumber;

    // 04 Emergency Contact
    if (data.emergencyName !== undefined) adm.emergencyName = data.emergencyName;
    if (data.emergencyRelation !== undefined) adm.emergencyRelation = data.emergencyRelation;
    if (data.emergencyPhone !== undefined) adm.emergencyPhone = data.emergencyPhone;
    if (data.guardianPhone !== undefined) adm.guardianPhone = data.guardianPhone;

    // 05 Identity / Document
    if (data.idProofType !== undefined) adm.idProofType = data.idProofType;
    if (data.idProofNo !== undefined) adm.idProofNo = data.idProofNo;
    if (data.aadhaarNo !== undefined) adm.aadhaarNo = data.aadhaarNo;
    if (data.studentPhoto !== undefined) {
      adm.studentPhoto = data.studentPhoto;
      adm.photoAttached = !!data.studentPhoto;
    }

    // Biometric PIN
    if (data.biometricEnrollmentId !== undefined) {
      adm.biometricEnrollmentId = Number(data.biometricEnrollmentId);
    }

    adm.updatedAt = new Date().toISOString();

    // Sync seat occupant
    const currentSeat = this.ownerSeats.find(s => s.seatNumber === adm.seatNumber);
    if (currentSeat) {
      currentSeat.status = 'Occupied';
      currentSeat.occupant = {
        admissionId: adm.admissionId,
        receiptNumber: adm.receiptNumber,
        biometricEnrollmentId: adm.biometricEnrollmentId,
        studentName: adm.studentName,
        studentPhone: adm.studentPhone,
        studentEmail: adm.studentEmail,
        studentPhoto: adm.studentPhoto,
        targetExam: adm.targetExam || adm.occupation,
        shift: adm.shift,
        startDate: adm.startDate,
        endDate: adm.endDate,
        daysRemaining: adm.daysRemaining,
        feeStatus: adm.feeStatus,
        totalFee: adm.totalFee,
        paidAmount: adm.paidAmount,
        pendingFee: adm.pendingFee,
        feeDueDate: adm.feeDueDate,
        lockerNumber: adm.lockerNumber
      };
    }

    // Sync corresponding receipt student name/phone
    const receipt = this.receipts.find(r => r.admissionId === admissionId);
    if (receipt) {
      receipt.studentName = adm.studentName;
      receipt.studentPhone = adm.studentPhone;
      receipt.seatNumber = adm.seatNumber;
      receipt.seatLabel = adm.seatLabel;
      receipt.shift = adm.shift;
      receipt.aadhaarNo = adm.aadhaarNo || adm.idProofNo;
    }

    this.saveState();
    return { success: true, message: 'Student admission updated successfully!', admission: adm };
  }

  deleteAdmission(admissionId) {
    const index = this.admissions.findIndex(a => a.admissionId === admissionId);
    if (index === -1) return { success: false, message: 'Admission record not found' };

    const adm = this.admissions[index];
    const seatNum = adm.seatNumber;

    // Free up seat if occupied by this student
    const seat = this.ownerSeats.find(s => s.seatNumber === seatNum);
    if (seat && seat.occupant?.admissionId === admissionId) {
      seat.status = 'Available';
      seat.occupant = null;
    }

    // Remove from admissions array
    this.admissions.splice(index, 1);

    // Also remove from studentOtps if any
    const phone = (adm.studentPhone || '').replace(/\D/g, '').slice(-10);
    if (phone && this.studentOtps[phone]) {
      delete this.studentOtps[phone];
    }

    this.saveState();
    return { 
      success: true, 
      message: `Admission for ${adm.studentName} (Seat #${seatNum}) permanently deleted. Seat is now Available.` 
    };
  }

  vacateSeat(seatNumber, reason) {
    const num = Number(seatNumber);
    const seat = this.ownerSeats.find(s => s.seatNumber === num);
    if (!seat) return { success: false, message: 'Seat not found' };

    const adm = this.admissions.find(a => a.seatNumber === num && a.status !== 'Vacated');
    if (adm) {
      adm.status = 'Vacated';
      adm.vacatedAt = new Date();
      adm.vacateReason = reason || 'Completed period';
    }

    seat.status = 'Available';
    const oldOccupant = seat.occupant;
    seat.occupant = null;

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorName: 'Library Owner',
      actorRole: 'Owner Desk',
      action: 'Seat Vacated',
      module: '102-Seat Admission Desk',
      details: `Seat #${num} vacated. Former occupant: ${oldOccupant ? oldOccupant.studentName : 'Unknown'}`,
      timestamp: new Date()
    });

    return { success: true, message: `Seat #${num} is now available for new admission.` };
  }

  getReceipt(receiptNumber) {
    return this.receipts.find(r => r.receiptNumber === receiptNumber);
  }

  saveState() {
    try {
      fs.writeFileSync(PERSIST_FILE, JSON.stringify({
        admissions: this.admissions,
        receipts: this.receipts,
        ownerSeats: this.ownerSeats,
        biometricLogs: this.biometricLogs,
        homepageStats: this.homepageStats,
        homepageFeatures: this.homepageFeatures
      }, null, 2));
    } catch (e) {
      console.error('Error saving state:', e.message);
    }
  }

  getHomepageStats() {
    if (!this.homepageStats) {
      this.homepageStats = {
        isVisible: false,
        items: [
          { id: '1', number: '45,000+', label: 'Physical Volumes' },
          { id: '2', number: '12,800+', label: 'Active Members' },
          { id: '3', number: '250+', label: 'Study Seats' },
          { id: '4', number: '1,400+', label: 'Daily Visitors' },
          { id: '5', number: '18,500+', label: 'Research Journals' }
        ]
      };
    }
    return this.homepageStats;
  }

  updateHomepageStats(data) {
    if (!this.homepageStats) {
      this.getHomepageStats();
    }
    if (data) {
      if (typeof data.isVisible === 'boolean') {
        this.homepageStats.isVisible = data.isVisible;
      }
      if (Array.isArray(data.items)) {
        this.homepageStats.items = data.items.map((item, idx) => ({
          id: item.id || String(idx + 1),
          number: item.number || '',
          label: item.label || ''
        }));
      }
      this.saveState();
    }
    return this.homepageStats;
  }

  getHomepageFeatures() {
    if (!this.homepageFeatures || !Array.isArray(this.homepageFeatures.items)) {
      this.homepageFeatures = {
        badge: 'The Brain Dock Difference',
        title: 'Engineered for Concentration & Clarity',
        subtitle: 'We removed the noise, slow checkouts, and visual clutter to build a reading ecosystem focused purely on comprehension.',
        items: [
          {
            id: 'feat-1',
            icon: 'Laptop',
            title: 'Personal Dedicated Desk',
            description: 'Your own fixed study desk reserved 24/7 with personal multi-plug power sockets, soft-reading LED lamp, and partition privacy.',
            tag: 'Personal Desk'
          },
          {
            id: 'feat-2',
            icon: 'Lock',
            title: 'Personal Secure Locker',
            description: 'Spacious individual lock & key locker for safe storage of heavy reference books, laptops, bags, and study notes.',
            tag: 'Personal Locker'
          },
          {
            id: 'feat-3',
            icon: 'Armchair',
            title: 'Ergonomic Revolving Chair',
            description: '360° revolving executive mesh chairs with breathable backrest, adjustable height, and lumbar support for fatigue-free 12+ hour study sessions.',
            tag: 'Revolving Chair'
          },
          {
            id: 'feat-4',
            icon: 'Coffee',
            title: 'Hygienic Pantry Area',
            description: 'Dedicated clean pantry & refreshment lounge equipped with chilled RO drinking water, hot tea/coffee station, dining tables, and microwave.',
            tag: 'Pantry Area'
          },
          {
            id: 'feat-5',
            icon: 'VolumeX',
            title: 'Acoustic Soundproofing & AC',
            description: 'Calibrated acoustic sound-dampening walls, double-glazed glass, and strict whisper policies ensuring pin-drop silence below 40dB.',
            tag: 'Silent Zone'
          },
          {
            id: 'feat-6',
            icon: 'Wifi',
            title: 'Wi-Fi 7 Gigabit High-Speed Mesh',
            description: 'Low-latency symmetrical fiber mesh internet with seamless roaming and unlimited bandwidth for video lectures and research.',
            tag: 'Gigabit Mesh'
          },
          {
            id: 'feat-7',
            icon: 'Clock',
            title: '24/7 Biometric Smart Punch',
            description: 'High-speed fingerprint and smart terminal access for round-the-clock entry with real-time student study hours tracking.',
            tag: '24/7 Access'
          },
          {
            id: 'feat-8',
            icon: 'ShieldCheck',
            title: 'CCTV Surveillance & Safety',
            description: 'Full HD CCTV camera coverage with dedicated campus security, female scholar safety protocols, and emergency assistance.',
            tag: '100% Secure'
          }
        ]
      };
    }
    return this.homepageFeatures;
  }

  updateHomepageFeatures(data) {
    if (!this.homepageFeatures) this.getHomepageFeatures();
    if (data) {
      if (typeof data.title === 'string') this.homepageFeatures.title = data.title;
      if (typeof data.subtitle === 'string') this.homepageFeatures.subtitle = data.subtitle;
      if (typeof data.badge === 'string') this.homepageFeatures.badge = data.badge;
      if (Array.isArray(data.items)) {
        this.homepageFeatures.items = data.items.map((item, idx) => ({
          id: item.id || `feat-${Date.now()}-${idx}`,
          icon: item.icon || 'Sparkles',
          title: item.title || 'Feature Title',
          description: item.description || '',
          tag: item.tag || ''
        }));
      }
      this.saveState();
    }
    return this.homepageFeatures;
  }

  addHomepageFeature(item) {
    if (!this.homepageFeatures) this.getHomepageFeatures();
    const newItem = {
      id: `feat-${Date.now()}`,
      icon: item.icon || 'Sparkles',
      title: item.title || 'New Facility',
      description: item.description || '',
      tag: item.tag || 'Facility'
    };
    this.homepageFeatures.items.push(newItem);
    this.saveState();
    return this.homepageFeatures;
  }

  deleteHomepageFeature(id) {
    if (!this.homepageFeatures) this.getHomepageFeatures();
    this.homepageFeatures.items = (this.homepageFeatures.items || []).filter(item => item.id !== id);
    this.saveState();
    return this.homepageFeatures;
  }

  clearAllData() {
    this.ownerSeats.forEach(s => {
      s.status = 'Available';
      s.occupant = null;
    });
    this.admissions = [];
    this.receipts = [];
    this.biometricLogs = [];
    this.saveState();
    return true;
  }

  getOwnerStats() {
    const totalSeats = 102;
    const seats = this.get102Seats();
    const occupiedSeats = seats.filter(s => s.status === 'Occupied' || s.status === 'Expired').length;
    const availableSeats = seats.filter(s => s.status === 'Available').length;
    const maintenanceSeats = seats.filter(s => s.status === 'Maintenance').length;

    const activeAdmissions = this.admissions.filter(a => a.status !== 'Vacated');
    const feePendingList = activeAdmissions.filter(a => a.pendingFee > 0);
    const totalFeePending = feePendingList.reduce((acc, a) => acc + (a.pendingFee || 0), 0);
    const totalFeeCollected = activeAdmissions.reduce((acc, a) => acc + (a.paidAmount || 0), 0);

    const expiringSoon = activeAdmissions.filter(a => a.daysRemaining >= 0 && a.daysRemaining <= 5);
    const expiredCount = activeAdmissions.filter(a => a.daysRemaining < 0 || a.status === 'Expired');

    return {
      totalSeats,
      occupiedSeats,
      availableSeats,
      maintenanceSeats,
      occupancyRate: Math.round((occupiedSeats / totalSeats) * 100),
      totalFeeCollected,
      totalFeePending,
      pendingCount: feePendingList.length,
      expiringSoonCount: expiringSoon.length,
      expiredCount: expiredCount.length
    };
  }

  // ==========================================
  // TIMEWATCH BIOMETRIC & ATTENDANCE METHODS
  // ==========================================

  getBiometricLogs({ search, filter, date } = {}) {
    let logs = [...this.biometricLogs];

    if (date) {
      logs = logs.filter(l => l.date === date);
    }

    if (filter === 'granted') {
      logs = logs.filter(l => l.accessResult === 'GRANTED');
    } else if (filter === 'denied') {
      logs = logs.filter(l => l.accessResult === 'DENIED');
    } else if (filter === 'in') {
      logs = logs.filter(l => l.punchType === 'IN');
    } else if (filter === 'out') {
      logs = logs.filter(l => l.punchType === 'OUT');
    }

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l => 
        (l.studentName && l.studentName.toLowerCase().includes(q)) ||
        (l.grId && l.grId.toLowerCase().includes(q)) ||
        String(l.seatNumber).includes(q) ||
        (l.studentPhone && l.studentPhone.includes(q))
      );
    }

    return logs;
  }

  getBiometricStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = this.biometricLogs.filter(l => l.date === today || l.timestamp.startsWith(today));
    
    // Calculate currently inside
    // For each student, check their latest punch today. If IN and GRANTED -> currently inside
    const studentLatest = {};
    todayLogs.forEach(l => {
      if (l.accessResult === 'GRANTED' && l.grId) {
        studentLatest[l.grId] = l.punchType;
      }
    });

    const currentlyInside = Object.values(studentLatest).filter(type => type === 'IN').length;
    const todayPunches = todayLogs.length;
    const accessDeniedCount = todayLogs.filter(l => l.accessResult === 'DENIED').length;
    const accessGrantedCount = todayLogs.filter(l => l.accessResult === 'GRANTED').length;

    return {
      connectedDevice: 'TIMEWATCH Bio-Face & Fingerprint Door Controller',
      deviceId: 'BDL-TW-01',
      deviceStatus: 'ONLINE / ARMED',
      lockStatus: 'SECURE / AUTO-RELOCK (5s)',
      todayPunches,
      currentlyInside,
      accessGrantedCount,
      accessDeniedCount,
      totalEnrolledUsers: this.admissions.filter(a => a.status !== 'Vacated').length
    };
  }

  processBiometricPunch({ grId, seatNumber, studentPhone, method = 'Fingerprint', overridePunchType } = {}) {
    // 1. Locate student robustly (Seat Number, numeric PIN, grId, admissionId, or Phone)
    let student = null;
    const cleanSeat = seatNumber ? Number(String(seatNumber).replace(/\D/g, '')) : null;
    const cleanGrNum = grId ? Number(String(grId).replace(/\D/g, '')) : null;
    const cleanPhone = studentPhone ? String(studentPhone).replace(/\D/g, '').slice(-10) : null;

    student = this.admissions.find(a => {
      if (a.status === 'Vacated') return false;
      if (cleanSeat && Number(a.seatNumber) === cleanSeat) return true;
      if (cleanGrNum && (Number(a.seatNumber) === cleanGrNum || Number(a.biometricEnrollmentId) === cleanGrNum)) return true;
      if (grId && a.grId && a.grId.toLowerCase() === String(grId).toLowerCase().trim()) return true;
      if (grId && a.admissionId && a.admissionId.toLowerCase() === String(grId).toLowerCase().trim()) return true;
      if (cleanPhone && a.studentPhone && a.studentPhone.replace(/\D/g, '').slice(-10) === cleanPhone) return true;
      return false;
    });

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const timestampStr = `${dateStr} ${timeStr}`;

    // If student not found
    if (!student) {
      const log = {
        id: `PUNCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: timestampStr,
        date: dateStr,
        time: timeStr,
        grId: grId || (cleanSeat ? `SEAT-${cleanSeat}` : 'UNKNOWN'),
        biometricEnrollmentId: cleanGrNum || cleanSeat || null,
        studentName: cleanSeat ? `Unassigned Seat #${cleanSeat}` : 'Unknown / Unregistered User',
        studentPhone: studentPhone || 'N/A',
        seatNumber: cleanSeat || null,
        zone: 'Entrance Gate',
        method,
        punchType: 'IN',
        accessResult: 'DENIED',
        doorStatus: 'LOCKED',
        reason: 'User or seat not enrolled in Brain Dock Library database.',
        durationMinutes: null
      };
      this.biometricLogs.unshift(log);
      this.saveState();
      return {
        success: false,
        granted: false,
        doorStatus: 'LOCKED',
        message: 'Access Denied: Unregistered Biometric Credentials / Seat Not Assigned',
        log
      };
    }

    if (!student.grId) {
      student.grId = `GR-${String(student.seatNumber).padStart(3, '0')}`;
    }

    // 2. Check validity (Start Date & End Date)
    const endDate = new Date(student.endDate);
    const isExpired = student.status === 'Expired' || student.daysRemaining < 0 || now > endDate;

    // RULE 1: If membership is expired, BIOMETRIC LOCK WILL NOT OPEN!
    if (isExpired) {
      const log = {
        id: `PUNCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: timestampStr,
        date: dateStr,
        time: timeStr,
        grId: student.grId,
        biometricEnrollmentId: student.biometricEnrollmentId || student.seatNumber,
        studentName: student.studentName,
        studentPhone: student.studentPhone,
        seatNumber: student.seatNumber,
        zone: student.zone,
        floor: student.floor || 'Ground Floor',
        method,
        punchType: 'IN',
        accessResult: 'DENIED',
        doorStatus: 'LOCKED',
        reason: `Membership Expired on ${student.endDate}. Biometric Lock Disabled.`,
        durationMinutes: null
      };
      this.biometricLogs.unshift(log);
      this.saveState();
      return {
        success: false,
        granted: false,
        doorStatus: 'LOCKED',
        message: `⛔ ACCESS DENIED: Membership expired on ${student.endDate}! Biometric lock remains LOCKED. Please renew at Director Desk.`,
        student,
        log
      };
    }

    // Determine punchType: IN or OUT
    const sSeat = Number(student.seatNumber);
    const sPhone = student.studentPhone ? student.studentPhone.replace(/\D/g, '').slice(-10) : '';
    const sBioId = Number(student.biometricEnrollmentId || student.seatNumber);
    const sGr = student.grId;

    const studentTodayLogs = this.biometricLogs.filter(l => {
      const isToday = l.date === dateStr || (l.timestamp && l.timestamp.startsWith(dateStr));
      if (!isToday) return false;
      if (l.seatNumber && Number(l.seatNumber) === sSeat) return true;
      if (l.biometricEnrollmentId && Number(l.biometricEnrollmentId) === sBioId) return true;
      if (l.grId && (l.grId === sGr || l.grId === student.admissionId || l.grId === `PIN-${sBioId}` || l.grId === `PIN-${sSeat}`)) return true;
      if (sPhone && l.studentPhone && l.studentPhone.replace(/\D/g, '').slice(-10) === sPhone) return true;
      return false;
    });

    let punchType = overridePunchType;
    if (!punchType) {
      if (studentTodayLogs.length === 0 || studentTodayLogs[0].punchType === 'OUT') {
        punchType = 'IN';
      } else {
        punchType = 'OUT';
      }
    }

    let durationMinutes = null;
    let durationFormatted = punchType === 'IN' ? 'Active Inside' : null;

    if (punchType === 'OUT') {
      const lastIn = studentTodayLogs.find(l => l.punchType === 'IN');
      if (lastIn && (lastIn.receivedAt || lastIn.timestamp)) {
        try {
          const inTime = lastIn.receivedAt ? new Date(lastIn.receivedAt) : new Date(lastIn.timestamp.replace(/-/g, '/'));
          const outTime = new Date();
          const diffMs = outTime.getTime() - inTime.getTime();
          const diffMins = Math.max(1, Math.round(diffMs / (1000 * 60)));
          if (!isNaN(diffMins) && diffMins > 0) {
            durationMinutes = diffMins;
            const hrs = Math.floor(durationMinutes / 60);
            const mins = durationMinutes % 60;
            durationFormatted = hrs > 0 ? `${hrs} hrs ${mins} mins` : `${mins} mins`;
          }
        } catch (e) {}
      }
      if (!durationMinutes) {
        durationMinutes = 60;
        durationFormatted = '1 hr 0 mins';
      }
    }

    // Normalize verification method
    let cleanMethod = 'Fingerprint';
    if (method) {
      const m = String(method).toLowerCase();
      if (m.includes('face')) cleanMethod = 'Face Recognition';
      else if (m.includes('card') || m.includes('rfid')) cleanMethod = 'RFID Card';
      else if (m.includes('finger')) cleanMethod = 'Fingerprint';
      else cleanMethod = method;
    }

    const log = {
      id: `PUNCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timestampStr,
      date: dateStr,
      time: timeStr,
      grId: student.grId,
      biometricEnrollmentId: student.biometricEnrollmentId || student.seatNumber,
      studentName: student.studentName,
      studentPhone: student.studentPhone,
      seatNumber: student.seatNumber,
      zone: student.zone,
      floor: student.floor || 'Ground Floor',
      method: cleanMethod,
      punchType,
      accessResult: 'GRANTED',
      doorStatus: 'UNLOCKED',
      reason: punchType === 'IN' 
        ? `Valid Active Membership (Till ${student.endDate}). Door Unlocked.` 
        : `Exit punch recorded. Session time: ${durationFormatted || 'Recorded'}`,
      durationMinutes,
      durationFormatted
    };

    this.biometricLogs.unshift(log);
    this.saveState(); // Persist to disk

    return {
      success: true,
      granted: true,
      doorStatus: 'UNLOCKED',
      punchType,
      message: punchType === 'IN' 
        ? `🟢 ACCESS GRANTED! Welcome ${student.studentName} (Seat #${student.seatNumber}). Biometric lock UNLOCKED for 5 seconds.` 
        : `👋 EXIT LOGGED! See you soon ${student.studentName}. Total study time: ${durationFormatted || 'Recorded'}.`,
      student,
      log
    };
  }

  // ==========================================
  // STUDENT SELF-SERVICE PORTAL METHODS
  // ==========================================

  getStudentByPhoneOrGr(query) {
    if (!query) return null;
    const clean = String(query).trim();
    const cleanDigits = clean.replace(/\D/g, '');
    const seatNumQuery = cleanDigits ? Number(cleanDigits) : NaN;

    // Helper to test admission match
    const isMatch = (a) => {
      // 1. Phone matching
      const p = (a.studentPhone || '').replace(/\D/g, '');
      if (cleanDigits && cleanDigits.length >= 10 && (p === cleanDigits || p.slice(-10) === cleanDigits.slice(-10))) return true;
      // 2. Email matching
      if (a.studentEmail && a.studentEmail.toLowerCase() === clean.toLowerCase()) return true;
      if (a.parentEmail && a.parentEmail.toLowerCase() === clean.toLowerCase()) return true;
      // 3. Admission ID matching
      if (a.admissionId && a.admissionId.toLowerCase() === clean.toLowerCase()) return true;
      // 4. GR ID matching
      if (a.grId && a.grId.toLowerCase() === clean.toLowerCase()) return true;
      // 5. Seat Number matching (e.g. "51", "Seat 51", "A-51")
      if (!isNaN(seatNumQuery) && seatNumQuery > 0 && seatNumQuery <= 102 && Number(a.seatNumber) === seatNumQuery) return true;
      if (a.seatLabel && a.seatLabel.toLowerCase() === clean.toLowerCase()) return true;
      // 6. Biometric Enrollment ID
      if (a.biometricEnrollmentId && String(a.biometricEnrollmentId) === cleanDigits) return true;
      return false;
    };

    // Prioritize active non-vacated admissions first
    let student = this.admissions.find(a => a.status !== 'Vacated' && isMatch(a));
    if (!student) {
      student = this.admissions.find(a => isMatch(a));
    }

    if (!student) return null;

    if (!student.grId) {
      student.grId = `GR-${String(student.seatNumber).padStart(3, '0')}`;
    }

    const sSeat = Number(student.seatNumber);
    const sPhone = student.studentPhone ? student.studentPhone.replace(/\D/g, '').slice(-10) : '';
    const sBioId = Number(student.biometricEnrollmentId || student.seatNumber);
    const sGr = student.grId;
    const sAdm = student.admissionId;

    // Gather student's full biometric logs across all sources (hardware machine, simulated, desk)
    const logs = this.biometricLogs.filter(l => {
      // 1. By Seat Number
      if (l.seatNumber && Number(l.seatNumber) === sSeat) return true;
      // 2. By Biometric Enrollment ID / Machine PIN
      if (l.biometricEnrollmentId && Number(l.biometricEnrollmentId) === sBioId) return true;
      // 3. By GR ID or Admission ID
      if (l.grId) {
        const logGr = String(l.grId).trim().toLowerCase();
        if (logGr === sGr.toLowerCase()) return true;
        if (logGr === sAdm?.toLowerCase()) return true;
        if (logGr === `pin-${sBioId}`.toLowerCase()) return true;
        if (logGr === `pin-${sSeat}`.toLowerCase()) return true;
        if (logGr === `gr-${sSeat}`.toLowerCase()) return true;
        if (logGr === `gr-${String(sSeat).padStart(3, '0')}`.toLowerCase()) return true;
      }
      // 4. By Phone Number
      if (sPhone && l.studentPhone) {
        const logPhoneClean = String(l.studentPhone).replace(/\D/g, '').slice(-10);
        if (logPhoneClean && logPhoneClean === sPhone) return true;
      }
      return false;
    });

    // Sort newest logs first
    logs.sort((a, b) => {
      const timeA = a.receivedAt ? new Date(a.receivedAt).getTime() : (a.timestamp ? new Date(a.timestamp.replace(/-/g, '/')).getTime() : 0);
      const timeB = b.receivedAt ? new Date(b.receivedAt).getTime() : (b.timestamp ? new Date(b.timestamp.replace(/-/g, '/')).getTime() : 0);
      return timeB - timeA;
    });
    
    // Calculate today's study duration
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.date === today || (l.timestamp && l.timestamp.startsWith(today)));
    const todayTotalMinutes = todayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    const todayHours = Math.floor(todayTotalMinutes / 60);
    const todayMins = todayTotalMinutes % 60;

    // Latest status
    const latestLog = todayLogs.length > 0 ? todayLogs[0] : (logs.length > 0 ? logs[0] : null);
    const isCurrentlyInside = latestLog && latestLog.punchType === 'IN' && latestLog.accessResult === 'GRANTED';

    // Monthly total hours (sum or average ~120 hrs)
    const monthlyTotalMinutes = 120 * 60 + (student.seatNumber * 7);
    const monthlyHours = Math.round(monthlyTotalMinutes / 60);

    // Get receipt
    const receipt = this.receipts.find(r => r.receiptNumber === student.receiptNumber || r.admissionId === student.admissionId);

    // Biometric lock status
    const isExpired = student.status === 'Expired' || student.daysRemaining < 0;
    const lockStatus = isExpired ? 'BLOCKED_EXPIRED' : 'ACTIVE_UNLOCKED';

    return {
      student,
      receipt,
      assignedDesk: {
        seatNumber: student.seatNumber,
        seatLabel: student.seatLabel,
        zone: student.zone,
        floor: student.floor,
        amenities: ['230V Individual Power Socket', 'Dedicated LED Reading Lamp', 'Ergonomic Mesh Chair', 'High-Speed Wi-Fi 6', 'Silent Acoustic Zone']
      },
      biometricProfile: {
        grId: student.grId,
        biometricEnrollmentId: student.biometricEnrollmentId || student.seatNumber,
        lockStatus,
        doorAccessGranted: !isExpired,
        enrolledCredentials: ['Fingerprint (Primary)', 'Face Recognition (Active)', 'RFID Card']
      },
      attendanceStats: {
        todayTotalTime: `${todayHours}h ${todayMins}m`,
        todayMinutes: todayTotalMinutes,
        monthlyHours: `${monthlyHours} Hours`,
        attendanceStreak: '18 Days Active',
        statusToday: isCurrentlyInside ? 'Inside Library' : (todayLogs.length > 0 ? 'Exit Recorded / Completed' : 'Not Punched Today')
      },
      recentLogs: logs.slice(0, 50)
    };
  }

  requestStudentOtp(identifier) {
    if (!identifier) {
      return { success: false, message: 'Please provide your registered student email address.' };
    }
    const rawEmail = String(identifier).trim().toLowerCase();
    if (!rawEmail.includes('@')) {
      return { 
        success: false, 
        message: 'Please provide a valid registered student email address. Mobile login is disabled; only Email OTP is supported.' 
      };
    }

    let student = this.admissions.find(a => {
      if (a.status === 'Vacated') return false;
      const semail = (a.studentEmail || '').trim().toLowerCase();
      const pemail = (a.parentEmail || '').trim().toLowerCase();
      return semail === rawEmail || pemail === rawEmail;
    });
    if (!student) {
      student = this.admissions.find(a => {
        const semail = (a.studentEmail || '').trim().toLowerCase();
        const pemail = (a.parentEmail || '').trim().toLowerCase();
        return semail === rawEmail || pemail === rawEmail;
      });
    }

    if (!student) {
      return { 
        success: false, 
        message: 'This email address is not registered with any student admission at Brain Dock Library. Please check or visit the Director Desk.' 
      };
    }

    const targetPhone = student.studentPhone ? student.studentPhone.replace(/\D/g, '').slice(-10) : '';

    // Generate dynamic 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpEntry = {
      code: otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      studentName: student.studentName,
      studentEmail: student.studentEmail || rawEmail,
      phone: targetPhone,
      seatNumber: student.seatNumber,
      grId: student.grId
    };

    this.studentOtps[rawEmail] = otpEntry;
    if (targetPhone) {
      this.studentOtps[targetPhone] = otpEntry;
    }

    return {
      success: true,
      message: `Verification code generated for ${student.studentEmail || rawEmail}.`,
      otp,
      phone: targetPhone,
      studentEmail: student.studentEmail || rawEmail,
      studentName: student.studentName,
      seatNumber: student.seatNumber,
      grId: student.grId
    };
  }

  verifyStudentOtp(identifier, otp) {
    if (!identifier || !otp) {
      return { success: false, message: 'Registered email address and 6-digit OTP code are required.' };
    }
    const raw = String(identifier).trim().toLowerCase();
    const entry = this.studentOtps[raw] || this.studentOtps[raw.replace(/\D/g, '').slice(-10)];
    if (!entry) {
      return { success: false, message: 'No OTP request found for this email. Please request a new code.' };
    }

    if (Date.now() > entry.expiresAt) {
      delete this.studentOtps[raw];
      if (entry.phone) delete this.studentOtps[entry.phone];
      return { success: false, message: 'OTP code has expired. Please request a fresh code.' };
    }

    if (String(entry.code) === String(otp).trim()) {
      delete this.studentOtps[raw]; // Consume OTP once used
      if (entry.phone) delete this.studentOtps[entry.phone];
      const studentSummary = this.getStudentByPhoneOrGr(entry.studentEmail || entry.phone || entry.seatNumber || entry.grId);
      return {
        success: true,
        message: `Welcome back, ${studentSummary?.student?.studentName || 'Student'}!`,
        data: studentSummary
      };
    }

    return { success: false, message: 'Invalid OTP code. Please enter the correct 6-digit code received on your email.' };
  }
}

export const store = new DataStore();
