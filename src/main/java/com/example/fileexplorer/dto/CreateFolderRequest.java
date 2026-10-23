package com.example.fileexplorer.dto;

public class CreateFolderRequest {
    private String parentPath;
    private String folderName;

    public CreateFolderRequest() {
    }

    public CreateFolderRequest(String parentPath, String folderName) {
        this.parentPath = parentPath;
        this.folderName = folderName;
    }

    public String getParentPath() {
        return parentPath;
    }

    public void setParentPath(String parentPath) {
        this.parentPath = parentPath;
    }

    public String getFolderName() {
        return folderName;
    }

    public void setFolderName(String folderName) {
        this.folderName = folderName;
    }
}
