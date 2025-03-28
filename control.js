// Kupon bilgileri
const coupons = {
    "SEFIR20": { discount: 20, type: 'percent', description: "%20 İndirim" },
    "SEFIR50": { discount: 50, type: 'percent', description: "%50 İndirim" },
    "SEFIR100": { discount: 100, type: 'fixed', description: "100 TL İndirim" },
    "WELCOME10": { discount: 10, type: 'percent', description: "Hoşgeldin %10 İndirimi" }
};

// Hizmet verileri (KDV %5)
const services = {
    1: { id: 1, name: "Logo Tasarım", price: 300 },
    2: { id: 2, name: "Web Tasarım", price: 600 },
    3: { id: 3, name: "Sosyal Medya Yönetimi", price: 250 }
};

// Discord Webhook URL
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/your_webhook_url";

let currentService = null;
let customerData = {};
let invoiceData = {};
let isAdminLoggedIn = false;
let appliedCoupon = null;

// Kupon uygula
function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();
    
    if (!couponCode) {
        alert("Lütfen bir kupon kodu girin!");
        return;
    }
    
    if (coupons[couponCode]) {
        appliedCoupon = coupons[couponCode];
        alert(`Kupon uygulandı: ${appliedCoupon.description}`);
        updatePriceDisplay();
    } else {
        alert("Geçersiz kupon kodu!");
        appliedCoupon = null;
        updatePriceDisplay();
    }
}

// Fiyat görünümünü güncelle
function updatePriceDisplay() {
    if (!currentService) return;
    
    const originalPrice = currentService.price;
    let discountAmount = 0;
    let discountedPrice = originalPrice;
    
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = originalPrice * (appliedCoupon.discount / 100);
        } else {
            discountAmount = appliedCoupon.discount;
        }
        discountedPrice = originalPrice - discountAmount;
        
        // Fiyat negatif olmasın
        if (discountedPrice < 0) discountedPrice = 0;
    }
    
    document.getElementById('originalPrice').textContent = `${originalPrice.toFixed(2)} ₺`;
    document.getElementById('discountedPrice').textContent = `${discountedPrice.toFixed(2)} ₺`;
    
    if (appliedCoupon) {
        document.getElementById('discountInfo').style.display = 'block';
        document.getElementById('discountAmount').textContent = `-${discountAmount.toFixed(2)} ₺`;
        document.getElementById('couponDescription').textContent = appliedCoupon.description;
    } else {
        document.getElementById('discountInfo').style.display = 'none';
    }
}

// Fatura oluştur (KDV %5 + kupon desteği)
async function generateInvoice() {
    const now = new Date();
    const kdvRate = 0.05; // %5 KDV
    
    // Orijinal fiyat
    const originalPrice = currentService.price;
    
    // İndirim hesapla
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = originalPrice * (appliedCoupon.discount / 100);
        } else {
            discountAmount = appliedCoupon.discount;
        }
    }
    
    // İndirimli fiyat (negatif olmasın)
    const discountedPrice = Math.max(0, originalPrice - discountAmount);
    
    // KDV hesapla (indirimli fiyat üzerinden)
    const kdvAmount = discountedPrice * kdvRate;
    const total = discountedPrice + kdvAmount;
    
    invoiceData = {
        service: currentService,
        customer: customerData,
        coupon: appliedCoupon ? {
            code: document.getElementById('couponCode').value.trim().toUpperCase(),
            description: appliedCoupon.description,
            discountAmount: discountAmount
        } : null,
        invoiceNumber: `FTR-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`,
        date: now.toLocaleDateString('tr-TR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        kdvRate: kdvRate * 100, // % olarak
        kdvAmount: kdvAmount,
        total: total
    };
}

// Discord'a bildirim gönder (kupon bilgisi eklendi)
async function sendToDiscord() {
    const embed = {
        title: "Yeni Fatura Oluşturuldu",
        color: 0x00ff00,
        fields: [
            {
                name: "Fatura No",
                value: invoiceData.invoiceNumber,
                inline: true
            },
            {
                name: "Müşteri",
                value: invoiceData.customer.name,
                inline: true
            },
            {
                name: "Hizmet",
                value: invoiceData.service.name,
                inline: true
            },
            {
                name: "Orijinal Fiyat",
                value: `${invoiceData.originalPrice.toFixed(2)} ₺`,
                inline: true
            }
        ],
        timestamp: new Date().toISOString()
    };

    // Kupon bilgisi eklendi
    if (invoiceData.coupon) {
        embed.fields.push({
            name: "Kupon İndirimi",
            value: `${invoiceData.coupon.description}\n-${invoiceData.coupon.discountAmount.toFixed(2)} ₺`,
            inline: true
        });
    }

    embed.fields.push(
        {
            name: "KDV (%5)",
            value: `${invoiceData.kdvAmount.toFixed(2)} ₺`,
            inline: true
        },
        {
            name: "Toplam",
            value: `${invoiceData.total.toFixed(2)} ₺`,
            inline: true
        }
    );

    const payload = {
        username: "Fatura Botu",
        embeds: [embed],
        content: `Yeni fatura kesildi: ${invoiceData.customer.name} - ${invoiceData.total.toFixed(2)} ₺`
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Discord'a bildirim gönderilemedi:", error);
    }
}

