/* -------------------------------------------------
   Big-Five Quiz  |  js/quiz.js
   ------------------------------------------------- */

/* ───────────────────────────── constants ───────────────────────────── */
const TRAITS = {
  O: { label: 'Openness' },
  C: { label: 'Conscientiousness' },
  E: { label: 'Extraversion' },
  A: { label: 'Agreeableness' },
  N: { label: 'Neuroticism' }
};

/* ───────────────────────────── 1. load JSON ────────────────────────── */
async function loadData () {
  const res = await fetch('js/questions.json');
  if (!res.ok) throw new Error('Cannot load questions.json');
  return res.json();
}

/* ───────────────────────────── 2. render Qs ────────────────────────── */
function renderQuestions (data) {
  Object.keys(data).forEach(trait => {
    data[trait].subcomponents.forEach(sub => {
      const shell = document.querySelector(
        `.subcategory[data-trait="${trait}"][data-subcomponent="${sub.name}"],
         .category[data-trait="${trait}"] .subcategory[data-subcomponent="${sub.name}"]`
      );
      if (!shell) return;

      const body  = shell.querySelector('.panel-body');
      const spot  = body.querySelector('.sub-results-btn');
      const block = document.createElement('div');

      sub.questions.forEach(q => {
        const qDiv = document.createElement('div');
        qDiv.className     = 'question';
        qDiv.dataset.trait = trait;

        const p = document.createElement('p');
        p.textContent = q.text;
        qDiv.appendChild(p);

        q.options.forEach(opt => {
          const label = document.createElement('label');
          const radio = document.createElement('input');
          radio.type  = 'radio';
          radio.name  = `q${q.id}`;
          radio.value = opt.value;         // 1-4
          label.appendChild(radio);
          label.append(' ' + opt.text);
          qDiv.appendChild(label);
        });

        block.appendChild(qDiv);
      });

      body.insertBefore(block, spot);
    });
  });
}

/* ───────────────────────────── 3. UI wiring ────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  try { renderQuestions(await loadData()); }
  catch (e) { console.error(e); alert('Failed to load quiz data.'); return; }

  /* accordion — only one parent open at once */
  document.querySelectorAll('details.category').forEach(cat => {
    cat.addEventListener('click', () => {
      document.querySelectorAll('details.category').forEach(o => {
        if (o !== cat) o.removeAttribute('open');
      });
    });
  });

  /* ── sub-facet “See Results” buttons ── */
  document.querySelectorAll('.sub-results-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subPanel = btn.closest('.subcategory');
      const picked   = subPanel.querySelectorAll('input[type=radio]:checked');
      const out      = subPanel.querySelector('.sub-result');

      if (!picked.length) { out.textContent = '(No questions answered)'; return; }

      let total = 0; picked.forEach(r => (total += +r.value));
      const mean5 = (total / picked.length) * 1.25;   // 4-scale → 5-scale
      out.textContent = `Subcategory Score: ${mean5.toFixed(2)} / 5`;
    });
  });

  /* ── category-level extras (expand-all + trait button) ── */
  document.querySelectorAll('details.category').forEach(cat => {
    const traitKey  = cat.dataset.trait;
    const traitName = TRAITS[traitKey].label;

    /* expand / collapse all subfacets */
    const expand = document.createElement('button');
    expand.type        = 'button';
    expand.className   = 'expand-all-btn';
    expand.title       = 'Toggle all sub-facets';
    expand.textContent = '⇲';
    expand.dataset.open = 'false';
    cat.querySelector(':scope > summary').appendChild(expand);

    expand.addEventListener('click', e => {
      e.stopPropagation();
      const openAll = expand.dataset.open === 'false';
      expand.dataset.open = String(openAll);
      expand.textContent  = openAll ? '⇱' : '⇲';
      cat.setAttribute('open', '');
      cat.querySelectorAll('details.subcategory').forEach(s => {
        openAll ? s.setAttribute('open', '') : s.removeAttribute('open');
      });
    });

    /* trait-wide score button */
    const pBody    = cat.querySelector(':scope > .panel-body');
    const tBtn     = document.createElement('button');
    tBtn.type      = 'button';
    tBtn.className = 'trait-results-btn';
    tBtn.textContent = `See ${traitName} Results`;
    pBody.appendChild(tBtn);

    const tOut = document.createElement('div');
    tOut.className = 'trait-result';
    pBody.appendChild(tOut);

    tBtn.addEventListener('click', () => {
      const picked = cat.querySelectorAll('.question input[type=radio]:checked');
      if (!picked.length) { tOut.textContent = '(No questions answered)'; return; }

      let total = 0; picked.forEach(r => (total += +r.value));
      const mean5 = (total / picked.length) * 1.25;
      tOut.textContent = `${traitName} Score: ${mean5.toFixed(2)} / 5`;
    });
  });

  /* ── full-quiz submit ── */
  const quizForm   = document.getElementById('quizForm');
  const resultBars = document.getElementById('resultBars');
  const resultsBox = document.getElementById('results');

  quizForm.addEventListener('submit', e => {
    e.preventDefault();

    Object.keys(TRAITS).forEach(k => { TRAITS[k].total = 0; TRAITS[k].count = 0; });

    document.querySelectorAll('.question').forEach(q => {
      const trait = q.dataset.trait;
      const sel   = q.querySelector('input[type=radio]:checked');
      if (sel) { TRAITS[trait].total += +sel.value; TRAITS[trait].count++; }
    });

    resultBars.innerHTML = '';

    Object.keys(TRAITS).forEach(k => {
      const t      = TRAITS[k];
      const mean4  = t.count ? t.total / t.count : 0;
      const mean5  = mean4 * 1.25;

      const wrap   = document.createElement('div');

      const label  = document.createElement('div');
      label.className = 'trait-label';
      label.textContent = `${t.label}: ${mean5.toFixed(2)} / 5`;
      wrap.appendChild(label);

      const bar    = document.createElement('div');  bar.className = 'bar';
      const fill   = document.createElement('div'); fill.className = 'bar-fill';
      fill.style.width = `${(mean5 / 5) * 100}%`;
      bar.appendChild(fill);

      wrap.appendChild(bar);
      resultBars.appendChild(wrap);
    });

    quizForm.style.display = 'none';
    resultsBox.style.display = 'block';
  });
});
