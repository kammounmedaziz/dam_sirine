# 🚀 Chat Summarization - Live Testing Guide

## 📋 Prerequisites

### 1. MongoDB Running
```bash
sudo systemctl status mongod
# Should show "active (running)"
```

### 2. Test Data Seeded
```bash
cd /home/vanitas/Desktop/dam_sirine/esprit_dam
npm run seed:messages
```

### 3. Test Users Created
- **David Smith** (Sender): `69316d85b25f4b56579930d3`
- **John Doe** (Receiver): `69316d85b25f4b56579930d5`

---

## 🖥️ Step 1: Start ConvoSummarizer Service

**Terminal 1:**
```bash
cd /home/vanitas/Desktop/dam_sirine/ConvoSummarizer
source .venv/bin/activate
python app.py
```

**Expected Output:**
```
Running on local URL: http://127.0.0.1:7861
```

---

## 🖥️ Step 2: Start NestJS Backend

**Terminal 2:**
```bash
cd /home/vanitas/Desktop/dam_sirine/esprit_dam
npm run start:dev
```

**Expected Output:**
```
✅ ValidationPipe & AllExceptionsFilter activés
🚀 Serveur en ligne : http://localhost:3000/api
📦 MongoDB connecté via MongooseModule
📚 Swagger disponible sur : http://localhost:3000/api-docs
```

---

## 🧪 Step 3: Test with Postman

### Import Collection
1. Open Postman
2. Click **Import**
3. Select **File**
4. Choose: `Chat_Summarization_Postman_Collection.json`

### Test Endpoints

#### 1. **Summarize Unread Messages** ⭐ MAIN TEST
- **Method:** POST
- **URL:** `http://localhost:3000/api/messages/summarize/69316d85b25f4b56579930d5/69316d85b25f4b56579930d3`
- **Expected Response:**
```json
{
  "summary": "David sent 7 messages about the project report...",
  "keyPoints": [
    "Completed draft yesterday",
    "Still needs charts and summary",
    "Will send completed version today",
    "Needs to review meeting feedback",
    "Will prepare presentation slides"
  ],
  "messageCount": 7,
  "timestamp": "2025-12-04T..."
}
```

#### 2. **Check Unread Messages Count**
- **Method:** GET
- **URL:** `http://localhost:3000/api/messages/unread/69316d85b25f4b56579930d5/69316d85b25f4b56579930d3`
- **Expected:** Array of 7 formatted messages

#### 3. **Get Full Conversation**
- **Method:** GET
- **URL:** `http://localhost:3000/api/messages/conversation/69316d85b25f4b56579930d3/69316d85b25f4b56579930d5`
- **Expected:** All messages between users

#### 4. **Verify Messages Marked as Read**
- **Method:** GET
- **URL:** `http://localhost:3000/api/messages/unread/69316d85b25f4b56579930d5/69316d85b25f4b56579930d3`
- **Expected:** Empty array (after summarization)

---

## 🧪 Step 4: Manual Testing with cURL

### Test Summarization
```bash
curl -X POST http://localhost:3000/api/messages/summarize/69316d85b25f4b56579930d5/69316d85b25f4b56579930d3
```

### Check Messages Before Summarization
```bash
curl http://localhost:3000/api/messages/unread/69316d85b25f4b56579930d5/69316d85b25f4b56579930d3
```

### Check Messages After Summarization
```bash
curl http://localhost:3000/api/messages/unread/69316d85b25f4b56579930d5/69316d85b25f4b56579930d3
```

---

## 🔍 Step 5: Verify in Database

### Check Messages Status
```bash
cd /home/vanitas/Desktop/dam_sirine/esprit_dam
./scripts/check-messages.sh
```

**Expected:** All messages should show `isRead: true` after summarization

---

## 🎯 Expected Test Results

### ✅ Success Indicators

1. **Summarization Response:**
   - Contains `summary` field with AI-generated text
   - Contains `keyPoints` array with bullet points
   - Contains `messageCount` (should be 7)
   - Contains `timestamp`

2. **Messages Marked as Read:**
   - Unread messages count drops to 0 after summarization
   - Database shows `isRead: true` for all messages

3. **No Errors:**
   - No 400/500 errors
   - No timeout errors
   - Clean JSON responses

### ❌ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `No unread messages to summarize` | Run `npm run seed:messages` again |
| `ECONNREFUSED` | Check if ConvoSummarizer is running on port 7861 |
| `Timeout` | Increase timeout in ChatSummarizerService |
| `MongoDB connection error` | Check MongoDB service status |

---

## 📊 Test Data Details

### Messages Content
```
1. "Good morning! Just checking in on the project status."
2. "I finished the draft of the report yesterday."
3. "I still need to add the charts and update the summary section."
4. "Planning to send the completed version by end of today."
5. "Also, need to review the feedback from the last meeting."
6. "After that, I can start preparing the presentation slides."
7. "Let me know if there's anything else I should focus on."
```

### Expected AI Summary
The AI should generate a summary like:
- David sent 7 messages about project report progress
- Key points about completion status, remaining tasks, and timeline

---

## 🎉 Success Checklist

- [ ] ConvoSummarizer running on port 7861
- [ ] NestJS backend running on port 3000
- [ ] Postman collection imported
- [ ] Summarization endpoint returns valid response
- [ ] Messages marked as read after summarization
- [ ] No errors in server logs
- [ ] Database shows correct message status

---

## 📞 Support

If you encounter issues:
1. Check server logs in both terminals
2. Verify MongoDB connection
3. Ensure ConvoSummarizer dependencies are installed
4. Check network connectivity between services

**Happy Testing! 🚀**
