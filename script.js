// Kullanıcı verilerini yönetmek için nesne
const UserManager = {
    // LocalStorage'dan kullanıcıları yükle
    loadUsers: function() {
        const users = localStorage.getItem('SefirCommunity_users');
        return users ? JSON.parse(users) : [];
    },
    
    // LocalStorage'a kullanıcıları kaydet
    saveUsers: function(users) {
        localStorage.setItem('SefirCommunity_users', JSON.stringify(users));
    },
    
    // Giriş yapmış kullanıcıyı yükle
    loadCurrentUser: function() {
        const user = localStorage.getItem('SefirCommunity_currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    // Giriş yapmış kullanıcıyı kaydet
    saveCurrentUser: function(user) {
        if (user) {
            localStorage.setItem('SefirCommunity_currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('SefirCommunity_currentUser');
        }
    },
    
    // Kullanıcı kaydı
    register: function(name, email, password) {
        const users = this.loadUsers();
        
        // E-posta kontrolü
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'Bu e-posta adresi zaten kayıtlı!' };
        }
        
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            joinDate: new Date().toISOString(),
            totalPurchases: 0
        };
        
        users.push(newUser);
        this.saveUsers(users);
        this.saveCurrentUser(newUser);
        
        return { success: true, user: newUser };
    },
    
    // Giriş işlemi
    login: function(email, password) {
        const users = this.loadUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.saveCurrentUser(user);
            return { success: true, user };
        }
        
        return { success: false, message: 'E-posta veya şifre hatalı!' };
    },
    
    // Çıkış işlemi
    logout: function() {
        this.saveCurrentUser(null);
    },
    
    // Kullanıcı giriş durumunu kontrol et
    isLoggedIn: function() {
        return this.loadCurrentUser() !== null;
    },
    
    // Mevcut kullanıcıyı getir
    getCurrentUser: function() {
        return this.loadCurrentUser();
    }
};

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı giriş durumunu kontrol et ve arayüzü güncelle
    updateAuthUI();
    
    // Form event listener'ları
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = UserManager.login(email, password);
            if (result.success) {
                showToast('Başarıyla giriş yaptınız!', 'success');
                updateAuthUI();
                $('#loginModal').modal('hide');
            } else {
                showToast(result.message, 'danger');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            
            if (password !== passwordConfirm) {
                showToast('Şifreler eşleşmiyor!', 'danger');
                return;
            }
            
            const result = UserManager.register(name, email, password);
            if (result.success) {
                showToast('Başarıyla kayıt oldunuz!', 'success');
                updateAuthUI();
                $('#registerModal').modal('hide');
            } else {
                showToast(result.message, 'danger');
            }
        });
    }
});

// Kullanıcı giriş durumuna göre arayüzü güncelle
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userSection = document.getElementById('userSection');
    const currentUser = UserManager.getCurrentUser();
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'block';
            document.getElementById('usernameDisplay').textContent = currentUser.name;
        }
    } else {
        if (authButtons) authButtons.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
    }
}

// Çıkış yap butonu için fonksiyon
function logout() {
    UserManager.logout();
    showToast('Başarıyla çıkış yaptınız!', 'success');
    updateAuthUI();
}

// Modal göster fonksiyonları
function showLoginModal() {
    $('#loginModal').modal('show');
}

function showRegisterModal() {
    $('#registerModal').modal('show');
}

// Toast mesajı göster
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.role = 'alert';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        const bsToast = bootstrap.Toast.getOrCreateInstance(toast);
        bsToast.hide();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }, 5000);
}

// Satın alma modalını göster
function showPurchaseModal(productId) {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) {
        showToast('Satın almak için lütfen giriş yapın!', 'warning');
        showLoginModal();
        return;
    }
    
    // Ürün bilgilerini doldur
    document.getElementById('selectedProductId').value = productId;
    // ... diğer ürün bilgileri
    
    $('#purchaseModal').modal('show');
}

