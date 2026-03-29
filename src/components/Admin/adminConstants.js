export const PROFILE_JSON_PLACEHOLDER = `{
  "user": {
    "name": "Your Name",
    "id": "123456",
    "department": "Department Name",
    "program": "Program Name",
    "intake": "63",
    "email": "mail@example.com",
    "mobile": "01234567890",
    "gender": "Male",
    "bloodGroup": "B+",
    "admissionSemester": "Fall, 2024",
    "avatar": "https://example.com/avatar.jpg",
    "avatarSmall": "https://example.com/avatar-small.jpg"
  }
}`;

export const ROUTINES_JSON_PLACEHOLDER = `{
  "semesters": [
    {
      "semester": "Spring, 2026",
      "routine": [
        {
          "day": "MON",
          "time": "08:15 AM to 09:45 AM",
          "course": "ACC 2102",
          "fc": "SHA",
          "room": "4404"
        }
      ]
    }
  ]
}`;

export const ROUTINE_SEMESTER_JSON_PLACEHOLDER = `{
  "semester": "Fall, 2026",
  "routine": [
    {
      "day": "SUN",
      "time": "08:15 AM to 09:45 AM",
      "course": "BUS 2102",
      "fc": "FI",
      "room": "4904"
    }
  ]
}`;

export const FEES_JSON_PLACEHOLDER = `{
  "fees": [
    {
      "semester": "Spring, 2026",
      "demand": 65000,
      "waiver": 5000,
      "paid": 60000,
      "status": "ok",
      "statusText": "Paid",
      "statusAmount": 0
    }
  ]
}`;

export const FEE_SEMESTER_JSON_PLACEHOLDER = `{
  "semester": "Fall, 2025",
  "demand": 70000,
  "waiver": 10000,
  "paid": 50000,
  "status": "due",
  "statusText": "Due",
  "statusAmount": 10000
}`;

export const CALENDAR_JSON_PLACEHOLDER = `{
  "events": [
    {
      "title": "Advising & Registration",
      "dateText": "Jan 15 - Jan 18",
      "tagType": "academic",
      "tagText": "Important",
      "start": "2026-01-15",
      "end": "2026-01-18"
    }
  ]
}`;

export const DOWNLOADS_JSON_PLACEHOLDER = `{
  "downloads": [
    {
      "title": "Syllabus - Accounting for Manufacturing Concerns",
      "category": "Syllabus",
      "url": "/documents/ACC2102_Syllabus.pdf",
      "date": "2026-01-10"
    }
  ]
}`;

export const COURSES_JSON_PLACEHOLDER = `{
  "courses": [
    {
      "code": "ACC 2102",
      "name": "Accounting for Manufacturing Concerns",
      "semester": "Spring, 2026",
      "type": "Theory",
      "credits": 3,
      "intake": "63",
      "section": "3",
      "result": "A+",
      "takeAs": "Regular"
    }
  ]
}`;

export const PENDING_COURSES_JSON_PLACEHOLDER = `{
  "pendingCourses": [
    {
      "code": "MTH 1101",
      "name": "Mathematics - I",
      "credits": 3,
      "reason": "Retake",
      "status": "pending"
    }
  ]
}`;

export const MARKS_JSON_PLACEHOLDER = `{
  "semesters": [
    {
      "semester": "Fall, 2025",
      "subjects": [
        { "code": "BUS 2105", "name": "Business Communication", "mark": 40 }
      ]
    }
  ]
}`;
