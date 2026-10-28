# LearnAngular_K244111486

Bài tập Angular + Node/Express + MongoDB (Phạm Ngô Bảo Trân).

## Cấu trúc
| Thư mục | Nội dung |
|---|---|
| `my-app/` | Ứng dụng Angular (frontend) |
| `my-server/` | Server Express đơn giản (port mặc định trong `index.js`) |
| `my-server-mongodb/` | Server Express kết nối MongoDB `mongodb://127.0.0.1:27017` |
| `my-server-mongodb/data/` | Dữ liệu mẫu export từ MongoDB (`FashionData.Fashion.json`) |
| `SearchFashion_Submit/`, `NopBai_Exercise58/` | Bản nộp bài |
| `Fashion.json`, `User.json`, `PUT_body_CafePrincess.json` | Dữ liệu test API |

`node_modules` **không** được đưa lên git — cài lại bằng `npm install`.

## Chạy lại trên máy mới
Cần cài: Node.js (LTS), Git, MongoDB Community Server (+ MongoDB Compass nếu muốn import dữ liệu).

```bash
git clone https://github.com/YangXing0810/LearnAngular_K244111486.git
cd LearnAngular_K244111486

# Frontend
cd my-app && npm install && npx ng serve      # http://localhost:4200
cd ..

# Server
cd my-server && npm install && node index.js
cd ..
cd my-server-mongodb && npm install && npm start
```

Import dữ liệu MongoDB: mở Compass → database `FashionData`, collection `Fashion` → *Import Data* → chọn `my-server-mongodb/data/FashionData.Fashion.json`.
