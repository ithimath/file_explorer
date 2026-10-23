package com.example.fileexplorer.exception;

public class FileExplorerException extends RuntimeException {
    public FileExplorerException(String message) {
        super(message);
    }

    public FileExplorerException(String message, Throwable cause) {
        super(message, cause);
    }
}
