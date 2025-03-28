// user-panel-complete.js - Tüm Kullanıcı Paneli Sistemi

/**
 * USER MANAGER - Veri Yönetimi
 */
class UserManager {
    constructor() {
      this.storageKeys = {
        users: 'SefirCommunity_users',
        currentUser: 'SefirCommunity_currentUser',
        products: 'SefirCommunity_products',
        sales: 'SefirCommunity_salesHistory'
      };
      this.initializeStorage();
    }
  
    // Storage kontrolü ve örnek veri oluşturma
    initializeStorage() {
      // Tüm storage anahtarlarını kontrol et
      const storageCheck = {
        users: () => {
          if (!this.getStorage('users')) {
            this.setStorage('users', [
              {
                id: '1',
                name: 'Demo Kullanıcı',
                email: 'demo@sefircommunity.com',
                password: 'demo123',
                joinDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                totalPurchases: 0
              }
            ]);
          }
        },
        products: () => {
          if (!this.getStorage('products')) {
            this.setStorage('products', [
              {
                id: 1,
                name: "Örnek Ürün",
                price: 100,
                features: ["Özellik 1", "Özellik 2"],
                category: "örnek",
                sales: 0
              }
            ]);
          }
        },
        sales: () => {
          if (!this.getStorage('sales')) {
            this.setStorage('sales', []);
          }
        },
        currentUser: () => {} // currentUser boş kalabilir
      };
  
      // Tüm storage'ları kontrol et
      Object.keys(storageCheck).forEach(key => storageCheck[key]());
    }
  
    // Genel storage okuma fonksiyonu
    getStorage(key) {
      try {
        const item = localStorage.getItem(this.storageKeys[key]);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error(`Storage okuma hatası (${key}):`, error);
        return null;
      }
    }
  
    // Genel storage yazma fonksiyonu
    setStorage(key, value) {
      try {
        localStorage.setItem(this.storageKeys[key], JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`Storage yazma hatası (${key}):`, error);
        return false;
      }
    }
  
    // Kullanıcı işlemleri
    loadUsers() {
      return this.getStorage('users') || [];
    }
  
    saveUsers(users) {
      return this.setStorage('users', users);
    }
  
    loadCurrentUser() {
      return this.getStorage('currentUser');
    }
  
    saveCurrentUser(user) {
      if (user) {
        return this.setStorage('currentUser', user);
      } else {
        localStorage.removeItem(this.storageKeys.currentUser);
        return true;
      }
    }
  
    // Ürün işlemleri
    loadProducts() {
      return this.getStorage('products') || [];
    }
  
    saveProducts(products) {
      return this.setStorage('products', products);
    }
  
    // Satış işlemleri
    loadSales() {
      return this.getStorage('sales') || [];
    }
  
    saveSales(sales) {
      return this.setStorage('sales', sales);
    }
  
    // Kullanıcı kayıt
    register(name, email, password) {
      const users = this.loadUsers();
      
      if (users.some(u => u.email === email)) {
        return { success: false, message: 'Bu e-posta zaten kayıtlı!' };
      }
      
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        totalPurchases: 0
      };
      
      users.push(newUser);
      this.saveUsers(users);
      this.saveCurrentUser(newUser);
      
