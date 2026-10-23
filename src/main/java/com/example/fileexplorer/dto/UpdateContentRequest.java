package com.example.fileexplorer.dto;

public class UpdateContentRequest {
    private String path;
    private String content;

    public UpdateContentRequest() {
    }

    public UpdateContentRequest(String path, String content) {
        this.path = path;
        this.content = content;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
