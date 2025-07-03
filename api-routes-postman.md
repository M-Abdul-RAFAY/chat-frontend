# API Routes for Postman

Replace `https://hivechat-2de5.onrender.com/api/v1` with your actual API base URL if different.

---

## 1. Get All Conversations (Authenticated)

**GET** `/api/v1/conversations`

- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

---

## 2. Get Specific Conversation (Authenticated)

**GET** `/api/v1/conversations/:id`

- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

---

## 3. Send Message in Conversation (Authenticated)

**POST** `/api/v1/conversations/:id/messages`

- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "content": "Hello from agent",
    "sender": "agent",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

---

## 4. Mark Conversation as Read (Authenticated)

**PATCH** `/api/v1/conversations/:id/read`

- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

---

## 5. Update Conversation Status (Authenticated)

**PATCH** `/api/v1/conversations/:id/status`

- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "status": "won"
  }
  ```

---

## 6. Get Widget Config (Authenticated)

**GET** `/api/v1/widget/config`

- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

---

## 7. Generate Widget (Authenticated)

**POST** `/api/v1/widget/generate`

- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`

---

## 8. Update Widget Config (Authenticated)

**PUT** `/api/v1/widget/config`

- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "companyName": "My Company",
    "welcomeMessage": "Welcome!",
    "primaryColor": "#3B82F6",
    "isActive": true
  }
  ```

---

## 9. Get Widget Public Data (No Auth)

**GET** `/api/v1/widget/:widgetId/public`

- Headers:
  - `Content-Type: application/json`

---

## 10. Create Conversation from Widget (No Auth)

**POST** `/api/v1/widget/:widgetId/conversation`

- Headers:
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "name": "Customer Name",
    "email": "customer@email.com",
    "phone": "1234567890",
    "message": "Hello, I need help!"
  }
  ```

---

## 11. Send Message from Widget (No Auth)

**POST** `/api/v1/widget/:widgetId/conversation/:conversationId/message`

- Headers:
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "content": "Customer reply",
    "sender": "customer",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

---
