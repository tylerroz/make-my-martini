/* ============================================
   MAKE MY MARTINI — app.js
   ============================================ */

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  spirit:  'gin',
  ratio:   'classic',
  mods:    new Set(),
  prep:    'stirred',
  serve:   'up',
  garnish: 'twist',
};

// ─── Data ────────────────────────────────────────────────────────────────────

const VERMOUTH = {
  'wet':       { oz: '1 oz',    spiritOz: '2 oz'  },
  'classic':   { oz: '½ oz',   spiritOz: '2½ oz' },
  'dry':       { oz: '¼ oz',   spiritOz: '2½ oz' },
  'extra-dry': { oz: '1 tsp',  spiritOz: '3 oz'  },
  'bone-dry':  { oz: null,     spiritOz: '3 oz'  },
  'in-out':    { oz: 'rinse',  spiritOz: '3 oz'  },
};

const FLAVOR_BASES = {
  gin:   { crisp: 55, herbal: 60, savory: 10, boozy: 45, silky: 55 },
  vodka: { crisp: 70, herbal: 20, savory: 10, boozy: 45, silky: 65 },
};

// ─── Computed Values ─────────────────────────────────────────────────────────

function getName() {
  const parts = [];
  const ratioLabels = { wet: 'Wet', dry: 'Dry', 'extra-dry': 'Extra Dry', 'bone-dry': 'Bone Dry', 'in-out': 'In & Out' };
  if (ratioLabels[state.ratio]) parts.push(ratioLabels[state.ratio]);
  if (state.mods.has('extra-dirty')) parts.push('Extra Dirty');
  else if (state.mods.has('dirty')) parts.push('Dirty');
  if (state.mods.has('bruised')) parts.push('Bruised');
  const spirit = state.spirit === 'gin' ? 'Gin' : 'Vodka';
  if (state.garnish === 'onion') return [...parts, spirit, 'Gibson'].join(' ');
  return [...parts, spirit, 'Martini'].join(' ');
}

function getIngredients() {
  const ings = [];
  const v = VERMOUTH[state.ratio];
  const spiritLabel = state.spirit === 'gin' ? 'London Dry Gin' : 'Vodka';

  ings.push({ name: spiritLabel, amount: v.spiritOz });

  if (v.oz) {
    ings.push({ name: 'Dry Vermouth', amount: v.oz });
  }

  if (state.mods.has('extra-dirty')) {
    ings.push({ name: 'Olive brine', amount: '1 oz' });
  } else if (state.mods.has('dirty')) {
    ings.push({ name: 'Olive brine', amount: '½ oz' });
  }

  const garnishLabels = { twist: 'Lemon twist', olive: 'Castelvetrano olive', onion: 'Cocktail onion' };
  if (garnishLabels[state.garnish]) {
    ings.push({ name: garnishLabels[state.garnish], amount: 'garnish' });
  }

  return ings;
}

function getFlavorProfile() {
  const base = { ...FLAVOR_BASES[state.spirit] };

  const ratioAdjust = {
    'wet':       { herbal: +20, silky: +15, boozy: -15, crisp: -10 },
    'dry':       { boozy: +15, crisp: +10, herbal: -10, silky: -5  },
    'extra-dry': { boozy: +25, crisp: +15, herbal: -20, silky: -10 },
    'bone-dry':  { boozy: +35, crisp: +20, herbal: -30, silky: -15 },
    'in-out':    { boozy: +20, crisp: +10, herbal: +5              },
  };

  const adj = ratioAdjust[state.ratio] || {};
  for (const [k, v] of Object.entries(adj)) base[k] = (base[k] || 0) + v;

  if (state.mods.has('extra-dirty')) { base.savory += 55; base.crisp -= 10; base.silky += 10; }
  else if (state.mods.has('dirty')) { base.savory += 30; base.crisp -= 8; base.silky += 8; }

  if (state.prep === 'shaken')  { base.crisp += 15; base.silky -= 15; }
  if (state.prep === 'stirred') { base.silky += 12; base.crisp -= 5; }

  const clamp = v => Math.min(100, Math.max(5, Math.round(v)));
  return {
    crisp:  clamp(base.crisp),
    herbal: clamp(base.herbal),
    savory: clamp(base.savory),
    boozy:  clamp(base.boozy),
    silky:  clamp(base.silky),
  };
}

function getTastingNote(fp) {
  const notes = [];
  if (state.spirit === 'vodka') notes.push('clean and spirit-neutral');
  else if (fp.herbal > 55)      notes.push('bright with juniper and botanicals');
  else                          notes.push('spirit-forward with whispers of botanicals');

  if (fp.savory > 55)       notes.push('deeply savory with pronounced olive brine');
  else if (fp.savory > 25)  notes.push('with a briny, savory undercurrent');

  if (fp.boozy > 80)        notes.push('formidably boozy and uncompromising');
  else if (fp.silky > 70)   notes.push('luxuriously silky on the palate');

  if (fp.crisp > 75)        notes.push('finishing clean and bright');
  if (state.mods.has('bruised')) notes.push('with fine bubbles from aggressive dilution');
  if (state.garnish === 'twist')  notes.push('lifted by a spray of lemon oils');
  if (state.garnish === 'onion')  notes.push('with a delicate sweet-onion finish');

  return notes.join(', ') + '.';
}

