// firebase-consult.js — 동수원노인전문요양원
// 상담 신청 폼 → Firestore 저장
// 실제 처리는 script.js consultForm submit 핸들러에서 window.db를 통해 수행
// 이 파일은 EmailJS 발송 로직 자리 (미설정 시 Firebase 저장만 동작)

// ──────────────────────────────────────────────
//  EmailJS 설정 (아래 3개 값을 발급받아 교체하세요)
//  https://emailjs.com 에서 무료 계정 생성 후:
//    1) Email Service 추가 → Service ID 복사
//    2) Email Template 추가 → Template ID 복사
//    3) Account > API Keys → Public Key 복사
// ──────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // 교체 필요
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // 교체 필요
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // 교체 필요

// EmailJS 초기화 (설정 완료 후 주석 해제)
// if (typeof emailjs !== 'undefined') {
//   emailjs.init(EMAILJS_PUBLIC_KEY);
// }

// 상담 신청 이메일 발송 함수 (script.js 에서 호출 가능)
window.sendConsultEmail = async function(formData) {
  if (typeof emailjs === 'undefined') return;
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') return; // 미설정 시 스킵

  const templateParams = {
    guardian_name:   formData.guardianName,
    phone:           formData.phone,
    patient_name:    formData.patientName,
    patient_age:     formData.patientAge || '미입력',
    care_grade:      formData.careGrade  || '미입력',
    admission_date:  formData.admissionDate || '미정',
    message:         formData.message    || '없음',
    submitted_at:    new Date().toLocaleString('ko-KR'),
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    console.log('상담 신청 이메일 발송 완료');
  } catch (err) {
    console.warn('이메일 발송 실패 (Firebase 저장은 완료):', err);
  }
};
