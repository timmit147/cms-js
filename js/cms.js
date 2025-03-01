document.addEventListener("DOMContentLoaded", function () {
    let isEditingEnabled = false;

    function checkHash() {
        switch (window.location.hash) {
            case '#edit':
                alert("Edit mode enabled");
                toggleEditing(true);
                break;
            case '#push':
                publishChanges();
                break;
            case '#view':
                alert("Edit mode disabled");
                toggleEditing(false);
                break;
        }
    }

    window.addEventListener('hashchange', checkHash);
    checkHash();  // Initial check when the page loads

    const GITHUB_REPO = 'cms-js';
    const GITHUB_OWNER = 'timmit147';
    const FILE_PATH = 'index.html';

    function publishChanges() {
        const GITHUB_TOKEN = prompt("Please enter your GitHub token:");

        if (!GITHUB_TOKEN) {
            alert("GitHub token is required to publish changes.");
            updateUrlWithoutHash();
            return;
        }

        const updatedContent = document.documentElement.innerHTML; // Get the entire HTML content

        fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            const sha = data.sha;
            return fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
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
            toggleEditing(false);  // Disable editing after publishing
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
                element.setAttribute("contenteditable", isEditingEnabled ? "true" : "false");
            }
        });

        // Clean up URL by removing hash
        updateUrlWithoutHash();
    }

    function updateUrlWithoutHash() {
        let url = window.location.href;
        url = url.replace(/#(edit|view|push)$/, ''); // Removes hash
        window.history.replaceState({}, document.title, url); // Replace the URL without the hash
    }
});
