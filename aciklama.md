# AI Not Uygulaması - Kapsamlı Proje Açıklaması

## 1. Projeye Genel Bakış

Bu proje, **MERN yığını** (MongoDB, Express.js, React.js, Node.js) kullanılarak geliştirilmiş, yapay zeka destekli bir not alma uygulamasıdır. Kullanıcıların notlar oluşturmasına, düzenlemesine, silmesine ve bu notlar için yapay zeka aracılığıyla özetler oluşturmasına olanak tanır.

**Temel Özellikler:**

*   Kullanıcı Kaydı ve Girişi (Authentication)
*   Not Oluşturma, Okuma, Güncelleme, Silme (CRUD işlemleri)
*   AI Destekli Not Özetleme (Hugging Face API ile)
*   Notları Etiketleme, Renklendirme, Sabitleme, Arşivleme (Bu özellikler daha önceki geliştirmelerde eklenmiş olabilir)

## 2. Proje Yapısı

Proje, iki ana bölümden oluşur:

*   **`server` klasörü:** Backend (sunucu taraflı) kodlarını içerir. Node.js ve Express.js ile yazılmıştır.
*   **`client` klasörü:** Frontend (istemci taraflı) kodlarını içerir. React.js ile yazılmıştır.

Bu ayrım, geliştirme ve yönetimi kolaylaştırır.

## 3. Backend (`server` Klasörü)

Backend, API (Uygulama Programlama Arayüzü) sağlayarak frontend'in veritabanı ile etkileşim kurmasını, kullanıcı kimlik doğrulama işlemlerini ve AI analizlerini gerçekleştirmesini sağlar.

### 3.1. `server.js` (Ana Sunucu Dosyası)

*   **Görevi:** Backend uygulamasının giriş noktasıdır. Express uygulamasını başlatır, gerekli middleware'leri (ara yazılımları) yükler, veritabanı bağlantısını kurar ve API rotalarını tanımlar.
*   **Temel İşlevleri:**
    *   Express uygulamasını oluşturur: `const app = express();`
    *   JSON veri formatını işlemek için middleware: `app.use(express.json({ extended: false }));`
    *   CORS (Cross-Origin Resource Sharing) ayarları (gerekliyse).
    *   Veritabanı bağlantısını başlatır (genellikle ayrı bir `config/db.js` dosyasından çağrılır).
    *   API rotalarını tanımlar:
        ```javascript
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/notes', require('./routes/notes'));
        app.use('/api/ai', require('./routes/aiRoutes'));
        ```
    *   Belirlenen port üzerinden sunucuyu dinlemeye başlar: `app.listen(PORT, () => console.log(...));`

```javascript
// server/server.js dosyasından örnek bir kesit
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Veritabanı bağlantı fonksiyonu

dotenv.config(); // .env dosyasındaki değişkenleri yükler
connectDB();    // Veritabanına bağlanır

const app = express();
app.use(express.json({ extended: false })); // Gelen isteklerde JSON body'sini parse eder

// Ana Rota
app.get('/', (req, res) => res.send('API Çalışıyor'));

// Rotaları Tanımla
app.use('/api/users', require('./routes/users')); // Örnek, kullanıcı kaydı için olabilir
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda başlatıldı`));
```

### 3.2. `config/db.js` (Veritabanı Bağlantısı)

*   **Görevi:** MongoDB veritabanına Mongoose kütüphanesi aracılığıyla bağlanmayı sağlar.
*   Bağlantı URI'si genellikle `.env` dosyasından alınır.

```javascript
// server/config/db.js dosyasından örnek bir kesit
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Mongoose 6 ve sonrası için useCreateIndex ve useFindAndModify artık gerekli değil
        });
        console.log('MongoDB Bağlantısı Başarılı...');
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Hata durumunda uygulamayı sonlandır
    }
};

