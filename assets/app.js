"use strict";
const embeddedStories=[{
  id:"eira-lindt",window:74,title:"Там, где оставляют свет",name:"Эйра Линдт",
  subtitle:"Глава первая · готовится",author:"ИКФ",
  description:"Эйра работает с городскими картами. Она точно знает: в «Альбатросе» всего 99 квартир. Кто же пригласил ее в сотую?",
  excerpt:"«Ты просто идешь познакомиться с соседом», — сказала она своему отражению. Но впервые за долгое время ей захотелось ошибиться.",
  ficbookUrl:null
}];
let stories=embeddedStories;
let currentWindow=null,lastFocus=null;
const grid=document.getElementById("window-grid");
const list=document.getElementById("story-grid");
const dialog=document.getElementById("window-dialog");
const numberEl=document.getElementById("dialog-number");
const titleEl=document.getElementById("dialog-title");
const copyEl=document.getElementById("dialog-copy");
const metaEl=document.getElementById("dialog-meta");
const lightButton=document.getElementById("dialog-light");
const storyLink=document.getElementById("dialog-story-link");
function readLights(){
  try{
    const v=JSON.parse(localStorage.getItem("ikf-window-lights-v1")||"[]");
    return Array.isArray(v)?v.filter(n=>Number.isInteger(n)&&n>=1&&n<=99):[];
  }catch{return [];}
}
const personalLights=new Set(readLights());
function saveLights(){try{localStorage.setItem("ikf-window-lights-v1",JSON.stringify([...personalLights]));}catch{}}
function element(tag,cl,text){const e=document.createElement(tag);if(cl)e.className=cl;if(text!==undefined)e.textContent=text;return e;}
function byWindow(n){return stories.find(s=>s.window===n);}
function defaultGlow(n){return ((n*37+19)%13<5)||n===74;}
function renderWindows(){
  grid.replaceChildren();
  for(let n=1;n<=99;n++){
    const s=byWindow(n),b=element("button","window");
    b.type="button";b.dataset.window=String(n);
    b.setAttribute("aria-label","Квартира "+n+(s?", "+s.name:""));
    b.title="Квартира "+n+(s?" · "+s.name:"");
    if(defaultGlow(n)||personalLights.has(n))b.classList.add("lit");
    if(s)b.classList.add("featured");
    if(personalLights.has(n))b.classList.add("user-lit");
    b.addEventListener("click",()=>openWindow(n));
    grid.append(b);
  }
}
function renderStories(){
  list.replaceChildren();
  for(const story of stories){
    const card=element("article","story-card");
    card.setAttribute("role","button");card.tabIndex=0;
    card.setAttribute("aria-label","Подробнее об истории "+story.name);
    const top=element("div","story-top");
    top.append(element("span","story-number",String(story.window).padStart(2,"0")),
               element("span","story-type",story.subtitle||"История Люсхольма"));
    card.append(top,element("h3","",story.name),element("p","",story.description),element("span","story-author","Автор: "+story.author));
    const show=()=>openWindow(story.window);
    card.addEventListener("click",show);
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();show();}});
    list.append(card);
  }
  const empty=element("article","story-card empty");
  const top=element("div","story-top");
  top.append(element("span","story-number","∞"),element("span","story-type","Ваша история"));
  empty.append(top,element("h3","","Здесь может быть ваш герой"),
    element("p","","Присоединяйтесь к проекту, придумайте персонажа и напишите свою новогоднюю главу."));
  const join=element("a","story-author","Стать автором ↗");
  join.href="https://t.me/chat_IKF";join.target="_blank";join.rel="noopener noreferrer";
  empty.append(join);list.append(empty);
}
function openWindow(n){
  currentWindow=n;lastFocus=document.activeElement;
  const s=byWindow(n);
  numberEl.textContent="Квартира №"+n;
  titleEl.textContent=s?s.name:"Здесь еще будет история";
  copyEl.textContent=s?s.description+" "+(s.excerpt||""):"Это окно ждет своего героя. Может быть, именно вы расскажете, что произошло здесь в новогоднюю ночь?";
  metaEl.textContent=s?"«"+s.title+"» · "+s.author:"Девяносто девять квартир. Сколько угодно историй.";
  lightButton.textContent=personalLights.has(n)?"Огонек зажжен ✓":"Зажечь огонек ✧";
  lightButton.disabled=personalLights.has(n);
  if(s&&typeof s.ficbookUrl==="string"&&/^https:\/\/(www\.)?ficbook\.net\//i.test(s.ficbookUrl)){
    storyLink.href=s.ficbookUrl;storyLink.textContent="Читать на Фикбуке ↗";storyLink.target="_blank";storyLink.rel="noopener noreferrer";
  }else if(s){
    storyLink.href="#stories";storyLink.textContent="Глава скоро появится";storyLink.removeAttribute("target");storyLink.removeAttribute("rel");
  }else{
    storyLink.href="https://t.me/chat_IKF";storyLink.textContent="Стать автором ↗";storyLink.target="_blank";storyLink.rel="noopener noreferrer";
  }
  if(!dialog.open)dialog.showModal();
}
function lightWindow(n){
  if(!Number.isInteger(n)||n<1||n>99)return;
  personalLights.add(n);saveLights();
  const b=grid.querySelector('[data-window="'+n+'"]');
  if(b)b.classList.add("lit","user-lit");
  document.getElementById("light-status").textContent=personalLights.size===1?"Вы зажгли первое окно ✦":"Ваших огоньков: "+personalLights.size+" ✦";
  if(currentWindow===n){lightButton.textContent="Огонек зажжен ✓";lightButton.disabled=true;}
}
document.getElementById("dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
dialog.addEventListener("close",()=>{if(lastFocus&&lastFocus.isConnected)lastFocus.focus();});
lightButton.addEventListener("click",()=>lightWindow(currentWindow));
document.getElementById("light-random").addEventListener("click",()=>{
  const unlit=Array.from({length:99},(_,i)=>i+1).filter(n=>!personalLights.has(n));
  const pool=unlit.length?unlit:Array.from({length:99},(_,i)=>i+1);
  lightWindow(pool[Math.floor(Math.random()*pool.length)]);
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("house").scrollIntoView({behavior:reduce?"instant":"smooth",block:"center"});
});
if(personalLights.size)document.getElementById("light-status").textContent="Ваших огоньков: "+personalLights.size+" ✦";
function snowfall(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const target=document.getElementById("snowfall"),count=window.innerWidth<600?24:48;
  for(let i=0;i<count;i++){
    const flake=element("span","flake");
    const duration=11+(i*17)%19;
    flake.style.left=((i*73.37+13)%100)+"%";
    flake.style.opacity=String(.15+((i*11)%9)/15);
    flake.style.animationDuration=duration+"s";
    flake.style.animationDelay=(-(i*3.7)%duration)+"s";
    flake.style.setProperty("--drift",(((i*29)%180)-90)+"px");
    flake.style.width=flake.style.height=(i%5===0?4:2)+"px";
    target.append(flake);
  }
}
async function loadStories(){
  try{
    const response=await fetch("./data/stories.json",{cache:"no-store"});
    if(!response.ok)throw new Error("Missing stories");
    const json=await response.json();
    if(!Array.isArray(json))throw new Error("Malformed stories");
    const clean=json.filter(s=>s&&Number.isInteger(s.window)&&s.window>=1&&s.window<=99&&["name","title","author","description"].every(k=>typeof s[k]==="string"));
    if(clean.length)stories=clean;
  }catch{/* Embedded demo remains available without fetch. */}
  renderWindows();renderStories();
}
renderWindows();renderStories();snowfall();loadStories();