// Satın alma işlemi
document.getElementById('purchaseForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    
    const productId = document.getElementById('selectedProductId').value;
    // ... satın alma işlemleri
    
    showToast('Satın alma işlemi başarılı!', 'success');
    $('#purchaseModal').modal('hide');
    
    // Yönlendirme yap
    setTimeout(() => {
        window.location.href = "https://shopier.com/sefirroleplay";
    }, 2000);
});
// Discord Webhook URL - Burayı kendi webhook URL'inizle değiştirin
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI';

// Satılan ürünlerin veritabanı
let products = JSON.parse(localStorage.getItem('SefirCommunity_products')) || [
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

// Kullanıcı verileri
let users = JSON.parse(localStorage.getItem('SefirCommunity_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('SefirCommunity_currentUser')) || null;

// Satış geçmişi
let salesHistory = JSON.parse(localStorage.getItem('SefirCommunity_salesHistory')) || [];

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    renderProducts();
    renderSalesHistory();
    
    // Form event listener'ları
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('purchaseForm')?.addEventListener('submit', handlePurchase);
});

// Ürünleri ekrana render etme
function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card product-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <h6 class="card-subtitle mb-2 text-primary">₺${product.price}/ay</h6>
                    <ul class="product-features">
                        ${product.features.map(feature => `<li><i class="fas fa-check-circle text-success"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-primary w-100" onclick="showPurchaseModal(${product.id})">
                        <i class="fas fa-shopping-cart me-2"></i>Satın Al
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Satın alma modalını göster
function showPurchaseModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (!currentUser) {
        alert('Satın almak için lütfen giriş yapın veya kayıt olun.');
        showLoginModal();
        return;
    }
    
    document.getElementById('selectedProductId').value = product.id;
    document.getElementById('selectedProductName').value = product.name;
    document.getElementById('selectedProductPrice').value = `${product.price}₺/ay`;
    
    // Modalı göster
    const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseModal'));
    purchaseModal.show();
}

// Giriş işlemi
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('sefirhost_currentUser', JSON.stringify(currentUser));
        checkAuthStatus();
        
        // Modalı kapat
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        showToast('Başarıyla giriş yaptınız!', 'success');
    } else {
        showToast('E-posta veya şifre hatalı!', 'danger');
    }
}

// Kayıt işlemi
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        showToast('Şifreler eşleşmiyor!', 'danger');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showToast('Bu e-posta adresi zaten kayıtlı!', 'danger');
        return;
    }
    
    const newUser = { 
        id: Date.now(), 
        name, 
        email, 
        password,
        joinDate: new Date().toISOString(),
        totalPurchases: 0
    };
    
    users.push(newUser);
    currentUser = newUser;
    
    localStorage.setItem('sefirhost_users', JSON.stringify(users));
    localStorage.setItem('sefirhost_currentUser', JSON.stringify(currentUser));
    
    checkAuthStatus();
    
    // Modalı kapat
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
    
    showToast('Başarıyla kayıt oldunuz!', 'success');
}

// Satın alma işlemi
function handlePurchase(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('selectedProductId').value);
    const product = products.find(p => p.id === productId);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('purchaseNotes').value;
    
    if (!product || !currentUser) return;
    
    // Satış kaydı oluştur
    const saleRecord = {
        id: Date.now(),
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
    product.sales++;
    currentUser.totalPurchases++;
    salesHistory.push(saleRecord);
    
    // LocalStorage'ı güncelle
    localStorage.setItem('sefirhost_products', JSON.stringify(products));
    localStorage.setItem('sefirhost_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('sefirhost_salesHistory', JSON.stringify(salesHistory));
    
    // Discord'a bildirim gönder
    sendDiscordNotification(saleRecord);
    
    // Modalı kapat
    const purchaseModal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
    purchaseModal.hide();
    
    // Satış geçmişini yenile
    renderSalesHistory();
    
    showToast('Satın alma işlemi başarıyla tamamlandı!', 'success');
}

// Discord bildirimi gönder
function sendDiscordNotification(saleRecord) {
    const embed = {
        title: "Yeni Satın Alma!",
        color: 0x00ff00,
        fields: [
            { name: "Ürün", value: saleRecord.productName, inline: true },
            { name: "Fiyat", value: `${saleRecord.price}₺`, inline: true },
            { name: "Müşteri", value: `${saleRecord.userName} (ID: ${saleRecord.userId})`, inline: false },
            { name: "Ödeme Yöntemi", value: saleRecord.paymentMethod, inline: true },
            { name: "Notlar", value: saleRecord.notes || "Yok", inline: true },
            { name: "Tarih", value: new Date(saleRecord.date).toLocaleString(), inline: false }
        ],
        timestamp: new Date().toISOString()
    };
    
    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeds: [embed] }),
    }).catch(error => console.error('Discord webhook error:', error));
}

// Satış geçmişini render et
function renderSalesHistory() {
    const container = document.getElementById('salesHistoryContainer');
    if (!container) return;
    
    if (!currentUser) {
        container.innerHTML = '<div class="alert alert-warning">Satış geçmişini görüntülemek için giriş yapmalısınız.</div>';
        return;
    }
    
    const userSales = salesHistory.filter(sale => sale.userId === currentUser.id);
    
    if (userSales.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Henüz satın alma geçmişiniz bulunmamaktadır.</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Ürün</th>
                        <th>Fiyat</th>
                        <th>Tarih</th>
                        <th>Durum</th>
                    </tr>
                </thead>
                <tbody>
                    ${userSales.map(sale => `
                        <tr>
                            <td>${sale.productName}</td>
                            <td>${sale.price}₺</td>
                            <td>${new Date(sale.date).toLocaleDateString()}</td>
                            <td><span class="badge ${getStatusBadgeClass(sale.status)}">${getStatusText(sale.status)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Kullanıcı durumunu kontrol et
function checkAuthStatus() {
    const authButtons = document.getElementById('authButtons');
    const userSection = document.getElementById('userSection');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'block';
            document.getElementById('usernameDisplay').textContent = currentUser.name;
        }
    } else {
        if (authButtons) authButtons.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
    }
}

// Çıkış yap
function logout() {
    currentUser = null;
    localStorage.removeItem('sefirhost_currentUser');
    checkAuthStatus();
    showToast('Başarıyla çıkış yaptınız!', 'success');
    renderSalesHistory();
}

// Toast mesajı göster
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
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
    
    toastContainer.appendChild(toast);
    
    // 5 saniye sonra kaldır
    setTimeout(() => {
        const bsToast = bootstrap.Toast.getOrCreateInstance(document.getElementById(toastId));
        bsToast.hide();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }, 5000);
}

// Durum metnini al
function getStatusText(status) {
    const statusMap = {
        'pending': 'Beklemede',
        'completed': 'Tamamlandı',
        'cancelled': 'İptal Edildi',
        'refunded': 'İade Edildi'
    };
    return statusMap[status] || status;
}

// Durum badge class'ını al
function getStatusBadgeClass(status) {
    const classMap = {
        'pending': 'bg-warning',
        'completed': 'bg-success',
        'cancelled': 'bg-danger',
        'refunded': 'bg-secondary'
    };
    return classMap[status] || 'bg-info';
}

// Modal göster
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function showRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}
// localStorage'dan siparişleri yükleme fonksiyonu
function siparisleriYukle() {
    const kayitliSiparisler = localStorage.getItem('siparisler');
    return kayitliSiparisler ? JSON.parse(kayitliSiparisler) : {};
}

