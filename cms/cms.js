document.addEventListener('DOMContentLoaded', () => {
  const menu = createMenu();
  document.body.appendChild(menu);

  let current = null;
  let templateElements = [];
  let uniqueClasses = [];

  // Load template once and extract elements & classes
  fetch('https://timmit147.github.io/cms-js/template.html')
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      templateElements = ['section', 'header', 'footer'].flatMap(t => Array.from(doc.querySelectorAll(t)));
      uniqueClasses = [...new Set(templateElements.map(e => e.className.trim()).filter(c => c))];

      // After loading template, attach event listeners
      document.querySelectorAll('section, header, footer').forEach(el => {
        el.addEventListener('click', e => {
          e.stopPropagation();
          current = el;
          renderEdit(menu, current, templateElements, uniqueClasses);
        });
      });
    })
    .catch(() => alert('Failed to load template.'));

});

function createMenu() {
  const div = document.createElement('div');
  div.id = 'optionsMenu';
  div.classList.add('options-menu', 'hidden');
  return div;
}

function btn(label, onClick, classes = ['button']) {
  const b = document.createElement('button');
  b.textContent = label;
  b.classList.add(...classes);
  b.onclick = onClick;
  return b;
}

const show = m => { m.classList.remove('hidden'); m.style.display = 'flex'; };
const hide = m => { m.classList.add('hidden'); m.style.display = 'none'; };

function renderEdit(menu, current, templateElements, uniqueClasses) {
  menu.innerHTML = '';
  show(menu);

  const wrapper = document.createElement('div');
  wrapper.className = 'edit-screen-wrapper';

  wrapper.appendChild(classSelector(menu, current, templateElements, uniqueClasses));
  editElems(current, wrapper);

  menu.appendChild(wrapper);
  menu.appendChild(btn('❌ Close', () => hide(menu)));
}

function classSelector(menu, current, templateElements, uniqueClasses) {
  const wrap = document.createElement('div');
  wrap.className = 'class-select-wrapper';

  const label = document.createElement('label');
  label.textContent = 'Select Element Class:';
  label.className = 'select-label';
  wrap.appendChild(label);

  const select = document.createElement('select');
  select.className = 'select-element';
  wrap.appendChild(select);

  uniqueClasses.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = cls;
    select.appendChild(opt);
  });

  const addBtn = btn('➕ Add Below', () => addBelow(select.value, current, menu, templateElements));
  const removeBtn = btn('🗑 Remove Element', () => {
    if (current) {
      current.remove();
      hide(menu);
    }
  });
  const moveDownBtn = btn('⬇ Move Element Down', () => {
    if (current?.nextElementSibling)
      current.parentNode.insertBefore(current.nextElementSibling, current);
    hide(menu);
  });

  wrap.append(addBtn, removeBtn, moveDownBtn);

  return wrap;
}

function addBelow(cls, current, menu, templateElements) {
  if (!cls || !current) return;
  const found = templateElements.find(el => el.classList.contains(cls));
  if (found) {
    const clone = found.cloneNode(true);
    current.insertAdjacentElement('afterend', clone);
    clone.addEventListener('click', e => {
      e.stopPropagation();
      current = clone;
      renderEdit(menu, current, templateElements, [...new Set(templateElements.map(e => e.className.trim()).filter(c => c))]);
    });
  } else {
    alert('Matching element not found.');
  }
  hide(menu);
}

function editElems(el, container) {
  const tags = ['h1','h2','h3','h4','h5','h6','p','span','a','img','ul'];
  Array.from(el.children).forEach(child => {
    const tag = child.tagName.toLowerCase();
    if (!tags.includes(tag)) {
      if (child.children.length) editElems(child, container);
      return;
    }
    if (tag === 'ul') return editList(child, container);
    editSimple(child, tag, container);
  });
}

