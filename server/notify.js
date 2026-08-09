// 텔레그램 알림 모듈 (원장님 수신용)
//
// 환경변수(Render → Environment 탭)에 아래 2개를 넣어야 동작합니다:
//   TELEGRAM_BOT_TOKEN   BotFather가 준 봇 토큰
//   TELEGRAM_CHAT_ID     받는 사람 chat_id (여러 명이면 쉼표 구분: 123,456)
//
// 값이 없으면 조용히 건너뛰므로, 환경변수를 안 넣어도 앱은 정상 동작합니다.
// 알림 발송이 실패해도 절대 앱 요청을 막지 않도록 예외를 삼킵니다.

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_IDS = process.env.TELEGRAM_CHAT_ID || '';

async function sendTelegram(text, opts = {}) {
  if (!BOT_TOKEN) return false; // 미설정 시 조용히 건너뜀

  const targets = opts.chatId
    ? [opts.chatId]
    : CHAT_IDS.split(',').map((c) => c.trim()).filter(Boolean);
  if (targets.length === 0) return false;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  let okAll = true;

  for (const chatId of targets) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          disable_notification: !!opts.silent,
        }),
      });
      if (!resp.ok) {
        console.log('[telegram] HTTP 오류', resp.status, await resp.text());
        okAll = false;
      }
    } catch (e) {
      console.log('[telegram] 발송 실패:', e.message);
      okAll = false;
    }
  }
  return okAll;
}

module.exports = { sendTelegram };
