/* ===== LearnDjango - Global JS ===== */

// ===== Storage Helpers =====
var _memStore = {};
function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return _memStore[key] || null;
  }
}
function safeSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {
    _memStore[key] = val;
  }
}

// ===== Dark Mode =====
(function initTheme() {
  var saved = safeGet('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  safeSet('theme', next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerHTML = isDark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
}

document.addEventListener('DOMContentLoaded', updateThemeIcon);

// ===== Progress Tracking =====
function getProgress() {
  try { return JSON.parse(safeGet('learndjango-progress') || '[]'); }
  catch(e) { return []; }
}

function markComplete(chapterId) {
  var progress = getProgress();
  if (!progress.includes(chapterId)) {
    progress.push(chapterId);
    safeSet('learndjango-progress', JSON.stringify(progress));
  }
  updateDropdownProgress();
}

function isComplete(chapterId) {
  return getProgress().includes(chapterId);
}

function updateDropdownProgress() {
  const progress = getProgress();
  // Update counter
  const counter = document.querySelector('.dropdown-progress');
  if (counter) counter.textContent = progress.length + '/16 Chapters Complete';
  // Update checkmarks
  document.querySelectorAll('.chapter-grid-item').forEach(item => {
    const id = item.getAttribute('data-chapter');
    if (id && progress.includes(id)) {
      item.classList.add('completed');
    }
  });
}

// ===== Chapter Dropdown =====
function openDropdown() {
  const overlay = document.getElementById('chapter-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateDropdownProgress();
  }
}

function closeDropdown() {
  const overlay = document.getElementById('chapter-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDropdown();
});

// ===== Copy Code =====
function copyCode(btn) {
  const block = btn.closest('.code-block');
  const code = block.querySelector('code');
  const text = code.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
}

function insertCodeFileStructureSnippets() {
  document.querySelectorAll('.code-block').forEach(block => {
    if (block.querySelector('.code-file-structure')) return;
    const span = block.querySelector('.code-header-left span');
    if (!span) return;
    const label = span.textContent.trim();

    if (label.toLowerCase() === 'terminal' || label.toLowerCase() === 'usage' || label === 'template.html') {
      // Skip showing structure for terminal commands, usage examples, and generic template examples
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'code-file-structure';

    const strong = document.createElement('strong');
    strong.textContent = 'Full project structure:';
    wrapper.appendChild(strong);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    const parts = label.split('/');
    let appName = '';
    let fileName = '';
    if (parts.length === 1) {
      fileName = parts[0];
    } else {
      appName = parts[0];
      fileName = parts[1];
    }
    const lines = ['helloworld/', '  manage.py', '  helloworld/', '    __init__.py', '    settings.py', '    urls.py', '    wsgi.py'];
    if (appName) {
      lines.push('  ' + appName + '/');
      lines.push('    __init__.py');
      lines.push('    views.py');
      lines.push('    urls.py');
      lines.push('    models.py');
      lines.push('    admin.py');
      lines.push('    apps.py');
      lines.push('    tests.py');
      // Highlight the current file
      const fileIndex = lines.findIndex(line => line.trim() === fileName);
      if (fileIndex !== -1) {
        lines[fileIndex] += '  <-- current file';
      }
    } else {
      // Project level files
      const fileMap = {
        'settings.py': 4,
        'urls.py': 5,
        'wsgi.py': 6,
        '__init__.py': 3
      };
      if (fileMap[fileName] !== undefined) {
        lines[fileMap[fileName]] += '  <-- current file';
      }
    }
    code.textContent = lines.join('\n');
    pre.appendChild(code);
    wrapper.appendChild(pre);

    const preTag = block.querySelector('pre');
    if (preTag) block.insertBefore(wrapper, preTag);
  });
}

// ===== Quiz =====
function selectOption(el) {
  const card = el.closest('.quiz-inner');
  if (card.classList.contains('answered')) return;
  card.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function checkQuiz(btn) {
  const card = btn.closest('.quiz-inner');
  if (card.classList.contains('answered')) return;
  const selected = card.querySelector('.quiz-option.selected');
  if (!selected) return;

  card.classList.add('answered');
  const correct = card.getAttribute('data-answer');
  const chosen = selected.getAttribute('data-value');

  if (chosen === correct) {
    selected.classList.add('correct');
    card.querySelector('.quiz-feedback-correct').classList.add('correct');
  } else {
    selected.classList.add('incorrect');
    card.querySelector('.quiz-option[data-value="' + correct + '"]').classList.add('correct');
    card.querySelector('.quiz-feedback-incorrect').classList.add('incorrect');
  }
  btn.disabled = true;
}

// ===== Scroll to top =====
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Landing page progress =====
function updateLandingProgress() {
  const progress = getProgress();
  const bar = document.querySelector('.landing-progress');
  if (bar && progress.length > 0) {
    bar.classList.add('visible');
    bar.querySelector('.progress-fill').style.width = (progress.length / 16 * 100) + '%';
    bar.querySelector('.progress-label').textContent = progress.length + ' of 16 chapters complete';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateLandingProgress();
  updateDropdownProgress();
  insertCodeFileStructureSnippets();
  // Initialize highlight.js
  if (window.hljs) {
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }
});
