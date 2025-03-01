document.addEventListener("DOMContentLoaded", async function () {
    const GITHUB_REPO = 'cms-js';
    const GITHUB_OWNER = 'timmit147';
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

    // Get current file name
    let fileName = window.location.pathname.split('/').pop() || 'index.html';

    // Fetch the raw HTML from GitHub
    async function fetchOriginalHTML() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${fileName}`);
            if (!response.ok) throw new Error('Failed to fetch HTML');
            originalHTML = await response.text();
            checkHash();
        } catch (error) {
            console.error("Error fetching original HTML:", error);
        }
    }

    fetchOriginalHTML();

    function publishChanges() {
        toggleEditing(false); // Disable editing before saving

        const GITHUB_TOKEN = prompt("Enter your GitHub token:");
        if (!GITHUB_TOKEN) {
            alert("GitHub token required!");
            updateUrlWithoutHash();
            return;
        }

        // Get the updated HTML content
        const updatedHTML = getUpdatedHTML();

        fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
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
                    message: 'Updated editable content',
                    content: btoa(unescape(encodeURIComponent(updatedHTML))), // Encode properly for GitHub
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
        const elements = document.querySelectorAll('*');
        elements.forEach((element, index) => {
            if (element.children.length === 0 && element.innerText.trim()) {
                if (enable) {
                    element.setAttribute("contenteditable", "true");
                    element.setAttribute("data-id", index); // Unique ID for mapping
                } else {
                    element.removeAttribute("contenteditable");
                    element.removeAttribute("data-id");
                }
            }
        });
    }

    function getUpdatedHTML() {
        let parser = new DOMParser();
        let doc = parser.parseFromString(originalHTML, "text/html");

        document.querySelectorAll('[contenteditable="true"]').forEach(editedElement => {
            let originalElement = doc.querySelector(`[data-id="${editedElement.dataset.id}"]`);
            if (originalElement) {
                originalElement.innerHTML = editedElement.innerHTML; // Replace with edited content
            }
        });

        return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    }

    function updateUrlWithoutHash() {
        let url = window.location.href.replace(/#(edit|push)$/, '');
        window.history.replaceState({}, document.title, url);
    }
});
