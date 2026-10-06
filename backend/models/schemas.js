import mongoose from 'mongoose';

// User Schema (Members & Staff)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Admin', 'Librarian', 'Staff', 'Accountant', 'Content Manager', 'Member'], 
    default: 'Member' 
  },
  memberId: { type: String, unique: true },
  avatar: { type: String, default: '' },
  membershipPlan: { type: String, default: 'Standard' },
  membershipStatus: { type: String, enum: ['Active', 'Expired', 'Pending', 'Suspended'], default: 'Active' },
  membershipValidUntil: { type: Date, default: () => new Date(Date.now() + 365*24*60*60*1000) },
  address: { type: String, default: '' },
  gender: { type: String, default: 'Not Specified' },
  dob: { type: String, default: '' },
  finesDue: { type: Number, default: 0 },
  qrCode: { type: String, default: '' },
  readingHistory: [{
    bookTitle: String,
    author: String,
    date: Date,
    rating: Number
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Book Schema
const BookSchema = new mongoose.Schema({
  bookId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  publisher: { type: String, default: 'Brain Dock Press' },
  publicationYear: { type: Number, default: 2024 },
  category: { type: String, required: true },
  language: { type: String, default: 'English' },
  description: { type: String, required: true },
  coverImage: { type: String, default: '' },
  shelf: { type: String, default: 'A-1' },
  rack: { type: String, default: 'R-04' },
  totalCopies: { type: Number, default: 5 },
  availableCopies: { type: Number, default: 5 },
  status: { type: String, enum: ['Available', 'Issued', 'Reserved', 'Lost', 'Damaged', 'Maintenance'], default: 'Available' },
  isNewArrival: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 12 },
  tags: [String],
  pdfUrl: { type: String, default: '' } // digital resource
}, { timestamps: true });

// Book Issue & Return Schema
const BookIssueSchema = new mongoose.Schema({
  issueId: { type: String, required: true, unique: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  bookTitle: { type: String, required: true },
  bookCover: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  memberId: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['Issued', 'Returned', 'Overdue', 'Lost', 'Damaged'], default: 'Issued' },
  renewalsCount: { type: Number, default: 0 },
  maxRenewals: { type: Number, default: 2 },
  fineAmount: { type: Number, default: 0 },
  finePaid: { type: Boolean, default: false },
  issuedBy: { type: String, default: 'Librarian Desk' }
}, { timestamps: true });

// Book Reservation Schema
const ReservationSchema = new mongoose.Schema({
  reservationId: { type: String, required: true, unique: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  bookTitle: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  memberId: { type: String, required: true },
  reservationDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Available', 'Fulfilled', 'Cancelled'], default: 'Pending' },
  queuePosition: { type: Number, default: 1 }
}, { timestamps: true });

// Membership Plan Schema
const MembershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  price: { type: Number, required: true },
  billingCycle: { type: String, default: 'Yearly' },
  durationDays: { type: Number, default: 365 },
  bookIssueLimit: { type: Number, default: 3 },
  renewalLimit: { type: Number, default: 2 },
  digitalAccess: { type: Boolean, default: true },
  studyRoomAccess: { type: Boolean, default: false },
  studyRoomHoursMonth: { type: Number, default: 0 },
  lockerAccess: { type: Boolean, default: false },
  highSpeedWifi: { type: Boolean, default: true },
  description: { type: String, default: '' },
  badge: { type: String, default: 'Popular' },
  benefits: [String]
}, { timestamps: true });

// Study Room Schema
const StudyRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['Silent Pod', 'Discussion Room', 'Research Suite', 'Executive Pod'], default: 'Discussion Room' },
  amenities: [String], // e.g. 'Smart Board', 'Ultra-Quiet AC', 'Hi-Fi Audio', 'Power Pods', 'Ergonomic Mesh Chairs'
  floor: { type: String, default: '2nd Floor - Innovation Wing' },
  hourlyRate: { type: Number, default: 0 }, // 0 for complimentary quota
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
  image: { type: String, default: '' }
}, { timestamps: true });

// Room Booking Schema
const RoomBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyRoom' },
  roomName: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  memberId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true }, // e.g., '10:00 AM - 12:00 PM'
  purpose: { type: String, default: 'Individual Deep Study' },
  status: { type: String, enum: ['Confirmed', 'In-Use', 'Completed', 'Cancelled'], default: 'Confirmed' }
}, { timestamps: true });

