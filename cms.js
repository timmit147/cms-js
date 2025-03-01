document.addEventListener("DOMContentLoaded", function () {
    let isEditingEnabled = false;

    function checkHash() {
        switch (window.location.hash) {
            case '#edit':
                alert("Edit mode enabled");
                toggleEditing(true);
                break;
            case '#push':
                if (isEditingEnabled) {
                    publishChanges();
                } else {
                    alert("You must enable edit mode first.");
                }
                break;
        }
    }

    window.addEventListener('hashchange', checkHash);
    checkHash();

    const GITHUB_REPO = 'cms-js';
    const GITHUB_OWNER = 'timmit147';

    function publishChanges() {
        toggleEditing(false); // Disable editing before capturing the HTML

        const GITHUB_TOKEN = prompt("Please enter your GitHub token:");
        if (!GITHUB_TOKEN) {
            alert("GitHub token is required to publish changes.");
            updateUrlWithoutHash();
            return;
        }

        // Get the full updated HTML document with only edited content replaced
        const updatedHTML = getUpdatedHTML();

        const documentUrl = document.documentURI;
        let fileName = documentUrl.substring(documentUrl.lastIndexOf('/') + 1);
        
        if (!fileName || fileName === '/') {
            fileName = 'index.html';
        } else if (!fileName.includes('.')) {
            fileName += '.html';
        }

        fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            const sha = data.sha;
            return fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update HTML content',
                    content: btoa(unescape(encodeURIComponent(updatedHTML))), // Encode properly for GitHub
                    sha: sha,
                })
            });
        })
        .then(() => {
            alert("Content published to GitHub!");
            updateUrlWithoutHash();
        })
        .catch(error => {
            console.error('Error publishing content:', error);
            alert("Failed to publish content.");
            updateUrlWithoutHash();
        });
    }

    function toggleEditing(enable) {
        const elements = document.querySelectorAll('*');
        isEditingEnabled = enable;

        elements.forEach((element, index) => {
            if (element.children.length === 0 && element.innerText.trim()) {
                if (isEditingEnabled) {
                    element.setAttribute("contenteditable", "true");
                    element.setAttribute("data-id", index); // Assign a unique ID
                } else {
                    element.removeAttribute("contenteditable");
                    element.removeAttribute("data-id"); // Clean up when disabling
                }
            }
        });

        updateUrlWithoutHash();
    }

    function getUpdatedHTML() {
        // Clone the current HTML document
        const clonedDocument = document.documentElement.cloneNode(true);

        // Get all contenteditable elements in the original document
        const editableElements = document.querySelectorAll('[contenteditable="true"]');

        editableElements.forEach(originalElement => {
            // Find the same element in the cloned document
            const clonedElement = clonedDocument.querySelector(`[contenteditable="true"][data-id="${originalElement.dataset.id}"]`);
            
            if (clonedElement) {
                clonedElement.innerHTML = originalElement.innerHTML; // Update content in clone
            }
        });

        // Return the full updated HTML
        return "<!DOCTYPE html>\n" + clonedDocument.outerHTML;
    }

    function updateUrlWithoutHash() {
        let url = window.location.href;
        url = url.replace(/#(edit|push)$/, '');
        window.history.replaceState({}, document.title, url);
    }

    window.addEventListener('beforeunload', function (event) {
        if (isEditingEnabled) {
            const confirmationMessage = 'You have unsaved changes. Are you sure you want to leave?';
            event.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });
});
