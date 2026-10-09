// =============================================
// PinDrop — Events / Etkinlikler Screen
// =============================================

const EventsScreen = {
  timerInterval: null,
  newEventMaxMembers: 4,

  init() {
    this.renderEvents();
    this.setupCreateModal();
    this.startTimers();
  },

  getTimeRemaining(expiresAt) {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return { text: 'Süresi doldu', hours: 0, urgent: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let text;
    if (hours > 0) {
      text = `${hours}s ${minutes}dk kaldı`;
    } else {
      text = `${minutes}dk kaldı`;
    }

    return {
      text,
      hours,
      urgent: hours < 6,
      warning: hours >= 6 && hours < 24,
    };
  },

  isUserMember(event) {
    return event.members.some(m => m.id === CURRENT_USER.id);
  },

  isUserAdmin(event) {
    const member = event.members.find(m => m.id === CURRENT_USER.id);
    return member && member.role === 'admin';
  },

  renderEvents() {
    const listEl = document.getElementById('eventsList');
    if (!listEl) return;

    // Filter active events (not expired and not closed)
    const activeEvents = EVENTS.filter(e => {
      if (e.status === 'closed') return false;
      if (e.expiresAt <= Date.now()) {
        e.status = 'expired';
        return false;
      }
      return true;
    });

    if (activeEvents.length === 0) {
      listEl.innerHTML = `
        <div class="events-empty">
          <div class="events-empty__icon">🎪</div>
          <div class="events-empty__title">Henüz etkinlik yok</div>
          <div>İlk etkinliği sen oluştur!</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';

    activeEvents.forEach((event, index) => {
      const card = this.createEventCard(event, index);
      listEl.appendChild(card);
    });
  },

  createEventCard(event, index) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.eventId = event.id;
    card.style.animationDelay = `${index * 80}ms`;

    const category = CATEGORIES.find(c => c.id === event.category);
    const catIcon = category ? category.icon : '🎯';
    const catName = category ? category.name : 'Diğer';
    const catColor = category ? category.color : '#94a3b8';

    const time = this.getTimeRemaining(event.expiresAt);
    let timerClass = '';
    if (time.urgent) timerClass = 'urgent';
    else if (time.warning) timerClass = 'warning';

    const isMember = this.isUserMember(event);
    const isFull = event.members.length >= event.maxMembers;
    const fillPercent = (event.members.length / event.maxMembers) * 100;

    // Build avatar HTML (max 5 shown)
    const shownMembers = event.members.slice(0, 5);
    const avatarsHtml = shownMembers.map(m => {
      return `<div class="event-card__avatar" style="background: ${getAvatarColor(m.name)}">${getInitials(m.name)}</div>`;
    }).join('');

    // Build action buttons
    let actionsHtml = '';
    if (isMember) {
      actionsHtml = `
        <button class="event-card__join-btn joined" disabled>✓ Katıldın</button>
        <button class="event-card__join-btn leave" data-action="leave" data-event-id="${event.id}">Ayrıl</button>
      `;
    } else if (isFull) {
      actionsHtml = `<button class="event-card__join-btn full" disabled>Kontenjan Dolu</button>`;
    } else {
      actionsHtml = `<button class="event-card__join-btn" data-action="join" data-event-id="${event.id}">Katıl</button>`;
    }

    card.style.setProperty('--cat-color', catColor);

    card.innerHTML = `
      <div class="event-card__top">
        <div class="event-card__category">
          <span>${catIcon}</span>
          <span>${catName}</span>
        </div>
        <div class="event-card__timer ${timerClass}" data-expires="${event.expiresAt}">
          ⏳ ${time.text}
        </div>
      </div>
      <div class="event-card__title">${event.title}</div>
      <div class="event-card__desc">${event.description}</div>
      <div class="event-card__location">📍 ${event.location}</div>
      <div class="event-card__members-section">
        <div class="event-card__avatars">${avatarsHtml}</div>
        <div class="event-card__member-count">
          ${event.members.length}<span>/${event.maxMembers} kişi</span>
        </div>
      </div>
      <div class="event-card__progress">
        <div class="event-card__progress-fill ${isFull ? 'full' : ''}" style="width: ${fillPercent}%"></div>
      </div>
      <div class="event-card__actions">${actionsHtml}</div>
    `;

    // Bind action buttons
    card.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const eventId = parseInt(btn.dataset.eventId);
        if (action === 'join') this.joinEvent(eventId);
        else if (action === 'leave') this.leaveEvent(eventId);
      });
    });

    return card;
  },

  joinEvent(eventId) {
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return;
    if (event.members.length >= event.maxMembers) {
      App.showToast('Kontenjan dolu!', '⚠️');
      return;
    }
    if (this.isUserMember(event)) return;

    // Add user to event
    event.members.push({ id: CURRENT_USER.id, name: CURRENT_USER.name, role: 'member' });

    // Create group chat in EVENT_CHATS if not exists
    let chat = EVENT_CHATS.find(c => c.eventId === eventId);
    if (!chat) {
      chat = { eventId, messages: [] };
      EVENT_CHATS.push(chat);
    }

    // Add system message
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    chat.messages.push({
      id: Date.now(),
      senderId: 0,
      senderName: 'Sistem',
      text: `${CURRENT_USER.name} etkinliğe katıldı! 🎉`,
      time: timeStr,
      isSystem: true,
    });

    // Re-render
    this.renderEvents();
    MessagesScreen.renderMatchesList();
    if (typeof MapScreen !== 'undefined' && MapScreen.map) MapScreen.addPins();
    App.showToast(`"${event.title}" etkinliğine katıldın!`, '🎉');
  },

  leaveEvent(eventId) {
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return;

    // Admin can't leave, they must close
    if (this.isUserAdmin(event)) {
      App.showToast('Yönetici olarak ayrılamazsın, grubu kapatabilirsin.', '⚠️');
      return;
    }

    // Remove user
    event.members = event.members.filter(m => m.id !== CURRENT_USER.id);

    // Add system message
    const chat = EVENT_CHATS.find(c => c.eventId === eventId);
    if (chat) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      chat.messages.push({
        id: Date.now(),
        senderId: 0,
        senderName: 'Sistem',
        text: `${CURRENT_USER.name} etkinlikten ayrıldı.`,
        time: timeStr,
        isSystem: true,
      });
    }

    this.renderEvents();
    MessagesScreen.renderMatchesList();
    if (typeof MapScreen !== 'undefined' && MapScreen.map) MapScreen.addPins();
    App.showToast('Etkinlikten ayrıldın.', '👋');
  },

  closeEvent(eventId) {
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return;
    if (!this.isUserAdmin(event)) return;

    event.status = 'closed';

    const chat = EVENT_CHATS.find(c => c.eventId === eventId);
    if (chat) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      chat.messages.push({
        id: Date.now(),
        senderId: 0,
        senderName: 'Sistem',
        text: 'Etkinlik yönetici tarafından kapatıldı.',
        time: timeStr,
        isSystem: true,
      });
    }

    this.renderEvents();
    MessagesScreen.renderMatchesList();
    if (typeof MapScreen !== 'undefined' && MapScreen.map) MapScreen.addPins();
    App.showToast('Etkinlik kapatıldı.', '🔒');
  },

  kickMember(eventId, userId) {
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return;
    if (!this.isUserAdmin(event)) return;
    if (userId === CURRENT_USER.id) return; // Can't kick yourself

    const kicked = event.members.find(m => m.id === userId);
    if (!kicked) return;

    event.members = event.members.filter(m => m.id !== userId);

    const chat = EVENT_CHATS.find(c => c.eventId === eventId);
    if (chat) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      chat.messages.push({
        id: Date.now(),
        senderId: 0,
        senderName: 'Sistem',
        text: `${kicked.name} etkinlikten çıkarıldı.`,
        time: timeStr,
        isSystem: true,
      });
    }

    this.renderEvents();
    MessagesScreen.renderMatchesList();
    if (typeof MapScreen !== 'undefined' && MapScreen.map) MapScreen.addPins();
    App.showToast(`${kicked.name} etkinlikten çıkarıldı.`, '🚫');
  },

  // Timer updater
  startTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      document.querySelectorAll('.event-card__timer[data-expires]').forEach(el => {
        const expires = parseInt(el.dataset.expires);
        const time = this.getTimeRemaining(expires);

        el.textContent = `⏳ ${time.text}`;
        el.classList.remove('warning', 'urgent');
        if (time.urgent) el.classList.add('urgent');
        else if (time.warning) el.classList.add('warning');

        // If expired, re-render
        if (time.hours <= 0 && time.text === 'Süresi doldu') {
          this.renderEvents();
        }
      });
    }, 60000); // Update every minute
  },

  // Create Event Modal
  setupCreateModal() {
    const fab = document.getElementById('createEventBtn');
    const modal = document.getElementById('createEventModal');
    const bg = document.getElementById('createEventModalBg');
    const cancelBtn = document.getElementById('cancelEventBtn');
    const saveBtn = document.getElementById('saveEventBtn');
    const minusBtn = document.getElementById('memberCountMinus');
    const plusBtn = document.getElementById('memberCountPlus');
    const countDisplay = document.getElementById('memberCountDisplay');

    if (!fab || !modal) return;

    this.newEventMaxMembers = 4;

    fab.addEventListener('click', () => {
      modal.classList.add('active');
      this.newEventMaxMembers = 4;
      if (countDisplay) countDisplay.textContent = '4';
      // Reset form
      const title = document.getElementById('eventTitleInput');
      const desc = document.getElementById('eventDescInput');
      const loc = document.getElementById('eventLocationInput');
      if (title) title.value = '';
      if (desc) desc.value = '';
      if (loc) loc.value = '';
      // Reset category
      const grid = document.getElementById('eventCategoryGrid');
      if (grid) grid.querySelectorAll('.pin-category-btn').forEach(b => b.classList.remove('selected'));
      this.selectedCategory = null;
    });

    if (bg) bg.addEventListener('click', () => modal.classList.remove('active'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        if (this.newEventMaxMembers > 2) {
          this.newEventMaxMembers--;
          if (countDisplay) countDisplay.textContent = this.newEventMaxMembers;
        }
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        if (this.newEventMaxMembers < 30) {
          this.newEventMaxMembers++;
          if (countDisplay) countDisplay.textContent = this.newEventMaxMembers;
        }
      });
    }

    // Category grid
    const grid = document.getElementById('eventCategoryGrid');
    if (grid) {
      grid.innerHTML = CATEGORIES.map(cat => `
        <button class="pin-category-btn" data-id="${cat.id}" style="--cat-color: ${cat.color};">
          <span class="pin-category-btn__icon">${cat.icon}</span>
          <span>${cat.name}</span>
        </button>
      `).join('');

      grid.querySelectorAll('.pin-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          grid.querySelectorAll('.pin-category-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedCategory = btn.dataset.id;
        });
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.createEvent());
    }
  },

  getCoordsForLocation(loc) {
    const DISTRICTS = {
      'kadıköy': [29.0255, 40.9912],
      'beşiktaş': [29.0065, 41.0428],
      'taksim': [28.9840, 41.0360],
      'bostancı': [29.0940, 40.9635],
      'beyoğlu': [28.9765, 41.0335],
      'üsküdar': [29.0155, 41.0255],
      'karaköy': [28.9750, 41.0200],
      'bakırköy': [28.8700, 40.9800],
      'sarıyer': [29.0440, 41.0770],
      'bebek': [29.0440, 41.0770],
    };

    const q = loc.toLowerCase().trim();
    let base = DISTRICTS[q];
    if (!base) {
      for (const [k, v] of Object.entries(DISTRICTS)) {
        if (q.includes(k) || k.includes(q)) {
          base = v;
          break;
        }
      }
    }
    if (!base) {
      base = [29.0255, 40.9912];
    }

    return {
      lng: base[0] + (Math.random() - 0.5) * 0.008,
      lat: base[1] + (Math.random() - 0.5) * 0.008,
    };
  },

  createEvent() {
    const titleInput = document.getElementById('eventTitleInput');
    const descInput = document.getElementById('eventDescInput');
    const locInput = document.getElementById('eventLocationInput');

    const title = titleInput ? titleInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const location = locInput ? locInput.value.trim() : '';

    if (!title) { App.showToast('Etkinlik başlığı gir!', '⚠️'); return; }
    if (!desc) { App.showToast('Açıklama yaz!', '⚠️'); return; }
    if (!location) { App.showToast('Konum gir!', '⚠️'); return; }
    if (!this.selectedCategory) { App.showToast('Kategori seç!', '⚠️'); return; }

    const coords = this.getCoordsForLocation(location);

    const newEvent = {
      id: Date.now(),
      title,
      description: desc,
      location,
      lat: coords.lat,
      lng: coords.lng,
      category: this.selectedCategory,
      maxMembers: this.newEventMaxMembers,
      members: [
        { id: CURRENT_USER.id, name: CURRENT_USER.name, role: 'admin' },
      ],
      createdAt: Date.now(),
      expiresAt: Date.now() + (72 * 60 * 60 * 1000),
      creatorId: CURRENT_USER.id,
      status: 'active',
    };

    EVENTS.unshift(newEvent);

    // Create chat for this event
    EVENT_CHATS.push({
      eventId: newEvent.id,
      messages: [{
        id: Date.now(),
        senderId: 0,
        senderName: 'Sistem',
        text: `"${title}" etkinliği oluşturuldu! 🎉`,
        time: new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0'),
        isSystem: true,
      }],
    });

    // Close modal
    const modal = document.getElementById('createEventModal');
    if (modal) modal.classList.remove('active');

    this.renderEvents();
    MessagesScreen.renderMatchesList();
    if (typeof MapScreen !== 'undefined' && MapScreen.map) {
      MapScreen.addPins();
    }
    App.showToast('Etkinlik oluşturuldu! 🎪', '✅');
  },
};
