const stopCookieName = "prefail_stop=1";
// 定期送信・停止監視・現在実行中fetchの状態を保持する
let timerId = null;
let stopWatcherId = null;
let currentController = null;
let isStopped = false;

const shouldStop = () => document.cookie.includes(stopCookieName);

// 停止条件を満たしたら、今後の送信と進行中fetchの両方を止める
const stopCommunication = (reason) => {
    if (isStopped) {
        return;
    }

    isStopped = true;
    if (timerId) {
        clearInterval(timerId);
    }
    if (stopWatcherId) {
        clearInterval(stopWatcherId);
    }
    if (currentController) {
        currentController.abort();
    }

    console.log("[victim] communication stopped", reason);
};

const sendHeartbeat = () => {
    if (isStopped) {
        return;
    }

    // depth側クリックで立つ共有cookieを検知したら即停止
    if (shouldStop()) {
        stopCommunication("prefail_stop=1 detected");
        return;
    }

    // 1回のheartbeatにつき1つのAbortControllerを紐づける
    currentController = new AbortController();
    const signal = currentController.signal;
    const url = `/assets/app-light.css?hb=${Date.now()}`;
    fetch(url, { cache: "no-store", signal })
        .then(() => {
            if (isStopped) {
                return;
            }
            console.log("[victim] heartbeat sent", url);
        })
        .catch((error) => {
            // abort由来の失敗は期待動作なので別ログにする
            if (error && error.name === "AbortError") {
                console.log("[victim] heartbeat aborted", url);
                return;
            }
            console.log("[victim] heartbeat failed", error);
        })
        .finally(() => {
            // 次回heartbeatで新しいcontrollerを作るためクリア
            currentController = null;
        });
};

// 通信負荷を維持する送信ループ
timerId = setInterval(sendHeartbeat, 1500);
// cookie監視を高頻度にして、heartbeat周期を待たずに停止する
stopWatcherId = setInterval(() => {
    if (shouldStop()) {
        stopCommunication("prefail_stop=1 detected (fast watcher)");
    }
}, 120);
sendHeartbeat();

/* サイズ調整用コメント
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...
*/