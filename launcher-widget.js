(() => {
  const SLOT_ID = 'proxysg-launcher-slot';
  const INSTALL_URL = './downloads/Install_ProxySG_Trace_Launcher.cmd';
  const PROTOCOL_URL = 'proxysg-trace://run';

  function isEn() {
    return document.documentElement.lang === 'en' ||
      window.PROXYSG_UI_LANG === 'en' ||
      localStorage.getItem('proxysgTraceLanguage') === 'en';
  }

  const T = {
    ko: {
      title:'ProxySG Trace Editor',
      sub:'상주 서비스 없이 필요할 때만 로컬 Editor를 실행합니다.',
      badge:'One-shot · 백그라운드 없음',
      run:'▶ Trace Editor 실행',
      checking:'Launcher 확인 중…',
      downloaded:'설치 파일 다운로드됨',
      note:'Launcher가 설치되어 있으면 바로 실행합니다. 설치되어 있지 않으면 설치 파일 1개를 자동으로 내려받습니다.',
      installHelp:'브라우저 보안상 다운로드한 파일을 웹페이지가 자동 실행할 수는 없습니다. 다운로드된 Install_ProxySG_Trace_Launcher.cmd를 한 번 실행한 뒤 같은 버튼을 다시 누르세요.'
    },
    en: {
      title:'ProxySG Trace Editor',
      sub:'Starts the local Editor only when needed, with no resident service.',
      badge:'One-shot · No background service',
      run:'▶ Run Trace Editor',
      checking:'Checking Launcher…',
      downloaded:'Installer downloaded',
      note:'Runs immediately when the Launcher is installed. If not, one installer file is downloaded automatically.',
      installHelp:'Browser security prevents a web page from automatically executing a downloaded file. Run the downloaded Install_ProxySG_Trace_Launcher.cmd once, then click the same button again.'
    }
  };

  function t(){ return T[isEn()?'en':'ko']; }

  function ensureStyle(){
    if(document.getElementById('psg-onebtn-style')) return;
    const s=document.createElement('style');
    s.id='psg-onebtn-style';
    s.textContent=`
      .psg-one-card{border:1px solid #8fb6f2;border-radius:16px;background:linear-gradient(135deg,#eaf2ff,#f8fbff 58%,#eef4ff);padding:20px;box-shadow:0 12px 30px rgba(30,64,175,.11);font-family:Inter,"Segoe UI",Arial,sans-serif;color:#19324f}
      .psg-one-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      .psg-one-title{font-size:18px;font-weight:850;color:#173b70}.psg-one-sub{font-size:12px;color:#566b84;margin-top:4px}
      .psg-one-badge{white-space:nowrap;border:1px solid #8fd7bd;background:#ecfdf5;color:#087a55;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:800}
      .psg-one-run{margin-top:16px;border:0;border-radius:10px;padding:11px 16px;font-size:12px;font-weight:850;cursor:pointer;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;box-shadow:0 6px 14px rgba(37,99,235,.24);transition:.13s ease}
      .psg-one-run:hover{transform:translateY(-1px);box-shadow:0 9px 18px rgba(37,99,235,.28)}
      .psg-one-run:active{transform:translateY(1px) scale(.975);box-shadow:inset 0 2px 5px rgba(15,23,42,.2)}
      .psg-one-run:disabled{opacity:.72;cursor:wait;transform:none}
      .psg-one-note{margin-top:13px;font-size:11px;line-height:1.6;color:#52657b}
      .psg-one-help{display:none;margin-top:12px;padding:10px 12px;border:1px solid #f2c079;border-radius:10px;background:#fff8e9;color:#7a4a12;font-size:11px;line-height:1.6}.psg-one-help.show{display:block}
    `;
    document.head.appendChild(s);
  }

  function downloadInstaller(){
    const a=document.createElement('a');
    a.href=INSTALL_URL;
    a.download='Install_ProxySG_Trace_Launcher.cmd';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>a.remove(),1000);
  }

  function attemptRun(){
    const btn=document.getElementById('psgOneRun');
    const help=document.getElementById('psgOneHelp');
    const x=t();
    if(btn){ btn.disabled=true; btn.textContent=x.checking; }
    if(help) help.classList.remove('show');

    let externalOpened=false;
    const mark=()=>{ externalOpened=true; };
    window.addEventListener('blur',mark,{once:true});
    document.addEventListener('visibilitychange',()=>{ if(document.hidden) externalOpened=true; },{once:true});

    try{
      const iframe=document.createElement('iframe');
      iframe.style.display='none';
      iframe.src=PROTOCOL_URL;
      document.body.appendChild(iframe);
      setTimeout(()=>iframe.remove(),2400);
    }catch(_){}

    setTimeout(()=>{
      if(externalOpened){
        if(btn){ btn.disabled=false; btn.textContent=x.run; }
        return;
      }
      downloadInstaller();
      if(btn){ btn.disabled=false; btn.textContent=x.downloaded; }
      if(help){
        help.textContent=x.installHelp;
        help.classList.add('show');
      }
      setTimeout(()=>{ if(btn) btn.textContent=t().run; },4500);
    },2200);
  }

  function render(){
    const slot=document.getElementById(SLOT_ID);
    if(!slot) return;
    ensureStyle();
    const x=t();
    slot.innerHTML=`
      <div class="psg-one-card">
        <div class="psg-one-head">
          <div><div class="psg-one-title">${x.title}</div><div class="psg-one-sub">${x.sub}</div></div>
          <div class="psg-one-badge">● ${x.badge}</div>
        </div>
        <button class="psg-one-run" id="psgOneRun">${x.run}</button>
        <div class="psg-one-note">${x.note}</div>
        <div class="psg-one-help" id="psgOneHelp"></div>
      </div>`;
    slot.querySelector('#psgOneRun').onclick=attemptRun;
  }

  function init(){
    render();
    const mo=new MutationObserver(()=>render());
    mo.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    document.addEventListener('click',e=>{
      if(e.target?.matches?.('.trace-lang-btn,.langBtn,[data-lang]')) setTimeout(render,0);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();