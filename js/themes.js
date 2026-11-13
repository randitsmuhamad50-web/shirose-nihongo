/* Tema SHIROSE: ungu (bawaan) + 4 cuaca. Disimpan di localStorage 'shirose-theme'. */
(function(){
  var KEY="shirose-theme";
  var TH=[["ungu","🟣","Ungu (bawaan)","#161b36"],["cerah","☀️","Cerah","#12345f"],["hujan","🌧️","Hujan","#1c2733"],["salju","❄️","Salju","#243a52"],["badai","⛈️","Badai","#1a1a24"]];
  function get(){try{var v=localStorage.getItem(KEY);return TH.some(function(t){return t[0]===v})?v:"ungu"}catch(e){return "ungu"}}
  function layer(t){
    var w=document.getElementById("wx");
    if(!w){w=document.createElement("div");w.id="wx";document.body.insertBefore(w,document.body.firstChild)}
    var h="",i,r=function(a,b){return a+Math.random()*(b-a)};
    if(t==="hujan"||t==="badai"){for(i=0;i<(t==="badai"?55:40);i++)h+='<i class="drop" style="left:'+r(0,100).toFixed(1)+'%;animation-duration:'+r(.7,1.3).toFixed(2)+'s;animation-delay:-'+r(0,2).toFixed(2)+'s;opacity:'+r(.35,.8).toFixed(2)+'"></i>'}
    if(t==="badai")h+='<i class="flash"></i>';
    if(t==="salju"){for(i=0;i<36;i++){var s=r(3,7).toFixed(1);h+='<i class="flake" style="left:'+r(0,100).toFixed(1)+'%;width:'+s+'px;height:'+s+'px;animation-duration:'+r(7,14).toFixed(1)+'s;animation-delay:-'+r(0,12).toFixed(1)+'s"></i>'}}
    if(t==="cerah")h+='<i class="sun"></i>';
    w.innerHTML=h;
  }
  function apply(t){
    document.documentElement.setAttribute("data-theme",t);
    var m=document.querySelector('meta[name="theme-color"]');if(m){for(var i=0;i<TH.length;i++)if(TH[i][0]===t)m.setAttribute("content",TH[i][3])}
    layer(t);
    var mn=document.getElementById("th-menu");if(mn)[].forEach.call(mn.querySelectorAll("button"),function(b){b.classList.toggle("on",b.dataset.t===t)});
  }
  function set(t){try{localStorage.setItem(KEY,t)}catch(e){}apply(t)}
  window.SHIROSE_THEME={set:set,get:get};
  function init(){
    apply(get());
    var tr=document.querySelector(".topbar-right");
    if(tr&&!document.getElementById("th-menu")){
      var d=document.createElement("div");d.className="th-wrap";
      d.innerHTML='<button class="th-btn" id="th-btn" title="Ganti tema" aria-label="Ganti tema">🎨</button><div class="th-menu" id="th-menu">'+TH.map(function(t){return '<button data-t="'+t[0]+'">'+t[1]+' '+t[2]+'</button>'}).join("")+'</div>';
      tr.insertBefore(d,tr.firstChild);
      d.querySelector("#th-btn").onclick=function(e){e.stopPropagation();document.getElementById("th-menu").classList.toggle("open")};
      d.querySelector("#th-menu").onclick=function(e){var b=e.target.closest("button");if(b){set(b.dataset.t);document.getElementById("th-menu").classList.remove("open")}};
      document.addEventListener("click",function(){var m=document.getElementById("th-menu");if(m)m.classList.remove("open")});
      apply(get());
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