function getOrderPhrase() {
  const parts = [];

  const ratioMap = {
    'wet':       'wet',
    'dry':       'dry',
    'extra-dry': 'extra dry',
    'bone-dry':  'bone dry',
    'in-out':    'in and out',
  };
  if (ratioMap[state.ratio]) parts.push(ratioMap[state.ratio]);

  if (state.mods.has('extra-dirty')) parts.push('extra dirty');
  else if (state.mods.has('dirty'))  parts.push('dirty');
  if (state.mods.has('bruised'))     parts.push('bruised');

  const spirit = state.spirit === 'gin' ? 'gin' : 'vodka';
  const drink = state.garnish === 'onion' ? 'gibson' : 'martini';
  parts.push(`${spirit} ${drink}`);

  parts.push(state.prep === 'shaken' ? 'shaken' : 'stirred');
  parts.push(state.serve === 'rocks' ? 'on the rocks' : 'straight up');

  const garnishMap = { twist: 'with a twist', olive: 'with an olive', onion: 'with an onion', none: '' };
  if (garnishMap[state.garnish]) parts.push(garnishMap[state.garnish]);

  const phrase = parts.filter(Boolean).join(', ');
  return `"I'll have a ${phrase}, please."`;
}

// ─── Render ──────────────────────────────────────────────────────────────────

function render() {
  const ings = getIngredients();
  const name = getName();
  const fp   = getFlavorProfile();
  const note = getTastingNote(fp);
  const order = getOrderPhrase();

  // Name & method
  document.getElementById('result-name').textContent = name;
  document.getElementById('result-method').textContent =
    `${state.prep === 'shaken' ? 'Shaken' : 'Stirred'} · ${state.serve === 'up' ? 'Straight Up' : 'On the Rocks'}`;

  // Ingredients
  const ul = document.getElementById('ingredient-list');
  ul.innerHTML = ings.map(i =>
    `<li><span class="ing-name">${i.name}</span><span class="ing-amount">${i.amount}</span></li>`
  ).join('');

  // Flavor bars
  const barsEl = document.getElementById('flavor-bars');
  barsEl.innerHTML = Object.entries(fp).map(([key, val]) =>
    `<div class="flavor-row">
      <span class="flavor-name">${key}</span>
      <div class="flavor-track"><div class="flavor-fill" style="width:${val}%"></div></div>
    </div>`
  ).join('');

  // Tasting note & order
  document.getElementById('tasting-note').textContent = note;
  document.getElementById('order-phrase').textContent = order;

  // SVG glass garnish
  document.getElementById('garnish-olive').style.opacity  = state.garnish === 'olive'  ? '1' : '0';
  document.getElementById('garnish-twist').style.opacity  = state.garnish === 'twist'  ? '1' : '0';
  document.getElementById('garnish-onion').style.opacity  = state.garnish === 'onion'  ? '1' : '0';

  // Dirty brine layer
  const dirtyOpacity = state.mods.has('extra-dirty') ? '0.55' : state.mods.has('dirty') ? '0.35' : '0';
  document.getElementById('dirty-fill').style.opacity = dirtyOpacity;

  // Ice
  document.getElementById('ice-group').style.opacity = state.serve === 'rocks' ? '1' : '0';
}

// ─── Event Handling ──────────────────────────────────────────────────────────

document.querySelectorAll('.chip-row').forEach(row => {
  row.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    const group = row.dataset.group;
    const mode  = row.dataset.mode;
    const val   = chip.dataset.val;

    if (mode === 'solo') {
      row.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[group] = val;

    } else if (mode === 'multi') {
      // Dirty / Extra Dirty are mutually exclusive
      if (val === 'dirty' && !chip.classList.contains('active')) {
        const edChip = row.querySelector('[data-val="extra-dirty"]');
        edChip?.classList.remove('active');
        state.mods.delete('extra-dirty');
      }
      if (val === 'extra-dirty' && !chip.classList.contains('active')) {
        const dChip = row.querySelector('[data-val="dirty"]');
        dChip?.classList.remove('active');
        state.mods.delete('dirty');
      }

      if (chip.classList.contains('active')) {
        chip.classList.remove('active');
        state.mods.delete(val);
      } else {
        chip.classList.add('active');
        state.mods.add(val);
      }
    }

    render();
  });
});

// ─── Surprise Me ─────────────────────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

document.getElementById('random-btn').addEventListener('click', () => {
  // Randomize state
  state.spirit  = pick(['gin', 'vodka']);
  state.ratio   = pick(['wet', 'classic', 'classic', 'dry', 'extra-dry', 'bone-dry', 'in-out']);
  state.prep    = pick(['stirred', 'stirred', 'shaken']);
  state.serve   = pick(['up', 'up', 'rocks']);
  state.garnish = pick(['twist', 'twist', 'olive', 'onion', 'none']);
  state.mods    = new Set();
  if (Math.random() < 0.3) state.mods.add(Math.random() < 0.5 ? 'dirty' : 'extra-dirty');
  if (Math.random() < 0.1) state.mods.add('bruised');

  // Sync chip UI
  document.querySelectorAll('.chip-row').forEach(row => {
    const group = row.dataset.group;
    const mode  = row.dataset.mode;
    row.querySelectorAll('.chip').forEach(chip => {
      const val = chip.dataset.val;
      if (mode === 'solo') {
        chip.classList.toggle('active', state[group] === val);
      } else if (mode === 'multi') {
        chip.classList.toggle('active', state.mods.has(val));
      }
    });
  });

  render();
});

// ─── Init ────────────────────────────────────────────────────────────────────

render();
