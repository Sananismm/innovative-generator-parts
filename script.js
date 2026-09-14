/* IGP catalogue: native browser interactions; no external dependencies. */
(() => {
  'use strict';
  const { categories, products } = window.IGP_CATALOGUE;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const icon = n => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const getPart = id => products.find(p => p.id === id);
  const state = { query:'', category:'', sort:'featured', expanded:false, enquiry:null };
  const initial = ['1-engine-block','2-fuel-injection-pump','3-radiator','4-engine-oil-pump','5-turbocharger','6-avr','7-generator-controller','8-air-filter'];
  const categoryImages = ['1-engine-block','2-fuel-injection-pump','3-radiator','4-engine-oil-pump','5-turbocharger','6-stator','7-generator-controller','8-air-filter'];
  const descriptions = ['The foundation of dependable power','Fuel delivery & injection','Temperature management','Moving parts, protected','Airflow & exhaust components','Power generation & regulation','Monitoring & safe operation','The essentials for routine service'];
  const returnFocus = new WeakMap();
  const behavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  function card(p) {
    return `<article class="product-card"><div class="product-top"><span class="category-pill">${esc(p.category)}</span><button class="part-open" data-product="${p.id}" aria-label="View ${esc(p.name)} details">${icon('diagonal')}</button></div><button class="product-image" data-product="${p.id}" aria-label="View ${esc(p.name)}"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" width="260" height="220"></button><h3><button data-product="${p.id}">${esc(p.name)}</button></h3><p class="product-description">${esc(p.dailyUse)}</p><div class="product-actions"><button class="text-link" data-product="${p.id}">View Details ${icon('arrow')}</button><button class="quote-link" data-quote="${p.id}">Request Quote</button></div></article>`;
  }
  function render() {
    const q = state.query.trim().toLowerCase();
    const matches = products.filter(p => (!state.category || p.category === state.category) && (!q || `${p.name} ${p.category} ${p.workingPrinciple} ${p.dailyUse} ${p.name === 'AVR' ? 'automatic voltage regulator' : ''}`.toLowerCase().includes(q)));
    const rank = p => initial.includes(p.id) ? initial.indexOf(p.id) : initial.length;
    matches.sort((a,b) => state.sort === 'az' ? a.name.localeCompare(b.name) : state.sort === 'za' ? b.name.localeCompare(a.name) : rank(a)-rank(b));
    const filtered = Boolean(q || state.category || state.sort !== 'featured');
    const visible = state.expanded || filtered ? matches : matches.slice(0,8);
    $('#product-grid').innerHTML = visible.map(card).join('');
    $('#product-grid').classList.remove('refreshing');
    requestAnimationFrame(() => $('#product-grid').classList.add('refreshing'));
    $('#results-count').textContent = filtered ? `${matches.length} ${matches.length === 1 ? 'part' : 'parts'} found${state.category ? ` in ${state.category}` : ''}` : `Showing ${visible.length} of ${products.length} parts`;
    $('#empty-state').hidden = matches.length > 0;
    $('#clear-search').hidden = !state.query;
    $('#reset-filters').hidden = !filtered;
    $('#view-all').hidden = filtered || !matches.length;
    $('#view-all').innerHTML = `${state.expanded ? 'Show Featured Parts' : `Explore All ${products.length} Parts`} ${icon('arrow')}`;
    $('.collection-bottom').hidden = !matches.length;
  }
  function reset() {
    Object.assign(state,{query:'',category:'',sort:'featured',expanded:false});
    $('#part-search').value = ''; $('#category-filter').value = ''; $('#sort-order').value = 'featured'; render();
  }
  function closeMenu() { $('#category-menu').hidden = true; $('#category-menu-toggle').setAttribute('aria-expanded','false'); }
  function closeDialogs() { $$('dialog[open]').forEach(d => d.close()); }
  // Native dialogs provide focus trapping, Escape and inert background content.
  function openDialog(d, target = document.activeElement) { closeDialogs(); returnFocus.set(d,target); d.showModal(); document.body.classList.add('modal-open'); d.scrollTop = 0; }
  function selectCategory(c) {
    closeDialogs(); Object.assign(state,{category:c,query:'',expanded:true}); $('#category-filter').value = c; $('#part-search').value = '';
    closeMenu(); render(); $('#products').scrollIntoView({behavior:behavior()}); $('#category-filter').focus({preventScroll:true});
  }
  function showProduct(id, updateURL = true) {
    const p = getPart(id); if (!p) return;
    const d = $('#product-dialog'), wasOpen = d.open;
    const related = products.filter(r => r.category === p.category && r.id !== p.id).slice(0,4);
    $('#product-detail').innerHTML = `<nav class="breadcrumb" aria-label="Part breadcrumb"><button data-detail-home>Home</button><span>/</span><button data-category="${esc(p.category)}">${esc(p.category)}</button><span>/</span><span>${esc(p.name)}</span></nav><div class="detail-grid"><div><div class="detail-image"><img src="${p.image}" alt="${esc(p.name)}" width="420" height="420"></div><p class="detail-image-caption">Catalogue reference image. Confirm the required part with IGP.</p></div><div class="detail-copy"><p class="eyebrow">${esc(p.category)}</p><h2 id="product-title" tabindex="-1">${esc(p.name)}</h2><dl><dt>CATEGORY</dt><dd>${esc(p.category)}</dd><dt>WORKING PRINCIPLE</dt><dd>${esc(p.workingPrinciple)}</dd><dt>DAILY USE / FUNCTION</dt><dd>${esc(p.dailyUse)}</dd></dl><button class="button button-red" data-quote="${p.id}">Request Quote ${icon('diagonal')}</button></div></div><div class="related"><h3>RELATED COMPONENTS</h3><div class="related-list">${related.map(r => `<button class="related-part" data-product="${r.id}"><img src="${r.image}" alt="" width="100" height="80" loading="lazy"><span>${esc(r.name)}</span></button>`).join('')}</div></div>`;
    if (!wasOpen) openDialog(d); else d.scrollTop = 0;
    $('#product-title').focus({preventScroll:true});
    if (updateURL) { const url = new URL(location.href); url.searchParams.set('part',id); history.replaceState(null,'',url); }
  }
  function clearErrors() { $$('.field-error').forEach(e => {e.textContent='';}); $$('#quote-form [aria-invalid]').forEach(e => e.removeAttribute('aria-invalid')); $('#form-status').textContent=''; }
  function openQuote(id) {
    const parent = document.activeElement?.closest('dialog'); const target = parent ? returnFocus.get(parent) : document.activeElement;
    $('#quote-form').reset(); clearErrors(); $('#quote-product').value=getPart(id)?.name || '';
    $('#quote-form').hidden=false; $('#quote-success').hidden=true; state.enquiry=null;
    openDialog($('#quote-dialog'),target); $('#quote-name').focus({preventScroll:true});
  }
  function validate() {
    clearErrors(); const errors=[];
    [['name',e=>e.value.trim().length>0,'Please enter your name.'],['email',e=>e.value.trim().length>0 && e.validity.valid,'Please enter a valid email address.'],['product',e=>e.value.trim().length>0,'Please enter the part you need.'],['quantity',e=>e.validity.valid,'Please enter a whole quantity of 1 or more.']].forEach(([name,valid,message]) => {const e=$(`#quote-${name}`); if(!valid(e)){e.setAttribute('aria-invalid','true'); $(`#error-${name}`).textContent=message; errors.push(e);}});
    if(errors.length){$('#form-status').textContent=`Please correct the ${errors.length} highlighted ${errors.length===1?'field':'fields'}.`;errors[0].focus();return false;} return true;
  }
  // Backend integration point: replace this demo-only function with a real API request.
  // Show a sent state only after server confirmation; retain input on API errors.
  function prepareEnquiry(fields) {
    state.enquiry=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.trim()]));
    $('#quote-form').hidden=true; $('#quote-success').hidden=false; $('#quote-success').focus();
  }
  function download() {
    if(!state.enquiry)return;
    const labels={name:'Name',company:'Company',email:'Email',phone:'Phone',product:'Product / Part Required',model:'Generator Model / Part Number',quantity:'Quantity',message:'Message'};
    const text=['INNOVATIVE GENERATOR PARTS — ENQUIRY DRAFT','This enquiry has NOT been sent.','',...Object.entries(state.enquiry).map(([k,v])=>`${labels[k]}: ${v || 'Not provided'}`)].join('\r\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})); const a=document.createElement('a'); a.href=url; a.download='igp-enquiry-draft.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function policy(kind) {
    $('#policy-title').textContent=kind==='privacy'?'Privacy — website preview':'Terms — website preview';
    $('#policy-content').innerHTML=kind==='privacy'?'<p>This preview processes search and enquiry details in your browser. The enquiry form does not send information to IGP and does not save it in browser storage. Downloading an enquiry creates a file on your device.</p><p>The hosting provider may process connection information when serving the site. IGP’s approved privacy policy and contact details must be supplied before collecting enquiries through a live service.</p>':'<p>This catalogue describes generator component functions using the supplied IGP reference document. Images are for component identification and may not show the exact replacement required.</p><p>Prices, availability, compatibility and supply terms must be confirmed with IGP. The preview form does not place an order or send a quote request.</p><p>IGP’s approved business terms must be supplied before enabling a live enquiry service.</p>';
    openDialog($('#policy-dialog'));
  }
  function setupCatalogue() {
    $('#category-filter').insertAdjacentHTML('beforeend',categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(''));
    const links=list=>list.map(c=>`<button data-category="${esc(c)}">${esc(c)}</button>`).join('');
    $('#category-menu').innerHTML=links(categories); $('#footer-products').innerHTML=links(categories.slice(0,6));
    $('#category-mosaic').innerHTML=categories.map((c,i)=>`<button class="category-tile" data-category="${esc(c)}"><img src="${getPart(categoryImages[i]).image}" alt="" loading="lazy" width="600" height="500"><span class="tile-index">0${i+1} / ${products.filter(p=>p.category===c).length} PARTS</span><span class="tile-bottom"><span><strong>${esc(c)}</strong><small>${descriptions[i]}</small></span><span class="tile-arrow">${icon('diagonal')}</span></span></button>`).join('');
    $('#featured-grid').innerHTML=['2-fuel-filter','4-oil-filter','5-air-filter','6-avr'].map(id=>card(getPart(id))).join('');
    $('#education-grid').innerHTML=['6-avr','5-turbocharger','3-thermostat'].map((id,i)=>{const p=getPart(id);return `<article class="education-card"><div class="education-card-top"><h3>${esc(p.name)}</h3><span>0${i+1}</span></div><dl><dt>WORKING PRINCIPLE</dt><dd>${esc(p.workingPrinciple)}</dd><dt>DAILY USE</dt><dd>${esc(p.dailyUse)}</dd></dl><button class="text-link" data-product="${id}">Learn More ${icon('arrow')}</button></article>`;}).join('');
    $('#part-names').innerHTML=[...new Set(products.map(p=>p.name))].sort().map(n=>`<option value="${esc(n)}"></option>`).join('');
    $('#year').textContent=new Date().getFullYear(); render();
  }
  function bindEvents() {
    $('#part-search').addEventListener('input',e=>{state.query=e.target.value;render();});
    $('#clear-search').addEventListener('click',()=>{state.query='';$('#part-search').value='';render();$('#part-search').focus();});
    $('#category-filter').addEventListener('change',e=>{state.category=e.target.value;render();});
    $('#sort-order').addEventListener('change',e=>{state.sort=e.target.value;render();});
    $('#reset-filters').addEventListener('click',reset);
    $('#empty-reset').addEventListener('click',()=>{reset();$('#part-search').focus();});
    $('#view-all').addEventListener('click',()=>{state.expanded=!state.expanded;render();if(!state.expanded)$('#products').scrollIntoView({behavior:behavior()});});
    $('#browse-maintenance').addEventListener('click',()=>{reset();state.expanded=true;render();});
    $('#category-menu-toggle').addEventListener('click',()=>{const open=$('#category-menu').hidden;$('#category-menu').hidden=!open;$('#category-menu-toggle').setAttribute('aria-expanded',String(open));});
    $('.nav-dropdown').addEventListener('focusout',e=>{if(!$('.nav-dropdown').contains(e.relatedTarget))closeMenu();});
    $('#menu-toggle').addEventListener('click',()=>{openDialog($('#mobile-menu'));$('#menu-toggle').setAttribute('aria-expanded','true');});
    document.addEventListener('click',e=>{
      if(!e.target.closest('.nav-dropdown'))closeMenu(); const t=e.target.closest('button,a');if(!t)return;
      if(t.hasAttribute('data-product'))showProduct(t.dataset.product);
      else if(t.hasAttribute('data-quote'))openQuote(t.dataset.quote);
      else if(t.hasAttribute('data-category'))selectCategory(t.dataset.category);
      else if(t.hasAttribute('data-close'))t.closest('dialog').close();
      else if(t.hasAttribute('data-search')){closeDialogs();$('#products').scrollIntoView({behavior:behavior()});$('#part-search').focus({preventScroll:true});}
      else if(t.hasAttribute('data-policy'))policy(t.dataset.policy);
      else if(t.hasAttribute('data-detail-home')){closeDialogs();$('#home').scrollIntoView({behavior:behavior()});}
      if(t.matches('#mobile-menu a'))closeDialogs();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#category-menu').hidden){closeMenu();$('#category-menu-toggle').focus();}});
    $$('dialog').forEach(d=>{
      d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});
      d.addEventListener('close',()=>{
        if(!$('dialog[open]')){document.body.classList.remove('modal-open');const t=returnFocus.get(d);if(t?.isConnected&&!t.closest('dialog:not([open])'))t.focus({preventScroll:true});}
        if(d.id==='mobile-menu')$('#menu-toggle').setAttribute('aria-expanded','false');
        if(d.id==='product-dialog'){const url=new URL(location.href);url.searchParams.delete('part');history.replaceState(null,'',url);}
      });
    });
    matchMedia('(min-width: 768px)').addEventListener('change',e=>{if(e.matches&&$('#mobile-menu').open)$('#mobile-menu').close();});
    $('#quote-form').addEventListener('submit',e=>{e.preventDefault();if(validate())prepareEnquiry(Object.fromEntries(new FormData(e.currentTarget)));});
    $('#download-enquiry').addEventListener('click',download);
    $('#edit-enquiry').addEventListener('click',()=>{$('#quote-success').hidden=true;$('#quote-form').hidden=false;$('#quote-name').focus();});
    addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('part');if(id)showProduct(id,false);else if($('#product-dialog').open)$('#product-dialog').close();});
  }
  function observers() {
    const sentinel=document.createElement('span');sentinel.className='header-sentinel';sentinel.setAttribute('aria-hidden','true');$('#home').prepend(sentinel);
    new IntersectionObserver(([e])=>$('#site-header').classList.toggle('scrolled',!e.isIntersecting),{threshold:0}).observe(sentinel);
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const o=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target);}}),{threshold:.08});$$('.section-heading, .manifesto, .features article, .education-card, .brand-statement').forEach(e=>{e.classList.add('reveal');o.observe(e);});}
    const nav=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('.desktop-nav > a').forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`));}),{rootMargin:'-15% 0px -55% 0px'});
    ['home','products','categories','about','contact'].forEach(id=>nav.observe(document.getElementById(id)));
  }
  setupCatalogue();bindEvents();observers();const id=new URL(location.href).searchParams.get('part');if(id)showProduct(id,false);
})();
