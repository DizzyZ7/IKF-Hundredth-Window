"use strict";
const $=id=>document.getElementById(id);
let font=20,theme="night";
try{font=Math.max(17,Math.min(27,Number(localStorage.getItem("ikf-reader-font"))||20));theme=localStorage.getItem("ikf-reader-theme")==="light"?"light":"night";}catch{}
function prefs(){
 document.documentElement.style.setProperty("--font-size",font+"px");
 document.body.dataset.theme=theme;
 $("theme-toggle").textContent=theme==="night"?"Светлая страница":"Темная страница";
 $("theme-toggle").setAttribute("aria-pressed",String(theme==="light"));
}
$("font-down").addEventListener("click",()=>{font=Math.max(17,font-1);try{localStorage.setItem("ikf-reader-font",String(font));}catch{}prefs()});
$("font-up").addEventListener("click",()=>{font=Math.min(27,font+1);try{localStorage.setItem("ikf-reader-font",String(font));}catch{}prefs()});
$("theme-toggle").addEventListener("click",()=>{theme=theme==="night"?"light":"night";try{localStorage.setItem("ikf-reader-theme",theme);}catch{}prefs()});
function progress(){const total=document.documentElement.scrollHeight-window.innerHeight;$("reading-progress").style.width=(total>0?Math.max(0,Math.min(100,window.scrollY/total*100)):0)+"%";}
window.addEventListener("scroll",progress,{passive:true});window.addEventListener("resize",progress,{passive:true});
async function chapter(){
 const target=$("chapter-content");
 try{
  const response=await fetch("./data/chapter-01.txt?v=20261123-11",{cache:"no-store"});
  if(!response.ok)throw Error("unavailable");
  const raw=(await response.text()).replace(/\r\n?/g,"\n").trim();
  if(!raw.startsWith("СВЕТ В СОТОМ ОКНЕ")||!raw.includes("Конец первой главы."))throw Error("incomplete text");
  const start=raw.indexOf("В Люсхольме существовала одна странная традиция.");
  if(start<0)throw Error("opening paragraph missing");
  const sections=raw.slice(start).split(/\n\s*\n/),fragment=document.createDocumentFragment();
  for(const section of sections){
   const t=section.trim();if(!t)continue;
   if(t==="***"){const hr=document.createElement("hr");hr.setAttribute("aria-label","Разделитель сцен");fragment.append(hr);}
   else{const p=document.createElement("p");p.textContent=t;if(t==="Конец первой главы.")p.className="chapter-last";fragment.append(p);}
  }
  target.replaceChildren(fragment);$("chapter-ending").hidden=false;
 }catch{target.replaceChildren(document.createTextNode("Не удалось загрузить главу. Обновите страницу или сохраните оригинальный TXT из панели чтения."));}
 progress();
}
prefs();chapter();
