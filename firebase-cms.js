// firebase-cms.js — 동수원노인전문요양원
// 공지사항 & 시설소식 게시판 Firebase 연동
// script.js의 loadBoard()가 window.db를 통해 자동 호출함

// 게시글 저장 유틸 (관리자용)
window.cmsUtils = {
  async addNotice({ title, content }) {
    if (!window.db) return;
    return window.db.collection('notices').add({
      title, content,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'notice',
    });
  },
  async addNews({ title, content }) {
    if (!window.db) return;
    return window.db.collection('news').add({
      title, content,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'news',
    });
  },
  async deletePost(collection, id) {
    if (!window.db) return;
    return window.db.collection(collection).doc(id).delete();
  },
};