// Fatura göster (kupon bilgisi eklendi)
function showInvoice() {
    const invoiceHTML = `
        <div class="text-center mb-4">
            <h2><i class="fas fa-file-invoice me-2 text-primary"></i>FATURA</h2>
            <p class="text-muted">Fatura No: ${invoiceData.invoiceNumber}</p>
            <p class="text-muted">${invoiceData.date}</p>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card bg-light">
                    <div class="card-body">
                        <h5><i class="fas fa-building me-2"></i>Firma Bilgileri</h5>
                        <hr>
                        <p><strong>Dijital Çözümler Ltd.</strong></p>
                        <p>Vergi No: 1234567890</p>
                        <p>Adres: Örnek Mah. No:1 İstanbul</p>
                        <p>Tel: 0212 123 45 67</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card bg-light">
                    <div class="card-body">
                        <h5><i class="fas fa-user me-2"></i>Müşteri Bilgileri</h5>
                        <hr>
                        <p><strong>${invoiceData.customer.name}</strong></p>
                        <p>${invoiceData.customer.email}</p>
                        <p>${invoiceData.customer.phone}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <table class="table table-bordered">
            <thead class="table-primary">
                <tr>
                    <th>Hizmet</th>
                    <th class="text-end">Tutar (₺)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${invoiceData.service.name}</td>
                    <td class="text-end">${invoiceData.originalPrice.toFixed(2)}</td>
                </tr>
                ${invoiceData.coupon ? `
                <tr class="table-warning">
                    <td>Kupon İndirimi (${invoiceData.coupon.description})</td>
                    <td class="text-end">-${invoiceData.coupon.discountAmount.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>İndirimli Tutar</td>
                    <td class="text-end">${invoiceData.discountedPrice.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr>
                    <td>KDV (%${invoiceData.kdvRate})</td>
                    <td class="text-end">${invoiceData.kdvAmount.toFixed(2)}</td>
                </tr>
                <tr class="table-active">
                    <td><strong>GENEL TOPLAM</strong></td>
                    <td class="text-end"><strong>${invoiceData.total.toFixed(2)} ₺</strong></td>
                </tr>
            </tbody>
        </table>
        
        <div class="alert alert-success mt-4">
            <i class="fas fa-check-circle me-2"></i>
            Fatura başarıyla oluşturuldu! Discord'a bildirim gönderildi.
        </div>
        
        <div class="text-center mt-4">
            <button class="btn btn-outline-primary me-2" onclick="printInvoice()">
                <i class="fas fa-print me-2"></i>Yazdır
            </button>
            <button class="btn btn-outline-secondary" onclick="closeInvoice()">
                <i class="fas fa-times me-2"></i>Kapat
            </button>
        </div>
    `;
    
    document.getElementById('invoicePreview').innerHTML = invoiceHTML;
    document.getElementById('invoicePreview').style.display = 'block';
}

// Satın alma formu submit işlemi
document.getElementById('purchaseForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Müşteri bilgilerini al
    customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value || "Belirtilmemiş"
    };

    // Validasyon
    if (!customerData.name || !customerData.email) {
        alert("Lütfen zorunlu alanları doldurunuz!");
        return;
    }

    // Kupon kodunu al (textarea'dan)
    const couponCode = document.getElementById('purchaseNotes').value.trim().toUpperCase();
    
    // Kupon kontrolü
    if (couponCode && coupons[couponCode]) {
        appliedCoupon = coupons[couponCode];
    } else if (couponCode) {
        alert("Geçersiz kupon kodu: " + couponCode);
        appliedCoupon = null;
    } else {
        appliedCoupon = null;
    }

    // Fatura oluştur
    await generateInvoice();
    
    // Discord'a bildirim gönder
    await sendToDiscord();
    
    // Faturayı göster
    showInvoice();
    
    // Modalı kapat
    const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
    modal.hide();
});

// Faturayı kapat
function closeInvoice() {
    document.getElementById('invoicePreview').style.display = 'none';
}

// Faturayı yazdır
function printInvoice() {
    const printContent = document.getElementById('invoicePreview').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    showInvoice(); // Faturayı tekrar göster
}

// Admin kontrolü
function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem('SefirCommunity_currentUser'));
    return currentUser && currentUser.email === 'admin@gmail.com' && currentUser.password === 'admin123';
}

// Kupon alanı için HTML örneği:
/*
<div class="mb-3">
    <label class="form-label">Kuponunuz:</label>
    <textarea class="form-control" id="purchaseNotes" rows="2" placeholder="SEFIR20, SEFIR50 gibi kupon kodlarınızı girin"></textarea>
</div>
*/
