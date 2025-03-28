/**
 * SefirCommunity - Premium Hizmetler Platformu
 * Kullanıcı Yönetim Sistemi
 * Versiyon: 2.0
 */

class UserManager {
    constructor() {
        this.usersKey = 'SefirCommunity_users';
        this.currentUserKey = 'SefirCommunity_currentUser';
        this.productsKey = 'SefirCommunity_products';
        this.salesKey = 'SefirCommunity_salesHistory';
        this.initSampleData();
    }

    initSampleData() {
        // Örnek ürün verileri (eğer yoksa)
        if (!localStorage.getItem(this.productsKey)) {
            const products = [
                {
                    id: 1,
                    name: "Logo Tasarım",
                    price: 299,
                    features: ["Kaliteli Hizmet", "Sıfırdan Çizim", "Sınırsız Revize", "Sefir Güvencesiyle"],
                    category: "tasarim",
                    sales: 0,
                },
                {
                    id: 2,
                    name: "Web Site Yazılım",
                    price: 900,
                    features: ["İstediğiniz Seçenekler", "7/24 Aktif Etme", "7/24 Canlı Destek"],
                    category: "yazilim",
                    sales: 0,
                },
                {
                    id: 3,
                    name: "Instagram Destek Hattı",
                    price: 250,
                    features: ["Kaliteli Otomasyon", "Hızlı Yanıt", "7/24 Aktiflik", "Kesintisiz Destek"],
                    category: "sosyal-medya",
                    sales: 0,
                }
            ];
            localStorage.setItem(this.productsKey, JSON.stringify(products));
        }
    }

    // Kullanıcı işlemleri
    loadUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    loadCurrentUser() {
        return JSON.parse(localStorage.getItem(this.currentUserKey));
    }

    saveCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.currentUserKey);
        }
    }

    // Ürün işlemleri
    loadProducts() {
        return JSON.parse(localStorage.getItem(this.productsKey)) || [];
    }

    saveProducts(products) {
        localStorage.setItem(this.productsKey, JSON.stringify(products));
    }

    // Satış işlemleri
    loadSales() {
        return JSON.parse(localStorage.getItem(this.salesKey)) || [];
    }

    saveSales(sales) {
        localStorage.setItem(this.salesKey, JSON.stringify(sales));
    }

    // Kayıt işlemi
    register(name, email, password) {
        const users = this.loadUsers();
        
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'Bu e-posta adresi zaten kayıtlı!' };
        }
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            joinDate: new Date().toISOString(),
            totalPurchases: 0,
            lastLogin: new Date().toISOString()
        };
        
        users.push(newUser);
        this.saveUsers(users);
        this.saveCurrentUser(newUser);
        
        // Discord webhook'a bildirim gönder
        this.sendRegistrationNotification(newUser);
        
        return { success: true, user: newUser };
    }

    // Giriş işlemi
    login(email, password) {
        const users = this.loadUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Son giriş tarihini güncelle
            user.lastLogin = new Date().toISOString();
            this.saveUsers(users);
            this.saveCurrentUser(user);
            
            return { success: true, user };
        }
        
        return { success: false, message: 'E-posta veya şifre hatalı!' };
    }

    // Çıkış işlemi
    logout() {
        this.saveCurrentUser(null);
    }

    // Discord bildirimleri
    sendRegistrationNotification(user) {
        const webhookUrl = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI';
        
        const embed = {
            title: "Yeni Kullanıcı Kaydı!",
            color: 0x3498db,
            fields: [
                { name: "Ad", value: user.name, inline: true },
                { name: "E-posta", value: user.email, inline: true },
                { name: "Kayıt Tarihi", value: new Date(user.joinDate).toLocaleString(), inline: false }
            ],
            timestamp: new Date().toISOString()
        };
        
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        }).catch(error => console.error('Discord webhook error:', error));
    }

    sendPurchaseNotification(sale) {
        const webhookUrl = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI';
        
        const embed = {
            title: "Yeni Satın Alma!",
            color: 0x00b894,
            fields: [
                { name: "Ürün", value: sale.productName, inline: true },
                { name: "Fiyat", value: `${sale.price}₺`, inline: true },
                { name: "Müşteri", value: `${sale.userName} (ID: ${sale.userId})`, inline: false },
                { name: "Ödeme Yöntemi", value: sale.paymentMethod, inline: true },
                { name: "Notlar", value: sale.notes || "Yok", inline: true }
            ],
            timestamp: new Date().toISOString()
        };
        
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        }).catch(error => console.error('Discord webhook error:', error));
    }
}

// UI Manager - Arayüz işlemlerini yönetir
class UIManager {
    constructor() {
        this.userManager = new UserManager();
        this.toastContainer = document.getElementById('toastContainer');
        this.initEventListeners();
        this.checkAuthStatus();
    }

