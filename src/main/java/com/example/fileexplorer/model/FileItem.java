package com.example.fileexplorer.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.time.LocalDateTime;

/**
 * Parent class representing an item in the file explorer.
 * 
 * OOP Concept 1: ENCAPSULATION
 * - Private fields protect the internal state of the object.
 * - Access is controlled via public getters and setters.
 * - Validation logic can be enforced in setters.
 * 
 * OOP Concept 2: INHERITANCE (Base Class)
 * - Defines common properties shared by both files and folders.
 * 
 * OOP Concept 3: POLYMORPHISM (Abstract Method)
 * - Declares the abstract method getItemType() which each subclass implements differently.
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "itemCategory"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = FileDocument.class, name = "FILE"),
    @JsonSubTypes.Type(value = FolderItem.class, name = "FOLDER")
})
public abstract class FileItem {

    // Encapsulated private fields
    private String name;
    private String path;
    private String type;
    private long size;
    private LocalDateTime lastModified;
    private boolean readable;
    private boolean writable;

    // Default constructor
    public FileItem() {
    }

    // Parameterized constructor
    public FileItem(String name, String path, String type, long size, LocalDateTime lastModified, boolean readable, boolean writable) {
        this.name = name;
        this.path = path;
        this.type = type;
        this.size = size;
        this.lastModified = lastModified;
        this.readable = readable;
        this.writable = writable;
    }

    /**
     * Polymorphic method to be overridden by subclasses.
     * Demonstrates Polymorphism: "FileDocument" returns "File", "FolderItem" returns "Folder".
     */
    public abstract String getItemType();

    /**
     * Polymorphic method returning a CSS icon category or class.
     */
    public abstract String getIcon();

    /**
     * Polymorphic method returning human-readable size or item count.
     */
    public abstract String getDisplaySize();

    // Getters and Setters (Encapsulation)

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("File item name cannot be empty");
        }
        this.name = name.trim();
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = (path != null) ? path.replace('\\', '/') : "";
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = Math.max(0, size);
    }

    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }

    public boolean isReadable() {
        return readable;
    }

    public void setReadable(boolean readable) {
        this.readable = readable;
    }

    public boolean isWritable() {
        return writable;
    }

    public void setWritable(boolean writable) {
        this.writable = writable;
    }

    @Override
    public String toString() {
        return "FileItem{" +
                "name='" + name + '\'' +
                ", path='" + path + '\'' +
                ", type='" + type + '\'' +
                ", size=" + size +
                ", lastModified=" + lastModified +
                '}';
    }
}
