// =============================================
// PinDrop — Mock Data
// =============================================

const CATEGORIES = [
  { id: 'gaming', name: 'Oyun', icon: '🎮', color: '#a855f7' },
  { id: 'cafe', name: 'Kafe', icon: '☕', color: '#f97316' },
  { id: 'art', name: 'Sanat', icon: '🎨', color: '#ec4899' },
  { id: 'sport', name: 'Spor', icon: '🏃', color: '#22c55e' },
  { id: 'music', name: 'Müzik', icon: '🎵', color: '#3b82f6' },
  { id: 'other', name: 'Diğer', icon: '🎯', color: '#94a3b8' },
];

// Istanbul pins spread across districts
const PINS = [
  // Kadıköy
  { id: 1, lat: 40.9907, lng: 29.0230, category: 'gaming', description: 'Bu civarda PS kafe var, FIFA turnuvası yapıyorlar her akşam', upvotes: 24, createdAt: '2s önce' },
  { id: 2, lat: 40.9885, lng: 29.0290, category: 'cafe', description: 'Çok tatlı bir kedi kafe var, çay bahçesi de güzel', upvotes: 42, createdAt: '1s önce' },
  { id: 3, lat: 40.9920, lng: 29.0180, category: 'art', description: 'Dövmeci var buralarda, custom çizim yapıyor fiyatlar uygun', upvotes: 18, createdAt: '4s önce' },
  { id: 4, lat: 40.9870, lng: 29.0250, category: 'sport', description: 'Sahilde koşu parkuru var, sabahları kalabalık oluyor', upvotes: 31, createdAt: '3s önce' },
  { id: 5, lat: 40.9930, lng: 29.0200, category: 'music', description: 'Canlı müzik yapan bar var, cuma akşamları jazz çalıyorlar', upvotes: 56, createdAt: '5s önce' },

  // Beşiktaş
  { id: 6, lat: 41.0422, lng: 29.0050, category: 'cafe', description: 'Boğaz manzaralı kahveci, türk kahvesi efsane', upvotes: 67, createdAt: '1s önce' },
  { id: 7, lat: 41.0450, lng: 29.0080, category: 'gaming', description: 'Board game cafe var, 200+ kutu oyun mevcut', upvotes: 38, createdAt: '6s önce' },
  { id: 8, lat: 41.0400, lng: 29.0020, category: 'music', description: 'Sokak müzisyenleri toplanıyor akşamları, jam session yapılıyor', upvotes: 45, createdAt: '2s önce' },

  // Taksim / Beyoğlu
  { id: 9, lat: 41.0370, lng: 28.9850, category: 'art', description: 'Grafiti workshop var, duvar boyama etkinliği yapıyorlar', upvotes: 29, createdAt: '3s önce' },
  { id: 10, lat: 41.0340, lng: 28.9770, category: 'gaming', description: 'Retro oyun salonu, atari makineleri var nostalji', upvotes: 52, createdAt: '7s önce' },
  { id: 11, lat: 41.0355, lng: 28.9810, category: 'cafe', description: 'Kitapçı-kafe konsepti, sessiz çalışma alanı da var', upvotes: 33, createdAt: '4s önce' },
  { id: 12, lat: 41.0380, lng: 28.9790, category: 'other', description: 'Kaçış odası var, 2-6 kişilik gruplar için ideal', upvotes: 41, createdAt: '2s önce' },

  // Üsküdar
  { id: 13, lat: 41.0255, lng: 29.0155, category: 'sport', description: 'Kız Kulesi manzaralı yoga yapılan park, sabah 7de başlıyor', upvotes: 27, createdAt: '1s önce' },
  { id: 14, lat: 41.0230, lng: 29.0190, category: 'cafe', description: 'Çınaraltı çay bahçesi, tavla oynamak için birebir', upvotes: 59, createdAt: '8s önce' },

  // Eminönü / Karaköy
  { id: 15, lat: 41.0170, lng: 28.9740, category: 'other', description: 'Balık tutma noktası, olta kiralayan yer var', upvotes: 35, createdAt: '5s önce' },
  { id: 16, lat: 41.0220, lng: 28.9770, category: 'art', description: 'Seramik atölyesi, workshop\'a katılabilirsiniz', upvotes: 22, createdAt: '3s önce' },
  { id: 17, lat: 41.0200, lng: 28.9750, category: 'music', description: 'Plakçı dükkanı, vinil dinleme köşesi var', upvotes: 48, createdAt: '6s önce' },

  // Bakırköy
  { id: 18, lat: 40.9800, lng: 28.8720, category: 'sport', description: 'Sahilde bisiklet kiralama var, parkur çok güzel', upvotes: 36, createdAt: '2s önce' },
  { id: 19, lat: 40.9820, lng: 28.8680, category: 'gaming', description: 'VR deneyim merkezi, grup indirim yapıyorlar', upvotes: 44, createdAt: '4s önce' },

  // Sarıyer / Bebek
  { id: 20, lat: 41.0770, lng: 29.0440, category: 'cafe', description: 'Boğaz kenarında waffle yapan tezgah, oturma alanı da var', upvotes: 51, createdAt: '1s önce' },
];

