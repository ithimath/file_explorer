/**
 * File Explorer JavaScript Application
 * Handles state management, REST API communications, navigation,
 * view toggling, modals, context menus, and micro-interactions.
 */

/**
 * Virtual File System (VFS)
 * Provides client-side fallback storage when running on static hosts
 * such as GitHub Pages or offline without the Spring Boot backend.
 */
class VirtualFileSystem {
    constructor() {
        this.storageKey = "java_file_explorer_vfs_v1";
        this.root = this.loadStorage();
    }

    loadStorage() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error("VFS load error:", e);
        }
        return this.getDefaultTree();
    }

    saveStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.root));
        } catch (e) {
            console.error("VFS save error:", e);
        }
    }

    getDefaultTree() {
        return {
            "Documents": {
                name: "Documents",
                path: "Documents",
                isDir: true,
                modified: "2026-10-22T22:20:00.000Z",
                children: {
                    "Meeting_Notes.txt": {
                        name: "Meeting_Notes.txt",
                        path: "Documents/Meeting_Notes.txt",
                        isDir: false,
                        content: "Sprint Planning Meeting Notes\nDate: 2026-10-22\n\n1. Review Java OOP design principles:\n   - FileDocument extends FileItem (Inheritance)\n   - FileOperations interface defines contract (Abstraction)\n   - Secure boundary checks (Encapsulation)\n   - Polymorphic icon and preview rendering (Polymorphism)\n2. Action items:\n   - Finalize REST API endpoints\n   - Polish frontend file manager UI\n   - Write comprehensive unit tests",
                        modified: "2026-10-22T22:09:00.000Z"
                    },
                    "Project_Proposal.txt": {
                        name: "Project_Proposal.txt",
                        path: "Documents/Project_Proposal.txt",
                        isDir: false,
                        content: "Project Proposal: Interactive Java File Explorer Web Application\n\nObjective:\nBuild an enterprise-grade file management platform demonstrating core OOP concepts:\n- Encapsulation: Strict path resolution preventing directory traversal attacks\n- Inheritance: Base FileItem class with specialized FolderItem and FileDocument subclasses\n- Polymorphism: Abstract methods for size calculation, formatting, and previewing\n- Abstraction: FileOperations interface decouples API layer from filesystem operations",
                        modified: "2026-10-22T22:09:00.000Z"
                    },
                    "java.txt": {
                        name: "java.txt",
                        path: "Documents/java.txt",
                        isDir: false,
                        content: "Java 17 & Spring Boot 3\nModern Java file explorer system",
                        modified: "2026-10-22T22:20:00.000Z"
                    }
                }
            },
            "Downloads": {
                name: "Downloads",
                path: "Downloads",
                isDir: true,
                modified: "2026-10-22T22:09:00.000Z",
                children: {
                    "Release_Notes_v1.0.txt": {
                        name: "Release_Notes_v1.0.txt",
                        path: "Downloads/Release_Notes_v1.0.txt",
                        isDir: false,
                        content: "Release Notes - v1.0.0\n\nFeatures:\n- Dual Grid & List views with responsive card layouts\n- Real-time directory navigation with interactive breadcrumbs\n- File operations: Create, Read, Update, Delete, Rename\n- In-browser text file editor with live preview\n- Dark and Light theme toggle with local storage persistence\n- Deep Java OOP principles educational inspector modal",
                        modified: "2026-10-22T22:09:00.000Z"
                    },
                    "Sample_Config.json": {
                        name: "Sample_Config.json",
                        path: "Downloads/Sample_Config.json",
                        isDir: false,
                        content: "{\n  \"appName\": \"Java File Explorer\",\n  \"version\": \"1.0.0\",\n  \"theme\": \"dark\",\n  \"enablePreviews\": true,\n  \"rootDirectory\": \"workspace\"\n}",
                        modified: "2026-10-22T22:09:00.000Z"
                    }
                }
            },
            "Notes": {
                name: "Notes",
                path: "Notes",
                isDir: true,
                modified: "2026-10-22T22:09:00.000Z",
                children: {
                    "OOP_Concepts_Summary.txt": {
                        name: "OOP_Concepts_Summary.txt",
                        path: "Notes/OOP_Concepts_Summary.txt",
                        isDir: false,
                        content: "=========================================================\n JAVA OBJECT ORIENTED PROGRAMMING ARCHITECTURE SUMMARY\n=========================================================\n\n1. ENCAPSULATION\n   - Private fields with validated getters and setters.\n   - Secure path sandbox resolution (WorkspaceConfig.resolveSecurePath) prevents path traversal (e.g. '../').\n\n2. INHERITANCE\n   - Abstract base class: FileItem\n   - Subclasses: FolderItem, FileDocument\n   - Common attributes (name, path, size, modified timestamp, permissions) shared.\n\n3. POLYMORPHISM\n   - Abstract methods getDisplayType(), isDirectory(), getIconType().\n   - Each subclass customizes behavior dynamically at runtime.\n\n4. ABSTRACTION\n   - FileOperations interface defines filesystem contracts.\n   - FileExplorerService implements the interface with Java NIO (Path, Files, DirectoryStream).\n   - Controller interacts purely with interface abstractions.",
                        modified: "2026-10-22T22:09:00.000Z"
                    }
                }
            },
            "SourceCode": {
                name: "SourceCode",
                path: "SourceCode",
                isDir: true,
                modified: "2026-10-22T22:09:00.000Z",
                children: {
                    "HelloJava.java": {
                        name: "HelloJava.java",
                        path: "SourceCode/HelloJava.java",
                        isDir: false,
                        content: "public class HelloJava {\n    public static void main(String[] args) {\n        System.out.println(\"Welcome to Java OOP File Explorer!\");\n    }\n}",
                        modified: "2026-10-22T22:09:00.000Z"
                    },
                    "Script.js": {
                        name: "Script.js",
                        path: "SourceCode/Script.js",
                        isDir: false,
                        content: "console.log('Java File Explorer - Interactive Client Initialized.');",
                        modified: "2026-10-22T22:09:00.000Z"
                    }
                }
            }
        };
    }

    getNode(path) {
        if (!path || path.trim() === "") return { isDir: true, children: this.root };
        const parts = path.split("/").filter(Boolean);
        let curr = { isDir: true, children: this.root };
        for (const p of parts) {
            if (!curr.children || !curr.children[p]) return null;
            curr = curr.children[p];
        }
        return curr;
    }

    toItemDTO(node, name, fullPath) {
        if (node.isDir) {
            return {
                name: name,
                path: fullPath,
                itemType: "Folder",
                type: "Folder",
                size: 0,
                displaySize: "--",
                lastModified: node.modified || new Date().toISOString(),
                readable: true,
                writable: true,
                itemCount: Object.keys(node.children || {}).length,
                oopClass: "FolderItem (subclass of FileItem)"
            };
        } else {
            const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
            const content = node.content || "";
            const size = new Blob([content]).size;
            let typeDesc = "File";
            if (ext === "txt") typeDesc = "Text Document";
            else if (ext === "java") typeDesc = "Java Source Code";
            else if (ext === "js") typeDesc = "JavaScript File";
            else if (ext === "json") typeDesc = "JSON File";
            return {
                name: name,
                path: fullPath,
                itemType: "File",
                type: typeDesc,
                extension: ext,
                size: size,
                displaySize: size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`,
                lastModified: node.modified || new Date().toISOString(),
                readable: true,
                writable: true,
                lineCount: content.split("\n").length,
                oopClass: "FileDocument (subclass of FileItem)"
            };
        }
    }

    listFiles(path) {
        const node = this.getNode(path);
        if (!node || !node.isDir) {
            return { success: false, message: `Path not found or not a directory: ${path}` };
        }
        const result = [];
        const base = path ? path.replace(/\/$/, "") + "/" : "";
        for (const [name, child] of Object.entries(node.children || {})) {
            result.push(this.toItemDTO(child, name, base + name));
        }
        return { success: true, data: result };
    }

    search(query, searchPath) {
        const q = (query || "").toLowerCase();
        const results = [];
        const traverse = (node, currentPath) => {
            if (!node || !node.children) return;
            for (const [name, child] of Object.entries(node.children)) {
                const full = currentPath ? `${currentPath}/${name}` : name;
                if (name.toLowerCase().includes(q)) {
                    results.push(this.toItemDTO(child, name, full));
                }
                if (child.isDir) {
                    traverse(child, full);
                }
            }
        };
        const startNode = this.getNode(searchPath);
        if (startNode && startNode.isDir) {
            traverse(startNode, searchPath || "");
        }
        return { success: true, data: results };
    }

    createFolder(parentPath, folderName) {
        const parent = this.getNode(parentPath);
        if (!parent || !parent.isDir) return { success: false, message: "Parent directory does not exist" };
        if (parent.children && parent.children[folderName]) return { success: false, message: "Item already exists" };
        const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
        parent.children = parent.children || {};
        parent.children[folderName] = {
            name: folderName,
            path: fullPath,
            isDir: true,
            modified: new Date().toISOString(),
            children: {}
        };
        this.saveStorage();
        return { success: true, data: this.toItemDTO(parent.children[folderName], folderName, fullPath) };
    }

    createFile(parentPath, fileName, content) {
        const parent = this.getNode(parentPath);
        if (!parent || !parent.isDir) return { success: false, message: "Parent directory does not exist" };
        if (parent.children && parent.children[fileName]) return { success: false, message: "File already exists" };
        const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
        parent.children = parent.children || {};
        parent.children[fileName] = {
            name: fileName,
            path: fullPath,
            isDir: false,
            content: content || "",
            modified: new Date().toISOString()
        };
        this.saveStorage();
        return { success: true, data: this.toItemDTO(parent.children[fileName], fileName, fullPath) };
    }

    renameItem(path, newName) {
        if (!path) return { success: false, message: "Invalid path" };
        const parts = path.split("/").filter(Boolean);
        const oldName = parts.pop();
        const parentPath = parts.join("/");
        const parent = this.getNode(parentPath);
        if (!parent || !parent.children || !parent.children[oldName]) {
            return { success: false, message: "Item to rename not found" };
        }
        if (parent.children[newName]) {
            return { success: false, message: "An item with the new name already exists" };
        }
        const item = parent.children[oldName];
        delete parent.children[oldName];
        item.name = newName;
        const newPath = parentPath ? `${parentPath}/${newName}` : newName;
        item.path = newPath;
        item.modified = new Date().toISOString();
        parent.children[newName] = item;

        const updateChildPaths = (dirNode, currentPrefix) => {
            if (!dirNode.children) return;
            for (const [k, child] of Object.entries(dirNode.children)) {
                child.path = `${currentPrefix}/${child.name}`;
                if (child.isDir) updateChildPaths(child, child.path);
            }
        };
        if (item.isDir) updateChildPaths(item, newPath);

        this.saveStorage();
        return { success: true, data: this.toItemDTO(item, newName, newPath) };
    }

    deleteItem(path) {
        if (!path) return { success: false, message: "Invalid path" };
        const parts = path.split("/").filter(Boolean);
        const targetName = parts.pop();
        const parentPath = parts.join("/");
        const parent = this.getNode(parentPath);
        if (!parent || !parent.children || !parent.children[targetName]) {
            return { success: false, message: "Item not found" };
        }
        delete parent.children[targetName];
        this.saveStorage();
        return { success: true, message: "Item deleted successfully" };
    }

    previewFile(path) {
        const node = this.getNode(path);
        if (!node || node.isDir) return { success: false, message: "File not found or is a directory" };
        const content = node.content || "";
        const size = new Blob([content]).size;
        return {
            success: true,
            data: {
                name: node.name,
                path: node.path,
                content: content,
                lineCount: content.split("\n").length,
                formattedSize: size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`,
                lastModified: node.modified || new Date().toISOString()
            }
        };
    }

    updateContent(path, content) {
        const node = this.getNode(path);
        if (!node || node.isDir) return { success: false, message: "File not found" };
        node.content = content;
        node.modified = new Date().toISOString();
        this.saveStorage();
        return this.previewFile(path);
    }
}

