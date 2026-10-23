/**
 * File Explorer JavaScript Application
 * Handles state management, REST API communications, navigation,
 * view toggling, modals, context menus, and micro-interactions.
 */

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
    async loadCurrentDirectory() {
        this.statusSelection.textContent = "Loading directory...";
        try {
            const res = await fetch(`/api/files?path=${encodeURIComponent(this.currentPath)}`);
            const json = await res.json();

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
            const res = await fetch(`/api/files/search?name=${encodeURIComponent(query)}&path=${encodeURIComponent(this.currentPath)}`);
            const json = await res.json();

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
            const res = await fetch("/api/files/folder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parentPath: this.currentPath,
                    folderName: folderName
                })
            });
            const json = await res.json();

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
            const res = await fetch("/api/files/text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parentPath: this.currentPath,
                    fileName: fileName,
                    content: content
                })
            });
            const json = await res.json();

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
            const res = await fetch("/api/files/rename", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: path,
                    newName: newName
                })
            });
            const json = await res.json();

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
            const res = await fetch(`/api/files?path=${encodeURIComponent(item.path)}`, {
                method: "DELETE"
            });
            const json = await res.json();

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
            const res = await fetch(`/api/files/preview?path=${encodeURIComponent(item.path)}`);
            const json = await res.json();

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
            const res = await fetch("/api/files/content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: this.selectedItem.path,
                    content: newContent
                })
            });
            const json = await res.json();

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