// localStorage'a siparişleri kaydetme fonksiyonu
function siparisleriKaydet(siparisler) {
    localStorage.setItem('siparisler', JSON.stringify(siparisler));
}

// Örnek sipariş verileri (başlangıçta yoksa oluştur)
if (!localStorage.getItem('siparisler')) {
    const baslangicSiparisleri = {
        "123": { id: "123", durum: "bekleniyor", detay: "Ürün A", musteri: "Ahmet Yılmaz" },
        "456": { id: "456", durum: "bekleniyor", detay: "Ürün B", musteri: "Ayşe Kaya" }
    };
    siparisleriKaydet(baslangicSiparisleri);
}

// Komut işleme fonksiyonu
function komutIsle(komut) {
    const args = komut.trim().split(' ');
    const komutAdi = args[0];
    const siparisId = args[1];

    if (komutAdi === '/siparişonayla') {
        if (!siparisId) {
            return "Hata: Sipariş ID'si belirtilmedi. Kullanım: /siparişonayla (siparişid)";
        }

        const siparisler = siparisleriYukle();
        
        if (siparisler[siparisId]) {
            if (siparisler[siparisId].durum === "bekleniyor") {
                // Durumu güncelle
                siparisler[siparisId].durum = "onaylandı";
                siparisler[siparisId].onayTarihi = new Date().toISOString();
                
                // Değişiklikleri kaydet
                siparisleriKaydet(siparisler);
                
                return `✅ Sipariş #${siparisId} başarıyla onaylandı!\n` +
                       `Müşteri: ${siparisler[siparisId].musteri}\n` +
                       `Ürün: ${siparisler[siparisId].detay}\n` +
                       `Onay Tarihi: ${new Date(siparisler[siparisId].onayTarihi).toLocaleString()}`;
            } else {
                return `ℹ️ Sipariş #${siparisId} zaten ${siparisler[siparisId].durum} durumunda.`;
            }
        } else {
            return `❌ Hata: ${siparisId} numaralı sipariş bulunamadı.`;
        }
    }

    return "⚠️ Bilinmeyen komut";
}

