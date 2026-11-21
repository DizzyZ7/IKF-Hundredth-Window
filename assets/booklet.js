"use strict";
document.getElementById("print-button").addEventListener("click",()=>window.print());
const root=document.getElementById("print-stories");
function make(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
async function loadAuthors(){
 try{
  const response=await fetch("./data/stories.json?v=07",{cache:"no-store"});
  if(!response.ok)throw Error("unavailable");
  const data=await response.json();
  if(!Array.isArray(data)||data.length===0)return;
  const entries=data.filter(s=>s&&typeof s.name==="string"&&typeof s.title==="string"&&typeof s.author==="string");
  if(!entries.length)return;
  root.replaceChildren();
  for(const s of entries){
   const article=make("article"),num=make("span","story-number",Number.isInteger(s.window)?String(s.window).padStart(2,"0"):"—"),info=make("div");
   info.append(make("h3","",s.name),make("small","",s.author+(Number.isInteger(s.window)?" · квартира №"+s.window:" · Люсхольм")),make("p","",s.title+". "+(s.description||"")));
   article.append(num,info);root.append(article);
  }
 }catch{/* Keep the initial character profile for offline use. */}
}
loadAuthors();
