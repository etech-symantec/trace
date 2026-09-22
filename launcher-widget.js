(() => {
  const SITE_BASE = 'https://etech-symantec.github.io/trace/';
  const DOWNLOAD_BASE = SITE_BASE + 'downloads/';
  const SETUP_URL = DOWNLOAD_BASE + 'ProxySG_Trace_Launcher_Setup.exe';
  const VERSION_URL = DOWNLOAD_BASE + 'version.json';
  const BRIDGE_BASE = 'http://127.0.0.1:58321';
  const PROTOCOL_URL = 'proxysg-trace://run';

  const css = `
  .psg-launcher-shell{font-family:Inter,"Segoe UI",Pretendard,Arial,sans-serif;color:#172033}
  .psg-launcher-card{border:1px solid #d9e1ec;border-radius:14px;background:linear-gradient(180deg,#fff,#f8fbff);padding:18px;box-shadow:0 8px 26px rgba(15,23,42,.07)}
  .psg-launcher-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
  .psg-launcher-title{font-size:17px;font-weight:800;color:#1e3a5f}.psg-launcher-sub{font-size:12px;color:#667085;margin-top:3px}
  .psg-status{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;border-radius:999px;padding:5px 9px;background:#eef2f7;color:#667085;border:1px solid #d9e1ec;white-space:nowrap}
  .psg-status::before{content:"";width:7px;height:7px;border-radius:50%;background:#98a2b3}.psg-status.ok{background:#ecfdf3;color:#067647;border-color:#abefc6}.psg-status.ok::before{background:#12b76a}.psg-status.warn{background:#fffaeb;color:#b54708;border-color:#fedf89}.psg-status.warn::before{background:#f79009}.psg-status.bad{background:#fef3f2;color:#b42318;border-color:#fecdca}.psg-status.bad::before{background:#f04438}
  .psg-launcher-actions{display:flex;gap:9px;flex-wrap:wrap}.psg-launcher-btn{appearance:none;border:0;border-radius:9px;padding:10px 14px;font-size:12px;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px}
  .psg-launcher-run{background:#2563eb;color:#fff}.psg-launcher-run:hover{background:#1d4ed8}.psg-launcher-install{background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe}.psg-launcher-install:hover{background:#e0e7ff}.psg-launcher-check{background:#f8fafc;color:#475467;border:1px solid #d0d5dd}.psg-launcher-btn:disabled{opacity:.55;cursor:wait}
  .psg-launcher-note{margin-top:12px;font-size:11px;line-height:1.55;color:#667085}.psg-launcher-note strong{color:#344054}
  .psg-install-modal{position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:100000;display:none;align-items:center;justify-content:center;padding:18px}.psg-install-modal.show{display:flex}
  .psg-modal-card{width:min(680px,96vw);max-height:90vh;overflow:auto;background:#fff;border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.28);padding:0;color:#172033}
  .psg-modal-head{padding:18px 20px 14px;border-bottom:1px solid #eaecf0;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.psg-modal-title{font-size:19px;font-weight:800;color:#1e3a5f}.psg-modal-close{border:0;background:transparent;font-size:23px;line-height:1;cursor:pointer;color:#667085}
  .psg-modal-body{padding:18px 20px}.psg-modal-lead{font-size:13px;line-height:1.65;color:#475467;margin:0 0 14px}.psg-feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0 16px}.psg-feature{border:1px solid #e4e7ec;border-radius:10px;padding:11px;background:#f9fafb}.psg-feature b{display:block;font-size:12px;color:#344054;margin-bottom:4px}.psg-feature span{font-size:11px;line-height:1.45;color:#667085}
  .psg-security{border-left:4px solid #2563eb;background:#eff6ff;border-radius:8px;padding:11px 12px;font-size:11px;line-height:1.55;color:#334155;margin:14px 0}.psg-security.warn{border-left-color:#f59e0b;background:#fffbeb}
  .psg-modal-actions{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;padding:14px 20px;border-top:1px solid #eaecf0;background:#f9fafb;border-radius:0 0 16px 16px}.psg-modal-status{font-size:11px;color:#667085;margin-right:auto;align-self:center}.psg-download-progress{font-weight:700;color:#2563eb}
  @media(max-width:700px){.psg-feature-grid{grid-template-columns:1fr}.psg-launcher-head{align-items:flex-start;flex-direction:column}.psg-modal-actions{justify-content:stretch}.psg-modal-actions .psg-launcher-btn{flex:1}}
  `;

  function addStyle(){
    if(document.getElementById('psg-launcher-style')) return;
    const st=document.createElement('style');st.id='psg-launcher-style';st.textContent=css;document.head.appendChild(st);
  }

  function timeoutFetch(url, options={}, ms=900){
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), ms);
    return fetch(url, {...options, signal: controller.signal, cache:'no-store'}).finally(()=>clearTimeout(timer));
  }

  async function bridgeStatus(ms=850){
    try{
      const r=await timeoutFetch(BRIDGE_BASE+'/status?t='+Date.now(), {method:'GET', mode:'cors'}, ms);
      if(!r.ok) return null;
      const j=await r.json();
      return j && j.ok ? j : null;
    }catch(_){ return null; }
  }

  async function bridgeRun(){
    const r=await timeoutFetch(BRIDGE_BASE+'/run?t='+Date.now(), {method:'GET', mode:'cors'}, 1600);
    if(!r.ok) throw new Error('Launcher 실행 요청 실패');
    return r.json().catch(()=>({ok:true}));
  }

  async function loadVersion(el){
    try{
      const r=await fetch(VERSION_URL+'?t='+Date.now(),{cache:'no-store'});
      if(!r.ok) return;
      const v=await r.json();
      if(v && v.version) el.textContent='최신 Editor v'+String(v.version).replace(/^v/i,'');
    }catch(_){ }
  }

  function triggerDownload(){
    const a=document.createElement('a');
    a.href=SETUP_URL+'?t='+Date.now();
    a.download='ProxySG_Trace_Launcher_Setup.exe';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>a.remove(),1000);
  }

  function ensureModal(){
    let modal=document.getElementById('psgInstallModal');
    if(modal) return modal;
    modal=document.createElement('div');
    modal.id='psgInstallModal';modal.className='psg-install-modal';
    modal.innerHTML=`
      <div class="psg-modal-card" role="dialog" aria-modal="true" aria-labelledby="psgModalTitle">
        <div class="psg-modal-head">
          <div><div class="psg-modal-title" id="psgModalTitle">🛡️ ProxySG Trace Launcher 최초 설치</div><div class="psg-launcher-sub">로컬 ProxySG에 직접 연결하려면 Windows Launcher가 한 번 필요합니다.</div></div>
          <button type="button" class="psg-modal-close" aria-label="닫기">×</button>
        </div>
        <div class="psg-modal-body">
          <p class="psg-modal-lead">Launcher는 웹페이지와 로컬 Trace Editor를 연결하는 작은 실행 도우미입니다. 설치 후에는 이 페이지의 <b>Trace Editor 실행</b> 버튼만으로 최신 버전을 확인하고 실행할 수 있습니다.</p>
          <div class="psg-feature-grid">
            <div class="psg-feature"><b>🔒 관리자 권한 불필요</b><span>현재 Windows 사용자 영역(%LOCALAPPDATA%)에만 설치합니다.</span></div>
            <div class="psg-feature"><b>🏠 로컬 전용 상태 서비스</b><span>127.0.0.1:58321에만 바인딩되며 외부 PC에서는 접근할 수 없습니다.</span></div>
            <div class="psg-feature"><b>✅ 무결성 확인</b><span>Trace Editor를 실행하기 전에 배포 정보의 SHA-256과 다운로드 파일을 비교합니다.</span></div>
            <div class="psg-feature"><b>🔄 자동 최신 버전</b><span>실행할 때마다 GitHub Pages의 최신 버전을 확인하고 필요한 경우에만 업데이트합니다.</span></div>
            <div class="psg-feature"><b>🔑 장비 계정 분리</b><span>Launcher 자체는 ProxySG ID/비밀번호를 수집하거나 서버로 전송하지 않습니다.</span></div>
            <div class="psg-feature"><b>🧩 직접 분석 기능</b><span>Local Policy 조회/Trace 정책 적용/HTTPS LIVE Trace 조회와 분석을 로컬 Editor에서 수행합니다.</span></div>
          </div>
          <div class="psg-security"><b>설치 위치:</b> %LOCALAPPDATA%\\Etech\\ProxySGTrace<br><b>다운로드 출처:</b> etech-symantec.github.io/trace/downloads/</div>
          <div class="psg-security warn"><b>Windows SmartScreen 안내:</b> 현재 설치 파일은 상용 코드 서명 인증서로 서명되지 않았으므로 PC 환경에 따라 ‘알 수 없는 게시자’ 경고가 표시될 수 있습니다. 파일 출처와 SHA-256을 확인한 뒤 진행하세요.</div>
        </div>
        <div class="psg-modal-actions">
          <span class="psg-modal-status">설치 파일을 자동으로 다운로드합니다.</span>
          <button type="button" class="psg-launcher-btn psg-launcher-check" data-act="check">설치 완료 확인</button>
          <button type="button" class="psg-launcher-btn psg-launcher-install" data-act="download">설치 파일 다시 받기</button>
          <button type="button" class="psg-launcher-btn psg-launcher-run" data-act="close">확인</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.psg-modal-close').addEventListener('click',()=>modal.classList.remove('show'));
    modal.addEventListener('click',e=>{ if(e.target===modal) modal.classList.remove('show'); });
    modal.querySelector('[data-act="close"]').addEventListener('click',()=>modal.classList.remove('show'));
    modal.querySelector('[data-act="download"]').addEventListener('click',()=>{
      triggerDownload();
      const s=modal.querySelector('.psg-modal-status');s.innerHTML='<span class="psg-download-progress">설치 파일 다운로드를 다시 시작했습니다.</span>';
    });
    modal.querySelector('[data-act="check"]').addEventListener('click',async()=>{
      const btn=modal.querySelector('[data-act="check"]');const s=modal.querySelector('.psg-modal-status');
      btn.disabled=true;s.textContent='Launcher 설치 상태 확인 중...';
      const st=await bridgeStatus(1300);
      btn.disabled=false;
      if(st){
        s.innerHTML='<span style="color:#067647;font-weight:700">설치 확인 완료. Trace Editor를 실행합니다.</span>';
        setTimeout(()=>modal.classList.remove('show'),500);
        try{ await bridgeRun(); }catch(e){ s.textContent=e.message; }
      }else{
        s.innerHTML='<span style="color:#b42318;font-weight:700">아직 Launcher가 확인되지 않습니다. 다운로드한 Setup EXE를 실행해 주세요.</span>';
      }
    });
    return modal;
  }

  function showInstallModal(autoDownload=true){
    addStyle();
    const modal=ensureModal();
    modal.classList.add('show');
    const s=modal.querySelector('.psg-modal-status');
    s.textContent=autoDownload?'Launcher가 없어 설치 파일 다운로드를 시작합니다.':'Launcher 설치가 필요합니다.';
    if(autoDownload){ setTimeout(triggerDownload,350); }
  }

  function tryProtocol(){
    try{
      const frame=document.createElement('iframe');
      frame.style.display='none';frame.src=PROTOCOL_URL;document.body.appendChild(frame);
      setTimeout(()=>frame.remove(),1600);
    }catch(_){ }
  }

  async function launch(statusEl, runBtn){
    if(runBtn) runBtn.disabled=true;
    if(statusEl){statusEl.className='psg-status warn';statusEl.textContent='Launcher 확인 중';}

    let st=await bridgeStatus();
    if(st){
      try{
        await bridgeRun();
        if(statusEl){statusEl.className='psg-status ok';statusEl.textContent='실행 요청 완료';}
        if(runBtn) runBtn.disabled=false;
        return true;
      }catch(_){ }
    }

    // 설치는 되어 있으나 상태 서비스가 잠시 꺼져 있는 경우 URL Protocol로 한 번 복구 시도.
    tryProtocol();
    for(let i=0;i<5;i++){
      await new Promise(r=>setTimeout(r,300));
      st=await bridgeStatus(500);
      if(st){
        try{await bridgeRun();}catch(_){ }
        if(statusEl){statusEl.className='psg-status ok';statusEl.textContent='Launcher 연결됨';}
        if(runBtn) runBtn.disabled=false;
        return true;
      }
    }

    if(statusEl){statusEl.className='psg-status bad';statusEl.textContent='설치 필요';}
    if(runBtn) runBtn.disabled=false;
    showInstallModal(true);
    return false;
  }

  async function refreshStatus(statusEl, localVerEl){
    if(statusEl){statusEl.className='psg-status';statusEl.textContent='확인 중';}
    const st=await bridgeStatus();
    if(st){
      if(statusEl){statusEl.className='psg-status ok';statusEl.textContent='Launcher 설치됨';}
      if(localVerEl) localVerEl.textContent=st.editorVersion ? 'PC Editor v'+st.editorVersion : 'Editor 미설치';
      return st;
    }
    if(statusEl){statusEl.className='psg-status warn';statusEl.textContent='Launcher 미확인';}
    if(localVerEl) localVerEl.textContent='PC 상태 확인 불가';
    return null;
  }

  function mount(target){
    addStyle();
    const host=typeof target==='string'?document.querySelector(target):target;
    if(!host) return null;
    host.innerHTML='';
    const box=document.createElement('div');box.className='psg-launcher-shell';
    box.innerHTML=`
      <div class="psg-launcher-card">
        <div class="psg-launcher-head">
          <div><div class="psg-launcher-title">ProxySG Trace Editor</div><div class="psg-launcher-sub"><span class="psg-remote-version">최신 버전 확인 중</span> · <span class="psg-local-version">PC 상태 확인 중</span></div></div>
          <span class="psg-status">확인 중</span>
        </div>
        <div class="psg-launcher-actions">
          <button type="button" class="psg-launcher-btn psg-launcher-run">▶ Trace Editor 실행</button>
          <button type="button" class="psg-launcher-btn psg-launcher-check">↻ 설치 상태 확인</button>
          <button type="button" class="psg-launcher-btn psg-launcher-install">Launcher 설치/복구</button>
        </div>
        <div class="psg-launcher-note"><strong>설치되어 있지 않으면</strong> 실행 버튼을 눌렀을 때 자동으로 설치 안내 모달이 열리고 Setup 파일 다운로드가 시작됩니다.</div>
      </div>`;
    host.appendChild(box);
    const status=box.querySelector('.psg-status');
    const localVer=box.querySelector('.psg-local-version');
    const runBtn=box.querySelector('.psg-launcher-run');
    const checkBtn=box.querySelector('.psg-launcher-check');
    const installBtn=box.querySelector('.psg-launcher-install');
    runBtn.addEventListener('click',()=>launch(status,runBtn));
    checkBtn.addEventListener('click',async()=>{checkBtn.disabled=true;await refreshStatus(status,localVer);checkBtn.disabled=false;});
    installBtn.addEventListener('click',()=>showInstallModal(true));
    loadVersion(box.querySelector('.psg-remote-version'));
    refreshStatus(status,localVer);
    return box;
  }

  window.ProxySGTraceLauncher={mount,launch,showInstallModal,setupUrl:SETUP_URL,bridgeStatus};
  document.addEventListener('DOMContentLoaded',()=>{
    const slot=document.getElementById('proxysg-launcher-slot');
    if(slot) mount(slot);
  });
})();