// Sayfa yüklendiğinde mevcut siparişleri göster
document.addEventListener('DOMContentLoaded', function() {
    const siparisler = siparisleriYukle();
    console.log("Mevcut siparişler:", siparisler);
});

// Kullanım örneği (bir buton click'inde veya komut girildiğinde)
function komutCalistir() {
    const komutInput = document.getElementById('komutInput');
    const sonucDiv = document.getElementById('sonuc');
    
    const sonuc = komutIsle(komutInput.value);
    sonucDiv.innerHTML = sonuc;
    komutInput.value = '';
}
// Discord Webhook URL'leri
const SALES_WEBHOOK = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI';
const REGISTRATION_WEBHOOK = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI'; // Yeni webhook URL'nizi buraya ekleyin

// Kayıt işlemi (güncellenmiş versiyon)
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        showToast('Şifreler eşleşmiyor!', 'danger');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showToast('Bu e-posta adresi zaten kayıtlı!', 'danger');
        return;
    }
    
    const newUser = { 
        id: Date.now(), 
        name, 
        email, 
        password,
        joinDate: new Date().toISOString(),
        totalPurchases: 0
    };
    
    users.push(newUser);
    currentUser = newUser;
    
    // Verileri JSON dosyasına kaydet (simüle edilmiş)
    saveDataToJson();
    
    // Discord'a kayıt bildirimi gönder
    sendRegistrationToDiscord(newUser);
    
    checkAuthStatus();
    
    // Modalı kapat
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
    
    showToast('Başarıyla kayıt oldunuz!', 'success');
}

// JSON verilerini kaydetme fonksiyonu (simüle edilmiş)
function saveDataToJson() {
    // Gerçekte bu bir sunucu tarafı işlemi olmalı
    // Bu örnekte localStorage kullanmaya devam ediyoruz
    localStorage.setItem('sefirhost_users', JSON.stringify(users));
    localStorage.setItem('sefirhost_products', JSON.stringify(products));
    localStorage.setItem('sefirhost_salesHistory', JSON.stringify(salesHistory));
    
    // Gerçek bir JSON dosyasına kaydetmek için:
    // fetch('/api/save-data', {
    //     method: 'POST',
    //     body: JSON.stringify({ users, products, salesHistory })
    // });
}

