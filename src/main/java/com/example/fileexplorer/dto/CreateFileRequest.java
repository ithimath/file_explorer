package com.example.fileexplorer.dto;

public class CreateFileRequest {
    private String parentPath;
    private String fileName;
    private String content;

    public CreateFileRequest() {
    }

    public CreateFileRequest(String parentPath, String fileName, String content) {
        this.parentPath = parentPath;
        this.fileName = fileName;
        this.content = content;
    }

    public String getParentPath() {
        return parentPath;
    }

    public void setParentPath(String parentPath) {
        this.parentPath = parentPath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