function editList(list, container) {
  const wrap = document.createElement('div');
  wrap.className = 'editable-wrapper';
  const label = document.createElement('label');
  label.className = 'editable-label';
  label.textContent = 'List Items:';
  wrap.appendChild(label);

  const renderItems = () => {
    wrap.querySelectorAll('.li-wrapper').forEach(el => el.remove());
    Array.from(list.children).filter(li => li.tagName.toLowerCase() === 'li').forEach(li => {
      const liWrap = document.createElement('div');
      liWrap.className = 'li-wrapper li-wrapper-style';
      editElems(li, liWrap);

      const remBtn = btn('🗑', () => {
        if (list.children.length <= 1) return alert('At least one list item required.');
        li.remove();
        renderItems();
      }, ['remove-button']);

      liWrap.appendChild(remBtn);
      wrap.appendChild(liWrap);
    });
  };
  renderItems();

  const addBtn = btn('➕ Add List Item', () => {
    const newLi = document.createElement('li');
    newLi.innerHTML = '<h3>New Title</h3><p>New description text.</p>';
    list.appendChild(newLi);
    renderItems();
  }, ['add-button']);
  wrap.appendChild(addBtn);

  container.appendChild(wrap);
}

function editSimple(el, tag, container) {
  const wrap = document.createElement('div');
  wrap.className = 'editable-wrapper';

  const label = document.createElement('label');
  label.className = 'editable-label';

  const appendEditable = (text) => {
    label.textContent = text;
    wrap.appendChild(label);
    wrap.appendChild(createEditable(el));
  };

  if (['h1','h2','h3','h4','h5','h6'].includes(tag)) appendEditable('Heading Text:');
  else if (tag === 'p') appendEditable('Paragraph Text:');
  else if (tag === 'span') appendEditable('Inline Text:');
  else if (tag === 'a') {
    label.textContent = 'Link Text:';
    const editable = createEditable(el);
    const hrefLabel = document.createElement('label');
    hrefLabel.className = 'editable-label';
    hrefLabel.textContent = 'Link URL:';

    const hrefInput = document.createElement('input');
    hrefInput.type = 'text';
    hrefInput.value = el.href;
    hrefInput.placeholder = 'https://example.com';
    hrefInput.className = 'input-text';
    hrefInput.addEventListener('input', () => el.href = hrefInput.value);

    wrap.append(label, editable, hrefLabel, hrefInput);
  } else if (tag === 'img') {
    label.textContent = 'Image Source:';
    const srcInput = document.createElement('input');
    srcInput.type = 'text';
    srcInput.value = el.src;
    srcInput.className = 'input-text';
    srcInput.addEventListener('input', () => el.src = srcInput.value);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'file-input';
    fileInput.addEventListener('change', e => {
      const reader = new FileReader();
      reader.onload = ev => {
        el.src = ev.target.result;
        srcInput.value = ev.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    });

    wrap.append(label, srcInput, fileInput);
  }

  container.appendChild(wrap);
}

function createEditable(el) {
  // Create container
  const container = document.createElement('div');
  container.className = 'editable-container';

  // Create toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'editable-toolbar';

  // Editable content area
  const editableDiv = document.createElement('div');
  editableDiv.contentEditable = true;
  editableDiv.className = 'editable-content';
  editableDiv.innerHTML = el.innerHTML;

  // Update original element on input
  editableDiv.addEventListener('input', () => {
    el.innerHTML = editableDiv.innerHTML;
  });

  // Helper function to create toolbar buttons
  function createToolBtn(label, command) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = 'tool-btn';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      editableDiv.focus();

      if (command === 'createLink') {
        const url = prompt('Enter the URL:', 'https://');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else {
        document.execCommand(command, false, null);
      }
    });

    return btn;
  }

  // Add toolbar buttons
  toolbar.appendChild(createToolBtn('B', 'bold'));
  toolbar.appendChild(createToolBtn('I', 'italic'));
  toolbar.appendChild(createToolBtn('U', 'underline'));
  toolbar.appendChild(createToolBtn('🔗', 'createLink'));

  // Assemble everything
  container.appendChild(toolbar);
  container.appendChild(editableDiv);

  return container;
}

