package com.example.fileexplorer.dto;

public class RenameRequest {
    private String path;
    private String newName;

    public RenameRequest() {
    }

    public RenameRequest(String path, String newName) {
        this.path = path;
        this.newName = newName;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }
}
