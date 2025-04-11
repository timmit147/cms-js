document.addEventListener("click", function(event) {
    const tag = event.target.tagName.toLowerCase();

    // Create the white full-screen div
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.style.userSelect = 'none';  // Disable selection

    // Close button (X) in the top-right corner
    const closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.textContent = "×";
    
    closeButton.addEventListener("click", function(event) {
        event.stopPropagation();
        document.body.removeChild(overlay);
    });

    overlay.appendChild(closeButton);

    // Handle text click (input field with update button)
    if (["h1", "h2", "h3", "p"].includes(tag)) {
        // Create the input field with the clicked text as its value
        const inputField = document.createElement("input");
        inputField.classList.add("input-field");
        inputField.type = "text";
        inputField.value = event.target.innerText;

        // Create the "Update" button
        const updateButton = document.createElement("button");
        updateButton.classList.add("update-button");
        updateButton.textContent = "Update";

        // When the "Update" button is clicked, update the text of the target element
        updateButton.addEventListener("click", function() {
            event.target.innerText = inputField.value;
            document.body.removeChild(overlay);
        });

        overlay.appendChild(inputField);
        overlay.appendChild(updateButton);

    } else if (tag === "img") {
        // Show message for image click
        const message = document.createElement("div");
        message.classList.add("image-message");
        message.textContent = "Click the screen to upload image or drag image";
        
        overlay.appendChild(message);

        const handleDrop = function(event) {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file && file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = function() {
                    const img = new Image();
                    img.src = reader.result;
                    img.classList.add("uploaded-image");
                    overlay.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        };

        const handleClick = function() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.style.display = "none";
            input.addEventListener("change", function(event) {
                const file = event.target.files[0];
                if (file && file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = function() {
                        const img = new Image();
                        img.src = reader.result;
                        img.classList.add("uploaded-image");
                        overlay.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
            document.body.appendChild(input);
            input.click();
        };

        overlay.addEventListener("click", handleClick);
        overlay.addEventListener("dragover", function(event) {
            event.preventDefault();
        });
        overlay.addEventListener("drop", handleDrop);
    } else if (tag === "section" || tag === "article") {
        // Create the buttons: Copy, Paste, Delete
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        // Copy Button
        const copyButton = document.createElement("button");
        copyButton.classList.add("copy-button");
        copyButton.textContent = "Copy";

        copyButton.addEventListener("click", function() {
            const htmlToCopy = event.target.outerHTML;
            navigator.clipboard.writeText(htmlToCopy).then(function() {
                alert("Content copied to clipboard");
            }).catch(function(err) {
                console.error("Error copying text: ", err);
            });
        });

        // Paste Button (no action)
        const pasteButton = document.createElement("button");
        pasteButton.classList.add("paste-button");
        pasteButton.textContent = "Paste";

        // Delete Button (no action)
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.textContent = "Delete";

        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(pasteButton);
        buttonContainer.appendChild(deleteButton);

        overlay.appendChild(buttonContainer);
    }

    // Prevent the event from propagating inside the popup
    overlay.addEventListener("click", function(event) {
        event.stopPropagation();
    });

    event.stopPropagation();
    document.body.appendChild(overlay);
});
