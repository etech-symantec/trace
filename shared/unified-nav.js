(() => {
  if(document.getElementById('proxyUnifiedNav')) return;

  const path=location.pathname.toLowerCase();
  const active=path.includes('/apps/sysinfo/')?'sysinfo':
               path.includes('/apps/isg/')?'isg':
               path.includes('/apps/mib/')?'mib':'direct';

  const labels={
    ko:{
      direct:['🛰️ ProxySG 직접 연결','장비 · Local Admin · Trace'],
      file:['📄 Trace 파일 분석','저장 Trace 분석'],
      sysinfo:['🧾 Sysinfo 분석','Sysinfo 진단'],
      isg:['🧩 ISG 분석','ISG 분석'],
      mib:['📡 MIB 분석','MIB / SNMP']
    },
    en:{
      direct:['🛰️ Direct ProxySG','Device · Local Admin · Trace'],
      file:['📄 Trace Analysis','Saved Trace'],
      sysinfo:['🧾 Sysinfo','Sysinfo Diagnostics'],
      isg:['🧩 ISG','ISG Analysis'],
      mib:['📡 MIB','MIB / SNMP']
    }
  };

  function currentLang(){
    return localStorage.getItem('proxysgTraceLanguage')==='en'?'en':'ko';
  }

  const nav=document.createElement('div');
  nav.id='proxyUnifiedNav';
  nav.innerHTML=`
    <div class="pun-row">
      <div class="pun-tabs">
        <a class="pun-tab" data-key="direct" href="../../"><b class="pun-title"></b><span class="pun-desc"></span></a>
        <a class="pun-tab" data-key="file" href="../../?mode=file"><b class="pun-title"></b><span class="pun-desc"></span></a>
        <a class="pun-tab" data-key="sysinfo" href="../sysinfo/"><b class="pun-title"></b><span class="pun-desc"></span></a>
        <a class="pun-tab" data-key="isg" href="../isg/"><b class="pun-title"></b><span class="pun-desc"></span></a>
        <a class="pun-tab" data-key="mib" href="../mib/"><b class="pun-title"></b><span class="pun-desc"></span></a>
      </div>
      <div class="pun-lang" aria-label="Language">
        <button type="button" data-lang="ko">한국어</button>
        <button type="button" data-lang="en">English</button>
      </div>
    </div>`;

  function paint(){
    const lang=currentLang();
    nav.querySelectorAll('.pun-tab').forEach(a=>{
      const key=a.dataset.key;
      a.classList.toggle('active',key===active);
      const [title,desc]=labels[lang][key];
      a.querySelector('.pun-title').textContent=title;
      a.querySelector('.pun-desc').textContent=desc;
    });
    nav.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    document.documentElement.lang=lang==='en'?'en':'ko';
  }

  nav.querySelectorAll('[data-lang]').forEach(b=>{
    b.addEventListener('click',()=>{
      localStorage.setItem('proxysgTraceLanguage',b.dataset.lang);
      paint();
      try{
        if(typeof window.traceSetLanguage==='function') window.traceSetLanguage(b.dataset.lang,false);
      }catch(_){}
      window.dispatchEvent(new CustomEvent('proxy-unified-language-change',{detail:{lang:b.dataset.lang}}));
    });
  });

  document.body.insertBefore(nav,document.body.firstChild);
  paint();
})();