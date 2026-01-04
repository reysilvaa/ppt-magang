const { createApp } = Vue;

createApp({
  data() {
    return {
      loaded: false,
      company: null,
      ui: null,
      slides: [],
      activeSlide: 0,
      galleryIndex: 0,
      showMobileMenu: false,
      scrolled: false,
      touchStartX: null,
      touchStartY: null,
    };
  },
  computed: {
    currentSlide() {
      return this.slides[this.activeSlide] || null;
    },
    isGallerySlide() {
      return this.currentSlide && this.currentSlide.type === 'gallery';
    },
    currentGalleryImage() {
      if (!this.isGallerySlide) return null;
      const images = this.currentSlide.gallery?.images || [];
      return images[this.galleryIndex] || null;
    },
    currentGalleryDescription() {
      if (!this.isGallerySlide) return [];
      const img = this.currentGalleryImage;
      return (img && img.description) || [];
    },
  },
  methods: {
    nextSlide() {
      if (this.activeSlide < this.slides.length - 1) {
        this.activeSlide += 1;
        this._syncGalleryIndexForSlide();
      }
    },
    prevSlide() {
      if (this.activeSlide > 0) {
        this.activeSlide -= 1;
        this._syncGalleryIndexForSlide();
      }
    },
    goToSlide(index) {
      if (index >= 0 && index < this.slides.length) {
        this.activeSlide = index;
        this._syncGalleryIndexForSlide();
      }
    },
    handleScroll() {
      this.scrolled = window.scrollY > 10;
    },
    handleDeckClick(event) {
      // Klik di area kosong (bukan tombol/nav) untuk next
      if (event.target === event.currentTarget) {
        this.nextSlide();
      }
    },
    handleKeydown(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        this.enterFullscreen();
      } else if (e.key === 'Home') {
        this.goToSlide(0);
      } else if (e.key === 'End') {
        this.goToSlide(this.slides.length - 1);
      }
    },
    handleWheel(e) {
      e.preventDefault();
      if (e.deltaY > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    },
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    },
    handleTouchEnd(e) {
      if (!this.touchStartX || !this.touchStartY) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = this.touchStartX - touchEndX;
      const deltaY = this.touchStartY - touchEndY;
      
      // Minimum swipe distance
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            this.nextSlide();
          } else {
            this.prevSlide();
          }
        }
      }
    },
    nextImage() {
      if (!this.isGallerySlide) return;
      const imgs = this.currentSlide.gallery?.images || [];
      if (!imgs.length) return;
      this.galleryIndex = (this.galleryIndex + 1) % imgs.length;
    },
    prevImage() {
      if (!this.isGallerySlide) return;
      const imgs = this.currentSlide.gallery?.images || [];
      if (!imgs.length) return;
      this.galleryIndex =
        (this.galleryIndex - 1 + imgs.length) % imgs.length;
    },
    setGalleryIndex(idx) {
      if (!this.isGallerySlide) return;
      const imgs = this.currentSlide.gallery?.images || [];
      if (idx >= 0 && idx < imgs.length) {
        this.galleryIndex = idx;
      }
    },
    isHeader(item) {
      // Define headers that should be styled as h3
      const headers = [
        'Data Pribadi',
        'Periode Magang', 
        'Penempatan',
        'Pembimbing Lapangan',
        'Tujuan Presentasi'
      ];
      return headers.includes(item);
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
    },
    enterFullscreen() {
      const root = document.documentElement;
      if (!document.fullscreenElement) {
        if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },
    _syncGalleryIndexForSlide() {
      if (!this.isGallerySlide) {
        this.galleryIndex = 0;
      } else {
        const imgs = this.currentSlide.gallery?.images || [];
        if (this.galleryIndex >= imgs.length) {
          this.galleryIndex = 0;
        }
      }
    },
    _loadContent() {
      fetch('assets/content.json')
        .then((res) => res.json())
        .then((data) => {
          this.company = data.company || null;
          this.ui = data.ui || null;
          this.slides = Array.isArray(data.slides) ? data.slides : [];
          this.activeSlide = 0;
          this.galleryIndex = 0;
          this.loaded = true;
          this._syncGalleryIndexForSlide();
        })
        .catch((err) => {
          // Jika gagal load, tetap mark loaded agar tidak hang di loader
          console.error('Gagal memuat content.json', err);
          this.loaded = true;
        });
    },
  },
  mounted() {
    this._loadContent();
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('wheel', this.handleWheel, { passive: false });
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    window.addEventListener('scroll', this.handleScroll);
  },
  unmounted() {
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('scroll', this.handleScroll);
  },
}).mount('#app');