// Ví dụ tối giản: đăng nhập Google + ghi chú riêng tư trong Firestore.
// firebaseConfig KHÔNG phải secret. Hàng rào thật là firestore.rules.
// Thay các giá trị YOUR_... bằng cấu hình từ Firebase console (Project settings > Your apps).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-firebase-project-id.firebaseapp.com',
  projectId: 'your-firebase-project-id',
  appId: 'YOUR_APP_ID',
}

const $ = (id) => document.getElementById(id)
const configured = !firebaseConfig.apiKey.startsWith('YOUR_')

if (!configured) {
  $('status').textContent = 'Chưa điền firebaseConfig trong public/app.js (xem README).'
} else {
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  let stop = () => {}

  $('login').onclick = () => signInWithPopup(auth, new GoogleAuthProvider())
  $('logout').onclick = () => signOut(auth)

  $('form').onsubmit = async (e) => {
    e.preventDefault()
    await addDoc(collection(db, 'notes'), {
      ownerId: auth.currentUser.uid,
      text: $('text').value,
      createdAt: serverTimestamp(),
    })
    $('text').value = ''
  }

  onAuthStateChanged(auth, (user) => {
    stop()
    $('login').hidden = !!user
    $('logout').hidden = !user
    $('form').hidden = !user
    $('list').textContent = ''
    $('status').textContent = user ? 'Xin chào ' + user.displayName : 'Hãy đăng nhập.'
    if (!user) return
    // Query phải lọc theo ownerId, nếu không rules sẽ từ chối.
    const q = query(collection(db, 'notes'), where('ownerId', '==', user.uid))
    stop = onSnapshot(q, (snap) => {
      $('list').textContent = ''
      snap.forEach((d) => {
        const li = document.createElement('li')
        li.textContent = d.data().text // textContent, không dùng innerHTML
        $('list').appendChild(li)
      })
    })
  })
}
