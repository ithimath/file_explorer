package com.example.fileexplorer.model;

import java.time.LocalDateTime;

/**
 * Child class representing a file document.
 * 
 * OOP Concept 2: INHERITANCE
 * - Inherits common fields and behaviors from FileItem (name, path, size, lastModified, etc.).
 * - Adds specialized fields suitable for files (extension, isText).
 * 
 * OOP Concept 3: POLYMORPHISM
 * - Overrides getItemType() to return "File".
 * - Overrides getIcon() to return appropriate file type icons.
 * - Overrides getDisplaySize() to return human-friendly size (B, KB, MB, GB).
 */
public class FileDocument extends FileItem {

    private String extension;
    private boolean textFile;

    public FileDocument() {
        super();
    }

    public FileDocument(String name, String path, String type, long size, LocalDateTime lastModified,
                        boolean readable, boolean writable, String extension, boolean textFile) {
        super(name, path, type, size, lastModified, readable, writable);
        this.extension = extension;
        this.textFile = textFile;
    }

    /**
     * Polymorphic implementation of getItemType()
     */
    @Override
    public String getItemType() {
        return "File";
    }

    /**
     * Polymorphic implementation of getIcon() based on file extension
     */
    @Override
    public String getIcon() {
        if (extension == null || extension.isEmpty()) {
            return "file";
        }
        String ext = extension.toLowerCase();
        switch (ext) {
            case "txt":
            case "md":
            case "log":
                return "file-text";
            case "java":
            case "js":
            case "html":
            case "css":
            case "json":
            case "xml":
            case "py":
            case "sql":
            case "sh":
            case "bat":
            case "cmd":
                return "file-code";
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
            case "svg":
            case "webp":
            case "ico":
                return "file-image";
            case "pdf":
                return "file-pdf";
            case "zip":
            case "rar":
            case "7z":
            case "tar":
            case "gz":
                return "file-archive";
            case "mp3":
            case "wav":
            case "ogg":
                return "file-audio";
            case "mp4":
            case "mkv":
            case "avi":
            case "webm":
                return "file-video";
            default:
                return "file";
        }
    }

    /**
     * Polymorphic implementation of getDisplaySize() formatting bytes into readable string.
     */
    @Override
    public String getDisplaySize() {
        long bytes = getSize();
        if (bytes < 1024) {
            return bytes + " B";
        }
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char unit = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), unit);
    }

    // Encapsulated Getters & Setters for specific properties
    public String getExtension() {
        return extension;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }

    public boolean isTextFile() {
        return textFile;
    }

    public void setTextFile(boolean textFile) {
        this.textFile = textFile;
    }
}
