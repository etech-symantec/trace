(() => {
  const SITE_BASE = 'https://etech-symantec.github.io/trace/';
  const DOWNLOAD_BASE = SITE_BASE + 'downloads/';
  const SETUP_URL = DOWNLOAD_BASE + 'ProxySG_Trace_Launcher_Setup.exe';
  const VERSION_URL = DOWNLOAD_BASE + 'version.json';

  const css = `
  .psg-launcher-card{font-family:Inter,"Segoe UI",Pretendard,Arial,sans-serif;display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#0d1b2d;border:1px solid #23486d;border-radius:12px;padding:8px 10px;color:#e8f2ff;box-shadow:0 8px 28px rgba(0,0,0,.20)}
  .psg-launcher-card.psg-fixed{position:fixed;right:18px;top:16px;z-index:99999}
  .psg-launcher-title{font-size:12px;font-weight:800;margin-right:2px;white-space:nowrap}
  .psg-launcher-version{font-size:10px;color:#93b7da;border:1px solid #294a6b;border-radius:999px;padding:3px 6px;white-space:nowrap}
  .psg-launcher-btn{appearance:none;border:0;border-radius:8px;padding:8px 11px;font-size:11px;font-weight:800;cursor:pointer;text-decoration:none;white-space:nowrap}
  .psg-launcher-run{background:#25b58a;color:#fff}.psg-launcher-run:hover{background:#20a17b}
  .psg-launcher-install{background:#1b3552;color:#d9eaff;border:1px solid #2b537a}.psg-launcher-install:hover{background:#234362}
  .psg-launcher-help{width:100%;font-size:10px;color:#7899b8;line-height:1.35;margin-top:-1px}
  @media(max-width:800px){.psg-launcher-card.psg-fixed{left:10px;right:10px;top:8px}.psg-launcher-title{display:none}}
  `;

  function addStyle(){
    if(document.getElementById('psg-launcher-style')) return;
    const st=document.createElement('style');st.id='psg-launcher-style';st.textContent=css;document.head.appendChild(st);
  }

  async function loadVersion(el){
    try{
      const r=await fetch(VERSION_URL+'?t='+Date.now(),{cache:'no-store'});
      if(!r.ok) return;
      const v=await r.json();
      if(v && v.version) el.textContent='v'+String(v.version).replace(/^v/i,'');
    }catch(_){ }
  }

  function launch(){
    // 설치된 URL Protocol Handler를 호출한다. 브라우저가 외부 앱 열기 확인창을 표시할 수 있다.
    window.location.href='proxysg-trace://run';
  }

  function mount(target){
    addStyle();
    const host = typeof target==='string' ? document.querySelector(target) : target;
    const box=document.createElement('div');
    box.className='psg-launcher-card'+(host?'':' psg-fixed');
    box.innerHTML=`
      <span class="psg-launcher-title">ProxySG Trace Editor</span>
      <span class="psg-launcher-version">latest</span>
      <button type="button" class="psg-launcher-btn psg-launcher-run">▶ Trace Editor 실행</button>
      <a class="psg-launcher-btn psg-launcher-install" href="${SETUP_URL}">최초 설치</a>
      <div class="psg-launcher-help">최초 1회 Launcher 설치 후, 실행 버튼만 누르면 최신 Editor를 자동 확인·다운로드·실행합니다.</div>`;
    (host||document.body).appendChild(box);
    box.querySelector('.psg-launcher-run').addEventListener('click',launch);
    loadVersion(box.querySelector('.psg-launcher-version'));
    return box;
  }

  window.ProxySGTraceLauncher={mount,launch,setupUrl:SETUP_URL};
  document.addEventListener('DOMContentLoaded',()=>{
    const slot=document.getElementById('proxysg-launcher-slot');
    mount(slot||null);
  });
})();
