"use strict";
/* IKF spoiler-safe public chronicle. Public episodes and relationships require editorial approval. */
const VER="20261121-10";
const $=id=>document.getElementById(id);
function el(tag,cl,txt){const a=document.createElement(tag);if(cl)a.className=cl;if(txt!==undefined)a.textContent=txt;return a;}
const anchorFallback=[
 {id:"winter-evening",sequence:1,title:"Накануне полуночи",timeLabel:"31 декабря · вечер",description:"В Люсхольме готовятся к Новому году.",state:"world"},
 {id:"power-outage",sequence:2,title:"Когда гаснет свет",timeLabel:"В течение вечера",description:"В доме «Альбатрос» пропадает электричество.",state:"world"},
 {id:"invitations",sequence:3,title:"Неожиданные приглашения",timeLabel:"Вскоре после отключения",description:"Жильцы получают приглашения из квартиры №100.",state:"world"}
];
let anchors=anchorFallback,events=[],stories=[],links=[];
const allowedStages=new Set(["before","during","after","independent"]);
const placeNames={mayachnaya:"Маячная улица / «Альбатрос»","fridas-bakery":"Пекарня Фриды",harbor:"Северный порт",other:"Другое место"};
const stageNames={before:"До отключения",during:"Во время отключения",after:"После отключения",independent:"Другое время / вне основной линии"};
const approvedStatuses=new Set(["published"]);
function validFicbook(url){return typeof url==="string"&&/^https:\/\/(www\.)?ficbook\.net\//i.test(url);}
function validStory(s){return !!s&&typeof s.id==="string"&&typeof s.name==="string"&&typeof s.title==="string"&&typeof s.author==="string";}
function characterId(s){return typeof s.characterId==="string"&&s.characterId?s.characterId:s.id;}
async function getJSON(path){
 try{const res=await fetch(path+"?v="+VER,{cache:"no-store"});if(!res.ok)throw Error("not found");
 return await res.json();
 }catch{return null;}
}
function paintAnchors(){
 const root=$("anchors");root.replaceChildren();
 const all=[...anchors].sort((a,b)=>a.sequence-b.sequence);
 for(const step of all){
  const item=el("article","timeline-card");
  item.append(el("div","timeline-label",step.timeLabel||"31 декабря"));
  item.append(el("h3","",step.title),el("p","",step.description));
  item.append(el("span","timeline-tag","Опора общего мира"));root.append(item);
 }
}
function getPublishedEvents(){
 return events.filter(e=>e&&approvedStatuses.has(e.status)&&typeof e.id==="string"&&typeof e.title==="string"&&typeof e.summary==="string"&&allowedStages.has(e.stage)&&typeof e.storyId==="string"&&stories.some(s=>s.id===e.storyId&&validFicbook(s.ficbookUrl)));
}
function paintEvents(){
 const root=$("episode-list");root.replaceChildren();
 const stage=$("event-filter").value;
 const published=getPublishedEvents().filter(e=>stage==="all"||e.stage===stage)
  .sort((a,b)=>(Number.isFinite(a.sequence)?a.sequence:9999)-(Number.isFinite(b.sequence)?b.sequence:9999));
 $("event-count").textContent="Эпизодов: "+published.length;
 if(!published.length){root.append(el("p","empty",events.length?"Опубликованных эпизодов для этого фильтра нет.":"Пока никто не опубликовал согласованный эпизод. Он появится после выхода главы."));return;}
 for(const event of published){
  const card=el("article","episode-card");const s=stories.find(s=>s.id===event.storyId);
  card.append(el("span","",stageNames[event.stage]||"Новогодняя ночь"),el("h3","",event.title),el("p","",event.summary));
  const link=el("a","","Читать главу «"+s.title+"» ↗");link.href=s.ficbookUrl;link.target="_blank";link.rel="noopener noreferrer";card.append(link);root.append(card);
 }
}
function paintDrafts(){
 const root=$("draft-list");root.replaceChildren();
 const drafts=stories.filter(s=>!validFicbook(s.ficbookUrl));
 if(!drafts.length){root.append(el("p","empty","Все добавленные главы уже опубликованы."));return;}
 for(const s of drafts){
  const card=el("article","draft-card"),left=el("div");
  left.append(el("strong","",s.title),el("small","",s.name+" · "+s.author));
  const a=el("a","","Герой ↗");a.href="characters.html?id="+encodeURIComponent(characterId(s));
  card.append(left,a);root.append(card);
 }
}
function paintCharactersAndTies(){
 const charRoot=$("tie-characters"),tieRoot=$("tie-list");charRoot.replaceChildren();tieRoot.replaceChildren();
 const chars=new Map();for(const s of stories){const id=characterId(s);if(!chars.has(id))chars.set(id,s);}
 if(!chars.size)charRoot.append(el("p","empty","Скоро здесь появятся первые персонажи."));
 for(const [id,s] of chars){
  const card=el("article","tie-character");
  const letter=Array.from(s.name.trim())[0]||"?";
  const mono=el("span","tie-monogram",letter);
  const group=el("div"),name=el("h3","",s.name);
  const place=el("p","",Number.isInteger(s.window)?"Квартира №"+s.window+" · «Альбатрос»":"Герой Люсхольма");
  const link=el("a","","Открыть досье ↗");link.href="characters.html?id="+encodeURIComponent(id);
  group.append(name,place,link);card.append(mono,group);charRoot.append(card);
 }
 const ids=new Set(chars.keys());
 const approved=links.filter(r=>r&&r.status==="approved"&&typeof r.from==="string"&&typeof r.to==="string"&&r.from!==r.to&&ids.has(r.from)&&ids.has(r.to)&&typeof r.label==="string"&&typeof r.description==="string");
 if(!approved.length){tieRoot.append(el("p","empty","Пока нет согласованных связей. Даже если герои встречаются в черновиках, чужие отношения не появляются без согласия авторов."));return;}
 for(const r of approved){
  const x=chars.get(r.from),y=chars.get(r.to);
  const card=el("article","tie-card");
  card.append(el("strong","",x.name+" — "+y.name+" · "+r.label),el("p","",r.description));tieRoot.append(card);
 }
}
function lightSnow(){
 if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 try{if(localStorage.getItem("ikf-snow-on")==="false")return;}catch{}
 const area=$("snow"),count=window.innerWidth<520?16:27;
 for(let i=0;i<count;i++){
  const dot=el("span","snowflake"),duration=13+(i*13)%20;
  dot.style.left=((i*79+17)%100)+"%";dot.style.animationDuration=duration+"s";
  dot.style.animationDelay=(-(i*7)%duration)+"s";
  dot.style.setProperty("--drift",((i*13)%110-55)+"px");dot.style.opacity=String(.35+(i%5)*.11);
  area.append(dot);
 }
}
async function begin(){
 const [chronicle,chapters,relationships]=await Promise.all([getJSON("./data/chronicle.json"),getJSON("./data/stories.json"),getJSON("./data/relationships.json")]);
 if(chronicle&&Array.isArray(chronicle.anchors)&&chronicle.anchors.length)anchors=chronicle.anchors.filter(x=>x&&typeof x.title==="string"&&typeof x.description==="string"&&Number.isFinite(x.sequence));
 if(chronicle&&Array.isArray(chronicle.events))events=chronicle.events;
 if(Array.isArray(chapters))stories=chapters.filter(validStory);
 if(relationships&&Array.isArray(relationships.links))links=relationships.links;
 paintAnchors();paintEvents();paintDrafts();paintCharactersAndTies();
}
$("event-filter").addEventListener("change",paintEvents);
const form=$("continuity-form");
const fieldIds=["chapter-name","chapter-period","chapter-location","chapter-summary","chapter-others","uses-others","spoiler-risk","has-consequences"];
function labelStage(stage){return stageNames[stage]||"Период не указан";}
form.addEventListener("input",()=>{$("continuity-result").hidden=true;$("note-feedback").textContent="";});
form.addEventListener("submit",event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const name=$("chapter-name").value.trim(),summary=$("chapter-summary").value.trim(),period=$("chapter-period").value,location=$("chapter-location").value;
 const names=$("chapter-others").value.trim(),usesOthers=$("uses-others").checked,spoilerRisk=$("spoiler-risk").checked,hasConsequences=$("has-consequences").checked;
 if(name.length<2||summary.length<12){$("note-feedback").textContent="Напиши название и короткое описание эпизода.";return;}
 const notes=[
  "📜 Люсхольм · заявка на согласование главы",
  "Глава / герой: "+name,
  "Период: "+labelStage(period),
  "Место: "+(placeNames[location]||placeNames.other),
  "Эпизод: "+summary,
  names?"Герои других авторов: "+names:"",
  "Пересечения с чужими персонажами: "+(usesOthers?"есть, требуется согласие":"не заявлены"),
  "Влияние на другие главы: "+(hasConsequences?"есть, сверить последствия":"не заявлено"),
  "Риск спойлера №100: "+(spoilerRisk?"ДА, до финала НЕ публиковать":"не отмечен"),
  "Перед публикацией: согласовать время, место, чужих героев и последствия с редакцией ИКФ."
 ].filter(Boolean).join("\n");
 $("continuity-output").value=notes;$("continuity-result").hidden=false;
 $("note-feedback").textContent=spoilerRisk?"Важно: этот эпизод не публикуем до согласования финала.":"Заметка готова. Она не была отправлена автоматически.";
 $("continuity-result").scrollIntoView({block:"nearest",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
});
$("copy-note").addEventListener("click",async()=>{
 const output=$("continuity-output");
 try{await navigator.clipboard.writeText(output.value);$("note-feedback").textContent="Заметка скопирована. Отправь редакторам ИКФ.";}
 catch{output.focus();output.select();$("note-feedback").textContent="Скопируй выделенный текст вручную.";}
});
lightSnow();begin();