class FileExplorerApp {
    constructor() {
        this.currentPath = "";
        this.history = [""];
        this.historyIndex = 0;
        this.items = [];
        this.selectedItem = null;
        this.viewMode = localStorage.getItem("fe_view_mode") || "grid";
        this.theme = localStorage.getItem("fe_theme") || "dark";
        this.sortBy = "name";
        this.sortAsc = true;
        this.searchQuery = "";
        this.searchDebounceTimer = null;

        this.vfs = new VirtualFileSystem();
        this.useVFS = window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";

        this.initDOMElements();
        this.initEventListeners();
        this.applyTheme(this.theme);
        this.applyViewMode(this.viewMode);
        this.loadCurrentDirectory();
    }

    initDOMElements() {
        // Navigation & Toolbar
        this.btnBack = document.getElementById("btn-back");
        this.btnForward = document.getElementById("btn-forward");
        this.btnUp = document.getElementById("btn-up");
        this.btnRefresh = document.getElementById("btn-refresh");
        this.breadcrumbsContainer = document.getElementById("breadcrumbs-container");
        this.btnNewFolder = document.getElementById("btn-new-folder");
        this.btnNewFile = document.getElementById("btn-new-file");
        this.btnViewGrid = document.getElementById("btn-view-grid");
        this.btnViewList = document.getElementById("btn-view-list");
        this.themeToggleBtn = document.getElementById("theme-toggle-btn");
        this.oopConceptsBtn = document.getElementById("oop-concepts-btn");

        // Search
        this.searchInput = document.getElementById("search-input");
        this.searchClearBtn = document.getElementById("search-clear-btn");

        // Viewport & Empty State
        this.fileGrid = document.getElementById("file-grid");
        this.emptyState = document.getElementById("empty-state");
        this.countIndicator = document.getElementById("current-count-indicator");
        this.statusSelection = document.getElementById("status-selection");

        // Sidebar stats & nav
        this.statTotalItems = document.getElementById("stat-total-items");
        this.statFolders = document.getElementById("stat-folders");
        this.statFiles = document.getElementById("stat-files");
        this.navItems = document.querySelectorAll(".nav-item");

        // Details Panel
        this.detailsPanel = document.getElementById("details-panel");
        this.btnCloseDetails = document.getElementById("btn-close-details");
        this.detailIcon = document.getElementById("detail-icon");
        this.detailName = document.getElementById("detail-name");
        this.detailType = document.getElementById("detail-type");
        this.detailPath = document.getElementById("detail-path");
        this.detailSize = document.getElementById("detail-size");
        this.detailModified = document.getElementById("detail-modified");
        this.detailPermissions = document.getElementById("detail-permissions");
        this.detailOopClass = document.getElementById("detail-oop-class");
        this.detailBtnPreview = document.getElementById("detail-btn-preview");
        this.detailBtnRename = document.getElementById("detail-btn-rename");
        this.detailBtnDelete = document.getElementById("detail-btn-delete");

        // Context Menu
        this.contextMenu = document.getElementById("context-menu");
        this.ctxOpen = document.getElementById("ctx-open");
        this.ctxDetails = document.getElementById("ctx-details");
        this.ctxRename = document.getElementById("ctx-rename");
        this.ctxDelete = document.getElementById("ctx-delete");

        // Modals & Forms
        this.newFolderModal = document.getElementById("new-folder-modal");
        this.newFolderForm = document.getElementById("new-folder-form");
        this.folderNameInput = document.getElementById("folder-name-input");

        this.newFileModal = document.getElementById("new-file-modal");
        this.newFileForm = document.getElementById("new-file-form");
        this.fileNameInput = document.getElementById("file-name-input");
        this.fileContentInput = document.getElementById("file-content-input");

        this.renameModal = document.getElementById("rename-modal");
        this.renameForm = document.getElementById("rename-form");
        this.renameTargetPath = document.getElementById("rename-target-path");
        this.renameInput = document.getElementById("rename-input");

        this.deleteModal = document.getElementById("delete-modal");
        this.deleteItemName = document.getElementById("delete-item-name");
        this.confirmDeleteBtn = document.getElementById("confirm-delete-btn");

        this.previewModal = document.getElementById("preview-modal");
        this.previewTitle = document.getElementById("preview-title");
        this.previewSubtitle = document.getElementById("preview-subtitle");
        this.previewContentDisplay = document.getElementById("preview-content-display");
        this.previewContentEditor = document.getElementById("preview-content-editor");
        this.previewEditToggle = document.getElementById("preview-edit-toggle");
        this.previewSaveBtn = document.getElementById("preview-save-btn");
        this.previewPathInfo = document.getElementById("preview-path-info");

        this.oopModal = document.getElementById("oop-modal");
        this.toastContainer = document.getElementById("toast-container");
    }