module.exports = connectDB;
```

### 3.3. `models/` Klasörü (Veri Modelleri)

Bu klasör, Mongoose şemalarını kullanarak veritabanındaki koleksiyonların (tabloların) yapısını tanımlar.

*   **`User.js` (Kullanıcı Modeli):**
    *   Kullanıcıların bilgilerini (isim, e-posta, şifre vb.) saklamak için şemayı tanımlar.
    *   Şifreler genellikle `bcryptjs` kütüphanesi ile hash'lenerek (şifrelenerek) saklanır.

    ```javascript
    // server/models/User.js dosyasından örnek bir kesit
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');

    const UserSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    });

    // Şifreyi kaydetmeden önce hash'le
    UserSchema.pre('save', async function(next) {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    });

    module.exports = mongoose.model('User', UserSchema);
    ```

*   **`Note.js` (Not Modeli):**
    *   Notların bilgilerini (başlık, içerik, etiketler, renk, kullanıcı ID'si, AI özeti vb.) saklamak için şemayı tanımlar.
    *   `user` alanı, notun hangi kullanıcıya ait olduğunu belirtmek için `User` modeline bir referans içerir.

    ```javascript
    // server/models/Note.js dosyasından örnek bir kesit
    const mongoose = require('mongoose');

    const NoteSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        tags: [{ type: String }],
        color: { type: String, default: '#ffffff' },
        isPinned: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        aiSummary: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    module.exports = mongoose.model('Note', NoteSchema);
    ```

### 3.4. `routes/` Klasörü (API Rotaları)

Bu klasör, gelen API isteklerini ilgili kontrolcü (controller) fonksiyonlarına yönlendiren rota tanımlarını içerir.

*   **`auth.js` (Kimlik Doğrulama Rotaları):**
    *   `/api/auth/register`: Kullanıcı kaydı.
    *   `/api/auth/login`: Kullanıcı girişi.
    *   `/api/auth/me`: Giriş yapmış kullanıcının bilgilerini getirme (genellikle JWT token ile korunur).

*   **`notes.js` (Not Rotaları):**
    *   `/api/notes` (GET): Giriş yapmış kullanıcının tüm notlarını listeler.
    *   `/api/notes` (POST): Yeni bir not oluşturur.
    *   `/api/notes/:id` (GET): Belirli bir ID'ye sahip notu getirir.
    *   `/api/notes/:id` (PUT): Belirli bir ID'ye sahip notu günceller.
    *   `/api/notes/:id` (DELETE): Belirli bir ID'ye sahip notu siler.
    Bu rotalar genellikle `auth` middleware'i ile korunur, böylece sadece giriş yapmış kullanıcılar kendi notlarına erişebilir.

*   **`aiRoutes.js` (AI Rotaları):**
    *   `/api/ai/analyze` (POST): Metin analizi (özetleme) için kullanılır. Bu da `auth` middleware'i ile korunabilir.

```javascript
// server/routes/notes.js dosyasından örnek bir kesit
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Kimlik doğrulama middleware'i
const noteController = require('../controllers/noteController');

// @route   POST api/notes
// @desc    Yeni not oluştur
// @access  Private
router.post('/', auth, noteController.createNote);

// @route   GET api/notes
// @desc    Kullanıcının tüm notlarını al
// @access  Private
router.get('/', auth, noteController.getAllNotes);

// @route   PUT api/notes/:id
// @desc    Notu güncelle
// @access  Private
router.put('/:id', auth, noteController.updateNote);

