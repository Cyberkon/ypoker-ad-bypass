// ==UserScript==
// @name         Покер — проверка бонуса без видео
// @namespace    poker442398
// @version      0.4.0
// @description  Бонус без видео. Тихая версия без плашки и сообщений.
// @match        https://app-442398.games.s3.yandex.net/442398/*
// @run-at       document-idle
// @sandbox      raw
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  if (location.hostname !== 'app-442398.games.s3.yandex.net') return;

  const flag = Symbol.for('poker442398.noVideo');
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  let tries = 0;
  let busy = false;

  const timer = setInterval(() => {
    let adv;
    try { adv = typeof ysdk === 'undefined' ? null : ysdk?.adv; } catch {}

    if (!adv || typeof adv.showRewardedVideo !== 'function') {
      if (++tries >= 240) clearInterval(timer);
      return;
    }

    clearInterval(timer);
    if (adv.showRewardedVideo[flag]) return;

    const replacement = ({ callbacks: c } = {}) => {
      if (busy || typeof c?.onRewarded !== 'function') return;
      busy = true;

      setTimeout(async () => {
        try {
          c.onOpen?.();
          await wait(750);
          c.onRewarded();
        } catch {} finally {
          await wait(250);
          try { c.onClose?.(true); } catch {}
          busy = false;
        }
      }, 0);
    };

    replacement[flag] = true;
    try { adv.showRewardedVideo = replacement; } catch {}
  }, 250);
})();
