(() => {
  const SLOT_ID='proxysg-launcher-slot';
  const INSTALL_URL='./downloads/Install_ProxySG_Trace_Launcher_v6.cmd?v=20260929-1';
  const PROTOCOL_URL='proxysg-trace-v6://run';
  const STORAGE_KEY='proxysgTraceLauncherInstalledVersion';
  const VERSION='6';

  function isEn(){
    return document.documentElement.lang==='en' ||
      window.PROXYSG_UI_LANG==='en' ||
      localStorage.getItem('proxysgTraceLanguage')==='en';
  }

  const L={
    ko:{
      title:'ProxySG Trace Editor',
      sub:'최초 1회 설치 후에는 같은 버튼으로 로컬 Editor를 실행합니다.',
      badge:'v6 · ZIP 배포',
      install:'↓ Trace Editor 설치',
      run:'▶ Trace Editor 실행',
      downloading:'설치 파일 다운로드됨',
      installNote:'현재 브라우저에는 v6 설치 완료 기록이 없습니다. 버튼을 누르면 설치 CMD를 바로 다운로드합니다.',
      runNote:'v6 설치가 확인되었습니다. 버튼을 누르면 Windows URL Protocol로 로컬 Editor를 실행합니다.',
      help:'다운로드된 Install_ProxySG_Trace_Launcher_v6.cmd를 한 번 실행하세요. 설치가 완료되면 이 페이지가 자동으로 다시 열리고 버튼이 “Trace Editor 실행”으로 바뀝니다.'
    },
    en:{
      title:'ProxySG Trace Editor',
      sub:'Install once, then use the same button to run the local Editor.',
      badge:'v6 · ZIP distribution',
      install:'↓ Install Trace Editor',
      run:'▶ Run Trace Editor',
      downloading:'Installer downloaded',
      installNote:'This browser has no v6 installation record yet. Clicking the button downloads the installer CMD directly.',
      runNote:'v6 installation is confirmed. Click the button to start the local Editor via the Windows URL protocol.',
      help:'Run the downloaded Install_ProxySG_Trace_Launcher_v6.cmd once. When installation completes, this page opens again automatically and the button changes to “Run Trace Editor”.'
    }
  };

  function t(){ return L[isEn()?'en':'ko']; }

  function consumeInstallCallback(){
    const u=new URL(location.href);
    if(u.searchParams.get('launcher')==='v6-installed'){
      localStorage.setItem(STORAGE_KEY,VERSION);
      u.searchParams.delete('launcher');
      history.replaceState(null,'',u);
    }
  }

  function installed(){
    return localStorage.getItem(STORAGE_KEY)===VERSION;
  }

  function style(){
    if(document.getElementById('psg-v6-style')) return;
    const s=document.createElement('style');
    s.id='psg-v6-style';
    s.textContent=`
      .psgv6{border:1px solid #8fb6f2;border-radius:16px;background:linear-gradient(135deg,#eaf2ff,#f8fbff 58%,#eef4ff);padding:20px;box-shadow:0 12px 30px rgba(30,64,175,.11);font-family:Inter,"Segoe UI",Arial,sans-serif;color:#19324f}
      .psgv6-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
      .psgv6-title{font-size:18px;font-weight:850;color:#173b70}
      .psgv6-sub{font-size:12px;color:#566b84;margin-top:4px}
      .psgv6-badge{white-space:nowrap;border:1px solid #8fd7bd;background:#ecfdf5;color:#087a55;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:800}
      .psgv6-btn{margin-top:16px;border:0;border-radius:10px;padding:11px 16px;font-size:12px;font-weight:850;cursor:pointer;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;box-shadow:0 6px 14px rgba(37,99,235,.24);transition:.13s ease}
      .psgv6-btn:hover{transform:translateY(-1px);box-shadow:0 9px 18px rgba(37,99,235,.28)}
      .psgv6-btn:active{transform:translateY(1px) scale(.975);box-shadow:inset 0 2px 5px rgba(15,23,42,.2)}
      .psgv6-note{margin-top:13px;font-size:11px;line-height:1.6;color:#52657b}
      .psgv6-help{display:none;margin-top:12px;padding:10px 12px;border:1px solid #f2c079;border-radius:10px;background:#fff8e9;color:#7a4a12;font-size:11px;line-height:1.6}
      .psgv6-help.show{display:block}
    `;
    document.head.appendChild(s);
  }

  function downloadInstaller(){
    const a=document.createElement('a');
    a.href=INSTALL_URL;
    a.download='Install_ProxySG_Trace_Launcher_v6.cmd';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>a.remove(),500);
  }

  function launchEditor(){
    // Direct navigation from the user's click gesture.
    // No hidden iframe and no delayed synthetic protocol request.
    window.location.href=PROTOCOL_URL;
  }

  function render(){
    consumeInstallCallback();
    const slot=document.getElementById(SLOT_ID);
    if(!slot) return;
    style();
    const x=t(), ok=installed();

    slot.innerHTML=`
      <div class="psgv6">
        <div class="psgv6-head">
          <div><div class="psgv6-title">${x.title}</div><div class="psgv6-sub">${x.sub}</div></div>
          <div class="psgv6-badge">● ${x.badge}</div>
        </div>
        <button id="psgv6Button" class="psgv6-btn">${ok?x.run:x.install}</button>
        <div class="psgv6-note">${ok?x.runNote:x.installNote}</div>
        <div id="psgv6Help" class="psgv6-help"></div>
      </div>`;

    const btn=slot.querySelector('#psgv6Button');
    btn.onclick=()=>{
      if(installed()){
        launchEditor();
      }else{
        downloadInstaller();
        btn.textContent=x.downloading;
        const h=slot.querySelector('#psgv6Help');
        h.textContent=x.help;
        h.classList.add('show');
        setTimeout(()=>{ if(!installed()) btn.textContent=t().install; },5000);
      }
    };
  }

  function init(){
    consumeInstallCallback();
    render();
    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    window.addEventListener('pageshow',render);
    window.addEventListener('storage',render);
    document.addEventListener('click',e=>{
      if(e.target?.matches?.('.trace-lang-btn,.langBtn,[data-lang]')) setTimeout(render,0);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();