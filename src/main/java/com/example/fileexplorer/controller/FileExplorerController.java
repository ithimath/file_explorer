package com.example.fileexplorer.controller;

import com.example.fileexplorer.dto.*;
import com.example.fileexplorer.model.FileDocument;
import com.example.fileexplorer.model.FileItem;
import com.example.fileexplorer.model.FolderItem;
import com.example.fileexplorer.operations.FileOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller exposing File Explorer endpoints.
 * 
 * Endpoints:
 * - GET    /api/files?path=...        - list files and folders
 * - POST   /api/files/folder          - create a folder
 * - POST   /api/files/text            - create a text file
 * - PUT    /api/files/rename          - rename an item
 * - DELETE /api/files?path=...        - delete a file or folder
 * - GET    /api/files/preview?path=.. - preview a text file
 * - PUT    /api/files/content         - save updated text file content
 * - GET    /api/files/search?name=..  - search files and folders
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileExplorerController {

    private final FileOperations fileOperations;

    public FileExplorerController(FileOperations fileOperations) {
        this.fileOperations = fileOperations;
    }

    /**
     * GET /api/files?path=...
     * Lists files and folders inside the specified directory path.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FileItem>>> listFiles(
            @RequestParam(value = "path", required = false, defaultValue = "") String path) {
        List<FileItem> items = fileOperations.listFiles(path);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved " + items.size() + " items.", items));
    }

    /**
     * POST /api/files/folder
     * Creates a new folder.
     */
    @PostMapping("/folder")
    public ResponseEntity<ApiResponse<FolderItem>> createFolder(@RequestBody CreateFolderRequest request) {
        FolderItem folder = fileOperations.createFolder(request.getParentPath(), request.getFolderName());
        return ResponseEntity.ok(ApiResponse.ok("Folder '" + folder.getName() + "' created successfully.", folder));
    }

    /**
     * POST /api/files/text
     * Creates a new text file.
     */
    @PostMapping("/text")
    public ResponseEntity<ApiResponse<FileDocument>> createTextFile(@RequestBody CreateFileRequest request) {
        FileDocument file = fileOperations.createTextFile(request.getParentPath(), request.getFileName(), request.getContent());
        return ResponseEntity.ok(ApiResponse.ok("File '" + file.getName() + "' created successfully.", file));
    }

    /**
     * PUT /api/files/rename
     * Renames a file or folder.
     */
    @PutMapping("/rename")
    public ResponseEntity<ApiResponse<FileItem>> renameItem(@RequestBody RenameRequest request) {
        FileItem item = fileOperations.renameItem(request.getPath(), request.getNewName());
        return ResponseEntity.ok(ApiResponse.ok("Renamed to '" + item.getName() + "' successfully.", item));
    }

    /**
     * DELETE /api/files?path=...
     * Deletes a file or directory.
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteItem(@RequestParam("path") String path) {
        boolean deleted = fileOperations.deleteItem(path);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.ok("Item deleted successfully.", null));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to delete item: " + path));
        }
    }

    /**
     * GET /api/files/preview?path=...
     * Previews a text file with content and metadata.
     */
    @GetMapping("/preview")
    public ResponseEntity<ApiResponse<FilePreviewResponse>> previewFile(@RequestParam("path") String path) {
        FilePreviewResponse preview = fileOperations.previewFile(path);
        return ResponseEntity.ok(ApiResponse.ok("File preview loaded.", preview));
    }

    /**
     * PUT /api/files/content
     * Saves updated content back to a text file.
     */
    @PutMapping("/content")
    public ResponseEntity<ApiResponse<FilePreviewResponse>> saveFileContent(@RequestBody UpdateContentRequest request) {
        FilePreviewResponse response = fileOperations.saveFileContent(request.getPath(), request.getContent());
        return ResponseEntity.ok(ApiResponse.ok("File saved successfully.", response));
    }

    /**
     * GET /api/files/search?name=...
     * Searches for files and folders by name.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FileItem>>> searchFiles(
            @RequestParam("name") String name,
            @RequestParam(value = "path", required = false, defaultValue = "") String path) {
        List<FileItem> results = fileOperations.searchFiles(name, path);
        return ResponseEntity.ok(ApiResponse.ok("Found " + results.size() + " matches.", results));
    }
}