// Users for swipe
const USERS = [
  {
    id: 1,
    name: 'Arda',
    age: 24,
    avatar: 'assets/users/arda.jpg',
    bio: '3 kişiyiz, okey oynamak istiyoruz. Kadıköy civarındayız!',
    location: 'Kadıköy',
    interests: ['Okey', 'Tavla', 'Kafe Keşfi'],
    groupSize: 3,
    distance: '0.5 km',
  },
  {
    id: 2,
    name: 'Elif',
    age: 22,
    avatar: 'assets/users/elif.jpg',
    bio: 'Tek başımayım, fotoğraf çekmeyi seven biri arıyorum gezi için.',
    location: 'Beşiktaş',
    interests: ['Fotoğraf', 'Doğa Yürüyüşü', 'Kahve'],
    groupSize: 1,
    distance: '1.2 km',
  },
  {
    id: 3,
    name: 'Burak',
    age: 27,
    avatar: 'assets/users/burak.jpg',
    bio: 'FIFA turnuvasına katılacak birilerini arıyoruz, 2 kişiyiz.',
    location: 'Taksim',
    interests: ['PlayStation', 'FIFA', 'E-Spor'],
    groupSize: 2,
    distance: '2.1 km',
  },
  {
    id: 4,
    name: 'Zeynep',
    age: 25,
    avatar: 'assets/users/zeynep.jpg',
    bio: 'Board game oynamak isteyen var mı? Catan, Ticket to Ride falan.',
    location: 'Kadıköy',
    interests: ['Kutu Oyunu', 'Kafe', 'Sohbet'],
    groupSize: 1,
    distance: '0.8 km',
  },
  {
    id: 5,
    name: 'Can',
    age: 29,
    avatar: 'assets/users/can.jpg',
    bio: 'Sahilde voleybol oynayacak 4 kişi arıyoruz!',
    location: 'Bakırköy',
    interests: ['Voleybol', 'Spor', 'Sahil'],
    groupSize: 4,
    distance: '3.5 km',
  },
  {
    id: 6,
    name: 'Selin',
    age: 23,
    avatar: null,
    bio: 'Karaköy\'de sanat galerisi gezen biri arıyorum, tek başıma sıkılıyorum.',
    location: 'Karaköy',
    interests: ['Sanat', 'Galeri', 'Müze'],
    groupSize: 1,
    distance: '1.7 km',
  },
  {
    id: 7,
    name: 'Emre',
    age: 26,
    avatar: null,
    bio: 'Jam session yapacak gitarist arıyoruz, 3 kişilik bandız.',
    location: 'Beyoğlu',
    interests: ['Müzik', 'Gitar', 'Jam Session'],
    groupSize: 3,
    distance: '2.4 km',
  },
  {
    id: 8,
    name: 'Ayşe',
    age: 21,
    avatar: null,
    bio: 'Yoga sonrası brunch yapacak arkadaş arıyorum 🧘‍♀️',
    location: 'Üsküdar',
    interests: ['Yoga', 'Brunch', 'Sağlıklı Yaşam'],
    groupSize: 1,
    distance: '1.0 km',
  },
  {
    id: 9,
    name: 'Kaan',
    age: 28,
    avatar: null,
    bio: 'VR deneyim merkezine gidecek grup arıyoruz, 2 kişiyiz.',
    location: 'Bakırköy',
    interests: ['VR', 'Teknoloji', 'Oyun'],
    groupSize: 2,
    distance: '4.0 km',
  },
  {
    id: 10,
    name: 'Defne',
    age: 24,
    avatar: null,
    bio: 'Boğaz kenarında sketch çizecek biri var mı? Malzemeler bende!',
    location: 'Bebek',
    interests: ['Çizim', 'Sanat', 'Doğa'],
    groupSize: 1,
    distance: '5.2 km',
  },
];

