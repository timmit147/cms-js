document.addEventListener("DOMContentLoaded", async function () {
    const GITHUB_REPO = 'cms-js';
    const GITHUB_OWNER = 'timmit147';
    const STORAGE_KEY = 'editable-content'; // Store edits locally or on GitHub
    let originalHTML = '';

    function checkHash() {
        switch (window.location.hash) {
            case '#edit':
                alert("Edit mode enabled");
                toggleEditing(true);
                break;
            case '#push':
                if (originalHTML) {
                    publishChanges();
                } else {
                    alert("Error: Original HTML not loaded.");
                }
                break;
        }
    }

    window.addEventListener('hashchange', checkHash);

    let fileName = window.location.pathname.split('/').pop() || 'index.html';

    async function fetchOriginalHTML() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${fileName}`);
            if (!response.ok) throw new Error('Failed to fetch HTML');
            originalHTML = await response.text();
            restoreEdits();
            checkHash();
        } catch (error) {
            console.error("Error fetching original HTML:", error);
        }
    }

    fetchOriginalHTML();

    function publishChanges() {
        toggleEditing(false);
        const GITHUB_TOKEN = prompt("Enter your GitHub token:");
        if (!GITHUB_TOKEN) {
            alert("GitHub token required!");
            updateUrlWithoutHash();
            return;
        }

        let edits = getEditedContent();
        if (Object.keys(edits).length === 0) {
            alert("No changes detected.");
            updateUrlWithoutHash();
            return;
        }

        fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/edits.json`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
        })
        .then(response => response.ok ? response.json() : { sha: null }) // Handle missing file
        .then(data => {
            const sha = data.sha;
            return fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/edits.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Updated editable content',
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(edits, null, 2)))), // Save edits as JSON
                    sha: sha,
                })
            });
        })
        .then(() => {
            alert("Changes published to GitHub!");
            updateUrlWithoutHash();
        })
        .catch(error => {
            console.error('Publishing failed:', error);
            alert("Error publishing content.");
            updateUrlWithoutHash();
        });
    }

    function toggleEditing(enable) {
        document.querySelectorAll('*').forEach((element, index) => {
            if (element.children.length === 0 && element.innerText.trim()) {
                if (enable) {
                    element.setAttribute("contenteditable", "true");
                    element.setAttribute("data-id", index);
                } else {
                    element.removeAttribute("contenteditable");
                    element.removeAttribute("data-id");
                }
            }
        });
    }

    function getEditedContent() {
        let edits = {};
        document.querySelectorAll('[contenteditable="true"]').forEach(editedElement => {
            if (editedElement.dataset.id) {
                edits[editedElement.dataset.id] = editedElement.innerHTML;
            }
        });
        return edits;
    }

    function restoreEdits() {
        fetch(`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/edits.json`)
            .then(response => response.ok ? response.json() : {})
            .then(edits => {
                document.querySelectorAll('*').forEach((element, index) => {
                    if (edits[index]) {
                        element.innerHTML = edits[index];
                    }
                });
            })
            .catch(error => console.warn("No previous edits found:", error));
    }

    function updateUrlWithoutHash() {
        let url = window.location.href.replace(/#(edit|push)$/, '');
        window.history.replaceState({}, document.title, url);
    }
});
