/* ============================================================
   Firebase Realtime Database Helper for Construct 3
   功能：
   - 初始化 Firebase + Realtime Database
   - 讀取某一路徑資料 (RT_ReadData)
   - 更新某一個欄位 (RT_UpdateField)
   - 監聽某一路徑，並自動偵測哪個欄位改變 (RT_ListenValueWithDiff)
   ============================================================ */

/* -------------------------------------------
   1. 載入 Firebase SDK（Compat 版本）
-------------------------------------------- */
window.LoadFirebaseSDK = async function () {
    if (window._firebaseLoaded) return;

    const load = (url) => import(url);

    await load("https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js");
    await load("https://www.gstatic.com/firebasejs/11.0.1/firebase-database-compat.js");

    window._firebaseLoaded = true;
    console.log("🔥 RTDB: Firebase SDK Loaded");
};

/* -------------------------------------------
   2. 初始化 Realtime Database（InitFirebase）
-------------------------------------------- */
window.InitFirebase = async function () {
    if (window._initPromise) return window._initPromise;

    window._initPromise = (async () => {
        await window.LoadFirebaseSDK();

        // ⚠️ 這裡換成你自己的設定（包含 databaseURL）
        const firebaseConfig = {
     apiKey: "AIzaSyCK7sNXMML-IA_ZjaiAOXyN8ftCrLn39uA",
    authDomain: "theendoftheworld.firebaseapp.com",
    databaseURL: "https://theendoftheworld-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "theendoftheworld",
    storageBucket: "theendoftheworld.appspot.com",
    messagingSenderId: "333484279077",
    appId: "1:333484279077:web:53ddd6067e1f4b45c3c6cc"
        };

        console.log("🚀 RTDB: 初始化 Firebase...");
        window._firebaseApp = firebase.initializeApp(firebaseConfig);
        window._rtdb = firebase.database();
        console.log("✅ RTDB: 初始化完成");
    })();

    return window._initPromise;
};

/* -------------------------------------------
   3. 讀取某一路徑的資料（RT_ReadData）
   path 例： "controllers/main"
-------------------------------------------- */
window.RT_ReadData = async function (path) {
    if (!window._initPromise) await window.InitFirebase();
    await window._initPromise;

    const ref = window._rtdb.ref(path);
    const snap = await ref.get();

    if (!snap.exists()) return null;
    return snap.val();
};

/* -------------------------------------------
   4. 更新某一個欄位（RT_UpdateField）
   - path: 節點路徑，例如 "controllers/main"
   - fieldName: 欄位名稱，例如 "stage"
   - value: 新值，例如 3
-------------------------------------------- */
window.RT_UpdateField = async function (path, fieldName, value) {
    if (!window._initPromise) await window.InitFirebase();
    await window._initPromise;

    try {
        const ref = window._rtdb.ref(path);
        await ref.update({ [fieldName]: value });

        console.log(`🔥 RTDB 更新：${path}.${fieldName} =`, value);
        return { success: true };
    } catch (err) {
        console.error("❌ RT_UpdateField Error:", err);
        return { success: false, error: err.message };
    }
};

/* -------------------------------------------
   5. 監聽某一路徑，並偵測「哪個欄位改變」
   - path: 例如 "controllers/main"
   - callback: function (info) {...}
     info 結構：
     {
       field:    欄位名 (e.g. "stage"),
       newValue: 新值,
       oldValue: 舊值,
       fullData: 整個節點的新資料物件
     }

   回傳值：一個解除監聽的函式 () => {}
-------------------------------------------- */
window.RT_ListenValueWithDiff = async function (path, callback) {
    if (!window._initPromise) await window.InitFirebase();
    await window._initPromise;

    const ref = window._rtdb.ref(path);
    let lastData = null;

const handler = (snap) => {
    const newData = snap.val() || {};

    // === 第一次載入（lastData == null）===
    if (lastData === null) {
        callback({
            field: null,
            newValue: null,
            oldValue: null,
            fullData: newData
        });

        lastData = newData;
        return;
    }

    // === 第二次以後，偵測變動 ===
    const keys = ["stage", "chose", "minu", "hour"];

    keys.forEach((key) => {
        const oldValue = lastData[key];
        const newValue = newData[key];

        if (oldValue !== newValue) {
            callback({
                field: key,
                newValue,
                oldValue,
                fullData: newData
            });
        }
    });

    lastData = newData;
};


    ref.on("value", handler);

    // 回傳解除監聽函式
    return function unsubscribe() {
        ref.off("value", handler);
        console.log("🛑 RTDB: 已解除監聽", path);
    };
};