    initEventListeners() {
        // Navigation Buttons
        this.btnBack.addEventListener("click", () => this.navigateBack());
        this.btnForward.addEventListener("click", () => this.navigateForward());
        this.btnUp.addEventListener("click", () => this.navigateUp());
        this.btnRefresh.addEventListener("click", () => this.loadCurrentDirectory());

        // View Mode Toggles
        this.btnViewGrid.addEventListener("click", () => this.applyViewMode("grid"));
        this.btnViewList.addEventListener("click", () => this.applyViewMode("list"));

        // Theme Toggle
        this.themeToggleBtn.addEventListener("click", () => {
            const newTheme = this.theme === "dark" ? "light" : "dark";
            this.applyTheme(newTheme);
        });

        // OOP Modal
        this.oopConceptsBtn.addEventListener("click", () => this.openModal("oop-modal"));

        // OOP Tabs inside modal
        document.querySelectorAll(".oop-tab").forEach(tab => {
            tab.addEventListener("click", (e) => {
                document.querySelectorAll(".oop-tab").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".oop-content").forEach(c => c.classList.add("hidden"));
                tab.classList.add("active");
                const target = document.getElementById("oop-tab-" + tab.dataset.tab);
                if (target) target.classList.remove("hidden");
            });
        });

        // Creation buttons
        this.btnNewFolder.addEventListener("click", () => this.openNewFolderModal());
        this.btnNewFile.addEventListener("click", () => this.openNewFileModal());