      return { success: true, user: newUser };
    }
  
    // Kullanıcı giriş
    login(email, password) {
      const users = this.loadUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        user.lastLogin = new Date().toISOString();
        this.saveUsers(users);
        this.saveCurrentUser(user);
        return { success: true, user };
      }
      
      return { success: false, message: 'E-posta veya şifre hatalı!' };
    }
  }
  
  /**
   * USER PANEL - Arayüz Yönetimi
   */
  class UserPanel {
    constructor() {
      this.userManager = new UserManager();
      this.currentUser = null;
      this.init();
    }
  
    // Başlangıç işlemleri
    async init() {
      if (!this.checkAuth()) return;
      
      await this.loadAllData();
      this.setupEventListeners();
      
      // Verileri periyodik güncelle
      setInterval(() => this.loadAllData(), 30000);
    }
  
    // Oturum kontrolü
    checkAuth() {
      this.currentUser = this.userManager.loadCurrentUser();
      
      if (!this.currentUser) {
        if (confirm('Giriş yapmalısınız. Giriş sayfasına yönlendirilsin mi?')) {
          window.location.href = 'index.html#login';
        } else {
          window.location.href = 'index.html';
        }
        return false;
      }
      return true;
    }
  
    // Tüm verileri yükle
    async loadAllData() {
      try {
        await Promise.all([
          this.loadUserData(),
          this.loadUserOrders()
        ]);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        this.showToast('Veriler yüklenirken hata oluştu!', 'danger');
      }
    }
  
    // Kullanıcı verilerini yükle
    async loadUserData() {
      if (!this.currentUser) return;
      
      try {
        const elements = {
          username: document.getElementById('usernameDisplay'),
          email: document.getElementById('userEmailDisplay'),
          joinDate: document.getElementById('joinDateDisplay'),
          purchases: document.getElementById('totalPurchasesDisplay'),
          lastLogin: document.getElementById('lastLoginDisplay')
        };
        
        // Değerleri güncelle
        if (elements.username) elements.username.textContent = this.currentUser.name || 'Bilinmiyor';
        if (elements.email) elements.email.textContent = this.currentUser.email || 'Bilinmiyor';
        
        if (elements.joinDate) {
          elements.joinDate.textContent = this.currentUser.joinDate ? 
            new Date(this.currentUser.joinDate).toLocaleDateString('tr-TR') : 'Bilinmiyor';
        }
        
        if (elements.purchases) {
          elements.purchases.textContent = this.currentUser.totalPurchases ?? '0';
        }
        
        if (elements.lastLogin) {
          elements.lastLogin.textContent = this.currentUser.lastLogin ? 
            new Date(this.currentUser.lastLogin).toLocaleString('tr-TR') : 'Bilinmiyor';
        }
      } catch (error) {
        console.error('Kullanıcı verisi yükleme hatası:', error);
        throw error;
      }
    }
  
    // Siparişleri yükle
    async loadUserOrders() {
      if (!this.currentUser) return;
      
      try {
        const sales = this.userManager.loadSales();
        if (!Array.isArray(sales)) {
          throw new Error('Geçersiz satış verisi');
        }
        
        const userOrders = sales.filter(order => order.userId === this.currentUser.id);
        this.displayOrders(userOrders);
      } catch (error) {
        console.error('Sipariş yükleme hatası:', error);
        this.showErrorState();
        throw error;
      }
    }
  
    // Siparişleri göster
    displayOrders(orders) {
      const elements = {
        table: document.getElementById('ordersTable'),
        tableBody: document.getElementById('ordersTableBody'),
        emptyMessage: document.getElementById('emptyOrdersMessage'),
        count: document.getElementById('ordersCount')
      };
      
      if (!orders?.length) {
        if (elements.table) elements.table.style.display = 'none';
        if (elements.emptyMessage) {
          elements.emptyMessage.style.display = 'block';
          elements.emptyMessage.className = 'alert alert-info';
          elements.emptyMessage.textContent = 'Henüz siparişiniz yok';
        }
        if (elements.count) elements.count.textContent = '0';
        return;
      }
      
      // Siparişleri sırala (yeniden eskiye)
      orders.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Tabloyu doldur
      if (elements.tableBody) {
        elements.tableBody.innerHTML = orders.map(order => `
          <tr>
            <td>${order.id || '-'}</td>
            <td>${order.productName || '-'}</td>
            <td>${order.price ? `${order.price}₺` : '-'}</td>
            <td>${order.date ? new Date(order.date).toLocaleDateString('tr-TR') : '-'}</td>
            <td><span class="badge ${this.getStatusBadgeClass(order.status)}">${this.getStatusText(order.status)}</span></td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="userPanel.viewOrderDetails('${order.id}')">
                <i class="fas fa-eye"></i> Detay
              </button>
            </td>
          </tr>
        `).join('');
      }
      
      if (elements.table) elements.table.style.display = 'table';
      if (elements.emptyMessage) elements.emptyMessage.style.display = 'none';
      if (elements.count) elements.count.textContent = orders.length.toString();
    }
  
    // Sipariş detaylarını göster
    viewOrderDetails(orderId) {
      try {
        const order = this.userManager.loadSales().find(o => o.id === orderId);
        if (!order) {
          this.showToast('Sipariş bulunamadı!', 'danger');
          return;
        }
        
        // Modal içeriğini doldur
        const setText = (id, value) => {
          const el = document.getElementById(id);
          if (el) el.textContent = value || '-';
        };
        
        setText('orderIdDetail', order.id);
        setText('productNameDetail', order.productName);
        setText('orderDateDetail', order.date ? new Date(order.date).toLocaleString('tr-TR') : null);
        setText('orderPriceDetail', order.price ? `${order.price}₺` : null);
        
        const statusEl = document.getElementById('orderStatusDetail');
        if (statusEl) {
          statusEl.innerHTML = `<span class="badge ${this.getStatusBadgeClass(order.status)}">${this.getStatusText(order.status)}</span>`;
        }
        
        setText('paymentMethodDetail', order.paymentMethod);
        setText('orderNotesDetail', order.notes || 'Not yok');
        
        // Modalı göster
        this.showModal('orderDetailsModal');
      } catch (error) {
        console.error('Sipariş detay hatası:', error);
        this.showToast('Sipariş detayı gösterilemedi!', 'danger');
      }
    }
  
    // Hata durumunda arayüzü ayarla
    showErrorState() {
      const elements = {
        table: document.getElementById('ordersTable'),
        emptyMessage: document.getElementById('emptyOrdersMessage')
      };
      
      if (elements.table) elements.table.style.display = 'none';
      if (elements.emptyMessage) {
        elements.emptyMessage.style.display = 'block';
        elements.emptyMessage.className = 'alert alert-danger';
        elements.emptyMessage.textContent = 'Siparişler yüklenirken hata oluştu';
      }
    }
  
    // Çıkış yap
    logout() {
      this.userManager.saveCurrentUser(null);
      window.location.href = 'index.html';
    }
  
    // Yardımcı fonksiyonlar
    getStatusText(status) {
      const statusMap = {
        'pending': 'Beklemede',
        'processing': 'İşleniyor',
        'completed': 'Tamamlandı',
        'cancelled': 'İptal Edildi',
        'refunded': 'İade Edildi'
      };
      return statusMap[status] || status || 'Belirsiz';
    }
  
    getStatusBadgeClass(status) {
      const classMap = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'completed': 'bg-success',
        'cancelled': 'bg-danger',
        'refunded': 'bg-secondary'
      };
      return classMap[status] || 'bg-primary';
    }
  
    // Modal göster
    showModal(modalId) {
      const modal = new bootstrap.Modal(document.getElementById(modalId));
      modal.show();
    }
  
    // Toast mesajı göster
    showToast(message, type = 'info') {
      const toastContainer = document.getElementById('toastContainer') || document.body;
      
      const toast = document.createElement('div');
      toast.className = `toast show align-items-center text-white bg-${type} border-0`;
      toast.style.position = 'fixed';
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.zIndex = '1100';
      toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      `;
      
      toastContainer.appendChild(toast);
      
      setTimeout(() => toast.remove(), 5000);
    }
  
    // Event listener'ları ayarla
    setupEventListeners() {
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }
    }
  }
  
  // Sayfa yüklendiğinde başlat
  document.addEventListener('DOMContentLoaded', () => {
    window.userPanel = new UserPanel();
  });
