document.addEventListener("DOMContentLoaded", function () {
    let isEditingEnabled = false;

    function checkHash() {
        switch (window.location.hash) {
            case '#edit':
                alert("Edit mode enabled");
                // Refresh the page content from the server, then enable editing.
                refreshOriginalContent(function() {
                    // After rewriting the document, a short delay allows the new DOM to load.
                    setTimeout(() => {
                        // Reinitialize editing mode.
                        toggleEditing(true);
                    }, 100);
                });
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
        // Disable editing before capturing HTML.
        toggleEditing(false);

        const GITHUB_TOKEN = prompt("Please enter your GitHub token:");

        if (!GITHUB_TOKEN) {
            alert("GitHub token is required to publish changes.");
            updateUrlWithoutHash();
            return;
        }

        // Get the updated HTML after disabling editing.
        const updatedContent = document.documentElement.innerHTML;
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
                    content: btoa(updatedContent),
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

        elements.forEach(element => {
            if (element.children.length === 0 && element.innerText.trim()) {
                if (isEditingEnabled) {
                    element.setAttribute("contenteditable", "true");
                } else {
                    element.removeAttribute("contenteditable");
                }
            }
        });

        updateUrlWithoutHash();
    }

    function updateUrlWithoutHash() {
        let url = window.location.href;
        url = url.replace(/#(edit|push)$/, '');
        window.history.replaceState({}, document.title, url);
    }

    // This function fetches the original HTML from the server and replaces the current document.
    function refreshOriginalContent(callback) {
        const url = window.location.href.split('#')[0]; // Remove any hash
        fetch(url)
            .then(response => response.text())
            .then(html => {
                // Replace the entire document content.
                document.open();
                document.write(html);
                document.close();
                if (callback) callback();
            })
            .catch(error => console.error("Failed to fetch original content:", error));
    }

    window.addEventListener('beforeunload', function (event) {
        if (isEditingEnabled) {
            const confirmationMessage = 'You have unsaved changes. Are you sure you want to leave?';
            event.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });
});
