/**
 * SefirCommunity - Profesyonel Dijital Çözümler
 * Tüm JavaScript Fonksiyonları
 * @version 1.2.0
 */

class SefirApp {
    constructor() {
      this.init();
    }
  
    init() {
      // Temel seçiciler
      this.selectors = {
        navbar: '.navbar',
        menuToggle: '.menu-toggle',
        navLinks: '.nav-links',
        modal: '#orderModal',
        orderForm: '#orderForm',
        contactForm: '#contactForm'
      };
  
      // Elementleri seç
      this.elements = {};
      for (const [key, value] of Object.entries(this.selectors)) {
        this.elements[key] = document.querySelector(value);
      }
  
      // Webhook konfigürasyonu
      this.config = {
        discordWebhook: 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI',
        avatarURL: 'https://avatars.mds.yandex.net/i?id=8c787e6208ecc324ca17456dabfb756fcda6a9a7-5246120-images-thumbs&n=13',
        username: 'SefirCommunity Satış/Bildirim'
      };
  
      // Olay dinleyicileri
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      // Scroll efekti
      window.addEventListener('scroll', () => this.toggleNavbarShadow());
  
      // Mobil menü
      this.elements.menuToggle?.addEventListener('click', () => this.toggleMobileMenu());
  
      // Yumuşak scroll
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => this.smoothScroll(e, anchor));
      });
  
      // Modal işlemleri
      document.querySelectorAll('.open-order-modal').forEach(btn => {
        btn.addEventListener('click', (e) => this.openModal(e, btn));
      });
  
      this.elements.modal?.querySelector('.close-modal')?.addEventListener('click', () => this.closeModal());
      window.addEventListener('click', (e) => e.target === this.elements.modal && this.closeModal());
  
      // Form gönderimleri
      this.elements.orderForm?.addEventListener('submit', (e) => this.handleFormSubmit(e, 'order'));
      this.elements.contactForm?.addEventListener('submit', (e) => this.handleFormSubmit(e, 'contact'));
  
      // Hover efektleri
      this.setupHoverEffects();
    }
  
    /* NAVBAR FONKSİYONLARI */
    toggleNavbarShadow() {
      this.elements.navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  
    toggleMobileMenu() {
      this.elements.navLinks.classList.toggle('active');
      const icon = this.elements.menuToggle.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  
    /* SCROLL FONKSİYONLARI */
    smoothScroll(e, anchor) {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        this.elements.navLinks.classList.remove('active');
        this.elements.menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
      }
    }
  
    /* MODAL FONKSİYONLARI */
    openModal(e, btn) {
      e.preventDefault();
      this.elements.modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      this.prefillServiceInfo(btn);
    }
  
    closeModal() {
      this.elements.modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  
    prefillServiceInfo(btn) {
      const card = btn.closest('.pricing-card');
      if (!card) return;
  
      const serviceName = card.querySelector('h3').textContent;
      const servicePrice = card.querySelector('.price').textContent;
      document.getElementById('service').value = `${serviceName} ${servicePrice}`;
    }
  
    /* FORM FONKSİYONLARI */
    async handleFormSubmit(e, formType) {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      
      try {
        this.setLoadingState(submitBtn, true);
        
        const formData = this.getFormData(form);
        await this.sendToDiscord(formData, formType);
        
        this.showAlert(
          formType === 'order' 
            ? 'Siparişiniz alındı!<br>En kısa sürede dönüş yapacağız.' 
            : 'Mesajınız iletildi!<br>Teşekkür ederiz.',
          'success'
        );
        
        form.reset();
        if (formType === 'order') this.closeModal();
      } catch (error) {
        console.error(`${formType} Hatası:`, error);
        this.showAlert(
          'Bir hata oluştu.<br>Lütfen tekrar deneyin.',
          'error'
        );
      } finally {
        this.setLoadingState(submitBtn, false);
      }
    }
  
    getFormData(form) {
      return {
        name: form.fullname?.value || form.querySelector('input[type="text"]')?.value,
        email: form.email?.value || form.querySelector('input[type="email"]')?.value,
        service: form.service?.value || form.querySelector('select')?.value,
        phone: form.querySelector('input[type="tel"]')?.value,
        message: form.notes?.value || form.querySelector('textarea')?.value,
        date: new Date().toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    }
  
    async sendToDiscord(data, type) {
      const embedConfig = {
        order: { 
          title: 'YENİ SİPARİŞ 🎉', 
          color: 0x00ff00,
          icon: '🛒'
        },
        contact: { 
          title: 'YENİ İLETİŞİM FORMU 📩', 
          color: 0x0099ff,
          icon: '✉️'
        }
      };
  
      const embed = {
        title: `${embedConfig[type].icon} ${embedConfig[type].title}`,
        color: embedConfig[type].color,
        fields: [
          { name: '📌 İsim', value: data.name || 'Belirtilmemiş', inline: true },
          { name: '📧 Email', value: data.email || 'Belirtilmemiş', inline: true },
          { name: '📞 Telefon', value: data.phone || 'Belirtilmemiş', inline: true },
          { name: '🔍 Hizmet', value: data.service || 'Belirtilmemiş', inline: false },
          { name: '📝 Mesaj', value: data.message || 'Belirtilmemiş', inline: false },
          { name: '⏰ Tarih', value: data.date, inline: true }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: `SefirCommunity • ${new Date().getFullYear()}`
        }
      };
  
      try {
        const response = await fetch(this.config.discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            embeds: [embed],
            username: this.config.username,
            avatar_url: this.config.avatarURL
          })
        });
  
        if (!response.ok) {
          throw new Error(`Discord API Hatası: ${response.status}`);
        }
  
        return true;
      } catch (error) {
        console.error('Webhook Gönderim Hatası:', error);
        throw error;
      }
    }
  
    /* YARDIMCI FONKSİYONLAR */
    setLoadingState(button, isLoading) {
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.innerHTML;
      }
      
      button.innerHTML = isLoading 
        ? '<i class="fas fa-spinner fa-spin"></i> İşleniyor...' 
        : button.dataset.originalText;
      button.disabled = isLoading;
    }
  
    showAlert(message, type = 'success') {
      const alertConfig = {
        success: { icon: 'fa-check-circle', color: '#4BB543' },
        error: { icon: 'fa-exclamation-circle', color: '#ff3333' }
      };
  
      const alert = document.createElement('div');
      alert.className = `custom-alert ${type}`;
      alert.innerHTML = `
        <div class="alert-content">
          <i class="fas ${alertConfig[type].icon}"></i>
          <p>${message}</p>
        </div>
      `;
      alert.style.backgroundColor = alertConfig[type].color;
  
      document.body.appendChild(alert);
  
      setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 300);
      }, 3000);
    }
  
    /* ETKİLEŞİM EFEKTLERİ */
    setupHoverEffects() {
      // Hizmet kartları
      document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-10px)';
          card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '';
        });
      });
  
      // Hero resmi
      const heroImage = document.querySelector('.hero-image img');
      if (heroImage) {
        heroImage.addEventListener('mouseenter', () => {
          heroImage.style.transform = 'perspective(1000px) rotateY(0deg) scale(1.03)';
        });
        heroImage.addEventListener('mouseleave', () => {
          heroImage.style.transform = 'perspective(1000px) rotateY(-10deg) scale(1)';
        });
      }
  
      // Fiyat kartları
      document.querySelectorAll('.pricing-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
          if (!card.classList.contains('featured')) {
            card.style.transform = 'scale(1.02)';
          }
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    }
  }
  
  // Uygulamayı başlat
  document.addEventListener('DOMContentLoaded', () => {
    new SefirApp();
  });
