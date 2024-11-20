// Enhanced content script
console.log("Extension content script loaded");

// Inject the Google Fonts link for Material Symbols
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
link.rel = "stylesheet";
document.head.appendChild(link);

// Observe for changes to the DOM and initialize buttons when elements load
const observer = new MutationObserver((mutations, obs) => {
    const formsContainer = document.querySelector(".standardListItem.row");
    const addressElement = document.querySelector("dr-map .ng-binding");
    if (formsContainer && addressElement) {
        console.log("Forms container and address detected. Initializing...");
        initializeButtons();
        obs.disconnect();
    }
});

observer.observe(document, { childList: true, subtree: true });

function initializeButtons() {
    const addressElement = document.querySelector("dr-map .ng-binding");
    const address = addressElement ? addressElement.innerText.trim() : "Address not found";

    if (address !== "Address not found") {
        console.log(`Address retrieved: ${address}`);
    } else {
        console.warn("Address element not found. Retrying with delay...");
        setTimeout(initializeButtons, 1000);
        return;
    }

    // Add individual +Address buttons
    const forms = document.querySelectorAll(".standardListItem.row");
    forms.forEach((form, index) => {
        console.log(`Processing form ${index + 1} of ${forms.length}`);
        addRenameButton(form, address);
    });

    // Add the Address All button
    addGlobalRenameButton(address);
}

function addRenameButton(form, address) {
    const listInlineContainer = form.querySelector(".col-sm-2 .list-inline");

    if (listInlineContainer && !form.querySelector(".rename-address-button")) {
        const renameButton = document.createElement("button");
        renameButton.innerText = "+Address";
        renameButton.className = "rename-address-button";

        renameButton.style.position = "absolute";
        renameButton.style.left = "0";
        renameButton.style.top = "50%";
        renameButton.style.transform = "translateY(-50%)";
        renameButton.style.padding = "2px 5px";
        renameButton.style.fontSize = "10px";
        renameButton.style.border = "none";
        renameButton.style.backgroundColor = "transparent";
        renameButton.style.color = "#1a73e8";
        renameButton.style.cursor = "pointer";

        listInlineContainer.style.position = "relative";
        listInlineContainer.insertBefore(renameButton, listInlineContainer.firstChild);

        renameButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            renameFormWithAddress(form, address);
        });
    }
}

function addGlobalRenameButton(address) {
    const toolbar = document.querySelector(".view-toolbelt .list-inline");
    
    if (toolbar && !document.querySelector(".address-all-container")) {
        const listItem = document.createElement("li");
        listItem.className = "filter-option address-all-container";

        const button = document.createElement("button");
        button.className = "btn-is-lg btn-lg-fixed-size";

        // Add icon
        const iconSpan = document.createElement("span");
        iconSpan.className = "material-symbols-outlined";
        iconSpan.style.cssText = "color: rgb(26, 115, 232); font-size: 24px; line-height: 1; margin-bottom: 2px;";
        iconSpan.textContent = "add_circle";

        // Add text
        const textSpan = document.createElement("span");
        textSpan.style.cssText = "color: rgb(26, 115, 232); font-size: 12px; line-height: 1;";
        textSpan.textContent = "Address";

        button.appendChild(iconSpan);
        button.appendChild(textSpan);

        button.addEventListener("click", async () => {
            const forms = document.querySelectorAll(".standardListItem.row");
            for (const form of forms) {
                await renameFormWithAddress(form, address);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Add a small delay before reloading to ensure last rename completes
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        });
        
        listItem.appendChild(button);
        
        // Insert after the Add button
        const addButton = toolbar.querySelector("li:last-child");
        toolbar.appendChild(listItem);
    }
}

function renameFormWithAddress(form, address) {
    const formNameElement = form.querySelector("dr-edit-form a.ng-binding");
    let formName = formNameElement ? formNameElement.innerText : "";

    const newFormName = formName.includes("(")
        ? formName.replace(/\(.*?\)/, `(${address})`)
        : `${formName} (${address})`;

    const renameOption = form.querySelector("a.ng-binding[ng-click='openModal()']");
    if (renameOption) {
        renameOption.click();
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const renameInput = document.querySelector("input[name='name']");
                const renameButtonModal = document.querySelector("button[ng-click='isPositiveAction()']");
                
                if (renameInput && renameButtonModal) {
                    renameInput.value = newFormName;
                    renameInput.dispatchEvent(new Event("input"));
                    renameButtonModal.click();
                }
                resolve();
            }, 500);
        });
    }
    return Promise.resolve();
}