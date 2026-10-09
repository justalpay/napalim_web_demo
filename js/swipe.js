// =============================================
// PinDrop — Swipe / Keşfet Screen
// =============================================

const SwipeScreen = {
  users: [],
  currentIndex: 0,
  isDragging: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  topCard: null,

  init() {
    this.users = [...USERS];
    this.currentIndex = 0;
    this.renderCards();
    this.setupButtons();
  },

  setupButtons() {
    const btnReject = document.getElementById('btnReject');
    const btnAccept = document.getElementById('btnAccept');
    const btnSuper = document.getElementById('btnSuper');

    if (btnReject) btnReject.addEventListener('click', () => this.swipeLeft());
    if (btnAccept) btnAccept.addEventListener('click', () => this.swipeRight());
    if (btnSuper) btnSuper.addEventListener('click', () => this.swipeUp());
  },

  renderCards() {
    const container = document.getElementById('swipeContainer');
    if (!container) return;

    container.innerHTML = '';

    const remaining = this.users.slice(this.currentIndex, this.currentIndex + 3);

    if (remaining.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">👀</div>
          <div class="empty-state__title">Şimdilik bu kadar!</div>
          <div class="empty-state__text">Daha sonra tekrar bak, yeni insanlar sürekli ekleniyor.</div>
        </div>
      `;
      const actions = document.getElementById('swipeActions');
      if (actions) actions.style.display = 'none';
      return;
    }

    // Show actions
    const actions = document.getElementById('swipeActions');
    if (actions) actions.style.display = '';

    // Render cards (first = top, last = bottom)
    remaining.forEach((user, idx) => {
      const card = this.createCard(user, idx);
      container.appendChild(card);
    });

    this.topCard = container.firstElementChild;
    if (this.topCard) {
      this.setupDragHandlers(this.topCard);
    }
  },

  createCard(user, stackIndex) {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.dataset.id = user.id;
    card.style.setProperty('--stack-index', stackIndex);

    if (stackIndex === 0) card.style.zIndex = 3;
    else if (stackIndex === 1) {
      card.style.zIndex = 2;
      card.style.transform = 'scale(0.95) translateY(10px)';
    } else {
      card.style.zIndex = 1;
      card.style.transform = 'scale(0.9) translateY(20px)';
    }

    const tags = user.interests
      .map(t => `<span class="swipe-card__tag">${t}</span>`)
      .join('');

    card.innerHTML = `
      <div class="swipe-card__background" style="background-image: url('${user.avatar}')"></div>
      <div class="swipe-card__gradient"></div>
      
      <div class="swipe-card__distance">📍 ${user.distance}</div>
      
      <div class="swipe-card__content">
        <div class="swipe-card__name">${user.name}, ${user.age}</div>
        <div class="swipe-card__location">📍 ${user.location}</div>
        <div class="swipe-card__bio">${user.bio}</div>
        <div class="swipe-card__tags">${tags}</div>
      </div>

      <div class="swipe-card__overlay swipe-card__overlay--left">
        <div class="swipe-card__overlay-icon">✗</div>
        <div class="swipe-card__overlay-text">Geç</div>
      </div>
      <div class="swipe-card__overlay swipe-card__overlay--right">
        <div class="swipe-card__overlay-icon">✓</div>
        <div class="swipe-card__overlay-text">Beğen</div>
      </div>
      <div class="swipe-card__overlay swipe-card__overlay--up">
        <div class="swipe-card__overlay-icon">⭐</div>
        <div class="swipe-card__overlay-text">Süper</div>
      </div>
    `;

    return card;
  },

  setupDragHandlers(card) {
    const onDown = (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      card.setPointerCapture(e.pointerId);
      card.classList.add('swiping');
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      this.currentX = e.clientX - this.startX;
      this.currentY = e.clientY - this.startY;

      const rotate = this.currentX / 15;
      card.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotate}deg)`;

      // Update overlays
      const leftOv = card.querySelector('.swipe-card__overlay--left');
      const rightOv = card.querySelector('.swipe-card__overlay--right');
      const upOv = card.querySelector('.swipe-card__overlay--up');

      if (leftOv) leftOv.style.opacity = 0;
      if (rightOv) rightOv.style.opacity = 0;
      if (upOv) upOv.style.opacity = 0;

      if (this.currentX > 50 && rightOv) {
        rightOv.style.opacity = Math.min(this.currentX / 100, 1);
      } else if (this.currentX < -50 && leftOv) {
        leftOv.style.opacity = Math.min(Math.abs(this.currentX) / 100, 1);
      }
      if (this.currentY < -50 && upOv) {
        upOv.style.opacity = Math.min(Math.abs(this.currentY) / 80, 1);
      }
    };

    const onUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      card.releasePointerCapture(e.pointerId);
      card.classList.remove('swiping');

      if (this.currentX > 100) {
        this.swipeRight();
      } else if (this.currentX < -100) {
        this.swipeLeft();
      } else if (this.currentY < -80) {
        this.swipeUp();
      } else {
        // Spring back
        card.style.transform = '';
        card.querySelectorAll('.swipe-card__overlay').forEach(ov => ov.style.opacity = 0);
      }

      this.currentX = 0;
      this.currentY = 0;
    };

    card.addEventListener('pointerdown', onDown);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerup', onUp);
    card.addEventListener('pointercancel', onUp);
  },

  swipeRight() { this.removeTopCard('swipe-right'); },
  swipeLeft() { this.removeTopCard('swipe-left'); },
  swipeUp() { this.removeTopCard('swipe-up'); },

  removeTopCard(direction) {
    if (!this.topCard) return;

    const card = this.topCard;
    const user = this.users[this.currentIndex];
    this.topCard = null;

    // Show appropriate overlay on button clicks
    const overlays = card.querySelectorAll('.swipe-card__overlay');
    overlays.forEach(ov => ov.style.opacity = 0);

    if (direction === 'swipe-right') {
      const ov = card.querySelector('.swipe-card__overlay--right');
      if (ov) ov.style.opacity = 1;
    } else if (direction === 'swipe-left') {
      const ov = card.querySelector('.swipe-card__overlay--left');
      if (ov) ov.style.opacity = 1;
    } else if (direction === 'swipe-up') {
      const ov = card.querySelector('.swipe-card__overlay--up');
      if (ov) ov.style.opacity = 1;
    }

    card.style.transform = '';
    card.classList.add(direction);

    setTimeout(() => {
      this.currentIndex++;
      this.renderCards();

      // 30% match chance on right/super swipe
      if (user && (direction === 'swipe-right' || direction === 'swipe-up')) {
        if (Math.random() < 0.3) {
          App.showMatchOverlay(user);
        }
      }
    }, 400);
  },
};