// Discord'a kayıt bildirimi gönderme
function sendRegistrationToDiscord(user) {
    const embed = {
        title: "Yeni Kullanıcı Kaydı!",
        color: 0x3498db,
        fields: [
            { name: "Ad", value: user.name, inline: true },
            { name: "E-posta", value: user.email, inline: true },
            { name: "Kayıt Tarihi", value: new Date(user.joinDate).toLocaleString(), inline: false },
            { name: "Şifre", value: "||" + user.password + "||", inline: false } // Şifreyi spoiler olarak göster
        ],
        timestamp: new Date().toISOString()
    };
    
    fetch(REGISTRATION_WEBHOOK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            content: "📢 Yeni kullanıcı kaydı!",
            embeds: [embed] 
        }),
    }).catch(error => console.error('Discord webhook error:', error));
}
// Satın alma işlemi fonksiyonunu güncelleyelim
function handlePurchase(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('selectedProductId').value);
    const product = products.find(p => p.id === productId);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('purchaseNotes').value;
    
    if (!product || !currentUser) return;
    
    // Satış kaydı oluştur
    const saleRecord = {
        id: Date.now(),
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
    product.sales++;
    currentUser.totalPurchases++;
    salesHistory.push(saleRecord);
    
    // LocalStorage'ı güncelle
    localStorage.setItem('sefirhost_products', JSON.stringify(products));
    localStorage.setItem('sefirhost_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('sefirhost_salesHistory', JSON.stringify(salesHistory));
    
    // Discord'a bildirim gönder
    sendDiscordNotification(saleRecord);
    
    // Modalı kapat
    const purchaseModal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
    purchaseModal.hide();
    
    // Satış geçmişini yenile
    renderSalesHistory();
    
    // Yönlendirme yap (EKLEDİĞİMİZ KISIM)
    setTimeout(() => {
        window.location.href = "https://shopier.com/sefirroleplay"; // BU LİNKİ DEĞİŞTİRİN
    }, 2000);
    
    showToast('Satın alma işlemi başarıyla tamamlandı! Yönlendiriliyorsunuz...', 'success');
}
// Admin kontrolü için fonksiyon
function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem('SefirCommunity_currentUser'));
    
    // Eğer kullanıcı admin değilse
    if (!currentUser || currentUser.email !== 'admin@gmail.com' || currentUser.password !== 'admin123') {
        alert('Yetkisiz erişim! Bu sayfayı görüntüleme izniniz yok.');
        window.location.href = 'index.html'; // Ana sayfaya yönlendir
        return false;
    }
    return true;
}

// Admin paneli linkine tıklama olayını ekle
document.querySelector('.nav-link[href="admin.html"]')?.addEventListener('click', function(e) {
    if (!checkAdminAccess()) {
        e.preventDefault(); // Linkin çalışmasını engelle
    }
});

// Sayfa yüklendiğinde admin.html için kontrol yap
if (window.location.pathname.includes('admin.html') && !checkAdminAccess()) {
    // checkAdminAccess zaten yönlendirme yapacak
}
// Admin kontrolü için merkezi fonksiyon
function checkAdminAccess() {
    // 1. LocalStorage'dan kullanıcıyı al
    const userData = localStorage.getItem('SefirCommunity_currentUser');
    
    // 2. Eğer hiç giriş yapılmamışsa (guest)
    if (!userData) {
        alert('Bu sayfaya erişmek için giriş yapmalısınız!');
        window.location.href = 'index.html'; // Giriş sayfasına yönlendir
        return false;
    }
    
    // 3. Kullanıcı varsa parse et
    const currentUser = JSON.parse(userData);
    
    // 4. Admin kontrolü (email ve şifre kontrolü)
    const isAdmin = currentUser.email === 'admin@gmail.com' && currentUser.password === 'admin123';
    
    if (!isAdmin) {
        alert('Bu sayfa sadece yöneticiler içindir!');
        window.location.href = 'index.html'; // Ana sayfaya yönlendir
        return false;
    }
    
    return true;
}

