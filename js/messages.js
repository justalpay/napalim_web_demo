// =============================================
// PinDrop — Messages Screen
// =============================================

const MessagesScreen = {
  currentChat: null,

  init() {
    this.renderMatchesList();
    this.updateNavBadge();
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.getElementById('chatBackBtn').addEventListener('click', () => this.closeChat());

    document.getElementById('chatSendBtn').addEventListener('click', () => this.sendMessage());
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  },

  renderMatchesList() {
    const listEl = document.getElementById('messagesList');
    if (!listEl) return;

    // Get events user is part of
    const myEvents = (typeof EVENTS !== 'undefined' ? EVENTS : []).filter(e =>
      e.status === 'active' && e.members.some(m => m.id === CURRENT_USER.id)
    );

    if (MATCHES.length === 0 && myEvents.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">💬</div>
          <div class="empty-state__title">Henüz eşleşme yok</div>
          <div class="empty-state__text">Keşfet ekranından insanları beğen, eşleşince burada sohbet edebilirsin!</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    let itemIndex = 0;

    // Render event group chats first
    myEvents.forEach(event => {
      const chat = (typeof EVENT_CHATS !== 'undefined' ? EVENT_CHATS : []).find(c => c.eventId === event.id);
      const lastMsg = chat && chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1]
        : { text: 'Sohbeti başlat...', senderName: '', time: '' };

      const lastMsgPreview = lastMsg.senderName && !lastMsg.isSystem
        ? `${lastMsg.senderName}: ${lastMsg.text}`
        : lastMsg.text;

      const isUnread = chat && chat.unread > 0;
      const item = document.createElement('div');
      item.className = `message-item message-item--event ${isUnread ? 'message-item--unread' : ''}`;
      item.style.animationDelay = `${itemIndex * 60}ms`;
      item.style.animation = 'slide-up 400ms cubic-bezier(0.4, 0, 0.2, 1) both';

      const category = CATEGORIES.find(c => c.id === event.category);
      const catIcon = category ? category.icon : '🎯';

      item.innerHTML = `
        <div class="message-item__avatar message-item__avatar--event" style="background: var(--gradient-primary)">
          ${catIcon}
        </div>
        <div class="message-item__content">
          <div class="message-item__name">${event.title} <span style="font-size: 10px; color: var(--text-tertiary); font-weight: 400;">👥 ${event.members.length}</span></div>
          <div class="message-item__preview">${lastMsgPreview}</div>
        </div>
        <div class="message-item__meta">
          <div class="message-item__time">${lastMsg.time || ''}</div>
          ${isUnread ? `<div class="message-item__unread">${chat.unread}</div>` : ''}
        </div>
      `;

      item.addEventListener('click', () => this.openEventChat(event.id));
      listEl.appendChild(item);
      itemIndex++;
    });

    // Render regular matches
    MATCHES.forEach(match => {
      const user = match.user;
      if (!user) return;

      const lastMsg = match.messages && match.messages.length > 0
        ? match.messages[match.messages.length - 1]
        : { text: 'Sohbeti başlat...', time: '' };

      const isUnread = match.unread > 0;
      const item = document.createElement('div');
      item.className = `message-item ${isUnread ? 'message-item--unread' : ''}`;
      item.style.animationDelay = `${itemIndex * 60}ms`;
      item.style.animation = 'slide-up 400ms cubic-bezier(0.4, 0, 0.2, 1) both';

      item.innerHTML = `
        <div class="message-item__avatar" style="background: ${getAvatarColor(user.name)}">
          ${getInitials(user.name)}
        </div>
        <div class="message-item__content">
          <div class="message-item__name">${user.name}</div>
          <div class="message-item__preview">${lastMsg.text}</div>
        </div>
        <div class="message-item__meta">
          <div class="message-item__time">${match.timestamp}</div>
          ${isUnread ? `<div class="message-item__unread">${match.unread}</div>` : ''}
        </div>
      `;

      item.addEventListener('click', () => this.openChat(match.id));
      listEl.appendChild(item);
      itemIndex++;
    });
  },

  openChat(matchId) {
    const match = MATCHES.find(m => m.id === matchId);
    if (!match) return;

    this.currentChat = match;
    this.currentEventChat = null;
    this.hideTypingIndicator();

    // Mark as read
    match.unread = 0;
    this.renderMatchesList();
    this.updateNavBadge();

    // Update chat header
    const headerUser = document.getElementById('chatHeaderUser');
    if (headerUser) {
      const user = match.user;
      headerUser.innerHTML = `
        <div class="avatar avatar--sm" style="background: ${getAvatarColor(user.name)}">
          ${getInitials(user.name)}
        </div>
        <div>
          <div style="font-weight: 600; font-size: var(--font-md);">${user.name}</div>
          <div style="font-size: var(--font-xs); color: var(--text-tertiary);">📍 ${user.location}</div>
        </div>
      `;
    }

    // Hide event actions
    const eventActions = document.getElementById('chatEventActions');
    if (eventActions) eventActions.style.display = 'none';

    this.renderChatMessages(match);

    const chatView = document.getElementById('chatView');
    if (chatView) chatView.classList.add('active');
  },

  openEventChat(eventId) {
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return;

    let chat = EVENT_CHATS.find(c => c.eventId === eventId);
    if (!chat) {
      chat = { eventId, messages: [] };
      EVENT_CHATS.push(chat);
    }
    this.currentChat = null;
    this.currentEventChat = { event, chat };
    this.hideTypingIndicator();

    if (chat && chat.unread) {
      chat.unread = 0;
      this.renderMatchesList();
      this.updateNavBadge();
    }

    // Update chat header
    const headerUser = document.getElementById('chatHeaderUser');
    if (headerUser) {
      const category = CATEGORIES.find(c => c.id === event.category);
      const catIcon = category ? category.icon : '🎯';
      headerUser.innerHTML = `
        <div class="avatar avatar--sm" style="background: var(--gradient-primary)">
          ${catIcon}
        </div>
        <div>
          <div style="font-weight: 600; font-size: var(--font-md);">${event.title}</div>
          <div style="font-size: var(--font-xs); color: var(--text-tertiary);">👥 ${event.members.length}/${event.maxMembers} kişi</div>
        </div>
      `;
    }

    // Show event actions
    const isAdmin = event.members.find(m => m.id === CURRENT_USER.id && m.role === 'admin');
    let eventActionsEl = document.getElementById('chatEventActions');
    if (!eventActionsEl) {
      eventActionsEl = document.createElement('div');
      eventActionsEl.id = 'chatEventActions';
      eventActionsEl.style.cssText = 'display: flex; gap: 8px; padding: 8px 16px; border-bottom: 1px solid var(--glass-border);';
      const chatHeader = document.querySelector('.chat-header');
      if (chatHeader) chatHeader.after(eventActionsEl);
    }

    eventActionsEl.style.display = 'flex';
    eventActionsEl.innerHTML = '';

    if (isAdmin) {
      // Admin: show close and member management
      const closeBtn = document.createElement('button');
      closeBtn.className = 'btn-ghost';
      closeBtn.style.cssText = 'font-size: 11px; padding: 6px 12px; color: var(--accent-red); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-lg);';
      closeBtn.textContent = '🔒 Grubu Kapat';
      closeBtn.addEventListener('click', () => {
        EventsScreen.closeEvent(eventId);
        this.closeChat();
      });
      eventActionsEl.appendChild(closeBtn);

      // Kick dropdown
      const nonAdminMembers = event.members.filter(m => m.role !== 'admin');
      if (nonAdminMembers.length > 0) {
        const kickSelect = document.createElement('select');
        kickSelect.style.cssText = 'font-size: 11px; padding: 6px 12px; background: var(--bg-glass); color: var(--text-primary); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); cursor: pointer;';
        kickSelect.innerHTML = `<option value="">🚫 Üye At</option>` +
          nonAdminMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        kickSelect.addEventListener('change', () => {
          if (kickSelect.value) {
            EventsScreen.kickMember(eventId, parseInt(kickSelect.value));
            this.openEventChat(eventId); // Refresh
          }
        });
        eventActionsEl.appendChild(kickSelect);
      }
    } else {
      // Member: show leave button
      const leaveBtn = document.createElement('button');
      leaveBtn.className = 'btn-ghost';
      leaveBtn.style.cssText = 'font-size: 11px; padding: 6px 12px; color: var(--accent-red); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-lg);';
      leaveBtn.textContent = '👋 Etkinlikten Ayrıl';
      leaveBtn.addEventListener('click', () => {
        EventsScreen.leaveEvent(eventId);
        this.closeChat();
      });
      eventActionsEl.appendChild(leaveBtn);
    }

    // Render messages
    this.renderEventChatMessages(chat);

    const chatView = document.getElementById('chatView');
    if (chatView) chatView.classList.add('active');
  },

  renderEventChatMessages(chat) {
    const msgsEl = document.getElementById('chatMessages');
    if (!msgsEl) return;
    msgsEl.innerHTML = '';

    if (chat && chat.messages) {
      chat.messages.forEach(msg => {
        const isSent = msg.senderId === CURRENT_USER.id;
        const isSystem = msg.isSystem;
        const row = document.createElement('div');

        if (isSystem) {
          row.className = 'chat-message-row chat-message-row--system';
          row.innerHTML = `<div class="chat-bubble chat-bubble--system">${msg.text}</div>`;
        } else {
          row.className = `chat-message-row ${isSent ? 'chat-message-row--sent' : 'chat-message-row--received'}`;
          row.innerHTML = `
            ${!isSent ? `<div class="chat-bubble__sender">${msg.senderName}</div>` : ''}
            <div class="chat-bubble ${isSent ? 'chat-bubble--sent' : 'chat-bubble--received'}">${msg.text}</div>
            <div class="chat-bubble__time">${msg.time}</div>
          `;
        }
        msgsEl.appendChild(row);
      });
    }

    requestAnimationFrame(() => {
      msgsEl.scrollTop = msgsEl.scrollHeight;
    });
  },

  closeChat() {
    this.currentChat = null;
    this.currentEventChat = null;
    this.hideTypingIndicator();
    const chatView = document.getElementById('chatView');
    if (chatView) chatView.classList.remove('active');
  },

  PERSONA_REPLIES: {
    // Elif (id: 2 - Fotoğrafçı, Beşiktaş)
    2: [
      "Yarın Ortaköy'de ışık çok iyi olur, makineyi kapıp geliyorum! 📷",
      "Harika! Boğaz kenarında bir kahve de içeriz ☕",
      "Süper, saat 3 gibi buluşsak uyar mı sana?",
      "Fotoğrafları çektikten sonra sana da atarım, çok güzel kareler yakalayacağız! ✨",
      "Aynen öyle! Sahil hattı yürümek ve çekim yapmak için efsane."
    ],
    // Zeynep (id: 4 - Board Game, Kadıköy)
    4: [
      "Catan'ı çantaya attım bile! 🎲",
      "Kadıköy Moda'da masaları geniş ve çok tatlı bir kafe var, oraya geçelim.",
      "Zarlarda şansıma güvenirim baştan söyleyeyim 😄",
      "Ticket to Ride da getirebilirim istersen, ne dersin?",
      "Anlaştık! Çaylar kahveler masaya geldikten sonra başlarız oyuna 🎯"
    ],
    // Burak (id: 3 - FIFA, Taksim)
    3: [
      "Hangi takımı alıyorsun ona göre hazırlanayım? 😎🎮",
      "Akşam 8'de PS kafedeyiz, turnuva modu açıyoruz!",
      "Kaybeden hesabı öder turnuvada, iddialıyım!",
      "Kadroları güncelledim bile, maç efsane geçecek! ⚽",
      "Görüşürüz akşam, kolu iyi olan kazansın!"
    ],
    // Can (id: 5 - Spor, Bostancı)
    5: [
      "Sabah 7'de Caddebostan sahilinde buluşuyoruz, tempoyu sen belirlersin! 🏃‍♂️",
      "Harika, spor ayakkabıları hazırla! Mat da getirebilirsin istersen.",
      "Koşu sonrası taze portakal suyu içeriz sahil kafede, çok iyi gelir 🍊"
    ],
    // Default 1-on-1 replies
    'default': [
      "Harika fikir, bana uyar! 😊",
      "Süper, nerede buluşuyoruz tam olarak?",
      "Çok sevindim! Saat kaç gibi buluşalım?",
      "Tamamdır, haberleşiriz o zaman! 👍",
      "Aynen öyle, ben de tam bunu düşünüyordum! ✨",
      "Bana her türlü uyar, sen planı yap ben gelirim 🙌"
    ]
  },

  GROUP_REPLIES: [
    "Ben de geliyorum kesinlikle! 🙋‍♂️",
    "Harika haber, kaçta buluşuyoruz peki?",
    "Ben Kadıköy vapurundayım, yetişirim her türlü!",
    "Gelirken almam gereken bir şey var mı?",
    "Mekanın tam adresini gruptan paylaşabilir misiniz?",
    "Süper ekip oldu, çok eğlenceli geçecek! 🎉",
    "Ben de oradayım, 10 dakika gecikebilirim ama kusura bakmayın!",
    "Tamamdır, orada görüşürüz millet! 🚀"
  ],

  showTypingIndicator(name) {
    this.hideTypingIndicator();
    const msgsEl = document.getElementById('chatMessages');
    if (!msgsEl) return;

    const row = document.createElement('div');
    row.id = 'chatTypingRow';
    row.className = 'chat-typing-row';
    row.innerHTML = `
      <div class="chat-typing-label">${name} yazıyor...</div>
      <div class="chat-typing-bubble">
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
      </div>
    `;
    msgsEl.appendChild(row);
    requestAnimationFrame(() => {
      msgsEl.scrollTop = msgsEl.scrollHeight;
    });
  },

  hideTypingIndicator() {
    const el = document.getElementById('chatTypingRow');
    if (el) el.remove();
  },

  queueMatchReply(match) {
    const userId = match.user ? match.user.id : null;
    const replies = (userId && this.PERSONA_REPLIES[userId])
      ? this.PERSONA_REPLIES[userId]
      : this.PERSONA_REPLIES['default'];
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    // Show typing after 600ms
    setTimeout(() => {
      if (this.currentChat && this.currentChat.id === match.id) {
        this.showTypingIndicator(match.user.name);
      }
    }, 600);

    // Deliver reply after 2200ms
    setTimeout(() => {
      this.hideTypingIndicator();
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (!match.messages) match.messages = [];
      match.messages.push({
        id: Date.now(),
        sender: 'them',
        text: replyText,
        time: timeStr
      });
      match.lastMessage = replyText;
      match.timestamp = timeStr;

      if (this.currentChat && this.currentChat.id === match.id) {
        this.renderChatMessages(match);
      } else {
        match.unread = (match.unread || 0) + 1;
        App.showToast(`💬 ${match.user.name}: ${replyText}`, '💬');
      }

      this.renderMatchesList();
      this.updateNavBadge();
    }, 2200);
  },

  queueEventReply(event, chat) {
    // Pick another member from event
    const otherMembers = event.members.filter(m => m.id !== CURRENT_USER.id);
    const sender = otherMembers.length > 0
      ? otherMembers[Math.floor(Math.random() * otherMembers.length)]
      : { id: 999, name: 'Katılımcı' };

    const replyText = this.GROUP_REPLIES[Math.floor(Math.random() * this.GROUP_REPLIES.length)];

    // Show typing after 700ms
    setTimeout(() => {
      if (this.currentEventChat && this.currentEventChat.event.id === event.id) {
        this.showTypingIndicator(sender.name);
      }
    }, 700);

    // Deliver reply after 2400ms
    setTimeout(() => {
      this.hideTypingIndicator();
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (!chat.messages) chat.messages = [];
      chat.messages.push({
        id: Date.now(),
        senderId: sender.id,
        senderName: sender.name,
        text: replyText,
        time: timeStr
      });

      if (this.currentEventChat && this.currentEventChat.event.id === event.id) {
        this.renderEventChatMessages(chat);
      } else {
        chat.unread = (chat.unread || 0) + 1;
        App.showToast(`👥 ${event.title} • ${sender.name}: ${replyText}`, '🎪');
      }

      this.renderMatchesList();
      this.updateNavBadge();
    }, 2400);
  },

  renderChatMessages(match) {
    const msgsEl = document.getElementById('chatMessages');
    if (!msgsEl) return;

    msgsEl.innerHTML = '';

    if (match.messages) {
      match.messages.forEach(msg => {
        const isSent = msg.sender === 'me';
        const row = document.createElement('div');
        row.className = `chat-message-row ${isSent ? 'chat-message-row--sent' : 'chat-message-row--received'}`;

        row.innerHTML = `
          <div class="chat-bubble ${isSent ? 'chat-bubble--sent' : 'chat-bubble--received'}">${msg.text}</div>
          <div class="chat-bubble__time">${msg.time}</div>
        `;
        msgsEl.appendChild(row);
      });
    }

    // Scroll to bottom
    requestAnimationFrame(() => {
      msgsEl.scrollTop = msgsEl.scrollHeight;
    });
  },

  sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (this.currentEventChat) {
      // Event group chat message
      let chat = this.currentEventChat.chat;
      const event = this.currentEventChat.event;
      if (!chat) {
        chat = { eventId: event.id, messages: [] };
        EVENT_CHATS.push(chat);
        this.currentEventChat.chat = chat;
      }
      chat.messages.push({
        id: Date.now(),
        senderId: CURRENT_USER.id,
        senderName: CURRENT_USER.name,
        text,
        time: timeStr,
      });
      input.value = '';
      this.renderEventChatMessages(chat);
      this.renderMatchesList();

      // Trigger simulated reply from an event member!
      this.queueEventReply(event, chat);
    } else if (this.currentChat) {
      // Regular 1-on-1 chat message
      const match = this.currentChat;
      if (!match.messages) match.messages = [];
      match.messages.push({ text, time: timeStr, sender: 'me' });
      match.lastMessage = text;
      match.timestamp = timeStr;
      input.value = '';
      this.renderChatMessages(match);
      this.renderMatchesList();

      // Trigger simulated persona reply!
      this.queueMatchReply(match);
    }
  },

  updateNavBadge() {
    const matchUnread = MATCHES.reduce((sum, m) => sum + (m.unread || 0), 0);
    const eventUnread = (typeof EVENT_CHATS !== 'undefined' ? EVENT_CHATS : []).reduce((sum, c) => sum + (c.unread || 0), 0);
    const totalUnread = matchUnread + eventUnread;
    const badge = document.getElementById('msgBadge');
    if (badge) {
      if (totalUnread > 0) {
        badge.textContent = totalUnread;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  },
};
