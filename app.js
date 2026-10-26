const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='misCalorias_v1';
const blank={foods:[],weights:[],profile:{},target:2000};
let data;try{data={...blank,...JSON.parse(localStorage.getItem(KEY)||'{}')};data.profile=data.profile||{};data.foods=data.foods||[];data.weights=data.weights||[]}catch(e){data=structuredClone(blank)}
let photoData='';
const today=()=>new Date().toLocaleDateString('en-CA');
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dayFoods(){return data.foods.filter(f=>f.date===today())}
function render(){
 const foods=dayFoods(),sum=foods.reduce((a,f)=>a+Number(f.calories||0),0),target=Number(data.target)||2000;
 $('#consumed').textContent=Math.round(sum).toLocaleString('es-ES');$('#remaining').textContent=Math.max(0,target-sum).toLocaleString('es-ES');$('#targetLabel').textContent=target.toLocaleString('es-ES')+' kcal';$('#foodCount').textContent=foods.length+(foods.length===1?' registro':' registros');
 $('#ring').style.background=`conic-gradient(var(--orange) ${Math.min(sum/target,1)*360}deg,#f4e9e4 0deg)`;
 $('#foodList').innerHTML=foods.length?foods.map(f=>`<div class="fooditem"><div class="foodemoji">🍴</div><div class="foodinfo"><b>${esc(f.name)}</b><small>${esc(f.meal)}${f.portion?' · '+esc(f.portion):''}</small></div><div class="foodkcal">${Number(f.calories).toLocaleString('es-ES')}<small>kcal</small></div><button class="delete" data-del-food="${f.id}" aria-label="Eliminar">×</button></div>`).join(''):`<div class="empty"><div class="emptyicon">🍽️</div><b>Aún no has registrado comida</b><p>Añade tu primera comida para empezar.</p></div>`;
 $$('#foodList [data-del-food]').forEach(b=>b.onclick=()=>{data.foods=data.foods.filter(f=>f.id!==b.dataset.delFood);save()});
 $('#manualTarget').value=data.target||2000;
 $('#todayDate').textContent=new Date().toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'});
 const p=data.profile||{};for(const [id,key] of [['nickname','nickname'],['age','age'],['sex','sex'],['height','height'],['profileWeight','weight'],['activity','activity'],['goal','goal']])if(p[key]!==undefined)$('#'+id).value=p[key];
 renderWeights();
}
function renderWeights(){
 const w=[...data.weights].sort((a,b)=>a.date.localeCompare(b.date));$('#chartEmpty').classList.toggle('hidden',w.length>0);
 $('#weightChange').textContent=w.length>1?`${(w[w.length-1].kg-w[0].kg>0?'+':'')+(w[w.length-1].kg-w[0].kg).toFixed(1).replace('.',',')} kg en el periodo`:'';
 $('#weightList').innerHTML=w.slice().reverse().map(x=>`<div class="weightrow"><span>${new Date(x.date+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}</span><b>${x.kg.toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1})} kg</b><button data-del-weight="${x.id}" aria-label="Eliminar registro">×</button></div>`).join('');
 $$('#weightList [data-del-weight]').forEach(b=>b.onclick=()=>{data.weights=data.weights.filter(x=>x.id!==b.dataset.delWeight);save()});
 drawChart(w);
}
function drawChart(w){
 const c=$('#weightChart'),ctx=c.getContext('2d'),rect=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1;c.width=Math.max(280,rect.width*dpr);c.height=220*dpr;ctx.scale(dpr,dpr);let W=c.width/dpr,H=220;ctx.clearRect(0,0,W,H);
 if(!w.length)return;
 const pad={l:32,r:12,t:18,b:28},vals=w.map(x=>x.kg),min=Math.min(...vals)-1,max=Math.max(...vals)+1,span=Math.max(2,max-min);
 ctx.font='10px sans-serif';ctx.fillStyle='#99929d';ctx.strokeStyle='#eee9ef';ctx.lineWidth=1;
 for(let i=0;i<4;i++){let y=pad.t+(H-pad.t-pad.b)*i/3;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();ctx.fillText((max-span*i/3).toFixed(1),0,y+3)}
 const pts=w.map((v,i)=>({x:w.length===1?(W+pad.l-pad.r)/2:pad.l+i*(W-pad.l-pad.r)/(w.length-1),y:pad.t+(max-v.kg)/span*(H-pad.t-pad.b)}));
 if(pts.length>1){ctx.strokeStyle='#f26a3d';ctx.lineWidth=2.5;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()}
 pts.forEach((p,i)=>{ctx.fillStyle='#f26a3d';ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();if(i===0||i===pts.length-1||pts.length<5){ctx.fillStyle='#7e7783';ctx.fillText(new Date(w[i].date+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}),Math.min(W-45,Math.max(0,p.x-18)),H-7)}})
}
$$('.tab').forEach(b=>b.onclick=()=>{ $$('.tab').forEach(x=>x.classList.toggle('active',x===b));$$('.view').forEach(x=>x.classList.toggle('active',x.id===b.dataset.tab));if(b.dataset.tab==='peso')renderWeights()});
$('#settingsShortcut').onclick=()=>document.querySelector('[data-tab="perfil"]').click();
$('#addTop').onclick=()=>$('#foodName').focus();
$('#photoInput').onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>8*1024*1024){alert('La foto debe ocupar menos de 8 MB.');e.target.value='';return}const r=new FileReader();r.onload=()=>{photoData=r.result;$('#preview').src=photoData;$('#preview').classList.remove('hidden')};r.readAsDataURL(f)};
$('#foodForm').onsubmit=e=>{e.preventDefault();const name=$('#foodName').value.trim(),cal=Number($('#foodCalories').value);if(!name||!Number.isFinite(cal)||cal<0)return;data.foods.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:today(),name,portion:$('#portion').value.trim(),calories:Math.round(cal),meal:$('#meal').value});save();e.target.reset();$('#preview').classList.add('hidden');$('#preview').removeAttribute('src');photoData='';document.querySelector('[data-tab="hoy"]').click()};
$('#weightDate').value=today();
$('#weightForm').onsubmit=e=>{e.preventDefault();const kg=Number($('#weightValue').value),date=$('#weightDate').value;if(!kg||kg<20||kg>350||!date)return;const existing=data.weights.find(x=>x.date===date);if(existing)existing.kg=kg;else data.weights.push({id:String(Date.now()),date,kg});data.weights.sort((a,b)=>a.date.localeCompare(b.date));$('#profileWeight').value=kg;data.profile.weight=kg;save();e.target.reset();$('#weightDate').value=today()};
$('#profileForm').onsubmit=e=>{e.preventDefault();const p={nickname:$('#nickname').value.trim(),age:Number($('#age').value),sex:$('#sex').value,height:Number($('#height').value),weight:Number($('#profileWeight').value),activity:Number($('#activity').value),goal:$('#goal').value};if(!p.age||!p.height||!p.weight)return;data.profile=p;
 const bmr=10*p.weight+6.25*p.height-5*p.age+(p.sex==='male'?5:-161),tdee=bmr*p.activity,cal=Math.round((tdee+(p.goal==='lose'?-350:p.goal==='gain'?250:0))/50)*50;
 const safe=Math.max(1200,Math.min(4000,cal));data.target=safe;$('#goalResult').innerHTML=`Objetivo diario orientativo<strong>${safe.toLocaleString('es-ES')} kcal</strong>Estimación basada en tus datos y actividad. Revísala si no refleja tus necesidades.`;$('#goalResult').classList.remove('hidden');save()};
$('#saveTarget').onclick=()=>{const n=Number($('#manualTarget').value);if(n<1000||n>6000||!n){alert('Introduce un objetivo entre 1.000 y 6.000 kcal.');return}data.target=n;save();alert('Objetivo guardado.')};
$('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mis-calorias-datos.json';a.click();URL.revokeObjectURL(url)};
$('#clearData').onclick=()=>{if(confirm('¿Seguro que quieres borrar todas las comidas, pesos y ajustes guardados en este dispositivo? Esta acción no se puede deshacer.')){data=structuredClone(blank);localStorage.removeItem(KEY);save();$('#goalResult').classList.add('hidden')}};
window.addEventListener('resize',()=>{if($('#peso').classList.contains('active'))renderWeights()});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
