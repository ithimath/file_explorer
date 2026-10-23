package com.example.fileexplorer.model;

import java.time.LocalDateTime;

/**
 * Child class representing a folder directory.
 * 
 * OOP Concept 2: INHERITANCE
 * - Inherits common fields and behaviors from FileItem.
 * - Adds directory-specific information such as childCount.
 * 
 * OOP Concept 3: POLYMORPHISM
 * - Overrides getItemType() to return "Folder".
 * - Overrides getIcon() to return "folder".
 * - Overrides getDisplaySize() to display item count instead of raw bytes.
 */
public class FolderItem extends FileItem {

    private int childCount;

    public FolderItem() {
        super();
    }

    public FolderItem(String name, String path, String type, long size, LocalDateTime lastModified,
                      boolean readable, boolean writable, int childCount) {
        super(name, path, type, size, lastModified, readable, writable);
        this.childCount = childCount;
    }

    /**
     * Polymorphic implementation of getItemType()
     */
    @Override
    public String getItemType() {
        return "Folder";
    }

    /**
     * Polymorphic implementation of getIcon()
     */
    @Override
    public String getIcon() {
        return "folder";
    }

    /**
     * Polymorphic implementation of getDisplaySize()
     */
    @Override
    public String getDisplaySize() {
        if (childCount == 0) {
            return "Empty";
        } else if (childCount == 1) {
            return "1 item";
        } else {
            return childCount + " items";
        }
    }

    // Encapsulated Getters & Setters
    public int getChildCount() {
        return childCount;
    }

    public void setChildCount(int childCount) {
        this.childCount = Math.max(0, childCount);
    }
}
