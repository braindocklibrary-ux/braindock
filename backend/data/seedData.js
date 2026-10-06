export const seedUsers = [
  {
    name: 'Dr. Keval Patel (Director)',
    email: 'admin@braindock.com',
    password: 'admin123',
    phone: '+91 98765 43210',
    role: 'Super Admin',
    memberId: 'BDL-DIR-001',
    membershipPlan: 'Institutional VIP',
    membershipStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    finesDue: 0,
    address: 'Brain Dock HQ, Silicon Corridor, Gujarat',
    gender: 'Male'
  },
  {
    name: 'Ananya Sharma',
    email: 'librarian@braindock.com',
    password: 'librarian123',
    phone: '+91 98765 11223',
    role: 'Librarian',
    memberId: 'BDL-LIB-102',
    membershipPlan: 'Staff Privilege',
    membershipStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    finesDue: 0,
    address: 'Staff Quarters, Brain Dock Campus',
    gender: 'Female'
  },
  {
    name: 'Rajesh Varma',
    email: 'staff@braindock.com',
    password: 'staff123',
    phone: '+91 98765 22334',
    role: 'Staff',
    memberId: 'BDL-STF-205',
    membershipPlan: 'Staff Standard',
    membershipStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    finesDue: 0
  },
  {
    name: 'Kavita Mehta',
    email: 'finance@braindock.com',
    password: 'finance123',
    phone: '+91 98765 33445',
    role: 'Accountant',
    memberId: 'BDL-ACC-304',
    membershipPlan: 'Staff Standard',
    membershipStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    finesDue: 0
  },
  {
    name: 'Aarav Mehta',
    email: 'member@braindock.com',
    password: 'member123',
    phone: '+91 91234 56789',
    role: 'Member',
    memberId: 'BDL-MEM-8842',
    membershipPlan: 'Premium Scholar',
    membershipStatus: 'Active',
    membershipValidUntil: new Date('2027-09-30'),
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    finesDue: 0,
    address: '402, Lotus Orchid, Ahmedabad, Gujarat',
    gender: 'Male',
    readingHistory: [
      { bookTitle: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', date: new Date('2026-08-15'), rating: 5 },
      { bookTitle: 'Deep Work: Rules for Focused Success', author: 'Cal Newport', date: new Date('2026-07-20'), rating: 5 }
    ]
  },
  {
    name: 'Sneha Roy',
    email: 'sneha@braindock.com',
    password: 'member123',
    phone: '+91 94567 89012',
    role: 'Member',
    memberId: 'BDL-MEM-9921',
    membershipPlan: 'Standard Explorer',
    membershipStatus: 'Active',
    membershipValidUntil: new Date('2027-06-15'),
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    finesDue: 50,
    address: 'B-14, Green Crest Heights, Vadodara',
    gender: 'Female'
  }
];

export const seedBooks = [
  {
    bookId: 'BDL-BK-001',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    publisher: "O'Reilly Media",
    publicationYear: 2023,
    category: 'Computer Science & AI',
    language: 'English',
    description: 'The definitive handbook on the principles and practical architecture for building fast, reliable, scalable, and maintainable software systems and modern distributed data storage.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    shelf: 'CS-Shelf 3',
    rack: 'Rack 12-B',
    totalCopies: 6,
    availableCopies: 4,
    status: 'Available',
    isNewArrival: false,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 148,
    tags: ['Architecture', 'Distributed Systems', 'Databases', 'Cloud']
  },
  {
    bookId: 'BDL-BK-002',
    title: 'Deep Learning & Neural Networks Foundations',
    author: 'Ian Goodfellow & Yoshua Bengio',
    isbn: '978-0262035613',
    publisher: 'MIT Press',
    publicationYear: 2024,
    category: 'Artificial Intelligence',
    language: 'English',
    description: 'An expansive modern text on mathematics, linear algebra, deep learning architectures, convolutional networks, transformers, and generative modeling.',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
    shelf: 'AI-Shelf 1',
    rack: 'Rack 04-A',
    totalCopies: 5,
    availableCopies: 3,
    status: 'Available',
    isNewArrival: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 92,
    tags: ['AI', 'Deep Learning', 'PyTorch', 'Math']
  },
  {
    bookId: 'BDL-BK-003',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    publicationYear: 2022,
    category: 'Software Engineering',
    language: 'English',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Master formatting, refactoring, and test-driven craftsmanship.',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
    shelf: 'CS-Shelf 1',
    rack: 'Rack 02-C',
    totalCopies: 8,
    availableCopies: 6,
    status: 'Available',
    isNewArrival: false,
    isPopular: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 210,
    tags: ['Clean Code', 'Best Practices', 'Refactoring']
  },
  {
    bookId: 'BDL-BK-004',
    title: 'Atomic Habits: Tiny Changes, Remarkable Results',
    author: 'James Clear',
    isbn: '978-0735211292',
    publisher: 'Avery Publishing',
    publicationYear: 2023,
    category: 'Self Development & Psychology',
    language: 'English',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day through cues, cravings, responses, and rewards.',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
    shelf: 'Self-Shelf 2',
    rack: 'Rack 08-D',
    totalCopies: 10,
    availableCopies: 7,
    status: 'Available',
    isNewArrival: false,
    isPopular: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 340,
    tags: ['Productivity', 'Habits', 'Mindset']
  },
  {
    bookId: 'BDL-BK-005',
    title: 'Quantum Computing: An Applied Approach',
    author: 'Jack D. Hidary',
    isbn: '978-3030832735',
    publisher: 'Springer Nature',
    publicationYear: 2024,
    category: 'Physics & Quantum Tech',
    language: 'English',
    description: 'Comprehensive bridging of quantum mechanics theory and quantum circuits with hands-on code examples in Qiskit and Cirq.',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    shelf: 'Physics-1',
    rack: 'Rack 15-A',
    totalCopies: 4,
    availableCopies: 2,
    status: 'Available',
    isNewArrival: true,
    isPopular: false,
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 34,
    tags: ['Quantum', 'Qubits', 'Hardware']
  },
  {
    bookId: 'BDL-BK-006',
    title: 'Zero to One: Notes on Startups, or How to Build the Future',
    author: 'Peter Thiel & Blake Masters',
    isbn: '978-0804139298',
    publisher: 'Crown Business',
    publicationYear: 2022,
    category: 'Business & Entrepreneurship',
    language: 'English',
    description: 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create. Learn the art of vertical progress.',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    shelf: 'Biz-Shelf 4',
    rack: 'Rack 05-B',
    totalCopies: 6,
    availableCopies: 5,
    status: 'Available',
    isNewArrival: false,
    isPopular: true,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 185,
    tags: ['Startups', 'Strategy', 'Monopoly']
  },
  {
    bookId: 'BDL-BK-007',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    isbn: '978-0857197689',
    publisher: 'Harriman House',
    publicationYear: 2023,
    category: 'Economics & Finance',
    language: 'English',
    description: 'Timeless lessons on wealth, greed, and happiness doing well with money isn\'t necessarily about what you know. It\'s about how you behave.',
    coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&auto=format&fit=crop&q=80',
    shelf: 'Econ-Shelf 2',
    rack: 'Rack 07-A',
    totalCopies: 7,
    availableCopies: 4,
    status: 'Available',
    isNewArrival: false,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 220,
    tags: ['Finance', 'Psychology', 'Wealth']
  },
  {
    bookId: 'BDL-BK-008',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    publisher: 'HarperCollins',
    publicationYear: 2021,
    category: 'History & Anthropology',
    language: 'English',
    description: 'From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution that explores the cognitive, agricultural, and scientific revolutions.',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    shelf: 'Hist-Shelf 1',
    rack: 'Rack 01-B',
    totalCopies: 5,
    availableCopies: 3,
    status: 'Available',
    isNewArrival: false,
    isPopular: true,
    isFeatured: false,
    rating: 4.9,
    reviewsCount: 410,
    tags: ['Evolution', 'Civilization', 'History']
  },
  {
    bookId: 'BDL-BK-009',
    title: 'Neuroscience: Exploring the Human Brain',
    author: 'Mark F. Bear & Michael A. Paradiso',
    isbn: '978-0781778176',
    publisher: 'Wolters Kluwer',
    publicationYear: 2024,
    category: 'Medical & Neuroscience',
    language: 'English',
    description: 'Acclaimed for its clear, friendly style and exceptional illustrations that make the brain\'s complex mechanisms accessible to curious minds and researchers.',
    coverImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&auto=format&fit=crop&q=80',
    shelf: 'Med-Shelf 3',
    rack: 'Rack 18-C',
    totalCopies: 3,
    availableCopies: 2,
    status: 'Available',
    isNewArrival: true,
    isPopular: false,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 56,
    tags: ['Neuroscience', 'Cognitive', 'Brain']
  },
  {
    bookId: 'BDL-BK-010',
    title: 'Refactoring UI & Design Systems',
    author: 'Adam Wathan & Steve Schoger',
    isbn: '978-1734567890',
    publisher: 'Tailwind Labs',
    publicationYear: 2023,
    category: 'UI/UX & Product Design',
    language: 'English',
    description: 'Practical design advice for developers without artistic training. Learn hierarchy, layout spacing, color theory, and micro-interactions.',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    shelf: 'Design-1',
    rack: 'Rack 06-D',
    totalCopies: 5,
    availableCopies: 5,
    status: 'Available',
    isNewArrival: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 165,
    tags: ['Design', 'UI', 'UX', 'Tailwind']
  }
];

export const seedMembershipPlans = [
  {
    name: 'Basic Student',
    code: 'PLAN-BASIC',
    price: 499,
    billingCycle: 'Monthly',
    durationDays: 30,
    bookIssueLimit: 2,
    renewalLimit: 1,
    digitalAccess: true,
    studyRoomAccess: false,
    studyRoomHoursMonth: 0,
    lockerAccess: false,
    highSpeedWifi: true,
    description: 'Perfect for students and occasional readers who need standard reading hall access and basic issue privileges.',
    badge: 'Starter',
    benefits: [
      'Issue up to 2 books at a time',
      '14-day loan period with 1 renewal',
      'Access to Main Reading Hall (8 AM - 10 PM)',
      '1 Gbps High-Speed Optical Wi-Fi',
      'Digital OPAC search & reservation'
    ]
  },
  {
    name: 'Standard Scholar',
    code: 'PLAN-SCHOLAR',
    price: 1299,
    billingCycle: 'Quarterly',
    durationDays: 90,
    bookIssueLimit: 4,
    renewalLimit: 2,
    digitalAccess: true,
    studyRoomAccess: true,
    studyRoomHoursMonth: 10,
    lockerAccess: false,
    highSpeedWifi: true,
    description: 'Designed for competitive exam aspirants, university students, and serious researchers who need extended hours.',
    badge: 'Most Popular',
    benefits: [
      'Issue up to 4 books simultaneously',
      '21-day loan period with 2 renewals',
      '10 Hours / month Soundproof Study Room access',
      'Silent Reading Zone priority reservation',
      'Full Digital Library & IEEE / JSTOR repository access',
      'Personal power socket & ergonomic mesh seating'
    ]
  },
  {
    name: 'Premium Executive',
    code: 'PLAN-EXEC',
    price: 3999,
    billingCycle: 'Yearly',
    durationDays: 365,
    bookIssueLimit: 8,
    renewalLimit: 4,
    digitalAccess: true,
    studyRoomAccess: true,
    studyRoomHoursMonth: 30,
    lockerAccess: true,
    highSpeedWifi: true,
    description: 'The ultimate sanctuary for professionals, writers, PhD candidates, and lifelong learners seeking luxury quietude.',
    badge: 'Premium Tier',
    benefits: [
      'Issue up to 8 books with 30-day loans',
      'Unlimited renewals (subject to reservations)',
      'Dedicated personal digital locker with RFID lock',
      '30 Hours / month Executive Study Pod booking',
      '24/7 Access card & premium refreshments bar',
      'Complimentary priority booking for all workshops'
    ]
  },
  {
    name: 'Institutional VIP',
    code: 'PLAN-VIP',
    price: 8999,
    billingCycle: 'Yearly',
    durationDays: 365,
    bookIssueLimit: 15,
    renewalLimit: 6,
    digitalAccess: true,
    studyRoomAccess: true,
    studyRoomHoursMonth: 60,
    lockerAccess: true,
    highSpeedWifi: true,
    description: 'VIP corporate & academia membership with private boardroom bookings, research concierge, and group access.',
    badge: 'Enterprise',
    benefits: [
      '15 simultaneous book loans & home delivery',
      'Private 8-person conference room booking',
      'Personal research librarian assistance',
      'Dual master digital lockers',
      'All Brain Dock summits, hackathons & events VIP access'
    ]
  }
];

export const seedStudyRooms = [
  {
    roomId: 'SR-101',
    name: 'Turing Neural Pod',
    capacity: 2,
    type: 'Silent Pod',
    amenities: ['Ultra-Quiet Soundproofing (45dB)', 'Dual 4K USB-C Monitors', 'Ergonomic Steelcase Chairs', 'Independent Climate Control'],
    floor: '2nd Floor - Innovation Wing',
    hourlyRate: 0,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80'
  },
  {
    roomId: 'SR-102',
    name: 'Ada Lovelace Brainstorm Suite',
    capacity: 6,
    type: 'Discussion Room',
    amenities: ['75" Interactive Touch Screen', 'Glass Whiteboard Wall', 'Acoustic Wall Panels', 'Conference Camera & Mic Array'],
    floor: '2nd Floor - Collab Zone',
    hourlyRate: 0,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80'
  },
  {
    roomId: 'SR-103',
    name: 'Feynman Quantum Research Studio',
    capacity: 4,
    type: 'Research Suite',
    amenities: ['Dual Reference Desks', 'Reference Archive Access', 'Natural Sunlit Vista', 'Wireless Fast Charging'],
    floor: '3rd Floor - Deep Focus Wing',
    hourlyRate: 0,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80'
  },
  {
    roomId: 'SR-104',
    name: 'Hypatia Executive Sanctuary',
    capacity: 8,
    type: 'Executive Pod',
    amenities: ['Boardroom Setup', 'Espresso Lounge Access', 'Motorized Standing Desks', 'Private Restroom Access'],
    floor: '3rd Floor - Executive Loft',
    hourlyRate: 150,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=80'
  }
];

export const seedSeats = [
  // Zone A - Silent Reading Zone
  { seatNumber: 'A-01', zone: 'Silent Reading Zone', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Available' },
  { seatNumber: 'A-02', zone: 'Silent Reading Zone', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Occupied', currentOccupant: 'Sneha Roy' },
  { seatNumber: 'A-03', zone: 'Silent Reading Zone', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Available' },
  { seatNumber: 'A-04', zone: 'Silent Reading Zone', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Reserved' },
  { seatNumber: 'A-05', zone: 'Silent Reading Zone', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Available' },
  { seatNumber: 'A-06', zone: 'Silent Reading Zone', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Available' },
  
  // Zone B - Digital Research Commons
  { seatNumber: 'B-01', zone: 'Digital Research Commons', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Available' },
  { seatNumber: 'B-02', zone: 'Digital Research Commons', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Available' },
  { seatNumber: 'B-03', zone: 'Digital Research Commons', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Occupied', currentOccupant: 'Rajesh S.' },
  { seatNumber: 'B-04', zone: 'Digital Research Commons', hasChargingPort: true, hasDeskLamp: true, floor: '1st Floor', status: 'Available' },

  // Zone C - Natural Light Vista
  { seatNumber: 'C-01', zone: 'Natural Light Vista', hasChargingPort: true, hasDeskLamp: true, floor: '2nd Floor', status: 'Available' },
  { seatNumber: 'C-02', zone: 'Natural Light Vista', hasChargingPort: true, hasDeskLamp: true, floor: '2nd Floor', status: 'Available' },
  { seatNumber: 'C-03', zone: 'Natural Light Vista', hasChargingPort: true, hasDeskLamp: true, floor: '2nd Floor', status: 'Maintenance' },
  { seatNumber: 'C-04', zone: 'Natural Light Vista', hasChargingPort: true, hasDeskLamp: true, floor: '2nd Floor', status: 'Available' },

  // Zone D - Focus Cubicle
  { seatNumber: 'D-01', zone: 'Focus Cubicle', hasChargingPort: true, hasDeskLamp: true, floor: '2nd Floor', status: 'Available' },
  { seatNumber: 'D-02', zone: 'Focus Cubicle', hasChargingPort: true, hasDeskLamp: true, floor: '2nd Floor', status: 'Occupied' },
  { seatNumber: 'D-03', zone: 'Focus Cubicle', hasChargingPort: true, hasDeskLamp: true, floor: '2nd Floor', status: 'Available' },
  { seatNumber: 'D-04', zone: 'Focus Cubicle', hasChargingPort: true, hasDeskLamp: true, floor: '2nd Floor', status: 'Available' }
];

export const seedLockers = [
  { lockerNumber: 'LCK-101', size: 'Standard', floor: 'Ground Floor Bay A', status: 'Allocated', assignedUserName: 'Aarav Mehta', assignedMemberId: 'BDL-MEM-8842', pinCode: '4921' },
  { lockerNumber: 'LCK-102', size: 'Standard', floor: 'Ground Floor Bay A', status: 'Available' },
  { lockerNumber: 'LCK-103', size: 'Large', floor: 'Ground Floor Bay A', status: 'Available' },
  { lockerNumber: 'LCK-104', size: 'Standard', floor: 'Ground Floor Bay B', status: 'Maintenance' },
  { lockerNumber: 'LCK-105', size: 'Large', floor: 'Ground Floor Bay B', status: 'Available' },
  { lockerNumber: 'LCK-106', size: 'Standard', floor: 'Ground Floor Bay B', status: 'Available' }
];

export const seedEvents = [
  {
    eventId: 'EVT-2026-01',
    title: 'Future of Generative AI: From Transformers to Autonomous Agents',
    category: 'Workshop',
    date: '2026-10-10',
    time: '04:00 PM - 06:30 PM',
    location: 'Brain Dock Main Auditorium & Live Webinar',
    speaker: 'Dr. Keval Patel',
    speakerBio: 'Lead AI Scientist & Founding Director of Brain Dock Intelligent Systems',
    description: 'An intensive, code-first masterclass diving into deep attention mechanisms, multimodal agents, and deploying high-performance inference pipelines.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    totalSeats: 80,
    registeredSeats: 58,
    fee: 0,
    status: 'Upcoming'
  },
  {
    eventId: 'EVT-2026-02',
    title: 'Book Discussion: The Psychology of Modern Wealth & Happiness',
    category: 'Book Club',
    date: '2026-10-18',
    time: '05:00 PM - 07:00 PM',
    location: 'Café & Terrace Reading Zone, Brain Dock',
    speaker: 'Ananya Sharma',
    speakerBio: 'Curator & Senior Research Librarian at Brain Dock',
    description: 'Join fellow members over artisan coffee as we debate behavioral biases, financial freedom, and the mindset behind long-term compounding.',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
    totalSeats: 40,
    registeredSeats: 32,
    fee: 0,
    status: 'Upcoming'
  },
  {
    eventId: 'EVT-2026-03',
    title: 'Competitive Exam Deep-Focus Hackathon (24-Hour Marathon)',
    category: 'Seminar',
    date: '2026-10-25',
    time: '08:00 AM - Next Day 08:00 AM',
    location: 'Silent Research Wing & Brain Pods',
    speaker: 'UPSC & GATE Mentor Faculty',
    speakerBio: 'Former rank-holders and memory optimization trainers',
    description: '24 hours of guided Pomodoro sprints, high-focus ambient lighting, nutrition snacks, and strategic test-taking workshops.',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    totalSeats: 60,
    registeredSeats: 45,
    fee: 199,
    status: 'Upcoming'
  }
];

export const seedAnnouncements = [
  {
    announcementId: 'ANN-2026-01',
    title: '24/7 Extended Access Now Live for Premium & Scholar Members',
    category: 'General',
    content: 'We are thrilled to announce that Brain Dock Library is now accessible 24/7 using your Digital RFID Membership Card and Smartphone QR Scanner.',
    priority: 'High',
    publishedBy: 'Dr. Keval Patel (Director)',
    isPinned: true
  },
  {
    announcementId: 'ANN-2026-02',
    title: 'New High-Speed Wi-Fi 7 Mesh Network Installed',
    category: 'Maintenance',
    content: 'All reading zones have been upgraded with ultra-low-latency Wi-Fi 7 access points delivering symmetrical 1 Gbps wireless bandwidth throughout the facility.',
    priority: 'Normal',
    publishedBy: 'IT Infrastructure Desk',
    isPinned: false
  },
  {
    announcementId: 'ANN-2026-03',
    title: 'Upcoming National Holiday Library Schedule',
    category: 'Holiday',
    content: 'On October 2nd, the Silent Reading Zone will remain open 24 hours. Administrative and physical book issuing desks will operate from 10:00 AM to 04:00 PM.',
    priority: 'Normal',
    publishedBy: 'Library Administration',
    isPinned: false
  }
];

export const seedIssues = [
  {
    issueId: 'ISS-2026-081',
    bookTitle: 'Designing Data-Intensive Applications',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    userName: 'Aarav Mehta',
    memberId: 'BDL-MEM-8842',
    issueDate: new Date(Date.now() - 10*24*60*60*1000),
    dueDate: new Date(Date.now() + 11*24*60*60*1000),
    status: 'Issued',
    renewalsCount: 0,
    fineAmount: 0,
    finePaid: false
  },
  {
    issueId: 'ISS-2026-082',
    bookTitle: 'Deep Learning & Neural Networks Foundations',
    bookCover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
    userName: 'Sneha Roy',
    memberId: 'BDL-MEM-9921',
    issueDate: new Date(Date.now() - 25*24*60*60*1000),
    dueDate: new Date(Date.now() - 4*24*60*60*1000),
    status: 'Overdue',
    renewalsCount: 1,
    fineAmount: 40,
    finePaid: false
  }
];

export const seedPayments = [
  {
    transactionId: 'TXN-BDL-99881',
    invoiceNumber: 'INV-2026-4410',
    userName: 'Aarav Mehta',
    memberId: 'BDL-MEM-8842',
    purpose: 'Membership Fee',
    amount: 1299,
    paymentMethod: 'UPI',
    status: 'Success',
    date: new Date('2026-09-01')
  },
  {
    transactionId: 'TXN-BDL-99882',
    invoiceNumber: 'INV-2026-4411',
    userName: 'Sneha Roy',
    memberId: 'BDL-MEM-9921',
    purpose: 'Membership Fee',
    amount: 499,
    paymentMethod: 'Credit/Debit Card',
    status: 'Success',
    date: new Date('2026-09-10')
  },
  {
    transactionId: 'TXN-BDL-99883',
    invoiceNumber: 'INV-2026-4412',
    userName: 'Vikram Joshi',
    memberId: 'BDL-MEM-7731',
    purpose: 'Locker Rental',
    amount: 350,
    paymentMethod: 'UPI',
    status: 'Success',
    date: new Date('2026-09-15')
  }
];

export const seedTestimonials = [
  {
    name: 'Dr. Sameer Desai',
    role: 'AI Researcher & Data Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    quote: 'Brain Dock Library has completely revolutionized my research routine. The Turing soundproof pods with high-speed optical fiber allow me to train models and write papers in pure, uninterrupted peace.'
  },
  {
    name: 'Riddhi Pandya',
    role: 'Civil Services (UPSC) Aspirant',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    quote: 'The silent reading environment and ergonomic chairs made 12-hour study sessions effortless. The digital seat reservation system ensures I never lose my favorite desk.'
  },
  {
    name: 'Kabir Singhania',
    role: 'Senior Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    quote: 'Hands down the best library ecosystem I have experienced in India. The book collection is modern, the digital membership card on mobile works flawlessly, and the aesthetic is world-class.'
  }
];

export const seedFaqs = [
  {
    category: 'Membership',
    question: 'How do I activate my Brain Dock Digital Membership Card?',
    answer: 'Once you sign up and choose a membership plan, your Digital Membership Card is instantly generated in your Member Portal. You can view the live QR code, save it to Apple/Google Wallet, or download a printable PDF copy.'
  },
  {
    category: 'Facilities',
    question: 'What are the operating hours of Brain Dock Library?',
    answer: 'The general library and circulation desk operate from 07:00 AM to 11:00 PM. For Scholar and Executive members, 24/7 biometric and QR access is active throughout the year.'
  },
  {
    category: 'Book Circulation',
    question: 'How many books can I issue and for how long?',
    answer: 'It depends on your plan: Basic allows 2 books (14 days), Standard allows 4 books (21 days), and Premium Executive allows up to 8 books (30 days with automated online renewals).'
  },
  {
    category: 'Study Rooms & Seats',
    question: 'How do I book a private soundproof pod or study room?',
    answer: 'Navigate to the Study Rooms section in the website or your member dashboard, select your preferred room, pick a date and time slot, and confirm. Your reservation code will be emailed and displayed on your dashboard.'
  },
  {
    category: 'Fines & Returns',
    question: 'What happens if a book is overdue?',
    answer: 'A late fee of ₹10/day applies after the grace period. You will receive automated WhatsApp/Email reminders 3 days and 1 day before the due date. Fines can be settled seamlessly via UPI through your portal.'
  }
];
