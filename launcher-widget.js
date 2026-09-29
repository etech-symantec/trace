(() => {
  const SLOT_ID = 'proxysg-launcher-slot';
  const INSTALL_URL = './downloads/ProxySG_Trace_Launcher_Install.zip';
  const EDITOR_URL = './downloads/ProxySG_Policy_Trace_Editor.exe';
  const PROTOCOL_URL = 'proxysg-trace://run';

  function lang() {
    return document.documentElement.lang === 'en' ||
      window.PROXYSG_UI_LANG === 'en' ||
      localStorage.getItem('proxysgTraceLanguage') === 'en' ? 'en' : 'ko';
  }

  const text = {
    ko: {
      title: 'ProxySG Trace Editor',
      sub: '상주 서비스 없이 필요할 때만 로컬 Editor를 실행합니다.',
      badge: 'One-shot · 백그라운드 없음',
      run: '▶ Trace Editor 실행',
      install: 'Launcher 설치/복구',
      editor: 'Editor 다운로드',
      safety: '보안 친화 구조',
      safetyText: 'Launcher는 네트워크 통신, localhost 포트, 자동 EXE 다운로드/실행을 사용하지 않습니다. proxysg-trace:// 호출 시 설치된 CMD Launcher가 한 번 실행된 뒤 바로 종료됩니다.',
      fallbackTitle: 'Launcher 실행 확인',
      fallbackText: 'Trace Editor가 실행되지 않았다면 Launcher가 설치되지 않았거나 브라우저의 외부 앱 실행이 차단된 상태일 수 있습니다. 설치 패키지를 내려받아 Install_ProxySG_Trace_Launcher.cmd를 한 번 실행하세요.',
      auto: '설치 패키지 다운로드를 시작했습니다.',
      retry: '설치 후 다시 실행',
      close: '닫기',
      installAgain: '설치 패키지 다시 받기'
    },
    en: {
      title: 'ProxySG Trace Editor',
      sub: 'Starts the local Editor only when needed, with no resident service.',
      badge: 'One-shot · No background service',
      run: '▶ Run Trace Editor',
      install: 'Install/Repair Launcher',
      editor: 'Download Editor',
      safety: 'Security-friendly design',
      safetyText: 'The Launcher uses no network connection, localhost port, or automatic EXE download/execution. A CMD launcher runs once for proxysg-trace:// and exits immediately.',
      fallbackTitle: 'Check Launcher',
      fallbackText: 'If Trace Editor did not open, the Launcher may not be installed or the browser may have blocked the external application. Download the install package and run Install_ProxySG_Trace_Launcher.cmd once.',
      auto: 'The installation package download has started.',
      retry: 'Run again after install',
      close: 'Close',
      installAgain: 'Download install package again'
    }
  };

  function t() { return text[lang()]; }

  function download(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1000);
  }

  function ensureStyles() {
    if (document.getElementById('psg-safe-launcher-style')) return;
    const s = document.createElement('style');
    s.id = 'psg-safe-launcher-style';
    s.textContent = `
      .psg-safe-card{border:1px solid #8fb6f2;border-radius:16px;background:linear-gradient(135deg,#eaf2ff,#f8fbff 55%,#eef4ff);padding:20px;box-shadow:0 12px 30px rgba(30,64,175,.11);font-family:Inter,"Segoe UI",Arial,sans-serif;color:#19324f}
      .psg-safe-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.psg-safe-title{font-size:18px;font-weight:850;color:#173b70}.psg-safe-sub{font-size:12px;color:#566b84;margin-top:4px}.psg-safe-badge{white-space:nowrap;border:1px solid #8fd7bd;background:#ecfdf5;color:#087a55;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:800}
      .psg-safe-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.psg-safe-btn{border:0;border-radius:10px;padding:10px 14px;font-size:12px;font-weight:800;cursor:pointer;transition:transform .12s ease,box-shadow .15s ease,background .15s ease}.psg-safe-btn:hover{transform:translateY(-1px)}.psg-safe-btn:active{transform:translateY(1px) scale(.975);box-shadow:inset 0 2px 5px rgba(15,23,42,.18)!important}
      .psg-safe-run{background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;box-shadow:0 6px 14px rgba(37,99,235,.24)}.psg-safe-install{background:#f0edff;color:#4338ca;border:1px solid #beb9ff}.psg-safe-editor{background:white;color:#334155;border:1px solid #bdcbe0}
      .psg-safe-note{margin-top:14px;padding:11px 12px;border:1px solid rgba(85,125,178,.22);border-radius:10px;background:rgba(255,255,255,.62);font-size:11px;line-height:1.6;color:#52657b}.psg-safe-note b{color:#234d7d}
      .psg-safe-modal{position:fixed;inset:0;background:rgba(15,23,42,.48);display:none;align-items:center;justify-content:center;z-index:99999;padding:18px}.psg-safe-modal.show{display:flex}.psg-safe-dialog{width:min(560px,100%);background:white;border-radius:16px;border:1px solid #dbe3ee;box-shadow:0 24px 80px rgba(15,23,42,.26);padding:22px;color:#1e293b}.psg-safe-dialog h3{margin:0 0 8px;color:#173b70}.psg-safe-dialog p{font-size:12px;line-height:1.65;color:#52657b}.psg-safe-dialog .psg-safe-actions{justify-content:flex-end}
    `;
    document.head.appendChild(s);
  }

  function showFallback(autoDownload = false) {
    let modal = document.getElementById('psgSafeLauncherModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'psgSafeLauncherModal';
      modal.className = 'psg-safe-modal';
      modal.innerHTML = `<div class="psg-safe-dialog">
        <h3 id="psgSafeModalTitle"></h3>
        <p id="psgSafeModalText"></p>
        <p id="psgSafeModalAuto" style="display:none;font-weight:700;color:#315b8a"></p>
        <div class="psg-safe-actions">
          <button class="psg-safe-btn psg-safe-editor" id="psgSafeClose"></button>
          <button class="psg-safe-btn psg-safe-install" id="psgSafeInstallAgain"></button>
          <button class="psg-safe-btn psg-safe-run" id="psgSafeRetry"></button>
        </div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
      modal.querySelector('#psgSafeClose').onclick = () => modal.classList.remove('show');
      modal.querySelector('#psgSafeInstallAgain').onclick = () => download(INSTALL_URL);
      modal.querySelector('#psgSafeRetry').onclick = () => { modal.classList.remove('show'); attemptRun(); };
    }
    const x=t();
    modal.querySelector('#psgSafeModalTitle').textContent=x.fallbackTitle;
    modal.querySelector('#psgSafeModalText').textContent=x.fallbackText;
    modal.querySelector('#psgSafeClose').textContent=x.close;
    modal.querySelector('#psgSafeInstallAgain').textContent=x.installAgain;
    modal.querySelector('#psgSafeRetry').textContent=x.retry;
    const auto=modal.querySelector('#psgSafeModalAuto');
    auto.textContent=x.auto;
    auto.style.display=autoDownload?'block':'none';
    modal.classList.add('show');
    if (autoDownload) download(INSTALL_URL);
  }

  function attemptRun() {
    let leftPage=false;
    const mark=()=>{leftPage=true};
    window.addEventListener('blur',mark,{once:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden) leftPage=true},{once:true});
    try {
      const iframe=document.createElement('iframe');
      iframe.style.display='none';
      iframe.src=PROTOCOL_URL;
      document.body.appendChild(iframe);
      setTimeout(()=>iframe.remove(),2500);
    } catch (_) {}
    setTimeout(() => {
      if (!leftPage) showFallback(true);
    }, 2200);
  }

  function rewriteDirectCopy() {
    const en = lang()==='en';
    const direct = document.querySelector('[data-i18n="directDesc"]');
    const run = document.querySelector('[data-i18n="runEditorDesc"]');
    if (direct) direct.textContent = en
      ? 'The browser does not handle SSH/HTTPS directly. A one-shot local launcher starts the Policy Trace Editor only when requested.'
      : '브라우저가 SSH/HTTPS를 직접 처리하지 않고, 필요할 때만 일회성 로컬 Launcher가 Policy Trace Editor를 실행합니다.';
    if (run) run.textContent = en
      ? 'No resident process, localhost listener, or automatic EXE download is used. Install the small URL-protocol launcher once, then run the Editor from this page.'
      : '상주 프로세스, localhost 포트, 자동 EXE 다운로드를 사용하지 않습니다. URL Protocol Launcher를 최초 1회만 설치한 뒤 이 페이지에서 Editor를 실행합니다.';
  }

  function render() {
    const slot=document.getElementById(SLOT_ID);
    if(!slot) return;
    ensureStyles();
    const x=t();
    slot.innerHTML=`
      <div class="psg-safe-card">
        <div class="psg-safe-head">
          <div><div class="psg-safe-title">${x.title}</div><div class="psg-safe-sub">${x.sub}</div></div>
          <div class="psg-safe-badge">● ${x.badge}</div>
        </div>
        <div class="psg-safe-actions">
          <button class="psg-safe-btn psg-safe-run" id="psgSafeRun">${x.run}</button>
          <button class="psg-safe-btn psg-safe-install" id="psgSafeInstall">${x.install}</button>
          <button class="psg-safe-btn psg-safe-editor" id="psgSafeEditor">${x.editor}</button>
        </div>
        <div class="psg-safe-note"><b>🔐 ${x.safety}</b><br>${x.safetyText}</div>
      </div>`;
    slot.querySelector('#psgSafeRun').onclick=attemptRun;
    slot.querySelector('#psgSafeInstall').onclick=()=>showFallback(true);
    slot.querySelector('#psgSafeEditor').onclick=()=>download(EDITOR_URL);
    rewriteDirectCopy();
  }

  function init() {
    render();
    const mo=new MutationObserver(()=>{ rewriteDirectCopy(); });
    mo.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    window.addEventListener('storage',render);
    document.addEventListener('click', e => {
      if(e.target?.matches?.('.trace-lang-btn,.langBtn,[data-lang]')) setTimeout(render,0);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();