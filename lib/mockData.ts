import { Review, User } from '@/types/review';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Joel Hansen',
    initials: 'JH',
    backgroundColor: 'bg-green-500'
  },
  {
    id: '2',
    name: 'David Rodriguez',
    initials: 'DR',
    backgroundColor: 'bg-blue-500'
  },
  {
    id: '3',
    name: 'Chelsea Durfee',
    initials: 'CD',
    backgroundColor: 'bg-purple-500'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    initials: 'SJ',
    backgroundColor: 'bg-pink-500'
  },
  {
    id: '5',
    name: 'Mike Chen',
    initials: 'MC',
    backgroundColor: 'bg-orange-500'
  },
  {
    id: '6',
    name: 'Emily Davis',
    initials: 'ED',
    backgroundColor: 'bg-red-500'
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    user: mockUsers[0],
    rating: 5,
    text: 'This place is awesome! Great prices and even greater service. Bryson helped me find exactly what I needed and even arranged personal delivery too. Definitely recommend!',
    platform: 'Google',
    timestamp: new Date(),
    isRecent: true
  },
  {
    id: '2',
    user: mockUsers[1],
    rating: 5,
    text: 'Venture Auto turned my dream car into a reality with an exceptional buying journey. The team\'s enthusiasm and expertise made the process a breeze, guiding me to the perfect match for my lifestyle. The financing process was transparent, offering competitive rates and a payment plan that comfortably fit my budget. For an unparalleled car-buying experience, look no further than Venture Auto!',
    platform: 'Google',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000) // 7 hours ago
  },
  {
    id: '3',
    user: mockUsers[3],
    rating: 4,
    text: 'Great selection of vehicles and friendly staff. The buying process was smooth and they were very accommodating with my schedule. Would definitely recommend to friends and family.',
    platform: 'Yelp',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: '4',
    user: mockUsers[4],
    rating: 5,
    text: 'Outstanding service from start to finish! The sales team was knowledgeable and patient, helping me find the perfect car within my budget. The finance department made everything easy and transparent.',
    platform: 'Google',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }
];

export const mockInvitedUsers: User[] = mockUsers.slice(2, 6);