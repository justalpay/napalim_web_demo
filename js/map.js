// =============================================
// PinDrop — Map Screen
// =============================================

const MapScreen = {
  map: null,
  markers: [],
  activeFilter: 'all',
  searchQuery: '',
  isAddingPin: false,
  selectedLocation: null,
  userLocation: [29.025, 40.990],
  popupEl: null,
  selectedCategory: null,

  DISTRICT_CENTERS: {
    'kadıköy': [29.0255, 40.9912],
    'beşiktaş': [29.0065, 41.0428],
    'taksim': [28.9840, 41.0360],
    'beyoğlu': [28.9765, 41.0335],
    'üsküdar': [29.0155, 41.0255],
    'bostancı': [29.0940, 40.9635],
    'karaköy': [28.9750, 41.0200],
    'bakırköy': [28.8700, 40.9800],
    'bebek': [29.0440, 41.0770],
    'sarıyer': [29.0550, 41.1680],
    'moda': [29.0270, 40.9840],
    'caddebostan': [29.0600, 40.9680],
  },

  init() {
    this.initMap();
    this.setupSearchBar();
    this.setupFilters();
    this.setupButtons();
    this.setupModal();
  },

  initMap() {
    this.map = new maplibregl.Map({
      container: 'mapContainer',
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [29.0, 41.01],
      zoom: 10,
      attributionControl: false,
    });

    this.map.on('load', () => {
      this.map.resize();

      // Add GeoJSON route source and layers
      if (!this.map.getSource('route-line')) {
        this.map.addSource('route-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [] }
          }
        });

        // Glow layer
        this.map.addLayer({
          id: 'route-line-glow',
          type: 'line',
          source: 'route-line',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ec4899',
            'line-width': 7,
            'line-opacity': 0.45,
            'line-blur': 3
          }
        });

        // Core neon dashed line
        this.map.addLayer({
          id: 'route-line-core',
          type: 'line',
          source: 'route-line',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#c084fc',
            'line-width': 3.5,
            'line-dasharray': [2, 2],
            'line-opacity': 0.95
          }
        });
      }

      // Fly-in animation
      this.map.flyTo({
        zoom: 11.5,
        duration: 2000,
        essential: true,
      });

      this.addPins();
      this.addUserLocation();
      this.updatePinCount();
      this.setupPopup();

      // Re-cluster on zoom change
      this.map.on('zoomend', () => this.addPins());

      this.map.on('click', (e) => {
        if (this.isAddingPin) {
          this.selectedLocation = [e.lngLat.lng, e.lngLat.lat];
          this.savePin(); // Save immediately when location is picked
        } else {
          this.closePopup();
        }
      });
    });
  },

  getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  formatDistance(distKm) {
    const walkMins = Math.max(1, Math.round((distKm / 4.5) * 60));
    const distText = distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`;
    return { distText, walkMins };
  },

  drawRoute(targetLngLat) {
    if (!this.map || !this.map.getSource('route-line')) return;
    this.map.getSource('route-line').setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [this.userLocation, targetLngLat]
      }
    });
  },

  clearRoute() {
    if (!this.map || !this.map.getSource('route-line')) return;
    this.map.getSource('route-line').setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: [] }
    });
  },

  setupSearchBar() {
    const input = document.getElementById('mapSearchInput');
    const clearBtn = document.getElementById('mapSearchClearBtn');
    if (!input) return;

    input.addEventListener('input', () => {
      const val = input.value.trim();
      this.searchQuery = val;
      if (clearBtn) {
        clearBtn.style.display = val.length > 0 ? 'flex' : 'none';
      }

      // Check if matches known district
      const lower = val.toLowerCase();
      for (const [district, coords] of Object.entries(this.DISTRICT_CENTERS)) {
        if (lower === district || (lower.length >= 4 && district.startsWith(lower))) {
          this.map.flyTo({ center: coords, zoom: 14, duration: 1200 });
          break;
        }
      }

      this.addPins();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        this.addPins();
      });
    }
  },

  addPins() {
    // Clear existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const q = this.searchQuery ? this.searchQuery.toLowerCase().trim() : '';

    const matchesSearch = (item) => {
      if (!q) return true;
      const text = `${item.title || ''} ${item.description || ''} ${item.location || ''}`.toLowerCase();
      const cat = CATEGORIES.find(c => c.id === item.category);
      const catName = cat ? cat.name.toLowerCase() : '';
      return text.includes(q) || catName.includes(q);
    };

    const pinsToShow = (this.activeFilter === 'all'
      ? PINS
      : PINS.filter(p => p.category === this.activeFilter)
    ).filter(matchesSearch);

    const activeEvents = (typeof EVENTS !== 'undefined' ? EVENTS : []).filter(e => {
      if (e.status !== 'active') return false;
      if (e.expiresAt <= Date.now()) return false;
      if (this.activeFilter !== 'all' && e.category !== this.activeFilter) return false;
      return e.lat && e.lng && matchesSearch(e);
    });

    // Combine into unified items list
    const allItems = [
      ...pinsToShow.map(p => ({ type: 'pin', data: p, lng: p.lng, lat: p.lat })),
      ...activeEvents.map(e => ({ type: 'event', data: e, lng: e.lng, lat: e.lat }))
    ];

    const currentZoom = this.map ? this.map.getZoom() : 12;

    if (currentZoom < 12.8 && allItems.length > 2) {
      // Cluster nearby items on screen
      const clusters = this.computeClusters(allItems, 55);
      clusters.forEach(cluster => {
        if (cluster.items.length === 1) {
          const item = cluster.items[0];
          if (item.type === 'pin') this.renderPinMarker(item.data);
          else this.renderEventMarker(item.data);
        } else {
          this.renderClusterMarker(cluster);
        }
      });
    } else {
      // Render individually
      pinsToShow.forEach(pin => this.renderPinMarker(pin));
      activeEvents.forEach(event => this.renderEventMarker(event));
    }

    this.updatePinCount(allItems.length);
  },

  computeClusters(items, pixelRadius = 55) {
    if (!this.map) return items.map(item => ({ items: [item], lng: item.lng, lat: item.lat }));

    const points = items.map(item => {
      const pos = this.map.project([item.lng, item.lat]);
      return { item, x: pos.x, y: pos.y };
    });

    const visited = new Set();
    const clusters = [];

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;
      visited.add(i);

      const cluster = {
        items: [points[i].item],
        x: points[i].x,
        y: points[i].y,
        lng: points[i].item.lng,
        lat: points[i].item.lat,
      };

      for (let j = i + 1; j < points.length; j++) {
        if (visited.has(j)) continue;
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= pixelRadius) {
          visited.add(j);
          cluster.items.push(points[j].item);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  },

  renderClusterMarker(cluster) {
    const el = document.createElement('div');
    el.className = 'map-marker map-marker--cluster';
    el.style.width = '40px';
    el.style.height = '40px';
    el.innerHTML = `
      <div class="cluster-content">${cluster.items.length}</div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.map.flyTo({
        center: [cluster.lng, cluster.lat],
        zoom: Math.min(15, this.map.getZoom() + 2),
        duration: 700
      });
    });

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([cluster.lng, cluster.lat])
      .addTo(this.map);

    this.markers.push(marker);
  },

  renderPinMarker(pin) {
    const category = CATEGORIES.find(c => c.id === pin.category);
    if (!category) return;

    const el = document.createElement('div');
    el.className = 'map-marker';
    el.dataset.category = category.id;
    el.style.width = '34px';
    el.style.height = '34px';
    el.innerHTML = `
      <div class="map-marker__content" style="--marker-color: ${category.color};">
        <span class="map-marker__icon">${category.icon}</span>
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isAddingPin) {
        this.showPopup(pin, category);
      }
    });

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([pin.lng, pin.lat])
      .addTo(this.map);

    this.markers.push(marker);
  },

  renderEventMarker(event) {
    const category = CATEGORIES.find(c => c.id === event.category);
    const catColor = category ? category.color : 'var(--accent-purple)';

    const el = document.createElement('div');
    el.className = 'map-marker map-marker--event';
    el.style.width = '38px';
    el.style.height = '38px';
    el.innerHTML = `
      <div class="map-marker__content" style="--marker-color: ${catColor};">
        <span class="map-marker__icon">🎪</span>
      </div>
      <div class="event-badge">72s</div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isAddingPin) {
        this.showEventPopup(event);
      }
    });

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([event.lng, event.lat])
      .addTo(this.map);

    this.markers.push(marker);
  },

  addUserLocation() {
    const el = document.createElement('div');
    el.className = 'map-marker--user';
    el.style.width = '16px';
    el.style.height = '16px';

    new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(this.userLocation)
      .addTo(this.map);
  },

  setupFilters() {
    const filtersContainer = document.getElementById('mapFilters');
    if (!filtersContainer) return;

    filtersContainer.querySelectorAll('.map-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        filtersContainer.querySelectorAll('.map-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const category = chip.dataset.category;
        this.activeFilter = category;

        // Fade transition
        const mapEl = document.getElementById('mapContainer');
        if (mapEl) {
          mapEl.style.opacity = '0.6';
          mapEl.style.transition = 'opacity 0.2s';
          setTimeout(() => {
            this.addPins();
            mapEl.style.opacity = '1';
          }, 200);
        }
      });
    });
  },

  setupButtons() {
    const fab = document.getElementById('addPinBtn');
    if (fab) {
      fab.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isAddingPin) {
          this.exitAddPinMode();
        } else {
          this.showAddPinModal();
        }
      });
    }

    const locateBtn = document.getElementById('locateBtn');
    if (locateBtn) {
      locateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.map.flyTo({
          center: this.userLocation,
          zoom: 14,
          duration: 1500,
        });
      });
    }
  },

  setupPopup() {
    this.popupEl = document.createElement('div');
    this.popupEl.className = 'map-popup';
    this.popupEl.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    const mapEl = document.getElementById('mapContainer');
    if (mapEl) {
      mapEl.appendChild(this.popupEl);
    }
  },

  isPinLiked(pinId) {
    if (!this.likedPinIds) {
      try {
        this.likedPinIds = new Set(JSON.parse(localStorage.getItem('likedPins') || '[]'));
      } catch (e) {
        this.likedPinIds = new Set();
      }
    }
    return this.likedPinIds.has(pinId);
  },

  toggleLikePin(pin, category) {
    const isLiked = this.isPinLiked(pin.id);

    if (isLiked) {
      // Unlike
      this.likedPinIds.delete(pin.id);
      pin.upvotes = Math.max(0, (pin.upvotes || 0) - 1);
      App.showToast('Beğeni geri alındı', '🤍');
    } else {
      // Like
      this.likedPinIds.add(pin.id);
      pin.upvotes = (pin.upvotes || 0) + 1;
      App.showToast('Pini beğendin! ❤️', '👍');
    }

    try {
      localStorage.setItem('likedPins', JSON.stringify([...this.likedPinIds]));
    } catch (e) {}

    this.showPopup(pin, category);
  },

  showPopup(pin, category) {
    if (!this.popupEl || !this.map) return;

    // Draw route line from user location to pin
    this.drawRoute([pin.lng, pin.lat]);

    // Calculate distance
    const dist = this.formatDistance(
      this.getDistanceKm(this.userLocation[1], this.userLocation[0], pin.lat, pin.lng)
    );

    const updatePosition = () => {
      if (!this.map) return;
      const pos = this.map.project([pin.lng, pin.lat]);
      this.popupEl.style.left = `${pos.x}px`;
      this.popupEl.style.top = `${pos.y - 20}px`;
    };

    updatePosition();

    const isLiked = this.isPinLiked(pin.id);

    this.popupEl.innerHTML = `
      <div class="map-popup__header">
        <span class="map-popup__category" style="color: ${category.color};">
          ${category.icon} ${category.name}
        </span>
        <span class="map-popup__time">${pin.createdAt}</span>
      </div>
      <div class="map-popup__desc">${pin.description}</div>
      <div class="map-popup__route-info">
        <span class="map-popup__dist">🚶 ${dist.distText} (~${dist.walkMins} dk)</span>
        <button class="map-popup__directions-btn" id="pinDirectionsBtn">
          🧭 Yol Tarifi
        </button>
      </div>
      <div class="map-popup__footer">
        <span class="map-popup__like-count">
          ❤️ ${pin.upvotes} beğeni
        </span>
        <button class="map-popup__like-btn ${isLiked ? 'liked' : ''}" id="pinLikeBtn" title="${isLiked ? 'Beğeniyi geri al' : 'Pini beğen'}">
          <span>${isLiked ? '❤️' : '🤍'}</span>
          <span>${isLiked ? 'Beğendin' : 'Beğen'}</span>
        </button>
      </div>
    `;

    const likeBtn = this.popupEl.querySelector('#pinLikeBtn');
    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLikePin(pin, category);
      });
    }

    const directionsBtn = this.popupEl.querySelector('#pinDirectionsBtn');
    if (directionsBtn) {
      directionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`, '_blank');
      });
    }

    this.popupEl.classList.add('visible');

    // Remove old listener
    if (this._popupPositionFn) {
      this.map.off('move', this._popupPositionFn);
    }
    this._popupPositionFn = updatePosition;
    this.map.on('move', updatePosition);
  },

  showEventPopup(event) {
    if (!this.popupEl || !this.map) return;

    // Draw route line from user location to event
    this.drawRoute([event.lng, event.lat]);

    // Calculate distance
    const dist = this.formatDistance(
      this.getDistanceKm(this.userLocation[1], this.userLocation[0], event.lat, event.lng)
    );

    const time = EventsScreen.getTimeRemaining(event.expiresAt);
    const isMember = EventsScreen.isUserMember(event);
    const isFull = event.members.length >= event.maxMembers;

    const updatePosition = () => {
      if (!this.map) return;
      const pos = this.map.project([event.lng, event.lat]);
      this.popupEl.style.left = `${pos.x}px`;
      this.popupEl.style.top = `${pos.y - 25}px`;
    };

    updatePosition();

    let btnText = 'Katıl 🎪';
    let btnClass = 'btn-gradient';
    if (isMember) {
      btnText = 'Sohbete Git 💬';
    } else if (isFull) {
      btnText = 'Kontenjan Dolu';
      btnClass = 'btn-ghost';
    }

    let timerClass = '';
    if (time.urgent) timerClass = 'urgent';
    else if (time.warning) timerClass = 'warning';

    this.popupEl.innerHTML = `
      <div class="map-popup__header">
        <span class="map-popup__category" style="color: var(--accent-purple); font-weight: 700;">
          🎪 ${event.title}
        </span>
        <span class="event-card__timer ${timerClass}" style="font-size: 10px; padding: 2px 8px;">
          ⏳ ${time.text}
        </span>
      </div>
      <div class="map-popup__desc">${event.description}</div>
      <div class="map-popup__route-info">
        <span class="map-popup__dist">🚶 ${dist.distText} (~${dist.walkMins} dk)</span>
        <button class="map-popup__directions-btn" id="eventDirectionsBtn">
          🧭 Yol Tarifi
        </button>
      </div>
      <div style="font-size: var(--font-xs); color: var(--text-tertiary); margin-bottom: 10px;">
        📍 ${event.location} • 👥 ${event.members.length}/${event.maxMembers} kişi
      </div>
      <div class="map-popup__footer" style="padding-top: 4px;">
        <button id="eventPopupActionBtn" class="${btnClass}" style="width: 100%; padding: 8px 12px; font-size: var(--font-xs); border-radius: var(--radius-lg); cursor: pointer;">
          ${btnText}
        </button>
      </div>
    `;

    const actionBtn = this.popupEl.querySelector('#eventPopupActionBtn');
    if (actionBtn) {
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMember) {
          this.closePopup();
          App.switchScreen('screen-messages');
          MessagesScreen.openEventChat(event.id);
        } else if (!isFull) {
          EventsScreen.joinEvent(event.id);
          this.showEventPopup(event);
        }
      });
    }

    const directionsBtn = this.popupEl.querySelector('#eventDirectionsBtn');
    if (directionsBtn) {
      directionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`, '_blank');
      });
    }

    this.popupEl.classList.add('visible');

    if (this._popupPositionFn) {
      this.map.off('move', this._popupPositionFn);
    }
    this._popupPositionFn = updatePosition;
    this.map.on('move', updatePosition);
  },

  closePopup() {
    this.clearRoute();
    if (this.popupEl) {
      this.popupEl.classList.remove('visible');
      if (this._popupPositionFn && this.map) {
        this.map.off('move', this._popupPositionFn);
      }
    }
  },

  enterAddPinMode() {
    this.isAddingPin = true;
    const mapEl = document.getElementById('mapContainer');
    if (mapEl) {
      mapEl.classList.add('add-mode');
      
      let overlay = document.getElementById('addModeOverlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'addModeOverlay';
        overlay.style.cssText = 'position: absolute; top: 80px; left: 50%; transform: translateX(-50%); background: var(--gradient-primary); color: white; padding: 12px 24px; border-radius: 99px; font-weight: 600; box-shadow: 0 4px 16px rgba(168,85,247,0.5); z-index: 15; pointer-events: none; animation: slide-down 0.3s ease; text-align: center;';
        overlay.innerHTML = '👆<br>Haritada pinlemek istediğin yere dokun';
        mapEl.appendChild(overlay);
      }
    }
    
    // Ensure map matrix is synced to catch correct click coords
    if (this.map) {
      this.map.resize();
    }
    
    // Hide UI buttons to prevent confusion
    const fab = document.getElementById('addPinBtn');
    const locateBtn = document.getElementById('locateBtn');
    if (fab) fab.style.display = 'none';
    if (locateBtn) locateBtn.style.display = 'none';
    
    this.closePopup();
  },

  exitAddPinMode() {
    this.isAddingPin = false;
    const mapEl = document.getElementById('mapContainer');
    if (mapEl) {
      mapEl.classList.remove('add-mode');
      const overlay = document.getElementById('addModeOverlay');
      if (overlay) overlay.remove();
    }
    
    // Show UI buttons again
    const fab = document.getElementById('addPinBtn');
    const locateBtn = document.getElementById('locateBtn');
    if (fab) fab.style.display = 'flex';
    if (locateBtn) locateBtn.style.display = 'flex';
  },

  setupModal() {
    const modal = document.getElementById('addPinModal');
    if (!modal) return;

    // Populate category grid
    const grid = document.getElementById('pinCategoryGrid');
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

    // Cancel button
    document.getElementById('cancelPinBtn').addEventListener('click', () => {
      modal.classList.remove('active');
      this.exitAddPinMode();
    });

    // Background click to close
    const bg = document.getElementById('addPinModalBg');
    if (bg) {
      bg.addEventListener('click', () => {
        modal.classList.remove('active');
        this.exitAddPinMode();
      });
    }

    // Next/Continue button
    document.getElementById('savePinBtn').addEventListener('click', () => {
      if (!this.selectedCategory) {
        App.showToast('Bir kategori seç!', '⚠️');
        return;
      }
      this.tempDescription = document.getElementById('pinDescription').value.trim();
      if (!this.tempDescription) {
        App.showToast('Açıklama yaz!', '⚠️');
        return;
      }
      
      modal.classList.remove('active');
      this.enterAddPinMode();
    });
  },

  showAddPinModal() {
    const modal = document.getElementById('addPinModal');
    if (modal) {
      modal.classList.add('active');
      this.selectedCategory = null;

      // Reset form
      const textarea = document.getElementById('pinDescription');
      if (textarea) textarea.value = '';
      const grid = document.getElementById('pinCategoryGrid');
      if (grid) {
        grid.querySelectorAll('.pin-category-btn').forEach(b => b.classList.remove('selected'));
      }
    }
  },

  savePin() {
    if (!this.selectedCategory || !this.selectedLocation) return;

    const newPin = {
      id: Date.now(),
      lat: this.selectedLocation[1],
      lng: this.selectedLocation[0],
      category: this.selectedCategory,
      description: this.tempDescription || 'Yeni Pin',
      upvotes: 0,
      createdAt: 'Az önce',
    };

    PINS.push(newPin);

    this.exitAddPinMode();

    // Reset filter to all
    this.activeFilter = 'all';
    const filtersContainer = document.getElementById('mapFilters');
    if (filtersContainer) {
      filtersContainer.querySelectorAll('.map-filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.category === 'all');
      });
    }

    this.addPins();
    App.showToast('Pin eklendi! 📍', '✅');
    this.map.flyTo({ center: this.selectedLocation, zoom: 14, duration: 1000 });
  },

  updatePinCount(count) {
    const el = document.getElementById('pinCountText');
    if (el) {
      const total = typeof count === 'number' ? count : this.markers.length;
      el.textContent = `${total} aktivite`;
    }
  },
};
