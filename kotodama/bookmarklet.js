(function () {
  if (window.__ytSubBM) return;
  window.__ytSubBM = true;

  const videoId = new URLSearchParams(location.search).get('v');
  if (!videoId) {
    alert('YouTubeの動画ページで実行してください');
    window.__ytSubBM = false;
    return;
  }

  // 動画タイトル（末尾の " - YouTube" を除去）
  const videoTitle = document.title.replace(/\s*-\s*YouTube\s*$/, '').trim();

  const FONT = '-apple-system,BlinkMacSystemFont,"Hiragino Sans","Segoe UI",sans-serif';
  const COLOR_DEFAULT = 'rgba(255,255,255,0.55)';
  const COLOR_ERROR = '#ff7a85';
  const COLOR_SUCCESS = '#7ce895';

  // ---- UI（innerHTML不使用）----
  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed', 'bottom:20px', 'right:20px', 'z-index:2147483647',
    'background:rgba(20,22,32,0.55)',
    'backdrop-filter:blur(24px) saturate(180%)',
    '-webkit-backdrop-filter:blur(24px) saturate(180%)',
    'color:rgba(255,255,255,0.95)',
    'padding:10px 12px', 'border-radius:14px',
    'border:1px solid rgba(255,255,255,0.14)',
    'font:13px/1.5 ' + FONT, 'width:230px',
    'box-shadow:0 10px 40px rgba(0,0,0,0.45)',
    'letter-spacing:0.01em',
  ].join(';');

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin:0 -12px 8px;padding:0 12px 8px;border-bottom:1px solid rgba(255,255,255,0.08)';
  const title = document.createElement('b');
  title.textContent = '言霊 / Kotodama';
  title.style.cssText = 'font-weight:600;letter-spacing:0.04em;font-size:13px';
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'cursor:pointer;font-size:20px;line-height:1;color:rgba(255,255,255,0.5);transition:color 0.2s';
  closeBtn.onmouseover = () => closeBtn.style.color = 'rgba(255,255,255,0.95)';
  closeBtn.onmouseout = () => closeBtn.style.color = 'rgba(255,255,255,0.5)';
  closeBtn.onclick = () => { panel.remove(); window.__ytSubBM = false; };
  header.appendChild(title);
  header.appendChild(closeBtn);

  // ステータス
  const status = document.createElement('div');
  status.style.cssText = 'margin-bottom:8px;color:' + COLOR_DEFAULT + ';font-size:12px;line-height:1.4';
  status.textContent = '字幕をOFF→ONに切り替えてください';

  // ダウンロードボタン
  const dlBtn = document.createElement('button');
  dlBtn.textContent = 'Albireo用JSONをダウンロード';
  dlBtn.style.cssText = 'visibility:hidden;width:100%;padding:8px;background:linear-gradient(135deg,rgba(124,58,237,0.95),rgba(236,72,153,0.95));color:#fff;border:none;border-radius:8px;cursor:pointer;font:600 13px/1 ' + FONT + ';letter-spacing:0.04em;transition:transform 0.15s,filter 0.15s';
  dlBtn.onmouseover = () => dlBtn.style.filter = 'brightness(1.1)';
  dlBtn.onmouseout = () => dlBtn.style.filter = 'brightness(1)';
  dlBtn.onmousedown = () => dlBtn.style.transform = 'scale(0.97)';
  dlBtn.onmouseup = () => dlBtn.style.transform = 'scale(1)';

  panel.appendChild(header);
  panel.appendChild(status);
  panel.appendChild(dlBtn);
  document.body.appendChild(panel);

  let result = null;

  function setStatus(msg, color) {
    status.textContent = msg;
    status.style.color = color || COLOR_DEFAULT;
  }

  // ---- XHR インターセプト ----
  // YouTubeプレイヤーが送る timedtext リクエストの URL（tlangなし=元言語）をキャプチャ
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (typeof url === 'string' && url.includes('/timedtext?')) {
      const params = new URLSearchParams(url.split('?')[1]);
      if (params.get('v') === videoId && !params.get('tlang')) {
        fetchPair(url);
      }
    }
    return origOpen.apply(this, arguments);
  };

  let fetching = false;

  // json3 レスポンスを { startMs, durationMs, text }[] に正規化
  function parseEvents(text) {
    const events = JSON.parse(text).events || [];
    return events
      .filter(e => e.segs)
      .map(e => ({
        startMs: e.tStartMs,
        durationMs: e.dDurationMs,
        text: e.segs.map(s => s.utf8).join('').trim(),
      }))
      .filter(e => e.text);
  }

  async function fetchPair(capturedUrl) {
    if (fetching) return;
    fetching = true;

    const lang = 'ja';
    setStatus('字幕を取得中...');

    try {
      const [origText, transText] = await Promise.all([
        fetch(capturedUrl).then(r => r.text()),
        fetch(capturedUrl + '&tlang=' + lang).then(r => r.text()),
      ]);

      if (origText.length < 20) {
        setStatus('元字幕データが空でした', COLOR_ERROR);
        fetching = false;
        return;
      }
      if (transText.length < 20) {
        setStatus('翻訳データが空でした(多言語手動字幕の動画?)', COLOR_ERROR);
        fetching = false;
        return;
      }

      const origs = parseEvents(origText);
      const trans = parseEvents(transText);

      if (origs.length === 0) {
        setStatus('字幕のパースに失敗しました', COLOR_ERROR);
        fetching = false;
        return;
      }

      // startMs でマージ
      const transMap = new Map(trans.map(t => [t.startMs, t.text]));
      const subtitles = origs.map(o => ({
        startMs: o.startMs,
        durationMs: o.durationMs,
        subtitle: o.text,
        translation: transMap.get(o.startMs) || '',
      }));

      result = {
        id: videoId,
        title: videoTitle,
        subtitles,
      };

      setStatus('取得完了: ' + subtitles.length + ' 件', COLOR_SUCCESS);
      dlBtn.style.visibility = 'visible';
    } catch (e) {
      setStatus('エラー: ' + e.message, COLOR_ERROR);
      fetching = false;
    }
  }

  // ---- ダウンロード ----
  // iOS Safari は <a download> で blob を保存できないため、
  // Web Share API が使える環境では共有シート経由で「ファイル」に保存させる
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  dlBtn.onclick = async function () {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const filename = videoId + '_albireo.json';

    if (isIOS && typeof navigator.canShare === 'function') {
      try {
        const file = new File([json], filename, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
          setStatus('共有しました', COLOR_SUCCESS);
          return;
        }
      } catch (e) {
        if (e.name === 'AbortError') return;
        setStatus('共有失敗: ' + e.message, COLOR_ERROR);
        return;
      }
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
})();
