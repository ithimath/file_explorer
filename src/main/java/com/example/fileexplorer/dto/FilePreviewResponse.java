package com.example.fileexplorer.dto;

import java.time.LocalDateTime;

/**
 * DTO carrying text file content, line counts, and metadata for in-app preview and editing.
 */
public class FilePreviewResponse {

    private String name;
    private String path;
    private String extension;
    private long size;
    private String formattedSize;
    private LocalDateTime lastModified;
    private String content;
    private int lineCount;
    private boolean editable;
    private boolean truncated;

    public FilePreviewResponse() {
    }

    public FilePreviewResponse(String name, String path, String extension, long size, String formattedSize,
                               LocalDateTime lastModified, String content, int lineCount,
                               boolean editable, boolean truncated) {
        this.name = name;
        this.path = path;
        this.extension = extension;
        this.size = size;
        this.formattedSize = formattedSize;
        this.lastModified = lastModified;
        this.content = content;
        this.lineCount = lineCount;
        this.editable = editable;
        this.truncated = truncated;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getExtension() {
        return extension;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getFormattedSize() {
        return formattedSize;
    }

    public void setFormattedSize(String formattedSize) {
        this.formattedSize = formattedSize;
    }

    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getLineCount() {
        return lineCount;
    }

    public void setLineCount(int lineCount) {
        this.lineCount = lineCount;
    }

    public boolean isEditable() {
        return editable;
    }

    public void setEditable(boolean editable) {
        this.editable = editable;
    }

    public boolean isTruncated() {
        return truncated;
    }

    public void setTruncated(boolean truncated) {
        this.truncated = truncated;
    }
}
