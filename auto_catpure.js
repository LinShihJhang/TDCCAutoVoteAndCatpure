// ==UserScript==
// @name         TDCC 股票投票頁自動截圖
// @namespace    http://tampermonkey.net/
// @version      11.3
// @description  可以自動截圖投票結果，儲存在預設下載位置
// @match        https://stockservices.tdcc.com.tw/evote/shareholder/*
// @author       shihchang(Edited based on allen_chan's version)
// @grant        none
// @run-at       ddocument-idle 
// @noframes
// ==/UserScript==

// source blog url: https://vocus.cc/article/680e3a7dfd89780001db907a

(function() {
    'use strict';

    const stockIds = ['1225', '5398'];

    const storageKey = 'currentStockIndex';
    const returnFlagKey = 'returningFromVote';
    let currentIndex = 0;
    let currentStockId = '';

    let isProcessing = false; // 🔒 新增：狀態鎖，預設為未處理

    function loadProgress() {
        const savedIndex = localStorage.getItem(storageKey);
        if (savedIndex !== null) {
            currentIndex = parseInt(savedIndex, 10);
            console.log(`📂 載入記憶 currentIndex = ${currentIndex}`);
        } else {
            currentIndex = 0;
            console.log('🆕 沒有記憶，從頭開始');
        }
    }

    function saveProgress() {
        localStorage.setItem(storageKey, currentIndex.toString());
        console.log(`💾 儲存進度：第 ${currentIndex + 1} 筆`);
    }

    function clearProgress() {
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(returnFlagKey);
        alert('✅ 已清除記憶！請手動重新整理頁面重新開始');
        console.log('🧹 清除記憶完成');
        updateProgressText('已清除記憶');
    }

    function waitForElement(selector, callback) {
        // 1. 如果元素已經在畫面上，直接執行
        if (document.querySelector(selector)) {
            callback();
            return;
        }

        console.log(`⏳ 建立觀察者，等待 ${selector} 出現...`);

        // 2. 建立一個觀察者 (Observer)
        const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector(selector)) {
                console.log(`✅ 發現元素 ${selector}！`);
                obs.disconnect(); // 找到後立刻停止觀察，節省效能
                callback(); // 執行你的後續動作
            }
        });

        // 3. 開始觀察整個 HTML 的變化 (包含子節點的增刪)
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function waitForGetOverlapMeetingButton(retryCount = 0) {
        const currentMeetingDate = getCurrentMeetingDate();
        if (!currentMeetingDate) {
            console.log('⚠️ 找不到會議日期');
            //setTimeout(() => waitForGetOverlapMeetingButton(retryCount + 1), 1500);
            return;
        }

        console.log(`📅 抓到會議日期：${currentMeetingDate}`);

        const buttons = Array.from(document.querySelectorAll('button, a'));
        let foundQryButton = false;

        for (const button of buttons) {
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/getOverlapMeeting\('([^']+)','([^']+)','([^']+)'\)/);
                if (match) {
                    const stockCode = match[1];
                    const actionType = match[2];
                    const meetingDate = match[3];

                    console.log(`👉 掃描到按鈕：證券代號=${stockCode}，動作=${actionType}，會議日期=${meetingDate}`);

                    if (stockCode === currentStockId && actionType === 'qry' && meetingDate === currentMeetingDate) {
                        console.log(`✅ 找到正確按鈕，點擊 股票代號 ${stockCode}`);
                        //realClick(button);
                        getOverlapMeeting(stockCode, 'qry', meetingDate);
                        //setTimeout(() => waitForBarcodesAndCapture(currentStockId), 2000);
                        foundQryButton = true;
                        break;
                    }
                }
            }
        }

        if (!foundQryButton) {
            if (retryCount >= 10) {
                console.log(`⚠️ 找不到符合條件的 qry 按鈕（股票代號 ${currentStockId}），自動跳過！`);
                currentIndex++;
                saveProgress();
                isProcessing = false; // 🔓 3. 因為放棄尋找並準備跳下一筆，所以把鎖「解開」
                setTimeout(startProcess, 2000);
            } else {
                console.log(`⌛ 還沒找到正確 qry 按鈕，1500ms後再試 (第${retryCount+1}次)`);
                setTimeout(() => waitForGetOverlapMeetingButton(retryCount + 1), 2000);
            }
        }
    }

    function getCurrentMeetingDate() {
        const dateCell = document.querySelector('.u-inline.u-width--30.u-mobile_width--100.u-v_align--middle');
        if (dateCell) {
            const text = dateCell.textContent.trim(); // 例如 114/05/27
            const parts = text.split('/');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10) + 1911;
                const month = parts[1].padStart(2, '0');
                const day = parts[2].padStart(2, '0');

                console.log(`${year}${month}${day}`);
                return `${year}${month}${day}`; // 轉成 20250527
            }
        }
        return null;
    }

    function captureVotePage(stockIdForCapture) {
        html2canvas(document.body).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${stockIdForCapture}_vote.png`;
            link.click();
            console.log(`📸 截圖完成：${stockIdForCapture}_vote.png`);

            setTimeout(() => {
                console.log('↩️ 返回列表頁面...');
                sessionStorage.setItem(returnFlagKey, 'true'); // 設定回來的旗子
                // 為了安全起見，先解開狀態鎖 (雖然跳轉後整個環境會重置)
                isProcessing = false;

                // 👇 執行跳轉到你指定的網址
                window.location.href = 'https://stockservices.tdcc.com.tw/evote/shareholder/000/tc_estock_welshas_tmp.html';

            }, 2000);
        }).catch(error => {
            console.error('❌ 截圖失敗:', error);
        });
    }

    function addResetButton() {
        const btn = document.createElement('button');
        btn.textContent = '🧹 清除記憶';
        btn.style.position = 'fixed';
        btn.style.bottom = '70px';
        btn.style.right = '20px';
        btn.style.zIndex = '99999';
        btn.style.padding = '10px 15px';
        btn.style.background = '#ff5555';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '10px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0px 0px 8px rgba(0,0,0,0.3)';
        btn.onclick = clearProgress;
        document.body.appendChild(btn);
        console.log('✅ 插入清除記憶按鈕');
    }

    function addProgressBox() {
        const box = document.createElement('div');
        box.id = 'progressBox';
        box.style.position = 'fixed';
        box.style.bottom = '20px';
        box.style.right = '20px';
        box.style.zIndex = '99999';
        box.style.padding = '10px 15px';
        box.style.background = '#333';
        box.style.color = '#fff';
        box.style.fontSize = '14px';
        box.style.borderRadius = '10px';
        box.style.boxShadow = '0px 0px 8px rgba(0,0,0,0.3)';
        box.textContent = '初始化中...';
        document.body.appendChild(box);
        console.log('✅ 插入進度提示');
    }

    function updateProgressText(text) {
        const box = document.getElementById('progressBox');
        if (box) {
            box.textContent = text;
        }
    }


    function startProcess() {

        // 🔒 1. 執行前先檢查鎖，如果已經在處理中就直接 return 擋掉
        if (isProcessing) {
            console.log('⏳ 系統正在處理中，防止重複執行');
            return;
        }

        isProcessing = true; // 🔒 2. 確認沒問題後，馬上「上鎖」

        if (currentIndex >= stockIds.length) {
            console.log('🎉 全部股票處理完成，腳本停止');
            clearProgress();
            updateProgressText('✅ 全部完成');
            //isProcessing = false; // 🔓 結束時解鎖
            return;
        }

        currentStockId = stockIds[currentIndex];
        console.log(`🔎 開始處理第 ${currentIndex + 1} 筆：${currentStockId}`);
        updateProgressText(`第 ${currentIndex + 1} / ${stockIds.length} 筆：${currentStockId}`);

        // 👇 取得目前的完整網址與路徑
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname;
        console.log(`🌐 目前網址：${currentUrl}`);


        // ==========================================
        // 🚦 網址路由判斷區 (Router)
        // ==========================================

        // 情境一：網址包含 002/01.html (根據你提供的投票頁範例)
        if (currentUrl.includes('/000/tc_estock_welshas_tmp.html')) {
            console.log('📍 [狀態] 在列表頁面');

            waitForElement('input[name="qryStockId"]', () => {
                const input = document.querySelector('input[name="qryStockId"]');
                if (input) {
                    console.log('✅ 找到輸入框，填入股票代號並查詢');
                    input.value = currentStockId;
                    qryByStockId();
                }
            });


        } else if (currentUrl.includes('/000/tc_estock_welshas.html')) {
            console.log('📍 [狀態] 在查詢後頁面');
            waitForElement('.u-inline.u-width--30.u-mobile_width--100.u-v_align--middle', () => {
                waitForGetOverlapMeetingButton();
            });


        } else if (currentUrl.includes('/002/01.html')) {
            console.log('📍 [狀態] 在投票頁面，直接截圖');

            waitForElement('#barCodeAccountNo', () => {
                captureVotePage(currentStockId);
            });

        } else {
            console.log('❓ 未知或非預期的網址，準備跳回主頁面...');

            // 為了安全起見，先解開狀態鎖 (雖然跳轉後整個環境會重置)
            isProcessing = false;

            // 👇 執行跳轉到你指定的網址
            window.location.href = 'https://stockservices.tdcc.com.tw/evote/shareholder/000/tc_estock_welshas_tmp.html';
        }
    }


    waitForElement('body', () => {
        console.log('🚀 Body 出現，開始初始化');
        loadHtml2Canvas(() => {
            addProgressBox();
            addResetButton();
            loadProgress();

            const isReturning = sessionStorage.getItem(returnFlagKey);
            if (isReturning === 'true') {
                console.log('🔄 偵測到是返回頁面，切換下一筆');
                sessionStorage.removeItem(returnFlagKey);
                currentIndex++;
                saveProgress();
                // 👇 執行跳轉到你指定的網址
                window.location.href = 'https://stockservices.tdcc.com.tw/evote/shareholder/000/tc_estock_welshas_tmp.html';

            }
            startProcess();
        });
    });

    function loadHtml2Canvas(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

})();