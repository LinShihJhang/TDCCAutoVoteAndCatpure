// ==UserScript==
// @name         TDCC 自動投票一條龍
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  整合：1.自動點投票按鈕 → 2.自動投票流程 → 3.自動點確認按鈕
// @author       allen_chan
// @match        https://stockservices.tdcc.com.tw/evote/shareholder/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log("✅ TDCC 自動投票腳本啟動");

    /*** 第一段：自動找投票按鈕並點擊 ***/
    function autoClickVoteButton() {
        console.log("🔎 準備偵測投票按鈕...");
        const waitForVoteButton = setInterval(() => {
            const allClickableElements = document.querySelectorAll('button, input, a');
            let voteButton = null;

            for (const element of allClickableElements) {
                const onclickText = element.getAttribute('onclick') || '';
                if (onclickText.includes('getOverlapMeeting') && onclickText.includes("'vote'")) {
                    voteButton = element;
                    break;
                }
            }

            if (voteButton) {
                console.log("✅ 找到投票按鈕，點擊！");
                voteButton.click();
                clearInterval(waitForVoteButton);
            } else {
                console.log("⏳ 還沒找到投票按鈕，繼續等待...");
            }
        }, 500); // 每0.5秒檢查一次
    }

    /*** 第二段：偵測 voteObj 自動執行投票流程 ***/
    function autoExecuteVoteProcess() {
        console.log("🔎 準備偵測 voteObj...");
        const actions = [
            () => typeof window.voteObj !== 'undefined' && window.voteObj.checkMeetingPartner?.(),
            () => typeof window.optionAll !== 'undefined' && window.optionAll(0),
            () => typeof window.voteObj !== 'undefined' && window.voteObj.checkVote?.(),
            () => typeof window.doProcess !== 'undefined' && window.doProcess(),
            () => typeof window.voteObj !== 'undefined' && window.voteObj.ignoreVote?.(),
            () => typeof window.voteObj !== 'undefined' && window.voteObj.goNext?.(),
            () => typeof window.voteObj !== 'undefined' && window.voteObj.ignoreVote?.() && window.voteObj.goNext?.()
        ];

        let elapsedTime = 0;

        const waitForVoteObj = setInterval(() => {
            elapsedTime += 500;

            if (typeof window.voteObj !== 'undefined') {
                console.log("✅ 偵測到 voteObj，1 秒後開始投票流程");
                clearInterval(waitForVoteObj);

                setTimeout(async () => {
                    for (let i = 0; i < actions.length; i++) {
                        try {
                            const result = actions[i]();
                            if (result !== false) {
                                console.log(`✅ 已執行動作 ${i + 1}`);
                            }
                        } catch (e) {
                            console.warn(`⚠️ 動作 ${i + 1} 發生錯誤：${e.message}，已跳過`);
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000)); // 每步驟間隔1秒
                    }
                }, 1000);
            }
            else if (elapsedTime >= 10000) {
                console.warn("⛔ 超過10秒未偵測到 voteObj，停止等待");
                clearInterval(waitForVoteObj);
            }
            else {
                console.log("⏳ 尚未偵測到 voteObj，繼續等待...");
            }
        }, 500);
    }

    /*** 第三段：自動點擊「確認」按鈕 ***/
    function autoClickConfirmButton() {
        function findAndClickConfirmButton() {
            const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');

            buttons.forEach(button => {
                const onclickAttr = button.getAttribute('onclick') || '';
                const buttonText = (button.innerText || button.value || '').trim();

                if (onclickAttr.includes('doProcess()') && buttonText === '確認') {
                    console.log('✅ 找到確認按鈕，點擊');
                    button.click();
                }
            });
        }

        window.addEventListener('load', () => {
            setTimeout(findAndClickConfirmButton, 500); // 頁面載入完後延遲0.5秒執行
        });

        setInterval(findAndClickConfirmButton, 2000); // 每2秒檢查一次
    }

    /*** 主程式啟動順序 ***/
    autoClickVoteButton();
    autoExecuteVoteProcess();
    autoClickConfirmButton();

})();