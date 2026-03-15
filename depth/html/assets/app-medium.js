const statusEl = document.getElementById("stop-status");

// クリックをトリガーに、全サブドメイン共有の停止フラグcookieを立てる
const stopAttackVictimComm = () => {
    document.cookie = "prefail_stop=1; Domain=.lab-ish.com; Path=/; Max-Age=600; SameSite=Lax; Secure";
    if (statusEl) {
        statusEl.textContent = "stop signal sent: prefail_stop=1";
    }
    console.log("[depth] stop signal sent to .lab-ish.com");
};

// ユーザーの最初の1クリックだけで停止シグナルを送る
document.addEventListener(
    "click",
    () => {
        stopAttackVictimComm();
    },
    { once: true }
);

