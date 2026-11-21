"use strict";
/* Public, spoiler-free storybook. Final content is not bundled before 31 December. */
const demoStories=[{
 id:"eira-lindt",window:70,floor:7,location:"Альбатрос",title:"Там, где оставляют свет",
 name:"Эйра Линдт",subtitle:"Первая глава · готовится к публикации",author:"ИКФ",
 description:"Эйра работает с картами и точно знает: в «Альбатросе» 99 квартир. Кто пригласил ее в сотую?",
 excerpt:"«Ты просто идешь познакомиться с соседом», — сказала она своему отражению. Но впервые за долгое время ей захотелось ошибиться.",
 ficbookUrl:null
}];
let stories=demoStories;
let selectedStory=null,selectedWindow=null,lastFocus=null;
const byId=id=>document.getElementById(id);
const SITE_EDITION="0.9";
const grid=byId("window-grid"),list=byId("story-grid"),dialog=byId("window-dialog");
const storySearch=byId("story-search"),storyFilter=byId("story-filter");
function make(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;}
function readLights(){try{const a=JSON.parse(localStorage.getItem("ikf-window-lights-v1")||"[]");return Array.isArray(a)?a.filter(n=>Number.isInteger(n)&&n>=1&&n<=99):[]}catch{return []}}
const lights=new Set(readLights());
function saveLights(){try{localStorage.setItem("ikf-window-lights-v1",JSON.stringify([...lights]))}catch{}}
function floorFor(number){return Math.floor((number-1)/11)+1;}
function storiesAt(number){return stories.filter(s=>s.window===number);}
function naturalLight(number){return (number*37+19)%13<5||number===70;}
// A window is visually illuminated by its initial state, its resident story, or a visitor.
function isWindowLit(number){return naturalLight(number)||storiesAt(number).length>0||lights.has(number);}
function updateLightControl(number){
  const button=byId("dialog-light"),notice=byId("dialog-light-status");
  if(!Number.isInteger(number)){button.hidden=true;notice.hidden=true;return;}
  const lit=isWindowLit(number);
  button.hidden=lit;
  button.disabled=lit;
  notice.hidden=!lit;
  notice.textContent=lit?"✦ Свет уже горит. Загляните в историю или выберите темное окно.":"";
}
function updateRandomControl(){
  const dark=Array.from({length:99},(_,i)=>i+1).filter(n=>!isWindowLit(n));
  const button=byId("light-random");
  button.disabled=dark.length===0;
  button.textContent=dark.length?"Зажечь случайное окно ✧":"Все окна уже светятся ✨";
  if(!dark.length)byId("light-status").textContent="Все окна Люсхольма зажжены ✨";
  return dark;
}
function drawHouse(){
 grid.replaceChildren();
 for(let floor=9;floor>=1;floor--){
   const row=make("div","floor-row");row.dataset.floor=String(floor);
   row.setAttribute("role","group");row.setAttribute("aria-label",floor+"-й этаж");
   for(let i=1;i<=11;i++){
     const n=(floor-1)*11+i;const resident=storiesAt(n);
     const button=make("button","window");button.type="button";button.dataset.window=String(n);
     button.title="Квартира №"+n+", "+floor+"-й этаж"+(resident.length?" — "+resident.map(x=>x.name).join(", "):"");
     button.setAttribute("aria-label",button.title);
     if(isWindowLit(n))button.classList.add("lit");
     if(resident.length)button.classList.add("featured");
     if(n===70)button.classList.add("eira-home");
     if(lights.has(n))button.classList.add("user-lit");
     button.addEventListener("click",()=>openApartment(n));
     row.append(button);
   }
   grid.append(row);
 }
}
function storyMatches(s,term,place){
 if(place==="house"&&s.window===null)return false;
 if(place==="city"&&s.window!==null)return false;
 if(["mayachnaya","fridas-bakery","harbor"].includes(place)&&s.locationId!==place)return false;
 if(!term)return true;
 return [s.name,s.author,s.title,s.description,s.subtitle,s.location,getLocationTitle(s.locationId)].filter(Boolean).join(" ").toLocaleLowerCase("ru").includes(term);
}
function drawStories(){
 list.replaceChildren();
 const term=storySearch.value.trim().toLocaleLowerCase("ru"),place=storyFilter.value;
 const matching=stories.filter(s=>storyMatches(s,term,place));
 byId("story-count").textContent=matching.length===1?"Найдена 1 история":"Историй найдено: "+matching.length;
 for(const s of matching){
   const card=make("article","story-card"),top=make("div","story-top");
   const placeText=s.window===null?"Люсхольм":"Квартира "+s.window+" · "+floorFor(s.window)+"-й этаж";
   top.append(make("span","story-number",s.window===null?"✧":String(s.window).padStart(2,"0")),make("span","story-type",placeText));
   card.append(top,make("h3","",s.name),make("p","",s.description),make("span","story-author","Автор: "+s.author));
   const actions=make("div","story-card-actions");
   const peek=make("button","story-action-brief","Кратко");peek.type="button";
   peek.setAttribute("aria-label","Кратко о персонаже "+s.name);
   peek.addEventListener("click",()=>openStory(s));
   const profile=make("a","story-action-profile","Профиль ↗");
   const heroId=typeof s.characterId==="string"&&s.characterId?s.characterId:s.id;
   profile.href="characters.html?id="+encodeURIComponent(heroId);
   profile.setAttribute("aria-label","Открыть профиль "+s.name);
   actions.append(peek,profile);card.append(actions);
   list.append(card);
 }
 if(!matching.length)list.append(make("p","no-results","Пока таких историй нет. Попробуйте другой поиск."));
 if(!term&&place==="all"){
   const empty=make("article","story-card empty"),top=make("div","story-top");
   top.append(make("span","story-number","∞"),make("span","story-type","Ваша история"));
   empty.append(top,make("h3","","Здесь может быть ваш герой"),make("p","","В Люсхольме хватит места всем. Придумайте героя и напишите свою главу."));
   const link=make("a","story-author","Стать автором ↗");link.href="https://t.me/chat_IKF";link.target="_blank";link.rel="noopener noreferrer";
   empty.append(link);list.append(empty);
 }
}
function validFicbook(u){return typeof u==="string"&&/^https:\/\/(www\.)?ficbook\.net\//i.test(u);}
function displayStory(s){
 selectedStory=s;
 byId("dialog-number").textContent=s.window===null?"История Люсхольма":"Квартира №"+s.window+" · "+floorFor(s.window)+"-й этаж";
 byId("dialog-title").textContent=s.name;
 byId("dialog-copy").textContent=s.description+(s.excerpt?" "+s.excerpt:"");
 byId("dialog-meta").textContent="«"+s.title+"» · "+s.author;
 const profileLink=byId("dialog-profile-link");
 profileLink.hidden=false;
 profileLink.href="characters.html?id="+encodeURIComponent(s.characterId||s.id);
 const link=byId("dialog-story-link");
 if(validFicbook(s.ficbookUrl)){link.href=s.ficbookUrl;link.textContent="Читать на Фикбуке ↗";link.target="_blank";link.rel="noopener noreferrer";}
 else {link.href="#stories";link.textContent="Глава скоро появится";link.removeAttribute("target");link.removeAttribute("rel");}
 updateLightControl(s.window);
 const choices=byId("dialog-stories");choices.replaceChildren();
 if(s.window!==null)for(const other of storiesAt(s.window)){
   if(storiesAt(s.window).length<=1)break;
   const button=make("button","",other.name+" · "+other.author);button.type="button";
   button.setAttribute("aria-current",String(other.id===s.id));
   button.addEventListener("click",()=>displayStory(other));choices.append(button);
 }
}
function openStory(s){
 lastFocus=document.activeElement;selectedWindow=s.window;
 displayStory(s);byId("share-notice").textContent="";
 if(!dialog.open)dialog.showModal();
}
function openApartment(n){
 selectedWindow=n;
 byId("dialog-profile-link").hidden=true;
 const group=storiesAt(n);
 if(group.length){openStory(group[0]);return;}
 lastFocus=document.activeElement;selectedStory=null;
 byId("dialog-number").textContent="Квартира №"+n+" · "+floorFor(n)+"-й этаж";
 byId("dialog-title").textContent="Здесь еще будет история";
 byId("dialog-copy").textContent="Это окно ждет своего героя. Возможно, именно вы расскажете, что произошло здесь в новогоднюю ночь?";
 byId("dialog-meta").textContent="Девяносто девять квартир. Сколько угодно историй.";
 updateLightControl(n);
 const link=byId("dialog-story-link");link.href="https://t.me/chat_IKF";link.textContent="Стать автором ↗";link.target="_blank";link.rel="noopener noreferrer";
 byId("dialog-stories").replaceChildren();byId("share-notice").textContent="";
 if(!dialog.open)dialog.showModal();
}
function lightWindow(n){
 if(!Number.isInteger(n)||n<1||n>99||isWindowLit(n))return;
 lights.add(n);saveLights();
 const button=grid.querySelector('[data-window="'+n+'"]');if(button)button.classList.add("lit","user-lit");
 byId("light-status").textContent=lights.size===1?"Вы зажгли первое окно ✦":"Ваших огоньков: "+lights.size+" ✦";
 if(dialog.open&&selectedWindow===n)updateLightControl(n);
 updateRandomControl();
}
byId("dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener("close",()=>{if(lastFocus&&lastFocus.isConnected)lastFocus.focus()});
byId("dialog-light").addEventListener("click",()=>lightWindow(selectedWindow));
byId("light-random").addEventListener("click",()=>{
 const dark=updateRandomControl();
 if(!dark.length)return;
 lightWindow(dark[Math.floor(Math.random()*dark.length)]);
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 byId("house").scrollIntoView({behavior:reduced?"instant":"smooth",block:"center"});
});
byId("dialog-share").addEventListener("click",async()=>{
 const fragment=selectedWindow===null||selectedWindow===undefined?"#stories":"#window-"+selectedWindow;
 const address=window.location.href.split("#")[0]+fragment;
 try{await navigator.clipboard.writeText(address);byId("share-notice").textContent="Ссылка на окно скопирована";}
 catch{byId("share-notice").textContent="Ссылка: "+address;}
});
byId("hero-eira").addEventListener("click",()=>openApartment(70));
byId("window-finder").addEventListener("submit",e=>{
 e.preventDefault();
 const field=byId("window-number");
 if(!field.reportValidity())return;
 const n=Number(field.value);
 if(Number.isInteger(n)&&n>=1&&n<=99)openApartment(n);
});
const toggle=byId("snow-toggle");
let showSnow=true;
try{showSnow=localStorage.getItem("ikf-snow-on")!=="false";}catch{}
function syncSnow(){byId("snowfall").classList.toggle("snow-off",!showSnow);toggle.setAttribute("aria-pressed",String(showSnow));toggle.title=showSnow?"Выключить снег":"Включить снег";}
syncSnow();
toggle.addEventListener("click",()=>{showSnow=!showSnow;try{localStorage.setItem("ikf-snow-on",String(showSnow));}catch{}syncSnow();});
byId("dialog-story-link").addEventListener("click",e=>{if(e.currentTarget.getAttribute("href")?.startsWith("#"))dialog.close();});
storySearch.addEventListener("input",drawStories);
storyFilter.addEventListener("change",drawStories);
function snow(){
 if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const layer=byId("snowfall"),count=window.innerWidth<600?24:48;
 for(let i=0;i<count;i++){
   const dot=make("span","flake"),duration=11+(i*17)%19;
   dot.style.left=((i*73.37+13)%100)+"%";dot.style.opacity=String(.15+((i*11)%9)/15);
   dot.style.animationDuration=duration+"s";dot.style.animationDelay=(-(i*3.7)%duration)+"s";
   dot.style.setProperty("--drift",(((i*29)%180)-90)+"px");
   dot.style.width=dot.style.height=(i%5===0?4:2)+"px";layer.append(dot);
 }
}
async function fetchStories(){
 try{
   const response=await fetch("./data/stories.json?v=20261121-09",{cache:"no-store"});
   if(!response.ok)throw Error("Unavailable");
   const raw=await response.json();
   if(!Array.isArray(raw))throw Error("Invalid JSON");
   const valid=raw.filter(s=>s&&(s.window===null||(Number.isInteger(s.window)&&s.window>=1&&s.window<=99))&&["id","name","title","author","description"].every(k=>typeof s[k]==="string"));
   if(valid.length)stories=valid;
 }catch{/* Keep offline preview. */}
 drawHouse();drawStories();updateRandomControl();renderPlaceIfOpen();
 const match=window.location.hash.match(/^#window-(\d+)$/);
 if(match){const n=Number(match[1]);if(n>=1&&n<=99)openApartment(n);}
}
if(lights.size)byId("light-status").textContent="Ваших огоньков: "+lights.size+" ✦";
drawHouse();drawStories();updateRandomControl();snow();fetchStories();


/* Discover the town and prepare a shareable, client-only author application. */
let townLocations=[
 {id:"mayachnaya",name:"Маячная улица",description:"Здесь стоит дом «Альбатрос» с 99 квартирами.",ideas:["Добрая встреча на темной лестнице."]},
 {id:"fridas-bakery",name:"Пекарня Фриды",description:"Здесь пахнет кардамоном и свежей выпечкой.",ideas:["Незнакомцу достается лишний подарок."]},
 {id:"harbor",name:"Северный порт",description:"Паром, рыбацкие лодки и заснеженная пристань.",ideas:["Кто-то успевает домой к полуночи."]}
];
let openPlaceId=null;
function getLocationTitle(id){return townLocations.find(x=>x.id===id)?.name||"";}
function renderPlaceIfOpen(){if(openPlaceId)renderPlace(openPlaceId);}
function renderPlace(id){
 const p=townLocations.find(x=>x.id===id);if(!p)return;
 const root=byId("place-detail");root.replaceChildren();
 const main=make("div","place-description");
 main.append(make("span","place-kicker","Путеводитель по Люсхольму"),make("h3","",p.name),make("p","",p.description));
 const side=make("div","place-suggestions");
 side.append(make("span","place-kicker","Сюжетные зацепки"));
 const ul=make("ul","place-ideas");
 (p.ideas||[]).slice(0,5).forEach(x=>ul.append(make("li","",x)));side.append(ul);
 const total=stories.filter(s=>s.locationId===id).length;
 side.append(make("p","place-count",total?"Историй этой локации: "+total:"Здесь еще ждут своих героев."));
 const actions=make("div","place-actions");
 const show=make("button","btn outline","Истории этого места ↗");show.type="button";
 show.addEventListener("click",()=>{
   storySearch.value="";storyFilter.value=id;drawStories();
   byId("stories").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
 });
 const create=make("button","btn primary","Придумать героя");create.type="button";
 create.addEventListener("click",()=>openCharacter(id));
 actions.append(show,create);side.append(actions);
 root.append(main,side);root.hidden=false;openPlaceId=id;
 document.querySelectorAll(".place-open").forEach(b=>{
   const current=b.dataset.place===id;b.setAttribute("aria-expanded",String(current));
   b.closest(".place-card")?.classList.toggle("is-selected",current);
 });
}
document.querySelectorAll(".place-open").forEach(button=>button.addEventListener("click",()=>{
 const id=button.dataset.place;
 if(openPlaceId===id){
   openPlaceId=null;byId("place-detail").hidden=true;
   document.querySelectorAll(".place-open").forEach(b=>{b.setAttribute("aria-expanded","false");b.closest(".place-card")?.classList.remove("is-selected");});
 } else renderPlace(id);
}));
async function loadLocations(){
 try{
   const r=await fetch("./data/locations.json?v=20261121-08",{cache:"no-store"});
   if(!r.ok)throw Error("not found");
   const a=await r.json();
   if(Array.isArray(a)&&a.length>=3){
     const valid=a.filter(p=>p&&typeof p.id==="string"&&typeof p.name==="string"&&typeof p.description==="string"&&Array.isArray(p.ideas));
     if(valid.length>=3)townLocations=valid;
   }
 }catch{/* Built-in minimal lore remains readable offline. */}
 renderPlaceIfOpen();drawStories();
}
const characterDialog=byId("character-dialog"),characterForm=byId("character-form");
function openCharacter(placeId){
 if(placeId&&townLocations.some(x=>x.id===placeId))byId("character-place").value=placeId;
 characterDialog.showModal();byId("character-name").focus();
}
byId("make-character").addEventListener("click",()=>openCharacter());
byId("character-close").addEventListener("click",()=>characterDialog.close());
characterDialog.addEventListener("click",e=>{if(e.target===characterDialog)characterDialog.close();});
characterForm.addEventListener("input",()=>{byId("character-result").hidden=true;byId("character-feedback").textContent="";});
characterForm.addEventListener("submit",e=>{
 e.preventDefault();if(!characterForm.reportValidity())return;
 const name=byId("character-name").value.trim(),place=byId("character-place").value;
 const author=byId("character-author").value.trim(),idea=byId("character-idea").value.trim(),good=byId("character-warmth").value.trim();
 if(name.length<2||idea.length<10){byId("character-feedback").textContent="Добавь имя и описание истории.";return;}
 const location=place==="other"?"Другой уголок Люсхольма":getLocationTitle(place);
 byId("character-output").value=[
  "🕯 Зажгу свое окно!","Персонаж: "+name,"Место: "+location,
  author?"Ник на Фикбуке: "+author:"","Замысел главы: "+idea,good?"Добрый поступок: "+good:""
 ].filter(Boolean).join("\n");
 byId("character-result").hidden=false;
 byId("character-feedback").textContent="Готово! Скопируй заявку и отправь в чат ИКФ.";
 byId("character-result").scrollIntoView({block:"nearest",behavior:"smooth"});
});
byId("character-copy").addEventListener("click",async()=>{
 try{await navigator.clipboard.writeText(byId("character-output").value);byId("character-feedback").textContent="Скопировано. Отправь текст в чат ИКФ.";}
 catch{byId("character-output").focus();byId("character-output").select();byId("character-feedback").textContent="Скопируй выделенный текст вручную.";}
});
loadLocations();