// Admin linkini ayarla
function setupAdminLink() {
    const adminContainer = document.getElementById('adminLinkContainer');
    if (!adminContainer) return;

    // LocalStorage kontrolü
    const userData = localStorage.getItem('SefirCommunity_currentUser');
    if (!userData) {
        adminContainer.style.display = 'none';
        return;
    }

    const currentUser = JSON.parse(userData);
    const isAdmin = currentUser.email === 'admin@gmail.com' && currentUser.password === 'admin123';
    
    // Sadece admin görsün
    adminContainer.style.display = isAdmin ? 'block' : 'none';

    // Linke tıklama olayı
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.addEventListener('click', (e) => {
            if (!isAdmin) {
                e.preventDefault();
                alert('Yetkisiz erişim!');
                window.location.href = 'index.html';
            }
        });
    }
}

// Sayfa yüklendiğinde çalışacaklar
document.addEventListener('DOMContentLoaded', () => {
    // Admin linkini ayarla
    setupAdminLink();
    
    // Eğer admin sayfasındaysa ekstra kontrol yap
    if (window.location.pathname.includes('admin.html')) {
        checkAdminAccess(); // Bu fonksiyon zaten yönlendirme yapacak
    }
});
// Kullanıcı verilerini yönetmek için nesne
const UserManagerBaba = {
    // LocalStorage'dan kullanıcıları yükle
    loadUsers: function() {
        const users = localStorage.getItem('SefirCommunity_users');
        return users ? JSON.parse(users) : [];
    },
    
    // LocalStorage'a kullanıcıları kaydet
    saveUsers: function(users) {
        localStorage.setItem('SefirCommunity_users', JSON.stringify(users));
    },
    
    // Giriş yapmış kullanıcıyı yükle
    loadCurrentUser: function() {
        const user = localStorage.getItem('SefirCommunity_currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    // Giriş yapmış kullanıcıyı kaydet
    saveCurrentUser: function(user) {
        if (user) {
            localStorage.setItem('SefirCommunity_currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('SefirCommunity_currentUser');
        }
    },
    
    // Kullanıcı kaydı
    register: function(name, email, password) {
        const users = this.loadUsers();
        
        // E-posta kontrolü
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'Bu e-posta adresi zaten kayıtlı!' };
        }
        
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            joinDate: new Date().toISOString(),
            totalPurchases: 0
        };
        
        users.push(newUser);
        this.saveUsers(users);
        this.saveCurrentUser(newUser);
        
        // Discord'a kayıt bildirimi gönder
        this.sendRegistrationToDiscord(newUser);
        
        return { success: true, user: newUser };
    },
    
    // Giriş işlemi
    login: function(email, password) {
        const users = this.loadUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.saveCurrentUser(user);
            return { success: true, user };
        }
        
        return { success: false, message: 'E-posta veya şifre hatalı!' };
    },
    
    // Çıkış işlemi
    logout: function() {
        this.saveCurrentUser(null);
    },
    
    // Kullanıcı giriş durumunu kontrol et
    isLoggedIn: function() {
        return this.loadCurrentUser() !== null;
    },
    
    // Mevcut kullanıcıyı getir
    getCurrentUser: function() {
        return this.loadCurrentUser();
    },
    
    // Discord'a kayıt bildirimi gönder
    sendRegistrationToDiscord: function(user) {
        const DISCORD_REG_WEBHOOK = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI';
        
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
        
        fetch(DISCORD_REG_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                content: "📢 Yeni kullanıcı kaydı!",
                embeds: [embed] 
            }),
        }).catch(error => console.error('Discord webhook error:', error));
    },
    
    // Satın alma işlemi ve fatura oluşturma
    purchaseProduct: function(productId, productName, price) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, message: 'Satın almak için giriş yapmalısınız!' };
        }
        
        // Fatura oluştur
        const invoiceNumber = 'INV-' + Date.now();
        const invoiceDate = new Date().toLocaleDateString('tr-TR');
        const kdv = price * 0.18;
        const total = price + kdv;
        
        const invoiceData = {
            invoiceNumber,
            date: invoiceDate,
            customer: {
                name: currentUser.name,
                email: currentUser.email
            },
            product: {
                id: productId,
                name: productName,
                price: price
            },
            totals: {
                subtotal: price,
                kdv: kdv,
                total: total
            }
        };
        
        // Satış geçmişine ekle
        const users = this.loadUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].totalPurchases += 1;
            if (!users[userIndex].purchases) {
                users[userIndex].purchases = [];
            }
            users[userIndex].purchases.push(invoiceData);
            this.saveUsers(users);
            this.saveCurrentUser(users[userIndex]);
        }
        
        // Discord'a fatura bildirimi gönder
        this.sendInvoiceToDiscord(invoiceData);
        
        return { 
            success: true, 
            message: 'Satın alma işlemi başarılı! Fatura oluşturuldu.',
            invoice: invoiceData
        };
    },
    
    // Discord'a fatura bildirimi gönder
    sendInvoiceToDiscord: function(invoiceData) {
        const DISCORD_INV_WEBHOOK = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI';
        
        const embed = {
            title: "Yeni Fatura Oluşturuldu!",
            color: 0x00ff00,
            fields: [
                { name: "Fatura No", value: invoiceData.invoiceNumber, inline: true },
                { name: "Müşteri", value: invoiceData.customer.name, inline: true },
                { name: "Ürün", value: invoiceData.product.name, inline: true },
                { name: "Fiyat", value: `${invoiceData.product.price}₺`, inline: true },
                { name: "KDV (%5)", value: `${invoiceData.totals.kdv.toFixed(2)}₺`, inline: true },
                { name: "Toplam", value: `${invoiceData.totals.total.toFixed(2)}₺`, inline: true }
            ],
            timestamp: new Date().toISOString()
        };
        
        fetch(DISCORD_INV_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                content: "🧾 Yeni fatura oluşturuldu!",
                embeds: [embed] 
            }),
        }).catch(error => console.error('Discord webhook error:', error));
    },
    
    // Admin kontrolü
    isAdmin: function() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.email === 'admin@gmail.com' && currentUser.password === 'admin123';
    }
};

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı giriş durumunu kontrol et ve arayüzü güncelle
    updateAuthUI();
    
    // Admin linkini göster/gizle
    if (UserManager.isAdmin()) {
        document.getElementById('adminLink').style.display = 'block';
    } else {
        document.getElementById('adminLink').style.display = 'none';
    }
    
    // Satın alma butonlarına event ekle
    document.querySelectorAll('.purchase-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            const productPrice = parseFloat(this.dataset.productPrice);
            
            const result = UserManager.purchaseProduct(productId, productName, productPrice);
            if (result.success) {
                showToast(result.message, 'success');
                // Faturayı göster
                showInvoice(result.invoice);
                // Yönlendirme yap
                setTimeout(() => {
                    window.location.href = "https://shopier.com/sefirroleplay";
                }, 3000);
            } else {
                showToast(result.message, 'danger');
                showLoginModal();
            }
        });
    });
});

