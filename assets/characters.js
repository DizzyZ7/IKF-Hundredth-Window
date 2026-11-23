"use strict";
/* Character archive: local JSON, no backend or trackers. All user-facing data is text-only. */
const DATA_VERSION="20261123-11";
const $=id=>document.getElementById(id);
function el(tag,cls,label){const a=document.createElement(tag);if(cls)a.className=cls;if(label!==undefined)a.textContent=label;return a;}
const offline=[{id:"eira-lindt",characterId:"eira-lindt",name:"Эйра Линдт",author:"ИКФ",window:70,title:"Там, где оставляют свет",description:"Картограф, которая знает: у «Альбатроса» 99 квартир.",ficbookUrl:null,locationId:"mayachnaya",profile:{age:28,occupation:"Специалист по картографии и адресному учету",tagline:"Она знает все адреса Люсхольма. Почти все.",quote:"Но впервые за долгое время ей захотелось ошибиться.",biography:["Эйра живет в квартире №70 на седьмом этаже дома «Альбатрос».","Она иронична, наблюдательна и добрее, чем старается казаться."],traits:["Ироничная","Наблюдательная","Добрая"]}}];
let stories=offline;
function validStory(s){return !!(s&&typeof s.id==="string"&&typeof s.name==="string"&&typeof s.title==="string"&&typeof s.author==="string"&&(s.window===null||(Number.isInteger(s.window)&&s.window>=1&&s.window<=99)));}
function cid(s){return typeof s.characterId==="string"&&/^[a-z0-9-]{1,80}$/.test(s.characterId)?s.characterId:s.id;}
function groups(){const out=new Map();for(const s of stories){const k=cid(s);if(!out.has(k))out.set(k,[]);out.get(k).push(s);}return out;}
function floors(n){return Number.isInteger(n)?Math.floor((n-1)/11)+1:null;}
function location(s){return Number.isInteger(s.window)?"Квартира №"+s.window+" · "+floors(s.window)+"-й этаж":({mayachnaya:"Маячная улица","fridas-bakery":"Пекарня Фриды",harbor:"Северный порт"}[s.locationId]||"Люсхольм");}
function urlFor(k){return "characters.html?id="+encodeURIComponent(k)+"#profile-view";}
function safeFicbook(u){return typeof u==="string"&&/^https:\/\/(www\.)?ficbook\.net\//i.test(u);}
function firstLetter(str){return Array.from(String(str||"?").trim())[0]?.toLocaleUpperCase("ru")||"?";}
function addTextList(parent,items,cls,limit=20){for(const item of items.slice(0,limit)){if(typeof item==="string"&&item.trim())parent.append(el("span",cls,item));}}
function renderDirectory(){
 const root=$("character-grid");root.replaceChildren();
 const query=$("character-search").value.trim().toLocaleLowerCase("ru");
 const items=[...groups()].filter(([_,g])=>g.some(s=>[s.name,s.author,s.title,s.description].filter(Boolean).join(" ").toLocaleLowerCase("ru").includes(query)));
 $("character-count").textContent="Героев: "+items.length;
 if(!items.length){root.append(el("p","empty","Пока никого не нашли. Попробуйте другое имя."));return;}
 for(const [id,entries] of items){
  const s=entries.find(x=>x.profile)||entries[0],p=s.profile||{};
  const article=el("article","character-tile");
  const top=el("div","tile-top");
  top.append(el("div","tile-initial",firstLetter(s.name)),el("span","tile-number",Number.isInteger(s.window)?"№"+s.window:"Люсхольм"));
  const bottom=el("div","tile-body");
  bottom.append(el("h3","",s.name),el("p","",p.tagline||s.description||"История скоро появится."));
  const a=el("a","tile-cta","Открыть досье ↗");a.href=urlFor(id);a.setAttribute("aria-label","Открыть досье "+s.name);
  bottom.append(a);article.append(top,bottom);root.append(article);
 }
}
function renderProfile(id){
 const sections=groups();const entries=sections.get(id);
 if(!entries){$("profile-view").hidden=true;const banner=el("p","empty","Такого героя пока нет в архиве. Все опубликованные персонажи представлены ниже.");$("character-grid").prepend(banner);return;}
 const s=entries.find(x=>x.profile)||entries[0],p=s.profile||{};
 $("profile-view").hidden=false;
 $("profile-name").textContent=s.name;
 $("profile-tagline").textContent=p.tagline||s.description||"Новая история Люсхольма";
 $("portrait-letter").textContent=firstLetter(s.name);
 $("portrait-caption").textContent=p.portraitCaption||"Личное дело героя";
 $("poster-location").textContent=Number.isInteger(s.window)?"АЛЬБАТРОС":"ЛЮСХОЛЬМ";
 $("poster-number").textContent=Number.isInteger(s.window)?"№"+s.window:"ИКФ";
 const portrait=$("portrait-window");portrait.querySelector("img")?.remove();
 if(typeof p.portrait==="string"&&/^assets\/portraits\/[a-z0-9-]+\.(?:png|webp|jpg|jpeg|svg)$/.test(p.portrait)){
   const image=el("img");image.src=p.portrait;image.alt="Портрет персонажа "+s.name;image.loading="lazy";portrait.append(image);
 }
 const meta=$("profile-meta");meta.replaceChildren();
 meta.append(el("span","",location(s)),el("span","","Автор: "+s.author));
 if(Number.isInteger(p.age)&&p.age>=0&&p.age<=120)meta.append(el("span","",p.age+" лет"));
 if(typeof p.occupation==="string"&&p.occupation.trim())meta.append(el("span","",p.occupation));
 const traits=$("profile-traits");traits.replaceChildren();
 addTextList(traits,Array.isArray(p.traits)?p.traits:[],"",12);
 const bio=$("profile-bio");bio.replaceChildren();
 const paragraphs=Array.isArray(p.biography)?p.biography:typeof p.biography==="string"?[p.biography]:[];
 if(!paragraphs.length)paragraphs.push(s.description||"История персонажа появится вместе с главой.");
 for(const para of paragraphs.slice(0,8)){if(typeof para==="string"&&para.trim())bio.append(el("p","",para));}
 const quote=$("profile-quote");quote.hidden=!(typeof p.quote==="string"&&p.quote.trim());quote.textContent=p.quote||"";
 const home=$("profile-apartment");
 home.href=Number.isInteger(s.window)?"./#window-"+s.window:"./#places";
 home.textContent=Number.isInteger(s.window)?"Посмотреть окно №"+s.window+" ↗":"Увидеть Люсхольм ↗";
 renderFamily(p);
 const moments=$("profile-moments");moments.replaceChildren();
 const items=Array.isArray(p.moments)?p.moments.filter(x=>x&&typeof x.label==="string"&&typeof x.text==="string").slice(0,8):[];
 $("journey").hidden=!items.length;
 for(let i=0;i<items.length;i++){
  const row=el("div","moment"),body=el("div");
  body.append(el("strong","",items[i].label),el("p","",items[i].text));
  row.append(el("div","moment-number",String(i+1).padStart(2,"0")),body);moments.append(row);
 }
 const chapters=$("profile-chapters");chapters.replaceChildren();
 entries.forEach((entry,i)=>{
  const card=el("article","chapter-card");
  card.append(el("span","",entry.subtitle||"Глава "+(i+1)));
  card.append(el("h4","",entry.title));
  card.append(el("p","",entry.description||"Новая история из Люсхольма"));
  if(safeFicbook(entry.ficbookUrl)){
   const a=el("a","","Читать на Фикбуке ↗");a.href=entry.ficbookUrl;a.target="_blank";a.rel="noopener noreferrer";card.append(a);
  }else if(entry.previewUrl==="chapter-01.html"){
   const a=el("a","","Читать рабочую редакцию на сайте ↗");a.href=entry.previewUrl;card.append(a);
   card.append(el("p","chapter-draft-note","Фикбук: публикация еще не подтверждена."));
  }else card.append(el("span","","Ссылка появится после публикации"));
  chapters.append(card);
 });
 $("profile-share").onclick=async()=>{
  const shareUrl=new URL(urlFor(id),window.location.href).href;
  try{await navigator.clipboard.writeText(shareUrl);$("share-feedback").textContent="Ссылка на досье скопирована.";}
  catch{$("share-feedback").textContent="Скопируй ссылку: "+shareUrl;}
 };
}

function renderFamily(p){
 const buckets=[
  ["profile-family",Array.isArray(p.family)?p.family:[]],
  ["profile-pets",Array.isArray(p.pets)?p.pets:[]],
  ["profile-acquaintances",Array.isArray(p.acquaintances)?p.acquaintances:[]]
 ];
 $("family-section").hidden=buckets.every(([,people])=>people.length===0)&&!p.keepsake;
 for(const [id,people] of buckets){
  const root=$(id);root.replaceChildren();
  for(const person of people.slice(0,14)){
   if(!person||typeof person.name!=="string")continue;
   const card=el("article","family-card"),top=el("div","family-card-top");
   const letter=el("span","family-initial",Array.from(person.name)[0]||"?");
   const info=el("div");info.append(el("h4","",person.name));
   const sub=[person.relation||person.kind,Number.isInteger(person.age)?person.age+" лет":null].filter(Boolean).join(" · ");
   if(sub)info.append(el("span","family-role",sub));
   top.append(letter,info);card.append(top);
   if(person.occupation)card.append(el("small","family-occupation",person.occupation));
   if(person.description)card.append(el("p","",person.description));
   root.append(card);
  }
 }
 const memory=$("profile-keepsake");memory.replaceChildren();
 if(p.keepsake&&typeof p.keepsake.name==="string"){
  memory.hidden=false;memory.append(el("small","","Семейная традиция"),el("h4","",p.keepsake.name),el("p","",p.keepsake.description||""));
 }else memory.hidden=true;
}

function snow(){
 if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const target=$("atmosphere");const count=window.innerWidth<550?15:25;
 for(let i=0;i<count;i++){const dot=el("span","snowdot");const duration=14+(i*7)%18;
  dot.style.left=((i*71+11)%100)+"%";dot.style.opacity=String(.3+(i%6)*.08);
  dot.style.animationDuration=duration+"s";dot.style.animationDelay=-((i*3)%duration)+"s";
  dot.style.setProperty("--wind",((i*17)%90-45)+"px");target.append(dot);
 }
}
async function start(){
 try{const r=await fetch("./data/stories.json?v="+DATA_VERSION,{cache:"no-store"});if(!r.ok)throw Error("missing");
  const data=await r.json();if(Array.isArray(data)){const valid=data.filter(validStory);if(valid.length)stories=valid;}
 }catch{/* Basic offline archive remains readable. */}
 renderDirectory();
 const id=new URLSearchParams(window.location.search).get("id");
 if(id&&/^[a-z0-9-]{1,80}$/.test(id))renderProfile(id);
 else if(id)renderProfile("not-found");
 else renderProfile("eira-lindt");
}
$("character-search").addEventListener("input",renderDirectory);
snow();start();
