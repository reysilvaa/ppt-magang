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
    handleDeckClick(event) {
      // Klik di area kosong (bukan tombol/nav) untuk next
      if (event.target === event.currentTarget) {
        this.nextSlide();
      }
    },
    handleKeydown(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        this.enterFullscreen();
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
  },
  unmounted() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
}).mount('#app');