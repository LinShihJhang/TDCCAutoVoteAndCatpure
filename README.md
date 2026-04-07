此程式碼基於 「https://vocus.cc/article/680e3a7dfd89780001db907a」文章進行修改

1.安裝「篡改猴」並調整設定

🌟安裝連結

https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-TW

🌟調整教學
擴充套件「篡改猴」設定允許使用者指令碼

https://github.com/doggy8088/TampermonkeyUserscripts/blob/main/README.md


2.新增「自動投票」auto_vote.js 程式碼腳本(參考下面教學網址)

https://vocus.cc/article/680e3a7dfd89780001db907a


3.啟用自動投票，投票完關閉腳本

4.允許網站自動下載
🌟在 Chrome 瀏覽器中，若要允許網站自動下載多個檔案，點擊右上角「...」（更多）圖示，選擇
「設定」>「隱私權和安全性」>「網站設定」>「其他權限」>「自動下載」>，選擇「網站可以要求自動下載多個檔案」。若遇封鎖，可點擊網址列右側的提示圖示，選擇允許下載即可。 

🌟「可以自動下載多個檔案」部分，點選「新增」，輸入「https://stockservices.tdcc.com.tw:443」

5.在電子投票的網頁，下載持有股東會清單，並透過下面網站轉換成陣列，然後貼到「自動截圖」程式碼裡面

https://tdcc-voted-stockids.pages.dev/

(參考下面教學網址)

https://vocus.cc/article/680e3a7dfd89780001db907a

6.新增「自動截圖」auto_catpure.js 程式碼腳本(參考下面教學網址)

https://vocus.cc/article/680e3a7dfd89780001db907a

7.啟用自動截圖，重新整理，截圖完關掉視窗

