# 🎵 Dashboard วิเคราะห์อายุความนิยมของเพลง (Song Longevity Dashboard)

เว็บแดชบอร์ดสำหรับวิเคราะห์ข้อมูลอายุความนิยมของเพลง (Song Longevity) โดยใช้ข้อมูลจากไฟล์ `song_longevity.csv` เพื่อศึกษาปัจจัยที่ส่งผลต่อความนิยมของเพลงในระยะยาว และแสดงผลผ่านกราฟเชิงโต้ตอบ (Interactive Dashboard)

---

## 📌 คุณสมบัติหลัก

- แสดงข้อมูลสรุป (KPI)
  - จำนวนเพลงทั้งหมด
  - ค่าเฉลี่ยยอดสตรีมหลัง 3 ปี
  - อัตราเพลงฮิต (% Hit Rate)
  - ค่าเฉลี่ยอายุความนิยมของเพลง

- ตัวกรองข้อมูล (Filters)
  - ประเภทเพลง (Genre)
  - ระดับค่ายเพลง (Label Tier)
  - สถานะเพลงฮิต (Hit / Non-Hit)

- กราฟวิเคราะห์ข้อมูล
  1. Scatter Plot
     - ความสัมพันธ์ระหว่างยอดสตรีมเดือนแรกและยอดสตรีมหลัง 3 ปี

  2. Bar Chart
     - จำนวนเพลงแยกตามประเภทเพลง

  3. Doughnut Chart
     - อัตราเพลงฮิตจำแนกตามระดับค่ายเพลง

  4. Correlation Analysis
     - วิเคราะห์ค่าสหสัมพันธ์ (Pearson Correlation)
     - แสดงตัวแปรที่มีความสัมพันธ์กับยอดสตรีมหลัง 3 ปีมากที่สุด

- Insight อัตโนมัติ
  - สรุปความสัมพันธ์ระหว่างยอดสตรีมเดือนแรกและยอดสตรีมระยะยาว

---

## 🗂 โครงสร้างไฟล์

```text
song-longevity-dashboard/
│
├── index.html
├── style.css
├── app.js
└── song_longevity.csv
```

---

## 📊 ชุดข้อมูลที่ใช้

ไฟล์ข้อมูล:

```text
song_longevity.csv
```

ตัวอย่างตัวแปรสำคัญ

| ตัวแปร | ความหมาย |
|----------|----------|
| genre | ประเภทเพลง |
| label_tier | ระดับค่ายเพลง |
| streams_3yr | ยอดสตรีมหลัง 3 ปี |
| first_month_streams | ยอดสตรีมเดือนแรก |
| halflife_days | อายุความนิยมของเพลง |
| is_hit | สถานะเพลงฮิต |
| marketing_budget | งบประมาณการตลาด |
| tiktok_virality | ระดับความไวรัลบน TikTok |
| playlist_adds_first_month | จำนวนการเพิ่มเข้าเพลย์ลิสต์เดือนแรก |

---

## 🛠 เทคโนโลยีที่ใช้

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Chart.js

---

## 📈 การวิเคราะห์ที่นำเสนอ

### Scatter Plot

วิเคราะห์ความสัมพันธ์ระหว่าง

- ยอดสตรีมเดือนแรก
- ยอดสตรีมหลัง 3 ปี

เพื่อดูว่าเพลงที่ได้รับความนิยมตั้งแต่เปิดตัว จะยังคงได้รับความนิยมในระยะยาวหรือไม่

### Genre Distribution

เปรียบเทียบจำนวนเพลงในแต่ละประเภทเพลง

### Hit Rate by Label Tier

วิเคราะห์สัดส่วนเพลงฮิตของแต่ละระดับค่ายเพลง

### Correlation Analysis

ใช้ Pearson Correlation วิเคราะห์ความสัมพันธ์ของตัวแปรต่าง ๆ เช่น

- Energy
- Danceability
- Acousticness
- Marketing Budget
- TikTok Virality
- Playlist Adds
- Artist Monthly Listeners

กับยอดสตรีมหลัง 3 ปี

---

## 💡 ประโยชน์ของโครงการ

- ศึกษาพฤติกรรมความนิยมของเพลง
- วิเคราะห์ปัจจัยที่มีผลต่อความสำเร็จของเพลง
- ฝึกการทำ Data Visualization
- ฝึกการพัฒนา Dashboard ด้วย JavaScript

---

## 👨‍💻 ผู้พัฒนา
นางสาว ธิติลักษณ์ ธงงาม
พัฒนาเพื่อการศึกษาในรายวิชา Data Analytics / Business Intelligence