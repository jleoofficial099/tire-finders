const $ = id => document.getElementById(id);
const typeEl=$('typeSelect'), yearEl=$('yearSelect'), makeEl=$('makeSelect'), modelEl=$('modelSelect');
let vehicles=[];
const unique=(arr,key)=>[...new Set(arr.map(x=>String(x[key]??'')))].filter(Boolean);
const sortText=(a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'});
function fill(select, values, placeholder){select.innerHTML='';const first=document.createElement('option');first.value='';first.textContent=placeholder;select.append(first);values.forEach(v=>{const o=document.createElement('option');o.value=v.value??v;o.textContent=v.label??v;select.append(o)});select.disabled=values.length===0;}
function filtered(){return vehicles.filter(v=>(!typeEl.value||String(v.type_id)===typeEl.value)&&(!yearEl.value||String(v.year)===yearEl.value)&&(!makeEl.value||String(v.make_id)===makeEl.value)&&(!modelEl.value||String(v.model_id)===modelEl.value));}
function refreshYears(){const rows=vehicles.filter(v=>!typeEl.value||String(v.type_id)===typeEl.value);fill(yearEl,unique(rows,'year').sort((a,b)=>Number(b)-Number(a)),'Select year');fill(makeEl,[],'Select make');fill(modelEl,[],'Select model');}
function refreshMakes(){const rows=vehicles.filter(v=>(!typeEl.value||String(v.type_id)===typeEl.value)&&(!yearEl.value||String(v.year)===yearEl.value));const map=new Map();rows.forEach(v=>map.set(String(v.make_id),v.make));fill(makeEl,[...map].sort((a,b)=>sortText(a[1],b[1])).map(([value,label])=>({value,label})),'Select make');fill(modelEl,[],'Select model');}
function refreshModels(){const rows=vehicles.filter(v=>(!typeEl.value||String(v.type_id)===typeEl.value)&&(!yearEl.value||String(v.year)===yearEl.value)&&(!makeEl.value||String(v.make_id)===makeEl.value));const map=new Map();rows.forEach(v=>map.set(String(v.model_id),v.model));fill(modelEl,[...map].sort((a,b)=>sortText(a[1],b[1])).map(([value,label])=>({value,label})),'Select model');}
function status(){const n=filtered().length; $('statusText').textContent=modelEl.value?'Model selected — ready to search.':n.toLocaleString()+' matching vehicle records available.';}
function renderResult(){if(!typeEl.value||!yearEl.value||!makeEl.value||!modelEl.value){$('statusText').textContent='Select type, year, make and model to continue.';return;}const row=filtered()[0];if(!row){$('statusText').textContent='No exact vehicle match found.';return;} $('results').hidden=false;
 const tireCatalog=$('tireCatalog');
 selectedVehicle={type:String(row.type).toLowerCase(),year:String(row.year),make:String(row.make).toLowerCase(),model:String(row.model).toLowerCase()};
 const hasTireCatalog=tireProducts.some(matchesVehicle);
 tireCatalog.hidden=!hasTireCatalog;
 if(hasTireCatalog){activePosition='Front';document.querySelectorAll('.pos-btn').forEach(x=>x.classList.toggle('active',x.dataset.pos==='Front'));renderTires();}
 $('catalogVehicleLabel').textContent=hasTireCatalog?`STREET BIKE · ${row.year} ${row.make} ${row.model}`:'STREET BIKE TIRE DATA NOT AVAILABLE FOR THIS VEHICLE';
 $('catalogCopy').textContent=hasTireCatalog?'Front and rear tire listings imported from your supplied CSV files.':'Tire catalog is currently available only for: '+catalogVehicles()+'.';$('vehicleTitle').textContent=`${row.year} ${row.make} ${row.model}`;$('vehicleSubtitle').textContent='Vehicle application selected from the supplied dataset';$('vehicleTags').innerHTML='';[row.type,row.year,row.make,row.model].forEach(t=>{const s=document.createElement('span');s.className='tag';s.textContent=t;$('vehicleTags').append(s)});$('matchPill').textContent='VEHICLE MATCH FOUND';$('results').scrollIntoView({behavior:'smooth',block:'nearest'});}
typeEl.addEventListener('change',()=>{refreshYears();status();$('results').hidden=true;});
yearEl.addEventListener('change',()=>{refreshMakes();status();$('results').hidden=true;});
makeEl.addEventListener('change',()=>{refreshModels();status();$('results').hidden=true;});
modelEl.addEventListener('change',()=>{status();$('results').hidden=true;$('tireCatalog').hidden=true;});
$('findBtn').addEventListener('click',renderResult);
$('resetBtn').addEventListener('click',()=>{typeEl.value='';refreshYears();yearEl.disabled=true;makeEl.disabled=true;modelEl.disabled=true;$('results').hidden=true;$('tireCatalog').hidden=true;$('statusText').textContent='Select a vehicle type to begin.';});
fetch('data/vehicles.json').then(r=>{if(!r.ok)throw new Error('Could not load vehicle data');return r.json()}).then(data=>{vehicles=data;$('recordCount').textContent=vehicles.length.toLocaleString();fill(typeEl,[...new Map(vehicles.map(v=>[String(v.type_id),v.type])).entries()].sort((a,b)=>sortText(a[1],b[1])).map(([value,label])=>({value,label})),'All vehicle types');typeEl.addEventListener('change',()=>{if(typeEl.value){yearEl.disabled=false;}else{yearEl.disabled=true;makeEl.disabled=true;modelEl.disabled=true;}$('tireCatalog').hidden=true;});refreshYears();yearEl.disabled=true;}).catch(err=>{$('statusText').textContent='Data could not load. Run through a local web server rather than opening the file directly.';console.error(err);});


// Imported front and rear tire catalog (multiple vehicles).
let tireProducts=[];
const catalogVehicles=()=>[...new Set(tireProducts.map(p=>`${p.year} ${p.make} ${p.model} (${p.vehicle_type})`))].join(', ');

let selectedVehicle=null;
let activePosition='Front';
const matchesVehicle=p=>selectedVehicle&&String(p.vehicle_type).toLowerCase()===selectedVehicle.type&&String(p.year)===selectedVehicle.year&&String(p.make).toLowerCase()===selectedVehicle.make&&String(p.model).toLowerCase()===selectedVehicle.model;
const money=n=>n==null||!Number.isFinite(Number(n))?'Price unavailable':'$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function renderTires(){
 const search=($('productSearch')?.value||'').trim().toLowerCase();
 let list=tireProducts.filter(p=>matchesVehicle(p)&&p.position===activePosition&&(!search||p.name.toLowerCase().includes(search)));
 const sort=$('productSort')?.value||'featured';
 if(sort==='price-asc')list.sort((a,b)=>(a.price_from??Infinity)-(b.price_from??Infinity));
 if(sort==='price-desc')list.sort((a,b)=>(b.price_from??-Infinity)-(a.price_from??-Infinity));
 if(sort==='rating')list.sort((a,b)=>(b.rating??0)-(a.rating??0));
 $('productCount').textContent=list.length.toLocaleString();
 const grid=$('tireGrid');grid.innerHTML='';$('emptyProducts').hidden=list.length>0;
 list.forEach(p=>{
   const card=document.createElement('article');card.className='tire-card';
   const imageWrap=document.createElement('div');imageWrap.className='tire-image-wrap';
   const img=document.createElement('img');img.className='tire-image';img.loading='lazy';img.alt=p.name;img.referrerPolicy='no-referrer';img.src=p.image;img.onerror=()=>{img.style.display='none';imageWrap.style.background='linear-gradient(135deg,#f6f6f6,#d7d7d7)';const fallback=document.createElement('span');fallback.style.cssText='color:#333;font-weight:800;text-align:center;font-size:12px';fallback.textContent=p.name;imageWrap.append(fallback)};imageWrap.append(img);
   const position=document.createElement('span');position.className='tire-position';position.textContent=p.position.toUpperCase();imageWrap.append(position);
   if(p.sash){const sash=document.createElement('span');sash.className='tire-sale';sash.style.top='auto';sash.style.bottom='8px';sash.textContent=p.sash;imageWrap.append(sash)}
   if(p.sale){const sale=document.createElement('span');sale.className='tire-sale';sale.textContent=p.sale;imageWrap.append(sale)}
   const body=document.createElement('div');body.className='tire-body';const name=document.createElement('h3');name.className='tire-name';name.textContent=p.name;body.append(name);
   if(p.rating!=null){const rating=document.createElement('div');rating.className='tire-rating';rating.textContent='★ '+p.rating.toFixed(1);const reviews=document.createElement('span');reviews.textContent=p.reviews!=null?'('+p.reviews.toLocaleString()+' reviews)':'';rating.append(reviews);body.append(rating)}
   const price=document.createElement('div');price.className='tire-price';price.textContent=money(p.price_from);if(p.price_to!=null&&p.price_from!=null&&p.price_to!==p.price_from){const range=document.createElement('small');range.textContent=' – '+money(p.price_to);price.append(range)}body.append(price);
   if(p.was_from!=null){const was=document.createElement('div');was.className='tire-was';was.textContent='Was '+money(p.was_from);body.append(was)}
   const link=document.createElement('a');link.className='tire-actions';link.href=p.url||'#';link.target='_blank';link.rel='noopener noreferrer';link.textContent='VIEW PRODUCT ↗';body.append(link);card.append(imageWrap,body);grid.append(card);
 });
}
document.querySelectorAll('.pos-btn').forEach(b=>b.addEventListener('click',()=>{activePosition=b.dataset.pos;document.querySelectorAll('.pos-btn').forEach(x=>x.classList.toggle('active',x===b));renderTires()}));
$('productSearch')?.addEventListener('input',renderTires);$('productSort')?.addEventListener('change',renderTires);
fetch('data/tire_catalog.json').then(r=>{if(!r.ok)throw new Error('Tire catalog could not load');return r.json()}).then(data=>{tireProducts=data;renderTires()}).catch(err=>{console.error(err);const empty=$('emptyProducts');if(empty){empty.hidden=false;empty.textContent='Tire catalog could not load. Please start the project using START_FRONTEND.bat.'}});
