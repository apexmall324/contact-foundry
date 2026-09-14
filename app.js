const STORAGE_KEY = "contact-foundry-exports";

function loadExports() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveExports(exports) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exports));
}

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeVcf(value) {
    return String(value).replace(/[\\;,]/g, "\\$&").replace(/\r?\n/g, "\\n");
}

function buildVcf(contacts) {
    return contacts.map((contact) => ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeVcf(contact.name)}`, `TEL;TYPE=CELL:${escapeVcf(contact.phone)}`, "END:VCARD"].join("\n")).join("\n") + "\n";
}

function downloadVcf(file) {
    const blob = new Blob([buildVcf(file.contacts)], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
}

function parseNumbers(rawInput) {
    const tokens = rawInput.split(/[\n\r,;\t]+/);
    const numbers = tokens
        .map((token) => token.replace(/[^0-9+]/g, ""))
        .filter((number) => number.length >= 7);
    return [...new Set(numbers)];
}

function formatDate(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function renderArchive() {
    const body = document.querySelector("#archive-body");
    if (!body) return;
    const files = loadExports().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    body.innerHTML = "";
    if (!files.length) {
        body.innerHTML = '<tr><td class="empty-state" colspan="4">Your first export will appear here.</td></tr>';
        return;
    }
    files.forEach((file) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td class="date">${formatDate(file.createdAt)}</td><td class="filename"></td><td><span class="badge">${file.contacts.length}</span></td><td><div class="actions"><a class="text-link download-link" href="#">Download</a><a class="text-link" href="manage.html?id=${encodeURIComponent(file.id)}">Edit list</a></div></td>`;
        row.querySelector(".filename").textContent = file.filename;
        row.querySelector(".download-link").addEventListener("click", (event) => {
            event.preventDefault();
            downloadVcf(file);
        });
        body.appendChild(row);
    });
}

function initIndex() {
    const form = document.querySelector("#generator-form");
    if (!form) return;
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const baseName = String(formData.get("base_name")).trim();
        const numbers = parseNumbers(String(formData.get("raw_numbers")));
        if (!numbers.length) {
            window.alert("No valid phone numbers found.");
            return;
        }
        const startNumber = Number.parseInt(formData.get("start_number"), 10) || 0;
        const contacts = numbers.map((phone, index) => ({ id: makeId(), name: `${baseName} ${String(startNumber + index).padStart(3, "0")}`, phone }));
        const file = { id: makeId(), filename: `${baseName}_${Math.floor(Date.now() / 1000)}.vcf`, baseName, createdAt: new Date().toISOString(), contacts };
        saveExports([file, ...loadExports()]);
        downloadVcf(file);
        window.location.href = "index.html?success=1#history";
    });
    if (new URLSearchParams(window.location.search).has("success")) document.querySelector("#notice").hidden = false;
    renderArchive();
}

function initManage() {
    const id = new URLSearchParams(window.location.search).get("id");
    const body = document.querySelector("#manage-body");
    if (!body) return;
    const file = loadExports().find((item) => item.id === id);
    if (!file) {
        window.location.href = "index.html";
        return;
    }
    document.querySelector("#file-base-name").textContent = file.baseName;
    document.querySelector("#file-name").textContent = file.filename;
    document.querySelector("#contact-count").textContent = `${file.contacts.length} contacts`;
    body.innerHTML = "";
    file.contacts.forEach((contact) => {
        const row = document.createElement("tr");
        row.innerHTML = '<td><input type="text" name="contact_name" required></td><td><input type="text" name="phone_number" required></td><td class="manage-actions"><button class="button save-button" type="submit">Save</button><button class="delete-link" type="button">Delete</button></td>';
        row.querySelector('[name="contact_name"]').value = contact.name;
        row.querySelector('[name="phone_number"]').value = contact.phone;
        row.querySelector(".delete-link").addEventListener("click", () => {
            file.contacts = file.contacts.filter((item) => item.id !== contact.id);
            saveExports(loadExports().map((item) => item.id === file.id ? file : item));
            initManage();
        });
        row.querySelector(".save-button").addEventListener("click", () => {
            contact.name = row.querySelector('[name="contact_name"]').value.trim();
            contact.phone = row.querySelector('[name="phone_number"]').value.trim();
            saveExports(loadExports().map((item) => item.id === file.id ? file : item));
        });
        body.appendChild(row);
    });
    document.querySelector("#regenerate-button").onclick = () => {
        saveExports(loadExports().map((item) => item.id === file.id ? file : item));
        downloadVcf(file);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    initIndex();
    initManage();
});