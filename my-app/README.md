# technic-webb2

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd technic-web/my-app
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Environment dosyasını oluşturun:
```bash
cp .env.example .env
```
`.env` dosyasını açın ve API URL'inizi yapılandırın.

4. Uygulamayı başlatın:
```bash
npm start
```

## Environment Variables

Uygulama aşağıdaki environment değişkenlerini kullanır:

- `REACT_APP_API_URL`: Backend API URL'i (örnek: http://localhost:8080/api)

**Not:** `.env` dosyası git'e push edilmemelidir. Sadece `.env.example` dosyası repository'de tutulur.