// Matches & conversations
const MATCHES = [
  {
    id: 1,
    user: { id: 2, name: 'Elif', location: 'Beşiktaş' },
    lastMessage: 'Yarın öğleden sonra müsait misin?',
    timestamp: '14:32',
    unread: 2,
    messages: [
      { id: 1, sender: 'them', text: 'Selam! Ben de fotoğraf çekmeyi çok seviyorum 📸', time: '13:45' },
      { id: 2, sender: 'me', text: 'Harika! Hangi bölgelerde çekiyorsun genelde?', time: '13:48' },
      { id: 3, sender: 'them', text: 'Boğaz kenarı ve Balat çok güzel oluyor. Sen?', time: '14:02' },
      { id: 4, sender: 'me', text: 'Ben de Kadıköy sokaklarını çok seviyorum', time: '14:15' },
      { id: 5, sender: 'them', text: 'Yarın öğleden sonra müsait misin?', time: '14:32' },
    ],
  },
  {
    id: 2,
    user: { id: 4, name: 'Zeynep', location: 'Kadıköy' },
    lastMessage: 'Catan getiriyorum o zaman! 🎲',
    timestamp: '11:20',
    unread: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Selam! Kutu oyunu oynamak ister misin?', time: '10:30' },
      { id: 2, sender: 'me', text: 'Tabii ki! Catan var mı?', time: '10:45' },
      { id: 3, sender: 'them', text: 'Evet! En sevdiğim oyun', time: '11:00' },
      { id: 4, sender: 'me', text: 'Süper, nerede buluşalım?', time: '11:10' },
      { id: 5, sender: 'them', text: 'Catan getiriyorum o zaman! 🎲', time: '11:20' },
    ],
  },
  {
    id: 3,
    user: { id: 7, name: 'Emre', location: 'Beyoğlu' },
    lastMessage: 'Akşam 8\'de stüdyoda oluruz',
    timestamp: 'Dün',
    unread: 1,
    messages: [
      { id: 1, sender: 'me', text: 'Selam! Ben de gitar çalıyorum, jam yapalım!', time: 'Dün 16:00' },
      { id: 2, sender: 'them', text: 'Harika! Ne tür çalıyorsun?', time: 'Dün 16:15' },
      { id: 3, sender: 'me', text: 'Blues ve rock ağırlıklı', time: 'Dün 16:30' },
      { id: 4, sender: 'them', text: 'Akşam 8\'de stüdyoda oluruz', time: 'Dün 17:00' },
    ],
  },
];

