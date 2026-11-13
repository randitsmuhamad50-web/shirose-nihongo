/* Tema SHIROSE: ungu (bawaan) + 4 cuaca. Disimpan di localStorage 'shirose-theme'. */
(function(){
  var KEY="shirose-theme";
  var TH=[["ungu","🟣","Ungu (bawaan)","#161b36"],["cerah","☀️","Cerah","#12345f"],["hujan","🌧️","Hujan","#1c2733"],["salju","❄️","Salju / Dingin","#243a52"],["gugur","🍁","Gugur","#2d1a14"],["panas","🌊","Panas","#0b3b5c"],["semi","🌸","Semi","#2e1f4a"],["badai","⛈️","Badai","#1a1a24"]];
  function get(){try{var v=localStorage.getItem(KEY);return TH.some(function(t){return t[0]===v})?v:"ungu"}catch(e){return "ungu"}}

  /* ===== Pemandangan siluet (diburamkan, menyatu dengan latar) ===== */
  function pole(x,h,c){return '<g fill="'+c+'"><rect x="'+(x-3)+'" y="'+(300-h)+'" width="6" height="'+h+'"/><rect x="'+(x-34)+'" y="'+(300-h+16)+'" width="68" height="5"/><rect x="'+(x-24)+'" y="'+(300-h+44)+'" width="48" height="4"/></g>'}
  function wires(xs,h,c){var s='',y=300-h+18,i;for(i=0;i<xs.length-1;i++){[-30,0,30].forEach(function(o){s+='<path d="M'+(xs[i]+o)+' '+(y+(o?26:0)*0)+' Q'+((xs[i]+xs[i+1])/2+o)+' '+(y+55)+' '+(xs[i+1]+o)+' '+y+'" />'})}return '<g fill="none" stroke="'+c+'" stroke-width="1.6">'+s+'</g>'}
  function house(x,w,h,c,roof,win){return '<g><rect x="'+x+'" y="'+(300-h)+'" width="'+w+'" height="'+h+'" fill="'+c+'"/><path d="M'+(x-14)+' '+(300-h)+' L'+(x+w/2)+' '+(300-h-46)+' L'+(x+w+14)+' '+(300-h)+' Z" fill="'+roof+'"/>'+(win?'<rect x="'+(x+w*.3)+'" y="'+(300-h*.6)+'" width="'+w*.18+'" height="'+h*.22+'" fill="'+win+'"/><rect x="'+(x+w*.62)+'" y="'+(300-h*.6)+'" width="'+w*.18+'" height="'+h*.22+'" fill="'+win+'"/>':'')+'</g>'}
  function sak(x,s,c,t){var o='<g><path d="M'+x+' 300 q-4 -'+(60*s)+' 6 -'+(100*s)+' M'+x+' '+(300-60*s)+' q-30 -20 -50 -'+(34*s)+' M'+x+' '+(300-70*s)+' q30 -20 54 -'+(40*s)+'" stroke="'+t+'" stroke-width="'+(7*s)+'" fill="none" stroke-linecap="round"/>';[[0,-112,46],[-48,-92,38],[50,-100,40],[-22,-140,34],[26,-138,36],[-70,-70,28],[72,-72,30]].forEach(function(p){o+='<circle cx="'+(x+p[0]*s)+'" cy="'+(300+p[1]*s)+'" r="'+(p[2]*s)+'" fill="'+c+'"/>'});return o+'</g>'}
  function torii(x,s,c){return '<g fill="'+c+'"><rect x="'+(x-46*s)+'" y="'+(300-110*s)+'" width="'+(10*s)+'" height="'+(110*s)+'"/><rect x="'+(x+36*s)+'" y="'+(300-110*s)+'" width="'+(10*s)+'" height="'+(110*s)+'"/><path d="M'+(x-64*s)+' '+(300-112*s)+' Q'+x+' '+(300-100*s)+' '+(x+64*s)+' '+(300-112*s)+' L'+(x+70*s)+' '+(300-126*s)+' Q'+x+' '+(300-112*s)+' '+(x-70*s)+' '+(300-126*s)+' Z"/><rect x="'+(x-52*s)+'" y="'+(300-92*s)+'" width="'+(104*s)+'" height="'+(8*s)+'"/></g>'}
  function pagoda(x,s,w,r){var o='<g><rect x="'+(x-8*s)+'" y="'+(300-210*s)+'" width="'+(16*s)+'" height="'+(26*s)+'" fill="'+r+'"/>';for(var i=0;i<4;i++){var y=300-(30+i*48)*s,hw=(70-i*10)*s;o+='<rect x="'+(x-hw*.62)+'" y="'+(y-30*s)+'" width="'+(hw*1.24)+'" height="'+(30*s)+'" fill="'+w+'"/><path d="M'+(x-hw-14*s)+' '+(y-26*s)+' Q'+(x-hw*.4)+' '+(y-30*s)+' '+x+' '+(y-48*s)+' Q'+(x+hw*.4)+' '+(y-30*s)+' '+(x+hw+14*s)+' '+(y-26*s)+' Z" fill="'+r+'"/>'}return o+'</g>'}
  function pine(x,s,c){return '<path fill="'+c+'" d="M'+x+' '+(300-150*s)+' l'+(34*s)+' '+(60*s)+' h-'+(18*s)+' l'+(38*s)+' '+(56*s)+' h-'+(24*s)+' l'+(30*s)+' '+(34*s)+' h-'+(120*s)+' l'+(30*s)+' -'+(34*s)+' h-'+(24*s)+' l'+(38*s)+' -'+(56*s)+' h-'+(18*s)+' z"/>'}
  function maple(x,s,c,t){var o='<g><path d="M'+x+' 300 q-3 -'+(70*s)+' 4 -'+(110*s)+'" stroke="'+t+'" stroke-width="'+(8*s)+'" fill="none" stroke-linecap="round"/>';[[0,-120,50],[-46,-96,38],[48,-100,40],[-20,-150,34],[28,-146,34]].forEach(function(p,i){o+='<circle cx="'+(x+p[0]*s)+'" cy="'+(300+p[1]*s)+'" r="'+(p[2]*s)+'" fill="'+(i%2?c[1]:c[0])+'"/>'});return o+'</g>'}
  function fuji(x,s,c,cap){return '<path d="M'+(x-260*s)+' 300 L'+x+' '+(300-190*s)+' L'+(x+260*s)+' 300 Z" fill="'+c+'"/><path d="M'+(x-62*s)+' '+(300-146*s)+' L'+x+' '+(300-190*s)+' L'+(x+62*s)+' '+(300-146*s)+' L'+(x+34*s)+' '+(300-136*s)+' L'+x+' '+(300-150*s)+' L'+(x-30*s)+' '+(300-134*s)+' Z" fill="'+cap+'"/>'}
  function city(c,glow){var o='<g fill="'+c+'">',x=0,hs=[90,140,110,170,100,130,80,150];for(var i=0;i<16;i++){var h=hs[i%8],w=60+(i*17%40);o+='<rect x="'+x+'" y="'+(300-h)+'" width="'+w+'" height="'+h+'"/>';if(glow&&i%3==0)o+='<rect x="'+(x+10)+'" y="'+(300-h+16)+'" width="10" height="14" fill="'+glow+'"/>';x+=w+8}return o+'</g>'}
  function scene(t){
    var S='',c;
    if(t!=="badai")return "";
    if(t==="hujan"){c="#070d13";S=house(60,110,70,"#0c141b","#05090d","#ffcf6b")+pole(250,230,c)+pole(620,250,c)+pole(990,225,c)+wires([250,620,990],230,c)+house(400,120,86,"#0c141b","#05090d","#ffcf6b")+house(780,130,76,"#0c141b","#05090d","#ffcf6b")+house(1060,100,92,"#0c141b","#05090d")}
    else if(t==="badai"){c="#05050a";S=city("#0a0a14","#ffd60a")+pole(180,240,c)+pole(560,260,c)+pole(940,235,c)+wires([180,560,940],240,c)}
    else if(t==="salju"){S=pine(90,1.1,"#10243a")+house(240,150,80,"#1a3550","#e8f4ff","#ffd27a")+pine(520,.9,"#10243a")+house(640,170,90,"#1a3550","#e8f4ff","#ffd27a")+pine(980,1.2,"#10243a")+pine(1100,.8,"#10243a")}
    else if(t==="gugur"){S=maple(120,1.2,["#e0523a","#f08a24"],"#2a1209")+torii(340,1.1,"#c0291f")+pagoda(640,1.1,"#2a1209","#6b1d12")+maple(900,1.3,["#f08a24","#d6451f"],"#2a1209")+torii(1090,.8,"#c0291f")}
    else if(t==="semi"){S=fuji(940,1.3,"#6c5bb0","#fbe3f1")+sak(120,1.3,"#ff9fcb","#3a2347")+pagoda(430,1.15,"#35204f","#8a2a4a")+torii(640,1,"#e0443a")+sak(830,1.1,"#ffb3d6","#3a2347")+sak(1080,1.4,"#ff9fcb","#3a2347")}
    else if(t==="cerah"){S=fuji(300,1.2,"#2f6fb4","#ffffff")+house(560,130,70,"#173f6e","#0f2c52","#ffe08a")+pine(780,1,"#14553f")+house(900,120,80,"#173f6e","#0f2c52","#ffe08a")+pine(1100,1.1,"#14553f")}
    return S?'<svg class="scene" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">'+S+'</svg>':"";
  }
  function layer(t){
    var w=document.getElementById("wx");
    if(!w){w=document.createElement("div");w.id="wx";document.body.insertBefore(w,document.body.firstChild)}
    var h=scene(t),i,r=function(a,b){return a+Math.random()*(b-a)};
    if(t==="hujan"||t==="badai"){for(i=0;i<(t==="badai"?55:40);i++)h+='<i class="drop" style="left:'+r(0,100).toFixed(1)+'%;animation-duration:'+r(.7,1.3).toFixed(2)+'s;animation-delay:-'+r(0,2).toFixed(2)+'s;opacity:'+r(.35,.8).toFixed(2)+'"></i>'}
    if(t==="badai")h+='<i class="flash"></i>';
    if(t==="salju"){for(i=0;i<36;i++){var s=r(3,7).toFixed(1);h+='<i class="flake" style="left:'+r(0,100).toFixed(1)+'%;width:'+s+'px;height:'+s+'px;animation-duration:'+r(7,14).toFixed(1)+'s;animation-delay:-'+r(0,12).toFixed(1)+'s"></i>'}}
    if(t==="gugur"||t==="semi"){var ch=t==="gugur"?["🍁","🍂"]:["🌸","🌸"];for(i=0;i<22;i++)h+='<i class="leaf" style="left:'+r(0,100).toFixed(1)+'%;font-size:'+r(14,26).toFixed(0)+'px;animation-duration:'+r(8,15).toFixed(1)+'s;animation-delay:-'+r(0,14).toFixed(1)+'s;opacity:.85">'+ch[i%2]+'</i>'}
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
      d.innerHTML='<button class="th-btn" id="th-btn" title="Ganti tema" aria-label="Ganti tema">🎨 <span class="th-txt">Ganti tema</span></button><div class="th-menu" id="th-menu">'+TH.map(function(t){return '<button data-t="'+t[0]+'">'+t[1]+' '+t[2]+'</button>'}).join("")+'</div>';
      tr.insertBefore(d,tr.firstChild);
      d.querySelector("#th-btn").onclick=function(e){e.stopPropagation();document.getElementById("th-menu").classList.toggle("open")};
      d.querySelector("#th-menu").onclick=function(e){var b=e.target.closest("button");if(b){set(b.dataset.t);document.getElementById("th-menu").classList.remove("open")}};
      document.addEventListener("click",function(){var m=document.getElementById("th-menu");if(m)m.classList.remove("open")});
      apply(get());
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