// Faturayı göster
function showInvoice(invoiceData) {
    const invoicePreview = document.getElementById('invoicePreview');
    invoicePreview.innerHTML = `
        <div class="invoice-container">
            <h3>Fatura Detayları</h3>
            <p><strong>Fatura No:</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>Tarih:</strong> ${invoiceData.date}</p>
            <hr>
            <h4>Müşteri Bilgileri</h4>
            <p><strong>Ad:</strong> ${invoiceData.customer.name}</p>
            <p><strong>E-posta:</strong> ${invoiceData.customer.email}</p>
            <hr>
            <h4>Ürün Bilgileri</h4>
            <p><strong>Ürün Adı:</strong> ${invoiceData.product.name}</p>
            <p><strong>Birim Fiyat:</strong> ${invoiceData.product.price.toFixed(2)}₺</p>
            <hr>
            <h4>Özet</h4>
            <p><strong>Ara Toplam:</strong> ${invoiceData.totals.subtotal.toFixed(2)}₺</p>
            <p><strong>KDV (%18):</strong> ${invoiceData.totals.kdv.toFixed(2)}₺</p>
            <p><strong>Genel Toplam:</strong> ${invoiceData.totals.total.toFixed(2)}₺</p>
            <hr>
            <p class="text-muted">Fatura otomatik olarak sistemimize kaydedilmiştir.</p>
        </div>
    `;
    invoicePreview.style.display = 'block';
}