        // Sort Chips
        document.querySelectorAll(".sort-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                const sortType = chip.dataset.sort;
                if (this.sortBy === sortType) {
                    this.sortAsc = !this.sortAsc;
                } else {
                    this.sortBy = sortType;
                    this.sortAsc = true;
                }
                this.updateSortUI();
                this.renderItems();
            });
        });

        // Search with debounce
        this.searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim();
            this.searchQuery = query;
            this.searchClearBtn.classList.toggle("hidden", query.length === 0);

            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = setTimeout(() => {
                if (this.searchQuery) {
                    this.performSearch(this.searchQuery);
                } else {
                    this.loadCurrentDirectory();
                }
            }, 300);
        });

        this.searchClearBtn.addEventListener("click", () => {
            this.searchInput.value = "";
            this.searchQuery = "";
            this.searchClearBtn.classList.add("hidden");
            this.loadCurrentDirectory();
        });

        // Sidebar Navigation
        this.navItems.forEach(item => {
            item.addEventListener("click", () => {
                const path = item.dataset.path;
                this.navigateTo(path);
            });
        });

        // Details Close
        this.btnCloseDetails.addEventListener("click", () => {
            this.detailsPanel.classList.add("hidden");
            this.selectedItem = null;
            this.updateSelectionUI();
        });

        // Details Panel Action Buttons
        this.detailBtnPreview.addEventListener("click", () => {
            if (this.selectedItem) this.handleItemPrimaryAction(this.selectedItem);
        });
        this.detailBtnRename.addEventListener("click", () => {
            if (this.selectedItem) this.openRenameModal(this.selectedItem);
        });
        this.detailBtnDelete.addEventListener("click", () => {
            if (this.selectedItem) this.openDeleteModal(this.selectedItem);
        });

        // Forms Submissions
        this.newFolderForm.addEventListener("submit", (e) => this.handleCreateFolder(e));
        this.newFileForm.addEventListener("submit", (e) => this.handleCreateFile(e));
        this.renameForm.addEventListener("submit", (e) => this.handleRename(e));

        this.confirmDeleteBtn.addEventListener("click", () => this.handleConfirmDelete());

        // Previewer Editor Toggle & Save
        this.previewEditToggle.addEventListener("click", () => this.togglePreviewEditMode());
        this.previewSaveBtn.addEventListener("click", () => this.handleSaveFileContent());

        // Context Menu Actions
        this.ctxOpen.addEventListener("click", () => {
            this.hideContextMenu();
            if (this.selectedItem) this.handleItemPrimaryAction(this.selectedItem);
        });
        this.ctxDetails.addEventListener("click", () => {
            this.hideContextMenu();
            if (this.selectedItem) this.showDetails(this.selectedItem);
        });
        this.ctxRename.addEventListener("click", () => {
            this.hideContextMenu();
            if (this.selectedItem) this.openRenameModal(this.selectedItem);
        });
        this.ctxDelete.addEventListener("click", () => {
            this.hideContextMenu();
            if (this.selectedItem) this.openDeleteModal(this.selectedItem);
        });

        // Hide Context Menu on global click
        document.addEventListener("click", (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });

        // Keyboard Shortcuts (F2: Rename, Delete: Delete item, Escape: Close modals)
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeAllModals();
                this.hideContextMenu();
            } else if (e.key === "F2" && this.selectedItem && !this.isAnyModalOpen()) {
                e.preventDefault();
                this.openRenameModal(this.selectedItem);
            } else if ((e.key === "Delete" || e.key === "Del") && this.selectedItem && !this.isAnyModalOpen()) {
                e.preventDefault();
                this.openDeleteModal(this.selectedItem);
            }
        });
    }

    // =========================================================================
    // Theme & View Modes
    // =========================================================================
    applyTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("fe_theme", theme);
    }

    applyViewMode(mode) {
        this.viewMode = mode;
        localStorage.setItem("fe_view_mode", mode);

        if (mode === "grid") {
            this.btnViewGrid.classList.add("active");
            this.btnViewList.classList.remove("active");
        } else {
            this.btnViewList.classList.add("active");
            this.btnViewGrid.classList.remove("active");
        }

        this.renderItems();
    }

    // =========================================================================
    // API & Navigation
    // =========================================================================
    async apiFetch(url, options = {}) {
        const isPages = window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";
        if (this.useVFS || isPages) {
            return this.executeVFS(url, options);
        }

        try {
            const res = await fetch(url, options);
            if (!res.ok && (res.status === 404 || res.status === 502)) {
                this.enableVFSMode();
                return this.executeVFS(url, options);
            }
            return await res.json();
        } catch (err) {
            console.warn("Backend API unavailable, activating client-side Virtual File System demo:", err);
            this.enableVFSMode();
            return this.executeVFS(url, options);
        }
    }

    enableVFSMode() {
        if (this.useVFS) return;
        this.useVFS = true;
        this.showToast("⚡ Interactive Demo Mode active (client-side workspace)", "info");
    }

    executeVFS(url, options = {}) {
        const parsedUrl = new URL(url, window.location.origin || "http://localhost");
        const pathname = parsedUrl.pathname;
        const searchParams = parsedUrl.searchParams;
        const method = (options.method || "GET").toUpperCase();

        if (pathname === "/api/files" || pathname.endsWith("/api/files")) {
            if (method === "GET") {
                const path = searchParams.get("path") || "";
                return this.vfs.listFiles(path);
            } else if (method === "DELETE") {
                const path = searchParams.get("path") || "";
                return this.vfs.deleteItem(path);
            }
        } else if (pathname === "/api/files/search" || pathname.endsWith("/api/files/search")) {
            const query = searchParams.get("name") || "";
            const path = searchParams.get("path") || "";
            return this.vfs.search(query, path);
        } else if (pathname === "/api/files/folder" || pathname.endsWith("/api/files/folder")) {
            const body = JSON.parse(options.body || "{}");
            return this.vfs.createFolder(body.parentPath || "", body.folderName || "");
        } else if (pathname === "/api/files/text" || pathname.endsWith("/api/files/text")) {
            const body = JSON.parse(options.body || "{}");
            return this.vfs.createFile(body.parentPath || "", body.fileName || "", body.content || "");
        } else if (pathname === "/api/files/rename" || pathname.endsWith("/api/files/rename")) {
            const body = JSON.parse(options.body || "{}");
            return this.vfs.renameItem(body.path || "", body.newName || "");
        } else if (pathname === "/api/files/preview" || pathname.endsWith("/api/files/preview")) {
            const path = searchParams.get("path") || "";
            return this.vfs.previewFile(path);
        } else if (pathname === "/api/files/content" || pathname.endsWith("/api/files/content")) {
            const body = JSON.parse(options.body || "{}");
            return this.vfs.updateContent(body.path || "", body.content || "");
        }

        return { success: false, message: "Unhandled VFS route" };
    }

    async loadCurrentDirectory() {
        this.statusSelection.textContent = "Loading directory...";
        try {
            const json = await this.apiFetch(`/api/files?path=${encodeURIComponent(this.currentPath)}`);

            if (!json.success) {
                this.showToast(json.message || "Failed to load directory", "error");
                return;
            }

            this.items = json.data || [];
            this.updateBreadcrumbs();
            this.updateNavButtons();
            this.updateSidebarHighlight();
            this.updateSidebarStats();
            this.renderItems();
            this.statusSelection.textContent = `${this.items.length} items in current folder`;
        } catch (err) {
            this.showToast("Network error: Could not reach backend server", "error");
            console.error(err);
        }
    }

    async performSearch(query) {
        this.statusSelection.textContent = `Searching for "${query}"...`;
        try {
            const json = await this.apiFetch(`/api/files/search?name=${encodeURIComponent(query)}&path=${encodeURIComponent(this.currentPath)}`);

            if (json.success) {
                this.items = json.data || [];
                this.renderItems();
                this.statusSelection.textContent = `Found ${this.items.length} search results for "${query}"`;
            }
        } catch (err) {
            console.error("Search failed", err);
        }
    }

    navigateTo(path) {
        if (path === this.currentPath) return;

        // Add to history stack
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        this.history.push(path);
        this.historyIndex = this.history.length - 1;

        this.currentPath = path;
        this.selectedItem = null;
        this.loadCurrentDirectory();
    }

    navigateBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPath = this.history[this.historyIndex];
            this.selectedItem = null;
            this.loadCurrentDirectory();
        }
    }

    navigateForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentPath = this.history[this.historyIndex];
            this.selectedItem = null;
            this.loadCurrentDirectory();
        }
    }

    navigateUp() {
        if (!this.currentPath) return;
        const parts = this.currentPath.split("/").filter(Boolean);
        parts.pop();
        this.navigateTo(parts.join("/"));
    }

    updateNavButtons() {
        this.btnBack.disabled = this.historyIndex <= 0;
        this.btnForward.disabled = this.historyIndex >= this.history.length - 1;
        this.btnUp.disabled = !this.currentPath;
    }

    updateBreadcrumbs() {
        this.breadcrumbsContainer.innerHTML = "";

        // Root / Home crumb
        const rootCrumb = document.createElement("span");
        rootCrumb.className = `breadcrumb-crumb ${!this.currentPath ? 'current' : ''}`;
        rootCrumb.innerHTML = `<svg style="width:14px;height:14px;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg> Home`;
        rootCrumb.addEventListener("click", () => this.navigateTo(""));
        this.breadcrumbsContainer.appendChild(rootCrumb);

        if (!this.currentPath) return;

        const segments = this.currentPath.split("/").filter(Boolean);
        let accumulated = "";

        segments.forEach((seg, index) => {
            const sep = document.createElement("span");
            sep.className = "breadcrumb-sep";
            sep.textContent = "›";
            this.breadcrumbsContainer.appendChild(sep);

            accumulated += (accumulated ? "/" : "") + seg;
            const currentAccumulated = accumulated;
            const isLast = index === segments.length - 1;

            const crumb = document.createElement("span");
            crumb.className = `breadcrumb-crumb ${isLast ? 'current' : ''}`;
            crumb.textContent = seg;
            if (!isLast) {
                crumb.addEventListener("click", () => this.navigateTo(currentAccumulated));
            }
            this.breadcrumbsContainer.appendChild(crumb);
        });
    }

    updateSidebarHighlight() {
        this.navItems.forEach(item => {
            const p = item.dataset.path;
            if (p === this.currentPath) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }

    updateSidebarStats() {
        let folders = 0;
        let files = 0;
        this.items.forEach(it => {
            if (it.itemType === "Folder") folders++;
            else files++;
        });

        this.statTotalItems.textContent = this.items.length;
        this.statFolders.textContent = folders;
        this.statFiles.textContent = files;
    }

    updateSortUI() {
        document.querySelectorAll(".sort-chip").forEach(chip => {
            if (chip.dataset.sort === this.sortBy) {
                chip.classList.add("active");
                const arrow = chip.querySelector(".sort-arrow");
                if (arrow) arrow.textContent = this.sortAsc ? "↑" : "↓";
            } else {
                chip.classList.remove("active");
                const arrow = chip.querySelector(".sort-arrow");
                if (arrow) arrow.textContent = "";
            }
        });
    }

    // =========================================================================
    // Sorting & Rendering
    // =========================================================================
    getSortedItems() {
        return [...this.items].sort((a, b) => {
            // Folders always take precedence unless sorting explicitly reverses
            const aIsFolder = a.itemType === "Folder";
            const bIsFolder = b.itemType === "Folder";

            if (aIsFolder !== bIsFolder) {
                return aIsFolder ? -1 : 1;
            }

            let comp = 0;
            switch (this.sortBy) {
                case "name":
                    comp = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
                    break;
                case "size":
                    comp = (a.size || 0) - (b.size || 0);
                    break;
                case "type":
                    comp = (a.type || "").localeCompare(b.type || "");
                    break;
                case "modified":
                    comp = new Date(a.lastModified || 0) - new Date(b.lastModified || 0);
                    break;
                default:
                    comp = a.name.localeCompare(b.name);
            }

            return this.sortAsc ? comp : -comp;
        });
    }

    renderItems() {
        const sorted = this.getSortedItems();
        this.countIndicator.textContent = `${sorted.length} item${sorted.length === 1 ? '' : 's'}`;

        if (sorted.length === 0) {
            this.fileGrid.innerHTML = "";
            this.emptyState.classList.remove("hidden");
            return;
        }

        this.emptyState.classList.add("hidden");

        if (this.viewMode === "grid") {
            this.fileGrid.className = "file-grid-view";
            this.fileGrid.innerHTML = sorted.map(item => this.createCardHTML(item)).join("");
        } else {
            this.fileGrid.className = "file-list-view";
            this.fileGrid.innerHTML = `
                <div class="list-header">
                    <span>Name</span>
                    <span>Type</span>
                    <span>Size</span>
                    <span>Date Modified</span>
                    <span style="text-align:right;">Actions</span>
                </div>
                ${sorted.map(item => this.createRowHTML(item)).join("")}
            `;
        }

        this.attachItemEventListeners();
    }

    createCardHTML(item) {
        const isSelected = this.selectedItem && this.selectedItem.path === item.path;
        const iconSVG = this.getIconSVG(item);
        const displaySize = item.displaySize || (item.size ? item.size + " B" : "--");

        return `
            <div class="file-card ${isSelected ? 'selected' : ''}" data-path="${escapeHTML(item.path)}">
                <div class="file-card-actions">
                    <button class="card-action-btn item-btn-more" title="More Options">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>
                <div class="file-icon-wrapper">
                    ${iconSVG}
                </div>
                <div class="file-card-title" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</div>
                <div class="file-card-meta">${displaySize}</div>
            </div>
        `;
    }

    createRowHTML(item) {
        const isSelected = this.selectedItem && this.selectedItem.path === item.path;
        const iconSVG = this.getIconSVG(item);
        const displaySize = item.displaySize || (item.size ? item.size + " B" : "--");
        const formattedDate = this.formatDate(item.lastModified);

        return `
            <div class="list-row ${isSelected ? 'selected' : ''}" data-path="${escapeHTML(item.path)}">
                <div class="list-col-name">
                    <div class="file-icon-wrapper">${iconSVG}</div>
                    <span title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</span>
                </div>
                <div class="list-col-type">${escapeHTML(item.type || item.itemType)}</div>
                <div class="list-col-size">${displaySize}</div>
                <div class="list-col-date">${formattedDate}</div>
                <div class="list-col-actions">
                    <button class="card-action-btn item-btn-more" title="More Options">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    attachItemEventListeners() {
        const elements = this.fileGrid.querySelectorAll(".file-card, .list-row");
        elements.forEach(el => {
            const path = el.dataset.path;
            const item = this.items.find(i => i.path === path);
            if (!item) return;

            // Single click: select item & update details
            el.addEventListener("click", (e) => {
                if (e.target.closest(".item-btn-more")) {
                    e.stopPropagation();
                    this.showContextMenu(e.clientX, e.clientY, item);
                    return;
                }
                this.selectItem(item);
            });

            // Double click: open folder or preview file
            el.addEventListener("dblclick", () => {
                this.handleItemPrimaryAction(item);
            });

            // Right click: custom context menu
            el.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.selectItem(item);
                this.showContextMenu(e.clientX, e.clientY, item);
            });
        });
    }

    selectItem(item) {
        this.selectedItem = item;
        this.updateSelectionUI();
        this.showDetails(item);
    }

    updateSelectionUI() {
        const elements = this.fileGrid.querySelectorAll(".file-card, .list-row");
        elements.forEach(el => {
            if (this.selectedItem && el.dataset.path === this.selectedItem.path) {
                el.classList.add("selected");
            } else {
                el.classList.remove("selected");
            }
        });

        if (this.selectedItem) {
            this.statusSelection.textContent = `Selected: ${this.selectedItem.name} (${this.selectedItem.itemType})`;
        } else {
            this.statusSelection.textContent = `${this.items.length} items in current folder`;
        }
    }

    handleItemPrimaryAction(item) {
        if (item.itemType === "Folder") {
            this.navigateTo(item.path);
        } else {
            this.openFilePreview(item);
        }
    }

    // =========================================================================
    // Details Panel
    // =========================================================================
    showDetails(item) {
        this.selectedItem = item;
        this.detailsPanel.classList.remove("hidden");

        this.detailIcon.innerHTML = this.getIconSVG(item);
        this.detailName.textContent = item.name;
        this.detailType.textContent = item.type || item.itemType;
        this.detailPath.textContent = item.path || "/";
        this.detailSize.textContent = item.displaySize || (item.size ? item.size + " bytes" : "--");
        this.detailModified.textContent = this.formatDate(item.lastModified);
        this.detailPermissions.textContent = `${item.readable ? 'Readable' : 'No-read'}, ${item.writable ? 'Writable' : 'Read-only'}`;

        // OOP Concept explanation tag
        const isFolder = item.itemType === "Folder";
        this.detailOopClass.textContent = isFolder ? "FolderItem (extends FileItem)" : "FileDocument (extends FileItem)";

        // Enable or disable preview button based on file vs folder
        if (isFolder) {
            this.detailBtnPreview.textContent = "Open Folder";
        } else {
            this.detailBtnPreview.textContent = "Preview / Edit Text";
        }
    }

    // =========================================================================
    // Context Menu
    // =========================================================================
    showContextMenu(x, y, item) {
        this.selectedItem = item;
        this.updateSelectionUI();

        this.contextMenu.style.left = `${Math.min(x, window.innerWidth - 180)}px`;
        this.contextMenu.style.top = `${Math.min(y, window.innerHeight - 160)}px`;
        this.contextMenu.classList.remove("hidden");
    }

    hideContextMenu() {
        this.contextMenu.classList.add("hidden");
    }

    // =========================================================================
    // CRUD Operations
    // =========================================================================
    openNewFolderModal() {
        this.folderNameInput.value = "";
        this.openModal("new-folder-modal");
        setTimeout(() => this.folderNameInput.focus(), 50);
    }

    async handleCreateFolder(e) {
        e.preventDefault();
        const folderName = this.folderNameInput.value.trim();
        if (!folderName) return;

        try {
            const json = await this.apiFetch("/api/files/folder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parentPath: this.currentPath,
                    folderName: folderName
                })
            });

            if (json.success) {
                this.closeModal("new-folder-modal");
                this.showToast(`Folder "${folderName}" created successfully!`, "success");
                await this.loadCurrentDirectory();
            } else {
                this.showToast(json.message, "error");
            }
        } catch (err) {
            this.showToast("Failed to create folder", "error");
        }
    }

    openNewFileModal() {
        this.fileNameInput.value = "";
        this.fileContentInput.value = "";
        this.openModal("new-file-modal");
        setTimeout(() => this.fileNameInput.focus(), 50);
    }

    async handleCreateFile(e) {
        e.preventDefault();
        const fileName = this.fileNameInput.value.trim();
        const content = this.fileContentInput.value;
        if (!fileName) return;

        try {
            const json = await this.apiFetch("/api/files/text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parentPath: this.currentPath,
                    fileName: fileName,
                    content: content
                })
            });

            if (json.success) {
                this.closeModal("new-file-modal");
                this.showToast(`File "${fileName}" created successfully!`, "success");
                await this.loadCurrentDirectory();
            } else {
                this.showToast(json.message, "error");
            }
        } catch (err) {
            this.showToast("Failed to create text file", "error");
        }
    }

    openRenameModal(item) {
        this.renameTargetPath.value = item.path;
        this.renameInput.value = item.name;
        this.openModal("rename-modal");
        setTimeout(() => {
            this.renameInput.focus();
            this.renameInput.select();
        }, 50);
    }

    async handleRename(e) {
        e.preventDefault();
        const path = this.renameTargetPath.value;
        const newName = this.renameInput.value.trim();
        if (!newName) return;

        try {
            const json = await this.apiFetch("/api/files/rename", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: path,
                    newName: newName
                })
            });

            if (json.success) {
                this.closeModal("rename-modal");
                this.showToast(`Renamed to "${newName}"!`, "success");
                await this.loadCurrentDirectory();
            } else {
                this.showToast(json.message, "error");
            }
        } catch (err) {
            this.showToast("Failed to rename item", "error");
        }
    }

    openDeleteModal(item) {
        this.selectedItem = item;
        this.deleteItemName.textContent = `"${item.name}"`;
        this.openModal("delete-modal");
    }

    async handleConfirmDelete() {
        if (!this.selectedItem) return;
        const item = this.selectedItem;

        try {
            const json = await this.apiFetch(`/api/files?path=${encodeURIComponent(item.path)}`, {
                method: "DELETE"
            });

            if (json.success) {
                this.closeModal("delete-modal");
                this.showToast(`Deleted "${item.name}"!`, "success");
                this.detailsPanel.classList.add("hidden");
                this.selectedItem = null;
                await this.loadCurrentDirectory();
            } else {
                this.showToast(json.message, "error");
            }
        } catch (err) {
            this.showToast("Failed to delete item", "error");
        }
    }

    // =========================================================================
    // Text File Preview & Edit
    // =========================================================================
    async openFilePreview(item) {
        try {
            const json = await this.apiFetch(`/api/files/preview?path=${encodeURIComponent(item.path)}`);

            if (!json.success) {
                this.showToast(json.message, "error");
                return;
            }

            const preview = json.data;
            this.previewTitle.textContent = preview.name;
            this.previewSubtitle.textContent = `${preview.lineCount} lines | ${preview.formattedSize} | Last modified: ${this.formatDate(preview.lastModified)}`;
            this.previewPathInfo.textContent = `Path: /${preview.path}`;

            this.previewContentDisplay.querySelector("code").textContent = preview.content;
            this.previewContentEditor.value = preview.content;

            // Reset back to view mode
            this.previewContentDisplay.classList.remove("hidden");
            this.previewContentEditor.classList.add("hidden");
            this.previewEditToggle.textContent = "Edit File";
            this.previewSaveBtn.classList.add("hidden");

            this.openModal("preview-modal");
        } catch (err) {
            this.showToast("Unable to load file preview", "error");
        }
    }

    togglePreviewEditMode() {
        const isEditing = !this.previewContentEditor.classList.contains("hidden");
        if (isEditing) {
            // Cancel edit mode
            this.previewContentEditor.classList.add("hidden");
            this.previewContentDisplay.classList.remove("hidden");
            this.previewEditToggle.textContent = "Edit File";
            this.previewSaveBtn.classList.add("hidden");
        } else {
            // Enter edit mode
            this.previewContentEditor.classList.remove("hidden");
            this.previewContentDisplay.classList.add("hidden");
            this.previewEditToggle.textContent = "Cancel Edit";
            this.previewSaveBtn.classList.remove("hidden");
            this.previewContentEditor.focus();
        }
    }

    async handleSaveFileContent() {
        if (!this.selectedItem) return;
        const newContent = this.previewContentEditor.value;

        try {
            const json = await this.apiFetch("/api/files/content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: this.selectedItem.path,
                    content: newContent
                })
            });

            if (json.success) {
                const preview = json.data;
                this.previewContentDisplay.querySelector("code").textContent = preview.content;
                this.previewSubtitle.textContent = `${preview.lineCount} lines | ${preview.formattedSize}`;
                this.togglePreviewEditMode();
                this.showToast("File changes saved successfully!", "success");
                await this.loadCurrentDirectory();
            } else {
                this.showToast(json.message, "error");
            }
        } catch (err) {
            this.showToast("Failed to save file changes", "error");
        }
    }

    // =========================================================================
    // Modal Helpers
    // =========================================================================
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove("hidden");
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add("hidden");
    }

    closeAllModals() {
        document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.add("hidden"));
    }

    isAnyModalOpen() {
        return !!document.querySelector(".modal-backdrop:not(.hidden)");
    }

    // =========================================================================
    // Toast Notifications
    // =========================================================================
    showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        let iconSvg = "";
        if (type === "success") {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === "error") {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        toast.innerHTML = `
            <div class="toast-icon">${iconSvg}</div>
            <div class="toast-msg">${escapeHTML(message)}</div>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    }

    // =========================================================================
    // SVG Icon Generator (Polymorphic category mapping)
    // =========================================================================
    getIconSVG(item) {
        const iconType = item.icon || (item.itemType === "Folder" ? "folder" : "file");

        switch (iconType) {
            case "folder":
                return `<svg class="icon-svg icon-svg-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>`;
            case "file-text":
                return `<svg class="icon-svg icon-svg-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>`;
            case "file-code":
                return `<svg class="icon-svg icon-svg-code" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>`;
            case "file-image":
                return `<svg class="icon-svg icon-svg-image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>`;
            case "file-pdf":
                return `<svg class="icon-svg icon-svg-pdf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>`;
            case "file-archive":
                return `<svg class="icon-svg icon-svg-archive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                </svg>`;
            default:
                return `<svg class="icon-svg icon-svg-generic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>`;
        }
    }

    formatDate(dateStr) {
        if (!dateStr) return "--";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    }
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// Instantiate application when DOM is ready
let app;
document.addEventListener("DOMContentLoaded", () => {
    app = new FileExplorerApp();
});