// Events (72-hour timed group activities)
const EVENTS = [
  {
    id: 1,
    title: 'Okey Gecesi',
    description: 'Kadıköy\'de 4 kişilik okey masası kuruyoruz, çay ve simit bizden!',
    location: 'Kadıköy',
    lat: 40.9912,
    lng: 29.0255,
    category: 'gaming',
    maxMembers: 4,
    members: [
      { id: 1, name: 'Arda', role: 'admin' },
    ],
    createdAt: Date.now() - (2 * 60 * 60 * 1000),
    expiresAt: Date.now() + (70 * 60 * 60 * 1000),
    creatorId: 1,
    status: 'active',
  },
  {
    id: 2,
    title: 'Boğaz Fotoğraf Turu',
    description: 'Beşiktaş\'tan Ortaköy\'e yürüyüp fotoğraf çekeceğiz, herkese açık!',
    location: 'Beşiktaş',
    lat: 41.0428,
    lng: 29.0065,
    category: 'art',
    maxMembers: 8,
    members: [
      { id: 2, name: 'Elif', role: 'admin' },
      { id: 6, name: 'Selin', role: 'member' },
      { id: 10, name: 'Defne', role: 'member' },
    ],
    createdAt: Date.now() - (24 * 60 * 60 * 1000),
    expiresAt: Date.now() + (48 * 60 * 60 * 1000),
    creatorId: 2,
    status: 'active',
  },
  {
    id: 3,
    title: 'FIFA Turnuvası',
    description: 'PS kafe\'de FIFA 25 turnuvası! Kaybedenler çay ısmarlar.',
    location: 'Taksim',
    lat: 41.0360,
    lng: 28.9840,
    category: 'gaming',
    maxMembers: 8,
    members: [
      { id: 3, name: 'Burak', role: 'admin' },
      { id: 9, name: 'Kaan', role: 'member' },
    ],
    createdAt: Date.now() - (12 * 60 * 60 * 1000),
    expiresAt: Date.now() + (60 * 60 * 60 * 1000),
    creatorId: 3,
    status: 'active',
  },
  {
    id: 4,
    title: 'Sahil Koşusu',
    description: 'Sabah 7\'de Caddebostan sahilinde buluşup koşuyoruz, tempo orta seviye.',
    location: 'Bostancı',
    lat: 40.9635,
    lng: 29.0940,
    category: 'sport',
    maxMembers: 10,
    members: [
      { id: 5, name: 'Can', role: 'admin' },
      { id: 99, name: 'Sen', role: 'member' },
    ],
    createdAt: Date.now() - (6 * 60 * 60 * 1000),
    expiresAt: Date.now() + (66 * 60 * 60 * 1000),
    creatorId: 5,
    status: 'active',
  },
  {
    id: 5,
    title: 'Catan Gecesi',
    description: 'Board game kafe\'de Catan oynayacağız, deneyimli olmana gerek yok!',
    location: 'Kadıköy',
    lat: 40.9875,
    lng: 29.0310,
    category: 'gaming',
    maxMembers: 4,
    members: [
      { id: 4, name: 'Zeynep', role: 'admin' },
      { id: 8, name: 'Ayşe', role: 'member' },
      { id: 7, name: 'Emre', role: 'member' },
      { id: 1, name: 'Arda', role: 'member' },
    ],
    createdAt: Date.now() - (48 * 60 * 60 * 1000),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000),
    creatorId: 4,
    status: 'active',
  },
  {
    id: 6,
    title: 'Akustik Jam Session',
    description: 'Gitar, ukulele, perküsyon fark etmez, gel çal! Beyoğlu\'nda bir kafeye gideceğiz.',
    location: 'Beyoğlu',
    lat: 41.0335,
    lng: 28.9765,
    category: 'music',
    maxMembers: 6,
    members: [
      { id: 7, name: 'Emre', role: 'admin' },
    ],
    createdAt: Date.now() - (1 * 60 * 60 * 1000),
    expiresAt: Date.now() + (71 * 60 * 60 * 1000),
    creatorId: 7,
    status: 'active',
  },
];

// Event group chat messages
const EVENT_CHATS = [
  {
    eventId: 4,
    messages: [
      { id: 1, senderId: 5, senderName: 'Can', text: 'Yarın sabah 7\'de Caddebostan sahilinde buluşuyoruz!', time: '18:00' },
      { id: 2, senderId: 99, senderName: 'Sen', text: 'Tamam, orada olacağım 🏃', time: '18:15' },
      { id: 3, senderId: 5, senderName: 'Can', text: 'Süper! Yanınıza su almayı unutmayın', time: '18:20' },
    ],
  },
];

// Current user profile
const CURRENT_USER = {
  id: 99,
  name: 'Sen',
  age: 25,
  bio: 'İstanbul\'u keşfetmeyi seven biri 🌆',
  location: 'Kadıköy',
  interests: ['Kafe Keşfi', 'Oyun', 'Müzik', 'Fotoğraf', 'Yürüyüş'],
  stats: {
    pins: 12,
    matches: 8,
    discoveries: 47,
  },
};

// Generate avatar colors based on user name (consistent)
function getAvatarColor(name) {
  const colors = [
    'linear-gradient(135deg, #a855f7, #ec4899)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #f97316, #eab308)',
    'linear-gradient(135deg, #22c55e, #06b6d4)',
    'linear-gradient(135deg, #ec4899, #f97316)',
    'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    'linear-gradient(135deg, #06b6d4, #22c55e)',
    'linear-gradient(135deg, #f43f5e, #a855f7)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
