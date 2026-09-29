(() => {
  const SLOT_ID='proxysg-launcher-slot';
  const INSTALL_URL='./downloads/Install_ProxySG_Trace_Launcher.cmd';
  const PROTOCOL_URL='proxysg-trace://run';

  function en(){
    return document.documentElement.lang==='en' ||
      window.PROXYSG_UI_LANG==='en' ||
      localStorage.getItem('proxysgTraceLanguage')==='en';
  }

  const L={
    ko:{
      title:'ProxySG Trace Editor',
      sub:'설치 후에는 버튼 한 번으로 로컬 Policy Trace Editor를 실행합니다.',
      badge:'One-shot · 상주 없음',
      run:'▶ Trace Editor 실행',
      checking:'Launcher 확인 중…',
      installer:'설치 파일 다운로드됨',
      note:'Launcher와 Editor가 설치되어 있으면 바로 실행합니다. 처음 사용하는 PC에서는 설치 파일이 자동 다운로드됩니다.',
      help:'다운로드된 Install_ProxySG_Trace_Launcher.cmd를 한 번 실행하세요. 설치 과정에서 공식 페이지의 Editor를 다운로드하고 SHA-256 검증 후 LocalAppData에 설치합니다. 설치 완료 후 이 버튼을 다시 누르면 Editor가 실행됩니다.'
    },
    en:{
      title:'ProxySG Trace Editor',
      sub:'After one-time installation, this single button launches the local Policy Trace Editor.',
      badge:'One-shot · No resident process',
      run:'▶ Run Trace Editor',
      checking:'Checking Launcher…',
      installer:'Installer downloaded',
      note:'Runs immediately when Launcher and Editor are installed. On a new PC, the installer is downloaded automatically.',
      help:'Run the downloaded Install_ProxySG_Trace_Launcher.cmd once. It downloads the Editor from the official page, verifies SHA-256, and installs it under LocalAppData. Then click this button again.'
    }
  };
  const t=()=>L[en()?'en':'ko'];

  function style(){
    if(document.getElementById('psg-one-v3-style'))return;
    const s=document.createElement('style');
    s.id='psg-one-v3-style';
    s.textContent=`
      .psgv3{border:1px solid #8fb6f2;border-radius:16px;background:linear-gradient(135deg,#eaf2ff,#f8fbff 58%,#eef4ff);padding:20px;box-shadow:0 12px 30px rgba(30,64,175,.11);font-family:Inter,"Segoe UI",Arial,sans-serif;color:#19324f}
      .psgv3-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.psgv3-title{font-size:18px;font-weight:850;color:#173b70}.psgv3-sub{font-size:12px;color:#566b84;margin-top:4px}
      .psgv3-badge{white-space:nowrap;border:1px solid #8fd7bd;background:#ecfdf5;color:#087a55;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:800}
      .psgv3-run{margin-top:16px;border:0;border-radius:10px;padding:11px 16px;font-size:12px;font-weight:850;cursor:pointer;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;box-shadow:0 6px 14px rgba(37,99,235,.24);transition:.13s ease}.psgv3-run:hover{transform:translateY(-1px);box-shadow:0 9px 18px rgba(37,99,235,.28)}.psgv3-run:active{transform:translateY(1px) scale(.975);box-shadow:inset 0 2px 5px rgba(15,23,42,.2)}.psgv3-run:disabled{opacity:.72;cursor:wait;transform:none}
      .psgv3-note{margin-top:13px;font-size:11px;line-height:1.6;color:#52657b}.psgv3-help{display:none;margin-top:12px;padding:10px 12px;border:1px solid #f2c079;border-radius:10px;background:#fff8e9;color:#7a4a12;font-size:11px;line-height:1.6}.psgv3-help.show{display:block}
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

  function run(){
    const b=document.getElementById('psgv3Run');
    const h=document.getElementById('psgv3Help');
    const x=t();
    if(b){b.disabled=true;b.textContent=x.checking}
    h?.classList.remove('show');

    let opened=false;
    const mark=()=>opened=true;
    window.addEventListener('blur',mark,{once:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)opened=true},{once:true});

    const f=document.createElement('iframe');
    f.style.display='none';
    f.src=PROTOCOL_URL;
    document.body.appendChild(f);
    setTimeout(()=>f.remove(),2500);

    setTimeout(()=>{
      if(opened){
        if(b){b.disabled=false;b.textContent=t().run}
        return;
      }
      downloadInstaller();
      if(b){b.disabled=false;b.textContent=x.installer}
      if(h){h.textContent=x.help;h.classList.add('show')}
      setTimeout(()=>{if(b)b.textContent=t().run},5000);
    },2200);
  }

  function render(){
    const slot=document.getElementById(SLOT_ID);
    if(!slot)return;
    style();
    const x=t();
    slot.innerHTML=`
      <div class="psgv3">
        <div class="psgv3-head">
          <div><div class="psgv3-title">${x.title}</div><div class="psgv3-sub">${x.sub}</div></div>
          <div class="psgv3-badge">● ${x.badge}</div>
        </div>
        <button id="psgv3Run" class="psgv3-run">${x.run}</button>
        <div class="psgv3-note">${x.note}</div>
        <div id="psgv3Help" class="psgv3-help"></div>
      </div>`;
    slot.querySelector('#psgv3Run').onclick=run;
  }

  function init(){
    render();
    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    document.addEventListener('click',e=>{
      if(e.target?.matches?.('.trace-lang-btn,.langBtn,[data-lang]'))setTimeout(render,0);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();