document.addEventListener('DOMContentLoaded', () => {
  const menu = document.createElement('div');
  menu.id = 'optionsMenu';
  menu.classList.add('options-menu');

  document.body.appendChild(menu);

  let currentSection = null;

  const createButton = (label, onClick) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.classList.add('button');

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
      wrapper.classList.add('editable-wrapper');  // replace inline margin-bottom

      const label = document.createElement('label');
      label.classList.add('editable-label'); // replace inline display, font-weight, margin-bottom

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
            liWrapper.classList.add('li-wrapper-style'); // for margin, padding, border from original inline style

            // Sub-elements of <li> (like <h3>, <p>) rendered individually
            processEditableElements(li, liWrapper);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = '🗑';
            removeBtn.classList.add('remove-button');

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
        addBtn.classList.add('add-button');
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
      editable.classList.add('editable-content'); // replace inline width, padding, border

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
        linkLabel.classList.add('editable-label');

        editable.innerHTML = childElement.innerHTML;
        editable.addEventListener('input', () => {
          childElement.innerHTML = editable.innerHTML;
        });

        const hrefLabel = document.createElement('label');
        hrefLabel.textContent = 'Link URL:';
        hrefLabel.classList.add('editable-label');

        const hrefInput = document.createElement('input');
        hrefInput.type = 'text';
        hrefInput.value = childElement.href;
        hrefInput.placeholder = 'https://example.com';
        hrefInput.classList.add('input-text');
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
        srcLabel.classList.add('editable-label');

        const srcInput = document.createElement('input');
        srcInput.type = 'text';
        srcInput.value = childElement.src;
        srcInput.classList.add('input-text');
        srcInput.addEventListener('input', () => {
          childElement.src = srcInput.value;
        });

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.classList.add('file-input');
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
    wrapper.classList.add('edit-screen-wrapper'); // for width and margin

    const classSelectWrapper = document.createElement('div');
    classSelectWrapper.classList.add('class-select-wrapper'); // for margin bottom

    const classSelectLabel = document.createElement('label');
    classSelectLabel.textContent = 'Select Element Class:';
    classSelectLabel.classList.add('select-label'); // for font weight
    classSelectWrapper.appendChild(classSelectLabel);

    const classSelect = document.createElement('select');
    classSelect.classList.add('select-element'); // for width, padding, margin-top, border
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
    fetch('https://timmit147.github.io/cms-js/template.html')
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

const editHeaderDiv = document.createElement('div');
editHeaderDiv.classList.add('edit-header'); // for styling the container div

const label = document.createElement('p');
label.textContent = `Editing Element: ${currentSection ? currentSection.tagName.toLowerCase() : 'none'}`;
label.classList.add('editing-label'); // font-weight and margin bottom
editHeaderDiv.appendChild(label);

const toolbar = document.createElement('div');
toolbar.classList.add('toolbar'); // margin-bottom, display flex, gap, flex-wrap
toolbar.appendChild(createButton('Bold', () => document.execCommand('bold')));
toolbar.appendChild(createButton('Italic', () => document.execCommand('italic')));
toolbar.appendChild(createButton('Underline', () => document.execCommand('underline')));
toolbar.appendChild(createButton('Link', () => {
  const url = prompt('Enter URL:');
  if (url) document.execCommand('createLink', false, url);
}));
editHeaderDiv.appendChild(toolbar);

wrapper.appendChild(editHeaderDiv);

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