// Diğer rotalar (GET :id, DELETE :id) ...
module.exports = router;
```

### 3.5. `controllers/` Klasörü (Kontrolcüler)

Kontrolcüler, rotalardan gelen istekleri işleyen, veritabanı işlemleri yapan ve yanıtları oluşturan mantığı içerir.

*   **`authController.js`:**
    *   `registerUser`: Yeni kullanıcı kaydı mantığı.
    *   `loginUser`: Kullanıcı giriş mantığı, şifre kontrolü ve JWT (JSON Web Token) oluşturma.
    *   `getMe`: Giriş yapmış kullanıcının bilgilerini döndürme.

*   **`noteController.js`:**
    *   `createNote`: Yeni not oluşturma ve veritabanına kaydetme.
    *   `getAllNotes`: Kullanıcının tüm notlarını veritabanından çekme.
    *   `getNoteById`: Belirli bir notu çekme.
    *   `updateNote`: Notu güncelleme (AI özeti dahil).
    *   `deleteNote`: Notu silme.

*   **`aiController.js`:**
    *   `analyzeText`: Frontend'den gelen metni alıp Hugging Face API'sine göndererek özetleme işlemi yapma ve sonucu döndürme. (Detayları bir önceki mesajda verdik).

### 3.6. `middleware/auth.js` (Kimlik Doğrulama Ara Yazılımı)

*   **Görevi:** Gelen isteklerdeki JWT token'ını doğrulamak.
*   Token geçerliyse, token içindeki kullanıcı bilgisini (`req.user`) bir sonraki fonksiyona (genellikle kontrolcüye) iletir.
*   Token geçersiz veya yoksa, hata döndürür ve isteğin devam etmesini engeller. Bu, özel rotaların (örneğin, not oluşturma) sadece giriş yapmış kullanıcılar tarafından erişilebilmesini sağlar.

```javascript
// server/middleware/auth.js dosyasından örnek bir kesit
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Header'dan token'ı al
    const token = req.header('x-auth-token');

    // Token yoksa
    if (!token) {
        return res.status(401).json({ msg: 'Token yok, yetkilendirme reddedildi' });
    }

    try {
        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // payload içindeki user nesnesini req.user'a ata
        next(); // Bir sonraki middleware veya route handler'a geç
    } catch (err) {
        res.status(401).json({ msg: 'Token geçerli değil' });
    }
};
```

### 3.7. `.env` Dosyası

*   **Görevi:** Hassas bilgileri (veritabanı bağlantı string'i, JWT gizli anahtarı, Hugging Face API token'ı, port numarası vb.) ve ortam bazlı konfigürasyonları saklamak.
*   Bu dosya **asla** GitHub'a yüklenmemelidir (`.gitignore` dosyasında belirtilir).

## 4. Frontend (`client` Klasörü)

Frontend, kullanıcı arayüzünü (UI) oluşturur, kullanıcı etkileşimlerini yönetir ve backend API'si ile iletişim kurarak veri alışverişi yapar.

### 4.1. `public/index.html`

*   **Görevi:** React uygulamasının yükleneceği ana HTML dosyasıdır. Genellikle `<div id="root"></div>` gibi bir eleman içerir.

### 4.2. `src/index.js`

*   **Görevi:** React uygulamasının giriş noktasıdır. `App` bileşenini `public/index.html` içindeki `root` div'ine render eder.
*   Global context provider'ları (AuthContext, NotesContext vb.) genellikle burada `App` bileşenini sarar.

```javascript
// client/src/index.js dosyasından örnek bir kesit
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Global stiller
import { AuthProvider } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
// import { ThemeProvider } from './context/ThemeContext'; // Varsa

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NotesProvider>
        {/* <ThemeProvider> */}
          <App />
        {/* </ThemeProvider> */}
      </NotesProvider>
    </AuthProvider>
  </React.StrictMode>
);
```

### 4.3. `src/App.js`

*   **Görevi:** Uygulamanın ana bileşenidir. Genellikle `react-router-dom` kullanarak sayfa yönlendirmelerini (routing) ayarlar.
*   Farklı URL yollarına göre hangi sayfa bileşenlerinin render edileceğini belirler.

```javascript
// client/src/App.js dosyasından örnek bir kesit
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import CreateNotePage from './pages/CreateNote';
import EditNotePage from './pages/EditNote';
import NoteDetailPage from './pages/NoteDetail';
// ... diğer sayfalar