// Seat Schema
const SeatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true, unique: true }, // e.g., 'A-01'
  zone: { type: String, enum: ['Silent Reading Zone', 'Digital Research Commons', 'Natural Light Vista', 'Focus Cubicle'], default: 'Silent Reading Zone' },
  hasChargingPort: { type: Boolean, default: true },
  hasDeskLamp: { type: Boolean, default: true },
  floor: { type: String, default: '1st Floor' },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], default: 'Available' },
  currentOccupant: { type: String, default: null }
}, { timestamps: true });

// Seat Booking Schema
const SeatBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  seatNumber: { type: String, required: true },
  zone: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  memberId: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true }, // Morning / Afternoon / Evening / Full Day
  status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' }
}, { timestamps: true });

// Locker Schema
const LockerSchema = new mongoose.Schema({
  lockerNumber: { type: String, required: true, unique: true },
  size: { type: String, enum: ['Standard', 'Large', 'Luggage Size'], default: 'Standard' },
  floor: { type: String, default: 'Ground Floor Locker Bay' },
  status: { type: String, enum: ['Available', 'Allocated', 'Maintenance'], default: 'Available' },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedUserName: { type: String, default: '' },
  assignedMemberId: { type: String, default: '' },
  startDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  pinCode: { type: String, default: '' }
}, { timestamps: true });

// Event Schema
const EventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Workshop', 'Author Talk', 'Book Club', 'Coding Bootcamp', 'Research Seminar', 'Exhibition'], default: 'Workshop' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, default: 'Brain Dock Main Auditorium & Online Stream' },
  speaker: { type: String, required: true },
  speakerBio: { type: String, default: '' },
  description: { type: String, required: true },
  coverImage: { type: String, default: '' },
  totalSeats: { type: Number, default: 50 },
  registeredSeats: { type: Number, default: 0 },
  fee: { type: Number, default: 0 },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], default: 'Upcoming' }
}, { timestamps: true });

// Event Registration Schema
const EventRegistrationSchema = new mongoose.Schema({
  registrationId: { type: String, required: true, unique: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  eventTitle: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  ticketCode: { type: String, required: true },
  status: { type: String, default: 'Confirmed' }
}, { timestamps: true });

// Announcement Schema
const AnnouncementSchema = new mongoose.Schema({
  announcementId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['General', 'Holiday', 'New Acquisition', 'Maintenance', 'Urgent Notice', 'Event Alert'], default: 'General' },
  content: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
  publishedBy: { type: String, default: 'Library Administration' },
  isPinned: { type: Boolean, default: false },
  validUntil: { type: Date }
}, { timestamps: true });

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  memberId: { type: String, default: '' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['book_issued', 'book_returned', 'due_reminder', 'overdue', 'fine', 'reservation', 'room_booking', 'seat_booking', 'announcement', 'general'], 
    default: 'general' 
  },
  link: { type: String, default: '/dashboard' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Payment Schema
const PaymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  invoiceNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  memberId: { type: String, required: true },
  purpose: { type: String, enum: ['Membership Fee', 'Late Fine', 'Locker Rental', 'Study Room Fee', 'Lost Book Replacement', 'Donation'], default: 'Membership Fee' },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Credit/Debit Card', 'Net Banking', 'Cash at Desk', 'Wallet'], default: 'UPI' },
  status: { type: String, enum: ['Success', 'Pending', 'Failed', 'Refunded'], default: 'Success' },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String, default: '' }
}, { timestamps: true });

// Contact Message Schema
const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['New', 'In-Progress', 'Replied', 'Archived'], default: 'New' },
  replyNotes: { type: String, default: '' }
}, { timestamps: true });

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Book = mongoose.model('Book', BookSchema);
export const BookIssue = mongoose.model('BookIssue', BookIssueSchema);
export const Reservation = mongoose.model('Reservation', ReservationSchema);
export const MembershipPlan = mongoose.model('MembershipPlan', MembershipPlanSchema);
export const StudyRoom = mongoose.model('StudyRoom', StudyRoomSchema);
export const RoomBooking = mongoose.model('RoomBooking', RoomBookingSchema);
export const Seat = mongoose.model('Seat', SeatSchema);
export const SeatBooking = mongoose.model('SeatBooking', SeatBookingSchema);
export const Locker = mongoose.model('Locker', LockerSchema);
export const Event = mongoose.model('Event', EventSchema);
export const EventRegistration = mongoose.model('EventRegistration', EventRegistrationSchema);
export const Announcement = mongoose.model('Announcement', AnnouncementSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const Payment = mongoose.model('Payment', PaymentSchema);
export const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
