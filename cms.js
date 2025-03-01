document.addEventListener("DOMContentLoaded", function () {
    let isEditingEnabled = false;
    let originalContent = {};

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

    function saveOriginalContent() {
        document.querySelectorAll('[contenteditable="true"]').forEach(element => {
            originalContent[element.dataset.id] = element.innerHTML;
        });
    }

    function getEditedContent() {
        let edits = {};
        document.querySelectorAll('[contenteditable="true"]').forEach(element => {
            if (originalContent[element.dataset.id] !== element.innerHTML) {
                edits[element.dataset.id] = element.innerHTML;
            }
        });

        return edits;
    }

    function publishChanges() {
        toggleEditing(false);

        const GITHUB_TOKEN = prompt("Please enter your GitHub token:");

        if (!GITHUB_TOKEN) {
            alert("GitHub token is required to publish changes.");
            updateUrlWithoutHash();
            return;
        }

        let edits = getEditedContent();

        if (Object.keys(edits).length === 0) {
            alert("No changes detected.");
            return;
        }

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

            let updatedHtml = document.documentElement.innerHTML;
            Object.keys(edits).forEach(id => {
                let el = document.querySelector(`[data-id="${id}"]`);
                if (el) {
                    updatedHtml = updatedHtml.replace(originalContent[id], edits[id]);
                }
            });

            return fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update edited content',
                    content: btoa(updatedHtml),
                    sha: sha,
                })
            });
        })
        .then(() => {
            alert("Changes published to GitHub!");
            updateUrlWithoutHash();
        })
        .catch(error => {
            console.error('Error publishing content:', error);
            alert("Failed to publish content.");
            updateUrlWithoutHash();
        });
    }

    function toggleEditing(enable) {
        isEditingEnabled = enable;

        document.querySelectorAll('[contenteditable="true"]').forEach(element => {
            if (enable) {
                element.setAttribute("contenteditable", "true");
            } else {
                element.removeAttribute("contenteditable");
            }
        });

        if (enable) saveOriginalContent();
        updateUrlWithoutHash();
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
