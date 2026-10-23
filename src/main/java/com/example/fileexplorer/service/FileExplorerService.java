package com.example.fileexplorer.service;

import com.example.fileexplorer.config.WorkspaceConfig;
import com.example.fileexplorer.dto.FilePreviewResponse;
import com.example.fileexplorer.exception.FileExplorerException;
import com.example.fileexplorer.exception.InvalidPathException;
import com.example.fileexplorer.exception.ResourceNotFoundException;
import com.example.fileexplorer.model.FileDocument;
import com.example.fileexplorer.model.FileItem;
import com.example.fileexplorer.model.FolderItem;
import com.example.fileexplorer.operations.FileOperations;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Service implementation for FileOperations interface.
 * 
 * OOP Concept 4: ABSTRACTION
 * - Provides the concrete implementation of the abstract FileOperations interface.
 * - Utilizes Java NIO ("java.nio.file") for all disk and file system operations.
 */
@Service
public class FileExplorerService implements FileOperations {

    private final WorkspaceConfig workspaceConfig;

    // Maximum file size permitted for in-app preview: 5MB
    private static final long MAX_PREVIEW_SIZE = 5 * 1024 * 1024;

    // Set of extensions commonly treated as readable text
    private static final Set<String> TEXT_EXTENSIONS = new HashSet<>(Arrays.asList(
            "txt", "md", "java", "js", "html", "css", "json", "xml", "csv", "log",
            "yml", "yaml", "properties", "sql", "sh", "bat", "cmd", "py", "c", "cpp",
            "h", "ts", "jsx", "tsx", "ini", "gitignore"
    ));

    public FileExplorerService(WorkspaceConfig workspaceConfig) {
        this.workspaceConfig = workspaceConfig;
    }

    /**
     * Lists files and folders inside the provided directory path.
     * Demonstrates Polymorphism: returns a collection of FileItem containing
     * both FileDocument and FolderItem instances.
     */
    @Override
    public List<FileItem> listFiles(String path) {
        Path targetDir = workspaceConfig.resolveSecurePath(path);

        if (!Files.exists(targetDir)) {
            throw new ResourceNotFoundException("Directory not found: " + path);
        }
        if (!Files.isDirectory(targetDir)) {
            throw new InvalidPathException("Target path is a file, not a directory: " + path);
        }

        List<FileItem> items = new ArrayList<>();

        try (Stream<Path> stream = Files.list(targetDir)) {
            List<Path> paths = stream.collect(Collectors.toList());

            for (Path child : paths) {
                try {
                    items.add(toFileItem(child));
                } catch (Exception e) {
                    // Gracefully skip unreadable or locked files
                }
            }
        } catch (IOException e) {
            throw new FileExplorerException("Failed to read directory contents: " + e.getMessage(), e);
        }

        // Sort folders first, then files alphabetically by default
        items.sort((a, b) -> {
            boolean aIsFolder = a instanceof FolderItem;
            boolean bIsFolder = b instanceof FolderItem;
            if (aIsFolder != bIsFolder) {
                return aIsFolder ? -1 : 1;
            }
            return a.getName().compareToIgnoreCase(b.getName());
        });

        return items;
    }

    /**
     * Creates a new folder inside the specified parent path.
     */
    @Override
    public FolderItem createFolder(String parentPath, String folderName) {
        workspaceConfig.validateItemName(folderName);
        Path parent = workspaceConfig.resolveSecurePath(parentPath);

        if (!Files.exists(parent) || !Files.isDirectory(parent)) {
            throw new ResourceNotFoundException("Parent directory does not exist: " + parentPath);
        }

        Path newDir = parent.resolve(folderName).normalize();
        if (Files.exists(newDir)) {
            throw new FileExplorerException("A folder or file with name '" + folderName + "' already exists.");
        }

        try {
            Files.createDirectory(newDir);
            return (FolderItem) toFileItem(newDir);
        } catch (IOException e) {
            throw new FileExplorerException("Unable to create directory: " + e.getMessage(), e);
        }
    }

