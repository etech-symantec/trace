(() => {
  const SLOT_ID='proxysg-launcher-slot';
  const INSTALL_URL='./downloads/Install_ProxySG_Trace_Launcher_v4.cmd';
  const PROTOCOL_URL='proxysg-trace-v4://run';

  function en(){
    return document.documentElement.lang==='en' ||
      window.PROXYSG_UI_LANG==='en' ||
      localStorage.getItem('proxysgTraceLanguage')==='en';
  }

  const L={
    ko:{
      title:'ProxySG Trace Editor',
      sub:'기존 Launcher가 설치되어 있어도 v4가 아니면 자동으로 새 설치 파일을 안내합니다.',
      badge:'v4 · One-shot',
      run:'▶ Trace Editor 실행',
      checking:'v4 Launcher 확인 중…',
      installer:'v4 설치 파일 다운로드됨',
      note:'이 페이지는 새 URL Protocol을 사용하므로 예전 Launcher가 설치된 PC도 자동으로 v4 마이그레이션을 유도합니다.',
      help:'다운로드된 Install_ProxySG_Trace_Launcher_v4.cmd를 한 번 실행하세요. 기존 Launcher 등록을 v4로 교체하고 Editor를 설치합니다. 설치 후 같은 버튼을 다시 누르면 Editor가 실행됩니다.'
    },
    en:{
      title:'ProxySG Trace Editor',
      sub:'Even if an older Launcher is installed, this page migrates it when v4 is missing.',
      badge:'v4 · One-shot',
      run:'▶ Run Trace Editor',
      checking:'Checking v4 Launcher…',
      installer:'v4 installer downloaded',
      note:'This page uses a new URL protocol, so PCs with an older Launcher are guided through the v4 migration automatically.',
      help:'Run the downloaded Install_ProxySG_Trace_Launcher_v4.cmd once. It replaces the old Launcher registration with v4 and installs the Editor. Then click the same button again.'
    }
  };
  const t=()=>L[en()?'en':'ko'];

  function style(){
    if(document.getElementById('psg-v4-style'))return;
    const s=document.createElement('style');
    s.id='psg-v4-style';
    s.textContent=`
      .psgv4{border:1px solid #8fb6f2;border-radius:16px;background:linear-gradient(135deg,#eaf2ff,#f8fbff 58%,#eef4ff);padding:20px;box-shadow:0 12px 30px rgba(30,64,175,.11);font-family:Inter,"Segoe UI",Arial,sans-serif;color:#19324f}
      .psgv4-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.psgv4-title{font-size:18px;font-weight:850;color:#173b70}.psgv4-sub{font-size:12px;color:#566b84;margin-top:4px}
      .psgv4-badge{white-space:nowrap;border:1px solid #8fd7bd;background:#ecfdf5;color:#087a55;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:800}
      .psgv4-run{margin-top:16px;border:0;border-radius:10px;padding:11px 16px;font-size:12px;font-weight:850;cursor:pointer;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;box-shadow:0 6px 14px rgba(37,99,235,.24);transition:.13s ease}.psgv4-run:hover{transform:translateY(-1px);box-shadow:0 9px 18px rgba(37,99,235,.28)}.psgv4-run:active{transform:translateY(1px) scale(.975);box-shadow:inset 0 2px 5px rgba(15,23,42,.2)}.psgv4-run:disabled{opacity:.72;cursor:wait;transform:none}
      .psgv4-note{margin-top:13px;font-size:11px;line-height:1.6;color:#52657b}.psgv4-help{display:none;margin-top:12px;padding:10px 12px;border:1px solid #f2c079;border-radius:10px;background:#fff8e9;color:#7a4a12;font-size:11px;line-height:1.6}.psgv4-help.show{display:block}
    `;
    document.head.appendChild(s);
  }

  function downloadInstaller(){
    const a=document.createElement('a');
    a.href=INSTALL_URL;
    a.download='Install_ProxySG_Trace_Launcher_v4.cmd';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>a.remove(),1000);
  }

  function run(){
    const b=document.getElementById('psgv4Run');
    const h=document.getElementById('psgv4Help');
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
      <div class="psgv4">
        <div class="psgv4-head">
          <div><div class="psgv4-title">${x.title}</div><div class="psgv4-sub">${x.sub}</div></div>
          <div class="psgv4-badge">● ${x.badge}</div>
        </div>
        <button id="psgv4Run" class="psgv4-run">${x.run}</button>
        <div class="psgv4-note">${x.note}</div>
        <div id="psgv4Help" class="psgv4-help"></div>
      </div>`;
    slot.querySelector('#psgv4Run').onclick=run;
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