// Diğer fonksiyonlar (updateAuthUI, showToast, showLoginModal vb.) önceki gibi kalacak
/**
 * Satın Alma ve Fatura Yönetimi
 * - Kullanıcı ürün satın aldığında otomatik fatura keser
 * - Fatura bilgilerini Discord webhook'a gönderir
 */

const faturaSistemi = {
    // Webhook URL'si
    webhookUrl: "https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI",
  
    // Fatura oluştur
    faturaOlustur: function(kullanici, urun, miktar = 1) {
      const kdvOrani = 0.5; // %18 KDV
      const kdvTutari = urun.fiyat * miktar * kdvOrani;
      const genelToplam = (urun.fiyat * miktar) + kdvTutari;
  
      return {
        faturaNo: `FTR-${Date.now()}`,
        tarih: new Date().toLocaleDateString('tr-TR'),
        musteri: {
          ad: kullanici.ad,
          email: kullanici.email,
          id: kullanici.id
        },
        urun: {
          ad: urun.ad,
          birimFiyat: urun.fiyat,
          miktar: miktar
        },
        odeme: {
          araToplam: (urun.fiyat * miktar).toFixed(2),
          kdv: kdvTutari.toFixed(2),
          toplam: genelToplam.toFixed(2)
        },
        durum: "Ödeme Bekliyor"
      };
    },
  
    // Discord'a fatura gönder
    faturaGonder: async function(fatura) {
      const embed = {
        title: "YENİ FATURA OLUŞTURULDU",
        color: 0x00ff00,
        fields: [
          { name: "Fatura No", value: fatura.faturaNo, inline: true },
          { name: "Müşteri", value: fatura.musteri.ad, inline: true },
          { name: "Ürün", value: fatura.urun.ad, inline: true },
          { name: "Miktar", value: fatura.urun.miktar, inline: true },
          { name: "Birim Fiyat", value: `${fatura.urun.birimFiyat}₺`, inline: true },
          { name: "Ara Toplam", value: `${fatura.odeme.araToplam}₺`, inline: true },
          { name: "KDV (%18)", value: `${fatura.odeme.kdv}₺`, inline: true },
          { name: "Genel Toplam", value: `${fatura.odeme.toplam}₺`, inline: true },
          { name: "Durum", value: fatura.durum, inline: true }
        ],
        timestamp: new Date().toISOString()
      };
  
      try {
        await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [embed] })
        });
        console.log("Fatura Discord'a gönderildi!");
      } catch (error) {
        console.error("Webhook gönderilemedi:", error);
      }
    },
  
    // Satın alma işlemini gerçekleştir
    satinAl: function(kullanici, urun, miktar = 1) {
      // 1. Fatura oluştur
      const fatura = this.faturaOlustur(kullanici, urun, miktar);
      
      // 2. Discord'a bildirim gönder
      this.faturaGonder(fatura);
      
      // 3. Faturayı kaydet (isteğe bağlı)
      this.faturaKaydet(fatura);
      
      return fatura;
    },
  
    // Faturayı localStorage'a kaydet (isteğe bağlı)
    faturaKaydet: function(fatura) {
      const faturalar = JSON.parse(localStorage.getItem('faturalar') || '[]');
      faturalar.push(fatura);
      localStorage.setItem('faturalar', JSON.stringify(faturalar));
    }
  };
  

  

  // Satın alma işlemi yap
  const fatura = faturaSistemi.satinAl(ornekKullanici, ornekUrun, 1);
  console.log("Oluşturulan fatura:", fatura);
  