    /**
     * Creates a new text file inside the parent directory.
     */
    @Override
    public FileDocument createTextFile(String parentPath, String fileName, String content) {
        workspaceConfig.validateItemName(fileName);
        Path parent = workspaceConfig.resolveSecurePath(parentPath);

        if (!Files.exists(parent) || !Files.isDirectory(parent)) {
            throw new ResourceNotFoundException("Parent directory does not exist: " + parentPath);
        }

        Path newFile = parent.resolve(fileName).normalize();
        if (Files.exists(newFile)) {
            throw new FileExplorerException("A file or folder with name '" + fileName + "' already exists.");
        }

        try {
            String initialContent = (content != null) ? content : "";
            Files.writeString(newFile, initialContent, StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
            return (FileDocument) toFileItem(newFile);
        } catch (IOException e) {
            throw new FileExplorerException("Unable to create text file: " + e.getMessage(), e);
        }
    }

    /**
     * Renames an item (file or folder).
     */
    @Override
    public FileItem renameItem(String path, String newName) {
        workspaceConfig.validateItemName(newName);
        Path source = workspaceConfig.resolveSecurePath(path);

        if (!Files.exists(source)) {
            throw new ResourceNotFoundException("Item to rename was not found: " + path);
        }

        if (source.equals(workspaceConfig.getWorkspaceRoot())) {
            throw new InvalidPathException("Cannot rename the workspace root directory.");
        }

        Path target = source.getParent().resolve(newName).normalize();
        if (Files.exists(target) && !source.equals(target)) {
            throw new FileExplorerException("An item with name '" + newName + "' already exists in this folder.");
        }

        try {
            Files.move(source, target, StandardCopyOption.ATOMIC_MOVE);
            return toFileItem(target);
        } catch (AtomicMoveNotSupportedException e) {
            try {
                Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
                return toFileItem(target);
            } catch (IOException ex) {
                throw new FileExplorerException("Failed to rename item: " + ex.getMessage(), ex);
            }
        } catch (IOException e) {
            throw new FileExplorerException("Failed to rename item: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a file or directory recursively.
     */
    @Override
    public boolean deleteItem(String path) {
        Path target = workspaceConfig.resolveSecurePath(path);

        if (!Files.exists(target)) {
            throw new ResourceNotFoundException("Item not found: " + path);
        }

        if (target.equals(workspaceConfig.getWorkspaceRoot())) {
            throw new InvalidPathException("Cannot delete the workspace root directory.");
        }

        try {
            if (Files.isDirectory(target)) {
                // Recursive deletion of folder and contents
                Files.walkFileTree(target, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                        Files.delete(file);
                        return FileVisitResult.CONTINUE;
                    }

                    @Override
                    public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                        Files.delete(dir);
                        return FileVisitResult.CONTINUE;
                    }
                });
            } else {
                Files.delete(target);
            }
            return true;
        } catch (IOException e) {
            throw new FileExplorerException("Failed to delete item: " + e.getMessage(), e);
        }
    }

    /**
     * Previews the content of a text file.
     */
    @Override
    public FilePreviewResponse previewFile(String path) {
        Path file = workspaceConfig.resolveSecurePath(path);

        if (!Files.exists(file)) {
            throw new ResourceNotFoundException("File not found: " + path);
        }
        if (Files.isDirectory(file)) {
            throw new InvalidPathException("Path is a directory, cannot preview as text: " + path);
        }

        try {
            long size = Files.size(file);
            if (size > MAX_PREVIEW_SIZE) {
                throw new FileExplorerException("File is too large to preview (" +
                        String.format("%.2f MB", size / (1024.0 * 1024.0)) + "). Maximum preview limit is 5MB.");
            }

            String ext = getFileExtension(file.getFileName().toString());
            boolean isKnownText = TEXT_EXTENSIONS.contains(ext.toLowerCase());

            String content;
            try {
                content = Files.readString(file, StandardCharsets.UTF_8);
            } catch (Exception e) {
                // Fallback for non-UTF8 text files
                byte[] bytes = Files.readAllBytes(file);
                content = new String(bytes, StandardCharsets.ISO_8859_1);
            }

            int lineCount = content.isEmpty() ? 0 : content.split("\r\n|\r|\n", -1).length;
            LocalDateTime lastModified = LocalDateTime.ofInstant(
                    Files.getLastModifiedTime(file).toInstant(), ZoneId.systemDefault());

            FileDocument doc = (FileDocument) toFileItem(file);

            return new FilePreviewResponse(
                    file.getFileName().toString(),
                    workspaceConfig.toRelativePathString(file),
                    ext,
                    size,
                    doc.getDisplaySize(),
                    lastModified,
                    content,
                    lineCount,
                    Files.isWritable(file),
                    false
            );
        } catch (IOException e) {
            throw new FileExplorerException("Error reading file preview: " + e.getMessage(), e);
        }
    }

    /**
     * Saves updated content back to the file.
     */
    @Override
    public FilePreviewResponse saveFileContent(String path, String content) {
        Path file = workspaceConfig.resolveSecurePath(path);

        if (!Files.exists(file)) {
            throw new ResourceNotFoundException("File not found: " + path);
        }
        if (Files.isDirectory(file)) {
            throw new InvalidPathException("Path points to a directory: " + path);
        }

        try {
            Files.writeString(file, (content != null ? content : ""), StandardCharsets.UTF_8,
                    StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
            return previewFile(path);
        } catch (IOException e) {
            throw new FileExplorerException("Failed to save file content: " + e.getMessage(), e);
        }
    }

    /**
     * Searches recursively for files and folders matching the query.
     */
    @Override
    public List<FileItem> searchFiles(String query, String searchRoot) {
        if (query == null || query.trim().isEmpty()) {
            return listFiles(searchRoot);
        }

        String keyword = query.trim().toLowerCase();
        Path start = workspaceConfig.resolveSecurePath(searchRoot);

        if (!Files.exists(start)) {
            throw new ResourceNotFoundException("Search root directory not found: " + searchRoot);
        }

        List<FileItem> results = new ArrayList<>();

        try (Stream<Path> stream = Files.walk(start, 10)) {
            List<Path> matching = stream
                    .filter(p -> !p.equals(start)) // Exclude the starting root itself
                    .filter(p -> p.getFileName().toString().toLowerCase().contains(keyword))
                    .limit(100)
                    .collect(Collectors.toList());

            for (Path p : matching) {
                try {
                    results.add(toFileItem(p));
                } catch (Exception ignored) {
                }
            }
        } catch (IOException e) {
            throw new FileExplorerException("Error during file search: " + e.getMessage(), e);
        }

        return results;
    }

    /**
     * Helper method constructing polymorphic FileItem (FileDocument or FolderItem)
     * using Java NIO APIs.
     */
    private FileItem toFileItem(Path path) throws IOException {
        String name = path.getFileName() != null ? path.getFileName().toString() : "";
        String relPath = workspaceConfig.toRelativePathString(path);
        LocalDateTime lastModified = LocalDateTime.ofInstant(
                Files.getLastModifiedTime(path).toInstant(), ZoneId.systemDefault());
        boolean readable = Files.isReadable(path);
        boolean writable = Files.isWritable(path);

        if (Files.isDirectory(path)) {
            int childCount = 0;
            try (Stream<Path> sub = Files.list(path)) {
                childCount = (int) sub.count();
            } catch (Exception ignored) {
            }
            return new FolderItem(name, relPath, "Folder", 0, lastModified, readable, writable, childCount);
        } else {
            long size = Files.size(path);
            String ext = getFileExtension(name);
            String probeType = null;
            try {
                probeType = Files.probeContentType(path);
            } catch (Exception ignored) {
            }
            String fileType = (probeType != null) ? probeType : (ext.isEmpty() ? "File" : ext.toUpperCase() + " File");
            boolean isText = TEXT_EXTENSIONS.contains(ext.toLowerCase());

            return new FileDocument(name, relPath, fileType, size, lastModified, readable, writable, ext, isText);
        }
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1);
        }
        return "";
    }
}
