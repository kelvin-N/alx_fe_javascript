(function(){
  const LS_KEY = 'quotes';
  const SS_KEY = 'lastQuoteIndex';

  const seedQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "philosophy" },
    { text: "Mistakes are proof that you are trying.", category: "encouragement" }
  ];

  let quotes = [];

  const showQuoteBtn = document.getElementById('showQuote');
  const quoteBox = document.getElementById('quoteBox');
  const quoteMeta = document.getElementById('quoteMeta');
  const addForm = document.getElementById('addForm');
  const quoteText = document.getElementById('quoteText');
  const quoteCategory = document.getElementById('quoteCategory');
  const quotesList = document.getElementById('quotesList');
  const exportJsonBtn = document.getElementById('exportJson');
  const importFileInput = document.getElementById('importFile');
  const clearAllBtn = document.getElementById('clearAll');

  function loadQuotes(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        quotes = Array.isArray(parsed) ? parsed : seedQuotes.slice();
      } else {
        quotes = seedQuotes.slice();
      }
      saveQuotes();
    } catch {
      quotes = seedQuotes.slice();
    }
  }

  function saveQuotes(){
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
    renderList();
  }

  function showRandomQuote(){
    if(!quotes.length){
      quoteBox.textContent = 'No quotes available.';
      quoteMeta.textContent = '';
      return;
    }
    const idx = Math.floor(Math.random() * quotes.length);
    const q = quotes[idx];
    quoteBox.textContent = q.text;
    quoteMeta.textContent = q.category ? 'Category: ' + q.category : '';
    sessionStorage.setItem(SS_KEY, String(idx));
  }

  function renderList(){
    quotesList.innerHTML = '';
    if(!quotes.length){
      quotesList.innerHTML = '<div class="small">No saved quotes.</div>';
      return;
    }
    quotes.forEach((q, i) => {
      const div = document.createElement('div');
      div.className = 'item';
      const text = document.createElement('div');
      text.className = 'text';
      text.innerHTML = `<strong>${escapeHtml(q.text)}</strong>` + (q.category ? `<div class="small">${escapeHtml(q.category)}</div>` : '');
      
      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '6px';

      const showBtn = document.createElement('button');
      showBtn.className = 'ghost';
      showBtn.textContent = 'Show';
      showBtn.onclick = () => { quoteBox.textContent = q.text; quoteMeta.textContent = q.category ? 'Category: ' + q.category : ''; sessionStorage.setItem(SS_KEY, String(i)); };

      const delBtn = document.createElement('button');
      delBtn.className = 'ghost';
      delBtn.textContent = 'Delete';
      delBtn.onclick = () => { if(confirm('Delete this quote?')){ quotes.splice(i,1); saveQuotes(); } };

      actions.append(showBtn, delBtn);
      div.append(text, actions);
      quotesList.appendChild(div);
    });
  }

  function addQuote(text, category){
    const trimmed = text.trim();
    if(!trimmed) return false;
    quotes.push({ text: trimmed, category: category.trim() });
    saveQuotes();
    return true;
  }

  function exportToJson(){
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importFromFile(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
      try{
        const imported = JSON.parse(e.target.result);
        const valid = imported.filter(q => q.text).map(q => ({ text: q.text.trim(), category: q.category ? q.category.trim() : '' }));
        const replace = confirm('Replace existing quotes? Click OK to replace, Cancel to append.');
        if(replace) quotes = valid; else quotes.push(...valid);
        saveQuotes();
        alert('Quotes imported successfully!');
      } catch(err){
        alert('Error importing file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function clearAllQuotes(){
    if(confirm('This will remove all saved quotes. Continue?')){
      quotes = [];
      saveQuotes();
    }
  }

  function escapeHtml(s){ return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  function restoreLastViewed(){
    const idx = sessionStorage.getItem(SS_KEY);
    if(idx && quotes[idx]){
      const q = quotes[idx];
      quoteBox.textContent = q.text;
      quoteMeta.textContent = q.category ? 'Category: ' + q.category : '';
    } else showRandomQuote();
  }

  showQuoteBtn.onclick = showRandomQuote;
  addForm.onsubmit = e => {
    e.preventDefault();
    if(addQuote(quoteText.value, quoteCategory.value)){
      quoteText.value = '';
      quoteCategory.value = '';
    } else alert('Please enter a quote.');
  };
  exportJsonBtn.onclick = exportToJson;
  importFileInput.onchange = e => { importFromFile(e.target.files[0]); e.target.value=''; };
  clearAllBtn.onclick = clearAllQuotes;

  loadQuotes();
  renderList();
  restoreLastViewed();
})();
