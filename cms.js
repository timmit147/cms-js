
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
    `;
    btn.onclick = onClick;
    return btn;
  };

  const renderEditScreen = () => {
    menu.innerHTML = '';
    menu.style.display = 'flex';

    const wrapper = document.createElement('div');
    wrapper.style = 'width: 90%; margin-bottom: 2rem;';

    const classSelectWrapper = document.createElement('div');
    classSelectWrapper.style = 'margin-bottom: 1rem;';

    const classSelectLabel = document.createElement('label');
    classSelectLabel.textContent = 'Select Section Class:';
    classSelectLabel.style = 'font-weight: bold;';
    classSelectWrapper.appendChild(classSelectLabel);

    const classSelect = document.createElement('select');
    classSelect.style = 'width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ccc;';
    classSelectWrapper.appendChild(classSelect);
    wrapper.appendChild(classSelectWrapper);

    // ➕ Add Section Below
    const addSectionBtn = createButton('➕ Add Section Below', () => {
      const selectedClass = classSelect.value;
      if (!selectedClass) return;

      fetch('https://timmit147.github.io/templates/')
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const matchingSection = Array.from(doc.querySelectorAll('section'))
            .find(section => section.classList.contains(selectedClass));

          if (matchingSection && currentSection) {
            const clonedSection = matchingSection.cloneNode(true);
            currentSection.insertAdjacentElement('afterend', clonedSection);
            clonedSection.addEventListener('click', e => {
              e.stopPropagation();
              currentSection = clonedSection;
              renderEditScreen();
            });
          } else {
            alert('Matching section not found.');
          }

          menu.style.display = 'none'; // auto-close
        })
        .catch(error => {
          console.error('Failed to add section:', error);
          menu.style.display = 'none';
        });
    });
    classSelectWrapper.appendChild(addSectionBtn);

    // 🗑 Remove
    const removeBtn = createButton('🗑 Remove Section', () => {
      if (currentSection) {
        currentSection.remove();
        currentSection = null;
      }
      menu.style.display = 'none';
    });
    classSelectWrapper.appendChild(removeBtn);

    // ⬇ Move Down
    const moveDownBtn = createButton('⬇ Move Section Down', () => {
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
        const sections = doc.querySelectorAll('section');

        const classNames = Array.from(sections)
          .map(section => section.className.trim())
          .filter(name => name !== "");

        [...new Set(classNames)].forEach(cls => {
          const option = document.createElement('option');
          option.value = cls;
          option.textContent = cls;
          classSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Failed to fetch templates:', error));

    // Label
    const label = document.createElement('p');
    label.textContent = `Editing Section: ${currentSection ? currentSection.tagName.toLowerCase() : 'none'}`;
    label.style = 'font-weight: bold; margin-bottom: 0.5rem;';
    wrapper.appendChild(label);

    // Toolbar
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

    // Editable content
    Array.from(currentSection.children).forEach((childElement, index) => {
      const fieldWrapper = document.createElement('div');
      fieldWrapper.style = 'margin-bottom: 1rem;';

      if (childElement.tagName === 'A') {
        const editable = document.createElement('div');
        editable.contentEditable = true;
        editable.innerHTML = childElement.innerHTML;
        editable.style = 'width: 100%; padding: 0.5rem; border: 1px solid #ccc;';
        editable.addEventListener('input', () => {
          childElement.innerHTML = editable.innerHTML;
        });

        const hrefInput = document.createElement('input');
        hrefInput.type = 'text';
        hrefInput.value = childElement.href;
        hrefInput.placeholder = 'URL (href)';
        hrefInput.style = 'width: 100%; margin-top: 0.5rem; padding: 0.5rem;';
        hrefInput.addEventListener('input', () => {
          childElement.href = hrefInput.value;
        });

        const targetSelect = document.createElement('select');
        ['_self', '_blank', '_parent', '_top'].forEach(t => {
          const opt = document.createElement('option');
          opt.value = t;
          opt.textContent = t;
          if (childElement.target === t) opt.selected = true;
          targetSelect.appendChild(opt);
        });
        targetSelect.addEventListener('change', () => {
          childElement.target = targetSelect.value;
        });

        fieldWrapper.appendChild(editable);
        fieldWrapper.appendChild(hrefInput);
        fieldWrapper.appendChild(targetSelect);
      } else if (childElement.tagName === 'IMG') {
        const altInput = document.createElement('input');
        altInput.type = 'text';
        altInput.value = childElement.alt;
        altInput.placeholder = 'Alt text';
        altInput.style = 'width: 100%; margin-bottom: 0.5rem; padding: 0.5rem;';
        altInput.addEventListener('input', () => {
          childElement.alt = altInput.value;
        });

        const srcInput = document.createElement('input');
        srcInput.type = 'text';
        srcInput.value = childElement.src;
        srcInput.placeholder = 'Image src';
        srcInput.style = 'width: 100%; margin-bottom: 0.5rem; padding: 0.5rem;';
        srcInput.addEventListener('input', () => {
          childElement.src = srcInput.value;
        });

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', (e) => {
          const reader = new FileReader();
          reader.onload = ev => {
            childElement.src = ev.target.result;
            srcInput.value = ev.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
        });

        fieldWrapper.appendChild(altInput);
        fieldWrapper.appendChild(srcInput);
        fieldWrapper.appendChild(fileInput);
      } else {
        const editable = document.createElement('div');
        editable.contentEditable = true;
        editable.innerHTML = childElement.innerHTML;
        editable.style = 'width: 100%; padding: 0.5rem; border: 1px solid #ccc;';
        editable.addEventListener('input', () => {
          childElement.innerHTML = editable.innerHTML;
        });
        fieldWrapper.appendChild(editable);
      }

      wrapper.appendChild(fieldWrapper);
    });

    menu.appendChild(wrapper);

    // ❌ Close button only
    const closeBtn = createButton('❌ Close', () => {
      menu.style.display = 'none';
    });
    menu.appendChild(closeBtn);
  };

  // Make all sections editable on click
  document.querySelectorAll('section').forEach(section => {
    section.addEventListener('click', e => {
      e.stopPropagation();
      currentSection = section;
      renderEditScreen();
    });
  });

  // Click outside to close
  document.addEventListener('click', e => {
    if (e.target.id === 'optionsMenu') {
      menu.style.display = 'none';
    }
  });
});

