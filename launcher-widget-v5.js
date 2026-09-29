(() => {
  const SLOT_ID='proxysg-launcher-slot';
  const INSTALL_URL='./downloads/Install_ProxySG_Trace_Launcher_v5.cmd';
  const PROTOCOL_URL='proxysg-trace-v5://run';

  function en(){
    return document.documentElement.lang==='en' ||
      window.PROXYSG_UI_LANG==='en' ||
      localStorage.getItem('proxysgTraceLanguage')==='en';
  }

  const L={
    ko:{
      title:'ProxySG Trace Editor',
      sub:'Editor는 ZIP으로 배포하며, 설치 후에는 이 버튼 하나로 실행합니다.',
      badge:'v5 · ZIP 배포',
      run:'▶ Trace Editor 실행',
      checking:'v5 Launcher 확인 중…',
      installer:'v5 설치 파일 다운로드됨',
      note:'기존 Launcher가 있어도 v5 프로토콜이 없으면 새 설치 CMD가 자동 다운로드됩니다. Editor EXE는 웹에서 직접 내려받지 않습니다.',
      help:'다운로드된 Install_ProxySG_Trace_Launcher_v5.cmd를 한 번 실행하세요. 설치 프로그램이 Editor ZIP을 다운로드하고 SHA-256 검증 → 압축 해제 → LocalAppData 설치까지 처리합니다. 완료 후 같은 버튼을 다시 누르면 Editor가 실행됩니다.'
    },
    en:{
      title:'ProxySG Trace Editor',
      sub:'The Editor is distributed as a ZIP. After installation, this single button runs it.',
      badge:'v5 · ZIP distribution',
      run:'▶ Run Trace Editor',
      checking:'Checking v5 Launcher…',
      installer:'v5 installer downloaded',
      note:'Even when an older Launcher exists, the v5 installer is downloaded if the v5 protocol is missing. The browser never downloads the Editor EXE directly.',
      help:'Run the downloaded Install_ProxySG_Trace_Launcher_v5.cmd once. It downloads the Editor ZIP, verifies SHA-256, extracts it, and installs the Editor under LocalAppData. Then click this button again.'
    }
  };
  const t=()=>L[en()?'en':'ko'];

  function style(){
    if(document.getElementById('psg-v5-style')) return;
    const s=document.createElement('style');
    s.id='psg-v5-style';
    s.textContent=`
      .psgv5{border:1px solid #8fb6f2;border-radius:16px;background:linear-gradient(135deg,#eaf2ff,#f8fbff 58%,#eef4ff);padding:20px;box-shadow:0 12px 30px rgba(30,64,175,.11);font-family:Inter,"Segoe UI",Arial,sans-serif;color:#19324f}
      .psgv5-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.psgv5-title{font-size:18px;font-weight:850;color:#173b70}.psgv5-sub{font-size:12px;color:#566b84;margin-top:4px}
      .psgv5-badge{white-space:nowrap;border:1px solid #8fd7bd;background:#ecfdf5;color:#087a55;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:800}
      .psgv5-run{margin-top:16px;border:0;border-radius:10px;padding:11px 16px;font-size:12px;font-weight:850;cursor:pointer;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;box-shadow:0 6px 14px rgba(37,99,235,.24);transition:.13s ease}.psgv5-run:hover{transform:translateY(-1px);box-shadow:0 9px 18px rgba(37,99,235,.28)}.psgv5-run:active{transform:translateY(1px) scale(.975);box-shadow:inset 0 2px 5px rgba(15,23,42,.2)}.psgv5-run:disabled{opacity:.72;cursor:wait;transform:none}
      .psgv5-note{margin-top:13px;font-size:11px;line-height:1.6;color:#52657b}.psgv5-help{display:none;margin-top:12px;padding:10px 12px;border:1px solid #f2c079;border-radius:10px;background:#fff8e9;color:#7a4a12;font-size:11px;line-height:1.6}.psgv5-help.show{display:block}
    `;
    document.head.appendChild(s);
  }

  function downloadInstaller(){
    const a=document.createElement('a');
    a.href=INSTALL_URL;
    a.download='Install_ProxySG_Trace_Launcher_v5.cmd';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>a.remove(),1000);
  }

  function run(){
    const b=document.getElementById('psgv5Run');
    const h=document.getElementById('psgv5Help');
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
    if(!slot) return;
    style();
    const x=t();
    slot.innerHTML=`
      <div class="psgv5">
        <div class="psgv5-head">
          <div><div class="psgv5-title">${x.title}</div><div class="psgv5-sub">${x.sub}</div></div>
          <div class="psgv5-badge">● ${x.badge}</div>
        </div>
        <button id="psgv5Run" class="psgv5-run">${x.run}</button>
        <div class="psgv5-note">${x.note}</div>
        <div id="psgv5Help" class="psgv5-help"></div>
      </div>`;
    slot.querySelector('#psgv5Run').onclick=run;
  }

  function init(){
    render();
    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    document.addEventListener('click',e=>{
      if(e.target?.matches?.('.trace-lang-btn,.langBtn,[data-lang]')) setTimeout(render,0);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();