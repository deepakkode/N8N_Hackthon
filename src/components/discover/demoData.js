// Demo data for the discover page
export const demoEvents = [
  {
    id: 'demo-1',
    _id: 'demo-1',
    title: 'Tech Innovation Summit 2024',
    name: 'Tech Innovation Summit 2024',
    description: 'Join us for an exciting summit featuring the latest in technology and innovation. Network with industry leaders, attend workshops on AI, blockchain, and IoT, and discover cutting-edge solutions that are shaping the future.',
    category: 'technical',
    date: '2024-03-15',
    time: '10:00 AM',
    venue: 'Main Auditorium, Block A',
    organizer: { name: 'Tech Innovation Club' },
    attendees: ['user1', 'user2', 'user3', 'user4', 'user5'],
    maxParticipants: 100,
    poster: null,
    userRegistration: null // Not registered
  },
  {
    id: 'demo-2',
    _id: 'demo-2',
    title: 'Cultural Night Extravaganza',
    name: 'Cultural Night Extravaganza',
    description: 'Experience the rich diversity of cultures through music, dance, and art. A night filled with performances from various cultural groups, traditional food stalls, and interactive cultural workshops.',
    category: 'cultural',
    date: '2024-03-20',
    time: '6:00 PM',
    venue: 'Open Air Theatre',
    organizer: { name: 'Cultural Society' },
    attendees: ['user1', 'user2', 'user3'],
    maxParticipants: 200,
    poster: null,
    userRegistration: { registrationStatus: 'pending' }
  },
  {
    id: 'demo-3',
    _id: 'demo-3',
    title: 'AI & Machine Learning Workshop',
    name: 'AI & Machine Learning Workshop',
    description: 'Hands-on workshop covering fundamentals of AI and ML. Learn practical applications, build your first ML model, and understand how AI is transforming industries. Includes coding sessions and real-world case studies.',
    category: 'workshop',
    date: '2024-03-25',
    time: '2:00 PM',
    venue: 'Computer Lab 1, IT Block',
    organizer: { name: 'CS Department' },
    attendees: ['user1', 'user2'],
    maxParticipants: 50,
    poster: null,
    userRegistration: { registrationStatus: 'approved' }
  },
  {
    id: 'demo-4',
    _id: 'demo-4',
    title: 'Inter-College Sports Meet',
    name: 'Inter-College Sports Meet',
    description: 'Annual sports competition featuring various indoor and outdoor games. Compete with students from other colleges in cricket, football, basketball, badminton, and track events. Prizes for winners and participation certificates for all.',
    category: 'sports',
    date: '2024-03-30',
    time: '9:00 AM',
    venue: 'Sports Complex',
    organizer: { name: 'Sports Committee' },
    attendees: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'],
    maxParticipants: 300,
    poster: null,
    userRegistration: null
  },
  {
    id: 'demo-5',
    _id: 'demo-5',
    title: 'Entrepreneurship Bootcamp',
    name: 'Entrepreneurship Bootcamp',
    description: 'Learn the fundamentals of starting your own business. Meet successful entrepreneurs, get mentorship, pitch your ideas, and understand funding opportunities. Includes sessions on business planning, marketing, and legal aspects.',
    category: 'academic',
    date: '2024-04-05',
    time: '11:00 AM',
    venue: 'Conference Hall, Admin Block',
    organizer: { name: 'Business Club' },
    attendees: ['user1'],
    maxParticipants: 75,
    poster: null,
    userRegistration: { registrationStatus: 'rejected' }
  },
  {
    id: 'demo-6',
    _id: 'demo-6',
    title: 'Photography Contest & Exhibition',
    name: 'Photography Contest & Exhibition',
    description: 'Showcase your photography skills in our annual contest. Categories include nature, portrait, street, and abstract photography. Winners will have their work displayed in the college gallery.',
    category: 'cultural',
    date: '2024-04-10',
    time: '3:00 PM',
    venue: 'Art Gallery, Fine Arts Block',
    organizer: { name: 'Photography Club' },
    attendees: ['user1', 'user2', 'user3', 'user4'],
    maxParticipants: 60,
    poster: null,
    userRegistration: null
  }
];

export const demoClubs = [
  {
    _id: 'club-1',
    clubName: 'Tech Innovation Club',
    clubDescription: 'Exploring cutting-edge technology and innovation through projects, workshops, hackathons, and industry collaborations. Join us to learn about AI, blockchain, IoT, and emerging technologies.',
    organizer: { name: 'Dr. Smith', department: 'Computer Science' },
    eventCount: 8,
    memberCount: 45,
    clubLogo: null
  },
  {
    _id: 'club-2',
    clubName: 'Cultural Society',
    clubDescription: 'Celebrating arts, culture, and traditions through various cultural events, performances, festivals, and workshops. Promoting diversity and cultural exchange among students.',
    organizer: { name: 'Prof. Johnson', department: 'Arts & Literature' },
    eventCount: 12,
    memberCount: 67,
    clubLogo: null
  },
  {
    _id: 'club-3',
    clubName: 'Sports Club',
    clubDescription: 'Promoting fitness and competitive sports among students with regular training sessions, tournaments, and inter-college competitions. All skill levels welcome.',
    organizer: { name: 'Coach Williams', department: 'Physical Education' },
    eventCount: 15,
    memberCount: 89,
    clubLogo: null
  },
  {
    _id: 'club-4',
    clubName: 'Debate Society',
    clubDescription: 'Enhancing communication and critical thinking skills through debates, public speaking events, and discussion forums on current affairs and social issues.',
    organizer: { name: 'Dr. Brown', department: 'English' },
    eventCount: 6,
    memberCount: 34,
    clubLogo: null
  },
  {
    _id: 'club-5',
    clubName: 'Photography Club',
    clubDescription: 'Capturing moments and exploring the art of photography through workshops, photo walks, contests, and exhibitions. Learn from basics to advanced techniques.',
    organizer: { name: 'Ms. Davis', department: 'Fine Arts' },
    eventCount: 10,
    memberCount: 28,
    clubLogo: null
  },
  {
    _id: 'club-6',
    clubName: 'Environmental Club',
    clubDescription: 'Promoting environmental awareness and sustainability through green initiatives, tree plantation drives, and educational campaigns about climate change.',
    organizer: { name: 'Dr. Green', department: 'Environmental Science' },
    eventCount: 7,
    memberCount: 52,
    clubLogo: null
  }
];