document.addEventListener('DOMContentLoaded', () => {
  const menu = document.createElement('div');
  menu.id = 'optionsMenu';
  Object.assign(menu.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    background: 'white',
    display: 'none',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: '9999',
    padding: '2rem',
    boxSizing: 'border-box',
    overflowY: 'auto',
    justifyContent: 'flex-start',
  });
  document.body.appendChild(menu);

  let currentSection = null;

  const createButton = (label, onClick) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style = `
      margin: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      background: black;
      color: white;
      border: none;
      border-radius: 5px;
    `;
    btn.onclick = onClick;
    return btn;
  };

const processEditableElements = (element, parentWrapper) => {
  Array.from(element.children).forEach((childElement) => {
    const tag = childElement.tagName.toLowerCase();
    const editableTags = ['h1','h2','h3','h4','h5','h6','p','span','a','img','ul'];

    if (!editableTags.includes(tag)) {
      if (childElement.children.length > 0) {
        processEditableElements(childElement, parentWrapper);
      }
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.style = 'margin-bottom: 1.5rem;';

    const label = document.createElement('label');
    label.style = 'display: block; font-weight: bold; margin-bottom: 0.25rem;';

 if (tag === 'ul') {
  label.textContent = 'List Items:';
  wrapper.appendChild(label);

  const list = childElement;

  const renderListItems = () => {
    // Clear previously rendered items
    wrapper.querySelectorAll('.li-wrapper').forEach(el => el.remove());

    const items = Array.from(list.children).filter(li => li.tagName.toLowerCase() === 'li');

    items.forEach((li, i) => {
      const liWrapper = document.createElement('div');
      liWrapper.className = 'li-wrapper';
      liWrapper.style = 'margin-bottom: 1rem; padding: 0.5rem; border: 1px solid #ccc;';

      // Sub-elements of <li> (like <h3>, <p>) rendered individually
      processEditableElements(li, liWrapper);

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '🗑';
      removeBtn.style = `
        padding: 0.3rem 0.6rem;
        margin-top: 0.5rem;
        font-size: 1rem;
        background: black;
        color: white;
        cursor: pointer;
        border: none;
        border-radius: 4px;
      `;
      removeBtn.onclick = () => {
        if (list.children.length <= 1) {
          alert('You must have at least one list item.');
          return;
        }
        li.remove();
        renderListItems();
      };

      liWrapper.appendChild(removeBtn);
      wrapper.appendChild(liWrapper);
    });
  };

  renderListItems();

  const addBtn = document.createElement('button');
  addBtn.textContent = '➕ Add List Item';
  addBtn.style = `
    margin-top: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 1rem;
    cursor: pointer;
    background: black;
    color: white;
    border: none;
    border-radius: 4px;
  `;
  addBtn.onclick = () => {
    const newLi = document.createElement('li');
    const newH3 = document.createElement('h3');
    newH3.textContent = 'New Title';
    const newP = document.createElement('p');
    newP.textContent = 'New description text.';
    newLi.appendChild(newH3);
    newLi.appendChild(newP);
    list.appendChild(newLi);
    renderListItems();
  };

  wrapper.appendChild(addBtn);
  parentWrapper.appendChild(wrapper);
  return;
}


    const editable = document.createElement('div');
    editable.contentEditable = true;
    editable.style = 'width: 100%; padding: 0.5rem; border: 1px solid #ccc;';

    if (tag.startsWith('h')) {
      label.textContent = 'Heading Text:';
      editable.innerHTML = childElement.innerHTML;
      editable.addEventListener('input', () => {
        childElement.innerHTML = editable.innerHTML;
      });
      wrapper.appendChild(label);
      wrapper.appendChild(editable);

    } else if (tag === 'p') {
      label.textContent = 'Paragraph Text:';
      editable.innerHTML = childElement.innerHTML;
      editable.addEventListener('input', () => {
        childElement.innerHTML = editable.innerHTML;
      });
      wrapper.appendChild(label);
      wrapper.appendChild(editable);

    } else if (tag === 'span') {
      label.textContent = 'Inline Text:';
      editable.innerHTML = childElement.innerHTML;
      editable.addEventListener('input', () => {
        childElement.innerHTML = editable.innerHTML;
      });
      wrapper.appendChild(label);
      wrapper.appendChild(editable);

    } else if (tag === 'a') {
      const linkLabel = document.createElement('label');
      linkLabel.textContent = 'Link Text:';
      linkLabel.style = label.style;

      editable.innerHTML = childElement.innerHTML;
      editable.addEventListener('input', () => {
        childElement.innerHTML = editable.innerHTML;
      });

      const hrefLabel = document.createElement('label');
      hrefLabel.textContent = 'Link URL:';
      hrefLabel.style = label.style;

      const hrefInput = document.createElement('input');
      hrefInput.type = 'text';
      hrefInput.value = childElement.href;
      hrefInput.placeholder = 'https://example.com';
      hrefInput.style = 'width: 100%; padding: 0.5rem; margin-top: 0.25rem;';
      hrefInput.addEventListener('input', () => {
        childElement.href = hrefInput.value;
      });

      wrapper.appendChild(linkLabel);
      wrapper.appendChild(editable);
      wrapper.appendChild(hrefLabel);
      wrapper.appendChild(hrefInput);

    } else if (tag === 'img') {
      const srcLabel = document.createElement('label');
      srcLabel.textContent = 'Image Source:';
      srcLabel.style = label.style;

      const srcInput = document.createElement('input');
      srcInput.type = 'text';
      srcInput.value = childElement.src;
      srcInput.style = 'width: 100%; padding: 0.5rem;';
      srcInput.addEventListener('input', () => {
        childElement.src = srcInput.value;
      });

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style = 'margin-top: 0.5rem;';
      fileInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = ev => {
          childElement.src = ev.target.result;
          srcInput.value = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      });

      wrapper.appendChild(srcLabel);
      wrapper.appendChild(srcInput);
      wrapper.appendChild(fileInput);
    }

    parentWrapper.appendChild(wrapper);
  });
};


  const renderEditScreen = () => {
    menu.innerHTML = '';
    menu.style.display = 'flex';

    const wrapper = document.createElement('div');
    wrapper.style = 'width: 90%; margin-bottom: 2rem;';

    const classSelectWrapper = document.createElement('div');
    classSelectWrapper.style = 'margin-bottom: 1rem;';

    const classSelectLabel = document.createElement('label');
    classSelectLabel.textContent = 'Select Element Class:';
    classSelectLabel.style = 'font-weight: bold;';
    classSelectWrapper.appendChild(classSelectLabel);

    const classSelect = document.createElement('select');
    classSelect.style = 'width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ccc;';
    classSelectWrapper.appendChild(classSelect);
    wrapper.appendChild(classSelectWrapper);

    const addSectionBtn = createButton('➕ Add Below', () => {
      const selectedClass = classSelect.value;
      if (!selectedClass) return;

      fetch('https://timmit147.github.io/cms-js/template.html')
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const allElements = ['section', 'header', 'footer'].flatMap(tag =>
            Array.from(doc.querySelectorAll(tag))
          );
          const matchingElement = allElements.find(el => el.classList.contains(selectedClass));

          if (matchingElement && currentSection) {
            const cloned = matchingElement.cloneNode(true);
            currentSection.insertAdjacentElement('afterend', cloned);
            cloned.addEventListener('click', e => {
              e.stopPropagation();
              currentSection = cloned;
              renderEditScreen();
            });
          } else {
            alert('Matching element not found.');
          }

          menu.style.display = 'none';
        })
        .catch(error => {
          console.error('Failed to add element:', error);
          menu.style.display = 'none';
        });
    });
    classSelectWrapper.appendChild(addSectionBtn);

    const removeBtn = createButton('🗑 Remove Element', () => {
      if (currentSection) {
        currentSection.remove();
        currentSection = null;
      }
      menu.style.display = 'none';
    });
    classSelectWrapper.appendChild(removeBtn);

    const moveDownBtn = createButton('⬇ Move Element Down', () => {
      if (currentSection && currentSection.nextElementSibling) {
        currentSection.parentNode.insertBefore(currentSection.nextElementSibling, currentSection);
      }
      menu.style.display = 'none';
    });
    classSelectWrapper.appendChild(moveDownBtn);

    // Populate class dropdown
    fetch('https://timmit147.github.io/templates/')
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const allElements = ['section', 'header', 'footer'].flatMap(tag =>
          Array.from(doc.querySelectorAll(tag))
        );

        const classNames = Array.from(new Set(
          allElements.map(el => el.className.trim()).filter(name => name !== "")
        ));

        classNames.forEach(cls => {
          const option = document.createElement('option');
          option.value = cls;
          option.textContent = cls;
          classSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Failed to fetch templates:', error));

    const label = document.createElement('p');
    label.textContent = `Editing Element: ${currentSection ? currentSection.tagName.toLowerCase() : 'none'}`;
    label.style = 'font-weight: bold; margin-bottom: 0.5rem;';
    wrapper.appendChild(label);

    const toolbar = document.createElement('div');
    toolbar.style = 'margin-bottom: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;';
    toolbar.appendChild(createButton('Bold', () => document.execCommand('bold')));
    toolbar.appendChild(createButton('Italic', () => document.execCommand('italic')));
    toolbar.appendChild(createButton('Underline', () => document.execCommand('underline')));
    toolbar.appendChild(createButton('Link', () => {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    }));
    wrapper.appendChild(toolbar);

    processEditableElements(currentSection, wrapper);
    menu.appendChild(wrapper);

    const closeBtn = createButton('❌ Close', () => {
      menu.style.display = 'none';
    });
    menu.appendChild(closeBtn);
  };

  document.querySelectorAll('section, header, footer').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      currentSection = el;
      renderEditScreen();
    });
  });

  document.addEventListener('click', e => {
    if (e.target.id === 'optionsMenu') {
      menu.style.display = 'none';
    }
  });
});
