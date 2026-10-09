# Napalım App (PinDrop) 📍✨

Şehirdeki insanları ortak aktiviteler, anlık harita pinleri ve 72 saatlik grup etkinlikleri etrafında bir araya getiren yeni nesil sosyal keşif platformu.

---

## 🚀 Özellikler

### 🗺️ İnteraktif Harita
- **Kategori Filtreleme:** Oyun, Kafe, Sanat, Spor, Müzik vb. kategorilere göre renkli pinler.
- **Akıllı Arama:** Semt veya aktivite adı yazıldığında anında filtreleme ve kameranın yumuşakça o semte uçması (`flyTo`).
- **Dinamik Kümeleme (Clustering):** Haritadan uzaklaşınca birbirine yakın pinlerin neon rozetlerde toplanması.
- **Neon Rota Çizgisi & Mesafe:** Tıklanan pine giden kesikli neon rota çizgisi, yürüyüş mesafesi/süresi ve Google Maps yönlendirmesi.
- **Pin Beğeni (Upvote):** Her kullanıcının 1 kez beğenip geri alabildiği beğeni sistemi.

### 🃏 Keşfet (Swipe)
- Tam ekran görsel tasarımlı kartlar.
- Kaydırma jestleri (Geç, Beğen, Süper Beğen).
- Konfeti animasyonlu eşleşme ekranı ve eşleşmeden sonra otomatik gelen samimi ilk mesajlar (icebreaker).

### 💬 Canlı Mesajlaşma & Otomatik Yanıtlar
- Birebir sohbetler ve etkinlik grup sohbetleri.
- Karakter bazlı simüle yanıt motoru (Elif, Zeynep, Burak, Can vb.).
- "Yazıyor..." animasyonu (üç zıplayan neon nokta).
- Ekran dışı bildirim toast'ları ve okunmamış mesaj sayaçları.

### 🎪 72 Saatlik Grup Etkinlikleri
- Geri sayım sayaçları (Yeşil → Turuncu → Kırmızı yanıp sönen acil mod).
- Kontenjan ilerleme çubuğu (max 30 kişi).
- Katılınca otomatik oluşan etkinlik grup sohbeti.
- Yönetici yetkileri (Grup kapatma, üye çıkarma) ve üye ayrılma sistemi.

### 👤 Gelişmiş Profil & Düzenleme
- Cihazdan fotoğraf yükleme veya 4 özel 3D maskot avatar seçimi.
- İsteğe bağlı semt/konum paylaşımı (veya konumu gizleme).
- Biyografi ve etkileşimli ilgi alanı etiketleri.

---

## 🛠️ Yerel Çalıştırma

Projeyi yerel sunucuda çalıştırmak için:

```bash
node -e "const http=require('http'),fs=require('fs'),path=require('path');const mime={'html':'text/html','css':'text/css','js':'application/javascript','png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','svg':'image/svg+xml'};http.createServer((req,res)=>{let url=req.url==='/'?'/index.html':req.url;const fp=path.join('.',decodeURIComponent(url));fs.readFile(fp,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}const ext=path.extname(fp).slice(1);res.writeHead(200,{'Content-Type':mime[ext]||'text/plain','Access-Control-Allow-Origin':'*','Cache-Control':'no-cache, no-store, must-revalidate'});res.end(data);});}).listen(3000,()=>console.log('Server running at http://localhost:3000'));"
```

Tarayıcıda açın:
👉 `http://localhost:3000`
