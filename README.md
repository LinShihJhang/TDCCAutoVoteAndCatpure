# TDCC 股東會自動投票贊成與截圖工具指南

本專案程式碼基於 [Vocus 教學文章](https://vocus.cc/article/680e3a7dfd89780001db907a) 進行修改與整合。

---

## 🛠 1. 安裝與設定 Tampermonkey

在使用腳本之前，請先安裝擴充套件並調整權限：

* **安裝連結**：[Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-TW)
* **調整教學**：[允許使用者指令碼設定步驟](https://github.com/doggy8088/TampermonkeyUserscripts/blob/main/README.md)
    > 🌟 請確保已開啟「允許存取檔案網址」或相關開發者模式設定。

---

## 🗳 2. 自動投票流程 (auto_vote.js)

1.  **新增腳本**：在 Tampermonkey 中新增一個腳本，並貼上 `auto_vote.js` 程式碼。
2.  **參考教學**：詳細原理請參閱 [Vocus 教學文章](https://vocus.cc/article/680e3a7dfd89780001db907a)。
3.  **操作注意**：
    * 啟用腳本後進入電子投票網頁。
    * **投票完成後，請務必手動關閉腳本**，避免干擾後續操作。

---

## 📥 3. 瀏覽器自動下載設定

為避免下載截圖時被瀏覽器攔截，請依照下列步驟設定：

1.  開啟 Chrome **「設定」** > **「隱私權和安全性」** > **「網站設定」**。
2.  點擊 **「其他權限」** > **「自動下載」**。
3.  勾選 **「網站可以要求自動下載多個檔案」**。
4.  **新增白名單**：在「允許自動下載」清單中點擊「新增」，輸入以下網址：
    `https://stockservices.tdcc.com.tw:443`

---

## 📸 4. 自動截圖流程 (auto_catpure.js)

1.  **取得股東清單**：在電子投票網頁下載您的「持有股東會清單」。
2.  **資料轉換**：
    * 前往 [TDCC 清單轉換網站](https://tdcc-voted-stockids.pages.dev/)。
    * 將清單轉換為 **陣列格式 (Array)**。
3.  **填入腳本參數**：
    打開 `auto_catpure.js` 程式碼，將轉換後的陣列程式碼內容取代貼下面那一行程式碼 ：
    ```javascript
    // 範例：將轉換後的程式碼取代這行
    const stockIds = ['1225', '5398']; 
    ```
4.  **執行截圖**：
    * 新增 `auto_catpure.js` 腳本至 Tampermonkey。
    * 啟用腳本並**重新整理**電子投票網頁。
5.  **結束**：截圖完成後，關閉視窗並停用腳本。

---

## 🔗 相關連結
* [教學來源 - Vocus](https://vocus.cc/article/680e3a7dfd89780001db907a)
* [格式轉換工具](https://tdcc-voted-stockids.pages.dev/)