    initEventListeners() {
        // Giriş formu
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Kayıt formu
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Satın alma formu
        document.getElementById('purchaseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePurchase();
        });
    }

    // Giriş işlemi
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const result = this.userManager.login(email, password);
        if (result.success) {
            this.showToast('Başarıyla giriş yaptınız!', 'success');
            this.checkAuthStatus();
            this.hideModal('loginModal');
        } else {
            this.showToast(result.message, 'danger');
        }
    }

    // Kayıt işlemi
    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        if (password !== passwordConfirm) {
            this.showToast('Şifreler eşleşmiyor!', 'danger');
            return;
        }
        
        const result = this.userManager.register(name, email, password);
        if (result.success) {
            this.showToast('Başarıyla kayıt oldunuz!', 'success');
            this.checkAuthStatus();
            this.hideModal('registerModal');
        } else {
            this.showToast(result.message, 'danger');
        }
    }

    // Satın alma işlemi
    handlePurchase() {
        const currentUser = this.userManager.loadCurrentUser();
        if (!currentUser) {
            this.showToast('Satın almak için giriş yapmalısınız!', 'warning');
            this.showModal('loginModal');
            return;
        }
        
        const productId = parseInt(document.getElementById('selectedProductId').value);
        const product = this.userManager.loadProducts().find(p => p.id === productId);
        const paymentMethod = document.getElementById('paymentMethod').value;
        const notes = document.getElementById('purchaseNotes').value;
        
        if (!product) return;
        
        // Satış kaydı oluştur
        const saleRecord = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            userId: currentUser.id,
            userName: currentUser.name,
            price: product.price,
            date: new Date().toISOString(),
            paymentMethod,
            notes,
            status: 'pending'
        };
        
        // Verileri güncelle
        const products = this.userManager.loadProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        products[productIndex].sales++;
        
        const users = this.userManager.loadUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex].totalPurchases++;
        
        const sales = this.userManager.loadSales();
        sales.push(saleRecord);
        
        // Kaydet
        this.userManager.saveProducts(products);
        this.userManager.saveUsers(users);
        this.userManager.saveSales(sales);
        
        // Bildirim gönder
        this.userManager.sendPurchaseNotification(saleRecord);
        
        // Modalı kapat ve yönlendir
        this.hideModal('purchaseModal');
        this.showToast('Satın alma işlemi başarılı! Yönlendiriliyorsunuz...', 'success');
        
        setTimeout(() => {
            window.location.href = "https://shopier.com/sefirroleplay";
        }, 2000);
    }

    // Auth durumunu kontrol et
    checkAuthStatus() {
        const authButtons = document.getElementById('authButtons');
        const userSection = document.getElementById('userSection');
        const currentUser = this.userManager.loadCurrentUser();
        
        if (currentUser) {
            if (authButtons) authButtons.style.display = 'none';
            if (userSection) {
                userSection.style.display = 'flex';
                document.getElementById('usernameDisplay').textContent = currentUser.name;
            }
        } else {
            if (authButtons) authButtons.style.display = 'block';
            if (userSection) userSection.style.display = 'none';
        }
    }

    // Çıkış işlemi
    logout() {
        this.userManager.logout();
        this.showToast('Başarıyla çıkış yaptınız!', 'success');
        this.checkAuthStatus();
    }

    // Modal işlemleri
    showModal(modalId) {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }

    hideModal(modalId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        modal.hide();
    }

    // Toast mesajı göster
    showToast(message, type = 'info') {
        if (!this.toastContainer) return;
        
        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.className = `toast show align-items-center text-white bg-${type} border-0`;
        toast.id = toastId;
        toast.role = 'alert';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            const bsToast = bootstrap.Toast.getOrCreateInstance(toast);
            bsToast.hide();
            toast.addEventListener('hidden.bs.toast', () => toast.remove());
        }, 5000);
    }

    // Satın alma modalını doldur
    setupPurchaseModal(productId) {
        const product = this.userManager.loadProducts().find(p => p.id === productId);
        if (!product) return false;
        
        document.getElementById('selectedProductId').value = product.id;
        document.getElementById('selectedProductName').value = product.name;
        document.getElementById('selectedProductPrice').value = `${product.price}₺`;
        
        return true;
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    const uiManager = new UIManager();
    
    // Global fonksiyonlar
    window.showLoginModal = () => uiManager.showModal('loginModal');
    window.showRegisterModal = () => uiManager.showModal('registerModal');
    window.logout = () => uiManager.logout();
    
    window.showPurchaseModal = (productId) => {
        if (uiManager.setupPurchaseModal(productId)) {
            uiManager.showModal('purchaseModal');
        }
    };
});
