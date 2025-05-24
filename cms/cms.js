document.addEventListener('DOMContentLoaded', () => {
  const menu = createMenu();
  document.body.appendChild(menu);

  let current = null;
  let templateElements = [];
  let uniqueClasses = [];

  fetch('https://timmit147.github.io/cms-js/template.html')
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      templateElements = ['section', 'header', 'footer'].flatMap(t => Array.from(doc.querySelectorAll(t)));
      uniqueClasses = [...new Set(templateElements.map(e => e.className.trim()).filter(c => c))];

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

const show = m => { m.classList.remove('hidden'); m.style.display = 'flex'; };
const hide = m => { m.classList.add('hidden'); m.style.display = 'none'; };

function renderEdit(menu, current, templateElements, uniqueClasses) {
  menu.innerHTML = '';
  show(menu);

  const wrapper = document.createElement('div');
  wrapper.className = 'edit-screen-wrapper';

  const buttonsWrapper = document.createElement('div');
  buttonsWrapper.className = 'buttons-wrapper';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add block';
  addBtn.addEventListener('click', () => showAddBlockMenu(menu, current, templateElements));

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove block';
  removeBtn.addEventListener('click', () => {
    if (current) {
      current.remove();
      hide(menu);
    }
  });

  const moveDownBtn = document.createElement('button');
  moveDownBtn.textContent = 'Move block down';
  moveDownBtn.addEventListener('click', () => {
    if (current?.nextElementSibling)
      current.parentNode.insertBefore(current.nextElementSibling, current);
    hide(menu);
  });

  buttonsWrapper.append(addBtn, removeBtn, moveDownBtn);

  // Add class "button" to all buttons inside buttonsWrapper
  Array.from(buttonsWrapper.querySelectorAll('button')).forEach(btn => btn.classList.add('button'));

  wrapper.appendChild(buttonsWrapper);

  editElems(current, wrapper);
  menu.appendChild(wrapper);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.classList.add('close');
  closeBtn.addEventListener('click', () => hide(menu));
  menu.appendChild(closeBtn);
}

// Show custom block selection menu with different items, not from classes
function showAddBlockMenu(menu, current, templateElements) {
  menu.innerHTML = '';
  show(menu);

  const backBtn = document.createElement('button');
  backBtn.textContent = 'Go Back';
  backBtn.className = 'back-btn';
  backBtn.addEventListener('click', () => {
    const uniqueClasses = [...new Set(templateElements.map(e => e.className.trim()).filter(c => c))];
    renderEdit(menu, current, templateElements, uniqueClasses);
  });

  const container = document.createElement('div');
  container.className = 'add-block-selector';

  const title = document.createElement('h3');
  title.textContent = 'Select a block to add below:';
  container.appendChild(title);

  // Use actual classes from the template to create buttons
  const uniqueClasses = [...new Set(templateElements.map(e => e.className.trim()).filter(c => c))];

  if (uniqueClasses.length === 0) {
    const noBlocksMsg = document.createElement('p');
    noBlocksMsg.textContent = 'No blocks found in template.';
    container.appendChild(noBlocksMsg);
  } else {
    uniqueClasses.forEach(cls => {
      const blockBtn = document.createElement('button');
      blockBtn.textContent = cls || '(no class)';
      blockBtn.className = 'block-option-btn';
      blockBtn.addEventListener('click', () => {
        addBelowByClass(cls, current, menu, templateElements);
      });
      container.appendChild(blockBtn);
    });
  }

  menu.appendChild(container);
  menu.appendChild(backBtn);
}


function addBelowByClass(cls, current, menu, templateElements) {
  if (!cls || !current) return;
  const found = templateElements.find(el => el.classList.contains(cls));
  if (found) {
    const clone = found.cloneNode(true);
    current.insertAdjacentElement('afterend', clone);
    clone.addEventListener('click', e => {
      e.stopPropagation();
      current = clone;
      const uniqueClasses = [...new Set(templateElements.map(e => e.className.trim()).filter(c => c))];
      renderEdit(menu, current, templateElements, uniqueClasses);
    });
  } else {
    alert(`Block with class "${cls}" not found in template.`);
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

      const remBtn = document.createElement('button');
      remBtn.textContent = 'Remove Item';
      remBtn.className = 'remove-button';
      remBtn.addEventListener('click', () => {
        if (list.children.length <= 1) return alert('At least one list item required.');
        li.remove();
        renderItems();
      });

      liWrap.appendChild(remBtn);
      wrap.appendChild(liWrap);
    });
  };
  renderItems();

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add List Item';
  addBtn.className = 'add-button';
  addBtn.addEventListener('click', () => {
    const newLi = document.createElement('li');
    newLi.innerHTML = '<h3>New Title</h3><p>New description text.</p>';
    list.appendChild(newLi);
    renderItems();
  });
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
  const container = document.createElement('div');
  container.className = 'editable-container';

  const toolbar = document.createElement('div');
  toolbar.className = 'editable-toolbar';

  const editableDiv = document.createElement('div');
  editableDiv.contentEditable = true;
  editableDiv.className = 'editable-content';
  editableDiv.innerHTML = el.innerHTML;

  editableDiv.addEventListener('input', () => {
    el.innerHTML = editableDiv.innerHTML;
  });

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

  toolbar.appendChild(createToolBtn('Bold', 'bold'));
  toolbar.appendChild(createToolBtn('Italic', 'italic'));
  toolbar.appendChild(createToolBtn('Underline', 'underline'));
  toolbar.appendChild(createToolBtn('Link', 'createLink'));

  container.append(toolbar, editableDiv);
  return container;
}
