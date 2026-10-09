// =============================================
// PinDrop — Profile Screen
// =============================================

const ProfileScreen = {
  selectedAvatar: null,
  selectedInterests: new Set(),
  modalInitialized: false,

  AVATAR_PRESETS: [
    { id: 'cat', src: 'assets/avatars/cyber_cat.jpg', label: 'Siber Kedi' },
    { id: 'astro', src: 'assets/avatars/astronaut.jpg', label: 'Astronot' },
    { id: 'robot', src: 'assets/avatars/robot.jpg', label: 'Robot' },
    { id: 'fox', src: 'assets/avatars/neon_fox.jpg', label: 'Neon Tilki' },
    { id: 'default', src: null, label: 'Degrade' },
  ],

  ALL_INTERESTS: [
    'Kafe Keşfi', 'Oyun', 'Müzik', 'Fotoğraf', 'Yürüyüş',
    'Sanat', 'Spor', 'Teknoloji', 'Catan', 'Okey', 'FIFA',
    'Doğa', 'Kitap', 'Yemek'
  ],

  init() {
    this.render();
    this.setupEditModal();
  },

  render() {
    const container = document.getElementById('profileContainer');
    if (!container) return;

    const user = CURRENT_USER;
    const avatarGradient = getAvatarColor(user.name);
    const initials = getInitials(user.name);

    const hasPhoto = !!user.avatar;
    const avatarHtml = hasPhoto
      ? `<div class="avatar avatar--xl" style="background-image: url('${user.avatar}'); background-size: cover; background-position: center; border: 2px solid var(--accent-purple); position: relative; z-index: 1;"></div>`
      : `<div class="avatar avatar--xl" style="background: ${avatarGradient}; position: relative; z-index: 1;">${initials}</div>`;

    const locationHtml = (!user.hideLocation && user.location && user.location.trim())
      ? `<div class="profile-location">📍 ${user.location}</div>`
      : '';

    const ageStr = user.age ? `, ${user.age}` : '';

    container.innerHTML = `
      <div class="profile-header stagger-children">
        <div class="profile-avatar-glow"></div>
        ${avatarHtml}
        <div class="profile-name">${user.name}${ageStr}</div>
        ${locationHtml}
        <div class="profile-bio">${user.bio || 'İstanbul\'u keşfetmeyi seven biri 🌆'}</div>
        <button class="btn-ghost profile-edit-btn" id="openEditProfileBtn">✏️ Profili Düzenle</button>
      </div>

      <div class="profile-stats glass-card">
        ${this.renderStats(user.stats)}
      </div>

      <div class="profile-section">
        <div class="profile-section__title">İlgi Alanları</div>
        <div class="profile-interests stagger-children">
          ${this.renderInterests(user.interests || [])}
        </div>
      </div>

      <div class="profile-section">
        <div class="profile-section__title">Pinlerim</div>
        <div class="profile-pins-list stagger-children">
          ${this.renderMyPins()}
        </div>
      </div>

      <div class="profile-section">
        <div class="profile-section__title">Ayarlar</div>
        <div class="profile-settings glass-card">
          ${this.renderSettings()}
        </div>
      </div>

      <div class="profile-footer">PinDrop v1.0 — İstanbul</div>
    `;

    this.attachEvents();
  },

  renderStats(stats) {
    return `
      <div class="profile-stat">
        <div class="profile-stat-number">${stats.pins}</div>
        <div class="profile-stat-label">Pin</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-number">${stats.matches}</div>
        <div class="profile-stat-label">Eşleşme</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-number">${stats.discoveries}</div>
        <div class="profile-stat-label">Keşif</div>
      </div>
    `;
  },

  renderInterests(interests) {
    const icons = {
      'Kafe Keşfi': '☕', 'Oyun': '🎮', 'Müzik': '🎵', 'Fotoğraf': '📷',
      'Yürüyüş': '🚶', 'Sanat': '🎨', 'Spor': '🏃', 'Teknoloji': '💻',
      'Yemek': '🍔', 'Doğa': '🌲', 'Kitap': '📚', 'Catan': '🎲', 'Okey': '🀄', 'FIFA': '⚽'
    };

    return interests.map(interest => {
      const icon = icons[interest] || '✨';
      return `<div class="profile-interest-tag"><span>${icon}</span> <span>${interest}</span></div>`;
    }).join('');
  },

  renderMyPins() {
    const myPins = PINS.slice(0, 4);

    return myPins.map(pin => {
      const cat = CATEGORIES.find(c => c.id === pin.category);
      const icon = cat ? cat.icon : '📍';
      const color = cat ? cat.color : 'var(--accent-purple)';
      const desc = pin.description.length > 50
        ? pin.description.slice(0, 50) + '...'
        : pin.description;

      return `
        <div class="profile-pin-item glass-card">
          <div class="profile-pin-icon" style="background: ${color}22; color: ${color};">${icon}</div>
          <div class="profile-pin-info">
            <div class="profile-pin-desc">${desc}</div>
            <div class="profile-pin-time">${pin.createdAt}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderSettings() {
    const settings = [
      { id: 'setting-location', label: 'Konumumu Göster', active: true },
      { id: 'setting-notifications', label: 'Bildirimler', active: true },
      { id: 'setting-distance', label: 'Mesafe Göster', active: true },
    ];

    return settings.map(s => `
      <div class="profile-setting-item">
        <span class="profile-setting-label">${s.label}</span>
        <div class="profile-setting-toggle ${s.active ? 'active' : ''}" id="${s.id}"></div>
      </div>
    `).join('');
  },

  attachEvents() {
    // Toggle switches
    document.querySelectorAll('.profile-setting-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const isOn = toggle.classList.contains('active');
        const label = toggle.parentElement.querySelector('.profile-setting-label').textContent;
        App.showToast(`${label} ${isOn ? 'açıldı' : 'kapatıldı'}`, isOn ? '🔔' : '🔕');
      });
    });

    // Open Edit Profile modal
    const editBtn = document.getElementById('openEditProfileBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.openEditModal());
    }
  },

  setupEditModal() {
    if (this.modalInitialized) return;
    this.modalInitialized = true;

    const modal = document.getElementById('editProfileModal');
    const modalBg = document.getElementById('editProfileModalBg');
    const cancelBtn = document.getElementById('cancelEditProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    const fileInput = document.getElementById('avatarFileInput');

    if (!modal) return;

    if (modalBg) modalBg.addEventListener('click', () => this.closeEditModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeEditModal());

    // File upload button
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            this.selectedAvatar = loadEvent.target.result;
            this.updateEditAvatarPreview();
            this.updatePresetSelection();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Save button
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveProfile());
    }
  },

  openEditModal() {
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;

    const user = CURRENT_USER;
    this.selectedAvatar = user.avatar || null;
    this.selectedInterests = new Set(user.interests || []);

    // Fill form inputs
    const nameInput = document.getElementById('profileNameInput');
    const ageInput = document.getElementById('profileAgeInput');
    const locInput = document.getElementById('profileLocationInput');
    const hideLocCheck = document.getElementById('hideLocationCheckbox');
    const bioInput = document.getElementById('profileBioInput');

    if (nameInput) nameInput.value = user.name || '';
    if (ageInput) ageInput.value = user.age || '';
    if (locInput) locInput.value = user.location || '';
    if (hideLocCheck) hideLocCheck.checked = !!user.hideLocation;
    if (bioInput) bioInput.value = user.bio || '';

    // Render presets grid
    this.renderAvatarPresets();
    this.updateEditAvatarPreview();

    // Render interest chips
    this.renderEditInterests();

    modal.classList.add('active');
  },

  closeEditModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.classList.remove('active');
  },

  renderAvatarPresets() {
    const grid = document.getElementById('avatarPresetsGrid');
    if (!grid) return;

    grid.innerHTML = this.AVATAR_PRESETS.map(preset => {
      if (preset.src) {
        return `
          <div class="avatar-preset-item" data-preset-id="${preset.id}" title="${preset.label}">
            <img src="${preset.src}" alt="${preset.label}">
          </div>
        `;
      } else {
        const grad = getAvatarColor(CURRENT_USER.name);
        return `
          <div class="avatar-preset-item" data-preset-id="${preset.id}" title="${preset.label}" style="background: ${grad}; color: white; font-weight: 700; font-size: 14px;">
            ${getInitials(CURRENT_USER.name)}
          </div>
        `;
      }
    }).join('');

    grid.querySelectorAll('.avatar-preset-item').forEach(item => {
      item.addEventListener('click', () => {
        const presetId = item.dataset.presetId;
        const preset = this.AVATAR_PRESETS.find(p => p.id === presetId);
        if (preset) {
          this.selectedAvatar = preset.src;
          this.updateEditAvatarPreview();
          this.updatePresetSelection();
        }
      });
    });

    this.updatePresetSelection();
  },

  updatePresetSelection() {
    const items = document.querySelectorAll('.avatar-preset-item');
    items.forEach(item => {
      const presetId = item.dataset.presetId;
      const preset = this.AVATAR_PRESETS.find(p => p.id === presetId);
      if (preset && preset.src === this.selectedAvatar) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  },

  updateEditAvatarPreview() {
    const preview = document.getElementById('editAvatarPreview');
    if (!preview) return;

    if (this.selectedAvatar) {
      preview.style.background = '';
      preview.style.backgroundImage = `url('${this.selectedAvatar}')`;
      preview.style.backgroundSize = 'cover';
      preview.style.backgroundPosition = 'center';
      preview.textContent = '';
    } else {
      preview.style.backgroundImage = '';
      preview.style.background = getAvatarColor(CURRENT_USER.name);
      preview.textContent = getInitials(CURRENT_USER.name);
    }
  },

  renderEditInterests() {
    const grid = document.getElementById('editInterestsGrid');
    if (!grid) return;

    grid.innerHTML = this.ALL_INTERESTS.map(interest => {
      const isSelected = this.selectedInterests.has(interest);
      return `<button type="button" class="edit-interest-chip ${isSelected ? 'selected' : ''}" data-interest="${interest}">${interest}</button>`;
    }).join('');

    grid.querySelectorAll('.edit-interest-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.interest;
        if (this.selectedInterests.has(val)) {
          this.selectedInterests.delete(val);
          chip.classList.remove('selected');
        } else {
          this.selectedInterests.add(val);
          chip.classList.add('selected');
        }
      });
    });
  },

  saveProfile() {
    const nameInput = document.getElementById('profileNameInput');
    const ageInput = document.getElementById('profileAgeInput');
    const locInput = document.getElementById('profileLocationInput');
    const hideLocCheck = document.getElementById('hideLocationCheckbox');
    const bioInput = document.getElementById('profileBioInput');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      App.showToast('Lütfen adınızı girin!', '⚠️');
      return;
    }

    CURRENT_USER.name = name;
    if (ageInput && ageInput.value) {
      CURRENT_USER.age = parseInt(ageInput.value) || CURRENT_USER.age;
    }
    if (locInput) {
      CURRENT_USER.location = locInput.value.trim();
    }
    if (hideLocCheck) {
      CURRENT_USER.hideLocation = hideLocCheck.checked;
    }
    if (bioInput) {
      CURRENT_USER.bio = bioInput.value.trim();
    }

    CURRENT_USER.avatar = this.selectedAvatar;
    CURRENT_USER.interests = [...this.selectedInterests];

    this.closeEditModal();
    this.render();
    App.showToast('Profilin başarıyla güncellendi! ✨', '✅');
  },
};
