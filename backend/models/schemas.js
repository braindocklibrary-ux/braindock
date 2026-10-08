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

// Admission Schema (102-Desk Operations)
const AdmissionSchema = new mongoose.Schema({
  admissionId: { type: String, required: true, unique: true },
  receiptNumber: { type: String },
  grId: { type: String },
  seatNumber: { type: Number, required: true },
  biometricEnrollmentId: { type: Number },
  seatLabel: { type: String },
  zone: { type: String },
  floor: { type: String },
  studentName: { type: String, required: true },
  parentsName: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, default: 'Male' },
  studentPhone: { type: String, required: true },
  whatsAppNumber: { type: String, default: '' },
  studentEmail: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: 'Amreli' },
  pinCode: { type: String, default: '365601' },
  qualification: { type: String, default: '' },
  institution: { type: String, default: '' },
  course: { type: String, default: '' },
  yearSemester: { type: String, default: '' },
  occupation: { type: String, default: 'Self Study / General Reading' },
  targetExam: { type: String, default: 'Self Study / General Reading' },
  membershipType: { type: String, default: 'Monthly' },
  shift: { type: String, default: 'Full Day (24x7)' },
  plan: { type: String, default: '1 Month(s)' },
  startDate: { type: String },
  endDate: { type: String },
  daysRemaining: { type: Number, default: 30 },
  lockerNumber: { type: String, default: '' },
  emergencyName: { type: String, default: '' },
  emergencyRelation: { type: String, default: 'Parent' },
  emergencyPhone: { type: String, default: '' },
  guardianPhone: { type: String, default: '' },
  idProofType: { type: String, default: 'Aadhaar Card' },
  idProofNo: { type: String, default: '' },
  aadhaarNo: { type: String, default: '' },
  photoAttached: { type: Boolean, default: false },
  studentPhoto: { type: String, default: '' },
  feeItems: [{ description: String, amount: Number }],
  totalFee: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  pendingFee: { type: Number, default: 0 },
  feeDueDate: { type: String, default: null },
  feeStatus: { type: String, default: 'Paid' },
  paymentMode: { type: String, default: 'Cash' },
  transactionRef: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  createdAt: { type: String }
}, { strict: false, timestamps: true });

// Receipt Schema
const ReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  admissionId: { type: String },
  studentName: { type: String, required: true },
  studentPhone: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  date: { type: String },
  totalFee: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  pendingDue: { type: Number, default: 0 },
  paymentMode: { type: String, default: 'Cash' },
  transactionRef: { type: String, default: '' },
  feeItems: [{ description: String, amount: Number }]
}, { strict: false, timestamps: true });

// Owner Seat Schema
const OwnerSeatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true, unique: true },
  seatLabel: { type: String },
  zone: { type: String },
  floor: { type: String },
  hasSocket: { type: Boolean, default: true },
  hasLamp: { type: Boolean, default: true },
  hasErgonomicChair: { type: Boolean, default: true },
  status: { type: String, default: 'Available' },
  occupant: { type: mongoose.Schema.Types.Mixed, default: null }
}, { strict: false, timestamps: true });

// Biometric Log Schema
const BiometricLogSchema = new mongoose.Schema({
  logId: { type: String },
  seatNumber: { type: Number },
  biometricEnrollmentId: { type: Number },
  studentName: { type: String },
  studentPhone: { type: String },
  grId: { type: String },
  timestamp: { type: String },
  method: { type: String, default: 'Fingerprint' },
  granted: { type: Boolean, default: true },
  message: { type: String }
}, { strict: false, timestamps: true });

// Homepage Content Schema
const HomepageContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // 'stats' or 'features'
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

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
export const Admission = mongoose.model('Admission', AdmissionSchema);
export const Receipt = mongoose.model('Receipt', ReceiptSchema);
export const OwnerSeat = mongoose.model('OwnerSeat', OwnerSeatSchema);
export const BiometricLog = mongoose.model('BiometricLog', BiometricLogSchema);
export const HomepageContent = mongoose.model('HomepageContent', HomepageContentSchema);

