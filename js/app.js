// =============================================
// PinDrop — Main App Controller
// =============================================

const App = {
  currentScreen: 'screen-map',
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.setupNavigation();
    this.updateStatusBarTime();
    setInterval(() => this.updateStatusBarTime(), 30000);

    // Initialize all screens
    setTimeout(() => {
      MapScreen.init();
      SwipeScreen.init();
      MessagesScreen.init();
      EventsScreen.init();
      ProfileScreen.init();
    }, 100);
  },

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const screenId = item.dataset.screen;
        this.switchScreen(screenId);
      });
    });
  },

  switchScreen(screenId) {
    if (screenId === this.currentScreen) return;

    // Close any open modals when switching screens
    const modal = document.getElementById('addPinModal');
    if (modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
      if (typeof MapScreen !== 'undefined') MapScreen.exitAddPinMode();
    }

    // Update screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`[data-screen="${screenId}"]`);
    if (navItem) {
      navItem.classList.add('active');
    }

    this.currentScreen = screenId;

    // Resize map when switching to map screen
    if (screenId === 'screen-map' && MapScreen.map) {
      setTimeout(() => MapScreen.map.resize(), 50);
    }
  },

  updateStatusBarTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const el = document.getElementById('statusTime');
    if (el) el.textContent = `${h}:${m}`;
  },

  showToast(text, icon = '✅') {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    const toastIcon = document.getElementById('toastIcon');
    toastText.textContent = text;
    toastIcon.textContent = icon;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  },

  showMatchOverlay(user) {
    const overlay = document.getElementById('matchOverlay');
    const avatar2 = document.getElementById('matchAvatar2');
    avatar2.style.background = getAvatarColor(user.name);
    avatar2.textContent = getInitials(user.name);
    overlay.classList.add('active');

    // Add user to MATCHES if not already there
    let match = MATCHES.find(m => m.user.id === user.id);
    if (!match) {
      match = {
        id: Date.now(),
        user: { id: user.id, name: user.name, location: user.location },
        lastMessage: 'Yeni eşleşme! 🎉',
        timestamp: 'Az önce',
        unread: 1,
        messages: []
      };
      MATCHES.unshift(match);
      if (CURRENT_USER.stats) CURRENT_USER.stats.matches++;
      if (typeof ProfileScreen !== 'undefined') ProfileScreen.render();
      if (typeof MessagesScreen !== 'undefined') {
        MessagesScreen.renderMatchesList();
        MessagesScreen.updateNavBadge();
      }
    }

    // Spawn confetti
    this.spawnConfetti();

    // Close buttons
    document.getElementById('matchLaterBtn').onclick = () => {
      overlay.classList.remove('active');
    };
    document.getElementById('matchMessageBtn').onclick = () => {
      overlay.classList.remove('active');
      this.switchScreen('screen-messages');
      if (typeof MessagesScreen !== 'undefined') {
        MessagesScreen.openChat(match.id);
      }
    };

    // Auto icebreaker from the match after 2.8s
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const icebreakers = [
        `Selam ${CURRENT_USER.name}! Eşleştiğimize sevindim 😊`,
        `Selam! Ben de tam bu civardayım, ne yapıyorsun? ✨`,
        `Harika bir eşleşme! Profilin çok tatlı duruyor 👋`,
        `Selam! Buralardaysan bir kahve içelim mi? ☕`
      ];
      const icebreakerText = icebreakers[Math.floor(Math.random() * icebreakers.length)];

      if (!match.messages) match.messages = [];
      match.messages.push({
        id: Date.now(),
        sender: 'them',
        text: icebreakerText,
        time: timeStr
      });
      match.lastMessage = icebreakerText;
      match.timestamp = timeStr;

      if (typeof MessagesScreen !== 'undefined') {
        if (MessagesScreen.currentChat && MessagesScreen.currentChat.id === match.id) {
          MessagesScreen.renderChatMessages(match);
        } else {
          match.unread = (match.unread || 0) + 1;
          App.showToast(`💬 ${user.name}: ${icebreakerText}`, '💬');
        }
        MessagesScreen.renderMatchesList();
        MessagesScreen.updateNavBadge();
      }
    }, 2800);
  },

  spawnConfetti() {
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#f97316', '#eab308'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 1 + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }
  },
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