function App() {
  return (
    <Router>
      <MainLayout> {/* Navbar ve Footer gibi genel düzeni sağlar */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} /> {/* Korunmuş rota olabilir */}
          <Route path="/create-note" element={<CreateNotePage />} /> {/* Korunmuş rota */}
          <Route path="/edit-note/:id" element={<EditNotePage />} /> {/* Korunmuş rota */}
          <Route path="/notes/:id" element={<NoteDetailPage />} /> {/* Korunmuş rota */}
          {/* ... diğer rotalar */}
        </Routes>
      </MainLayout>
    </Router>
  );
}
export default App;
```

### 4.4. `src/context/` Klasörü (Global State Yönetimi)

React Context API, uygulama genelinde state (durum) paylaşımını ve bu state'i güncelleyecek fonksiyonları sağlamak için kullanılır. Prop drilling (props'ları çok sayıda iç içe bileşene aktarma) sorununu çözmeye yardımcı olur.

*   **`AuthContext.js`:**
    *   Kullanıcının giriş yapmış olup olmadığını (`isAuthenticated`), mevcut kullanıcı bilgilerini (`user`) ve JWT token'ını (`token`) saklar.
    *   `login`, `register`, `logout`, `loadUser` gibi fonksiyonları sağlar. Bu fonksiyonlar backend API'si ile iletişim kurar.

*   **`NotesContext.js`:**
    *   Kullanıcının notlarını (`notes`), notlarla ilgili yükleme durumlarını (`loading`) ve hataları (`error`) saklar.
    *   `getNotes`, `createNote`, `updateNote`, `deleteNote`, `analyzeNoteWithAI` gibi fonksiyonları sağlar. Bu fonksiyonlar backend API'si ile iletişim kurar.

*   **`ThemeContext.js` (Varsa):**
    *   Uygulamanın tema bilgilerini (açık/koyu mod) ve temayı değiştirecek fonksiyonları saklayabilir.

### 4.5. `src/pages/` Klasörü (Sayfa Bileşenleri)

Bu klasör, uygulamanın farklı sayfalarını temsil eden React bileşenlerini içerir.

*   **`Home.js`:** Genellikle uygulamanın ana karşılama sayfası.
*   **`Login.js` / `Register.js`:** Kullanıcı giriş ve kayıt formlarını içerir. `AuthContext`'teki fonksiyonları kullanarak backend ile iletişim kurar.
*   **`Dashboard.js`:** Giriş yapmış kullanıcının notlarını listeler. `NotesContext`'ten notları alır.
*   **`CreateNote.js`:** Yeni not oluşturma formunu içerir.
*   **`EditNote.js`:** Mevcut bir notu düzenleme formunu ve AI analiz butonunu içerir. (Detayları bir önceki mesajda verdik).
*   **`NoteDetail.js`:** Tek bir notun detaylarını gösterir (AI özeti dahil).

Bu sayfa bileşenleri, genellikle `useState` ve `useEffect` gibi React Hook'larını kullanarak kendi yerel state'lerini yönetir ve `useContext` Hook'u ile global context'lere erişir.

### 4.6. `src/components/` Klasörü (Tekrar Kullanılabilir Bileşenler)

Bu klasör, uygulama içinde birden fazla yerde kullanılabilen daha küçük UI bileşenlerini içerir (örneğin, `Navbar.js`, `NoteItem.js`, `Button.js`, `Modal.js` vb.). Bu, kod tekrarını azaltır ve bakımı kolaylaştırır.

### 4.7. `src/layouts/MainLayout.js`

*   **Görevi:** Uygulamanın genel sayfa düzenini (örneğin, Navbar, Sidebar, Footer) sağlamak. `App.js`'deki `Routes` bileşenini sarmalayarak tüm sayfalarda tutarlı bir görünüm oluşturur.

### 4.8. API Çağrıları

Frontend, backend ile genellikle `axios` veya tarayıcının yerel `fetch` API'si aracılığıyla iletişim kurar. Bu çağrılar genellikle Context dosyalarında (örn: `AuthContext.js`, `NotesContext.js`) veya doğrudan sayfa bileşenlerinde yapılır. JWT token'ı gerektiren isteklerde, token HTTP başlıklarına (`Authorization: Bearer YOUR_TOKEN` veya `x-auth-token: YOUR_TOKEN`) eklenir.

## 5. AI Entegrasyonu (Özet)

AI özetleme özelliği, frontend ve backend arasındaki koordineli bir çalışma ile gerçekleştirilir:

1.  **Frontend (`EditNote.js`):** Kullanıcı "AI ile Analiz Et" butonuna tıklar. Not içeriği `NotesContext` aracılığıyla backend'e gönderilir.
2.  **Backend (`aiController.js`):** Gelen metni alır, Hugging Face API'sine özetleme isteği gönderir.
3.  **Hugging Face API:** Metni işler ve özeti döndürür.
4.  **Backend:** Özeti frontend'e JSON olarak geri gönderir.
5.  **Frontend:** Gelen özeti alır, `aiResults` ve `formData.aiSummary` state'lerini günceller, kullanıcıya gösterir.
6.  **Kaydetme:** Kullanıcı notu kaydettiğinde, `formData.aiSummary` (güncel özeti içeren) `noteData` ile birlikte backend'e gönderilir.
7.  **Backend (`noteController.js`):** `updateNote` fonksiyonu, gelen `aiSummary`'yi alır ve notu veritabanında bu özetle birlikte günceller.

## 6. Anahtar Kavramlar

*   **REST API:** Backend, frontend'in HTTP istekleri (GET, POST, PUT, DELETE) aracılığıyla kaynaklara (kullanıcılar, notlar) erişmesini sağlayan bir RESTful API sunar.
*   **Mongoose:** MongoDB için bir ODM (Object Data Modeling) kütüphanesidir. Veri modelleri oluşturmayı, veritabanı sorguları yapmayı ve veri doğrulama işlemlerini kolaylaştırır.
*   **React Hooks:** `useState`, `useEffect`, `useContext` gibi fonksiyonlar, fonksiyonel bileşenlerde state ve lifecycle özelliklerini kullanmayı sağlar.
*   **Context API:** React'ta global state yönetimi için bir mekanizmadır.
*   **JWT (JSON Web Token):** Kullanıcı kimlik doğrulama ve yetkilendirme için güvenli bir yöntemdir. Kullanıcı giriş yaptığında bir token oluşturulur ve sonraki isteklerde bu token kullanılır.

---

Bu kapsamlı açıklama, AI Not Uygulamasının tüm ana parçalarını ve bunların nasıl bir araya geldiğini anlamana yardımcı olacaktır. Her bir dosya ve klasörün projenin genel işleyişine nasıl katkıda bulunduğunu görebilirsin.