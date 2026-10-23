package com.example.fileexplorer.config;

import com.example.fileexplorer.exception.InvalidPathException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.regex.Pattern;

/**
 * Configuration and security manager for the dedicated workspace directory.
 * 
 * Security Requirements:
 * - Restrict all operations to dedicated application workspace directory.
 * - Prevent path traversal attacks ("../", "..\").
 * - Never allow access to arbitrary system files.
 * - Validate all paths and file names.
 */
@Configuration
public class WorkspaceConfig {

    @Value("${file.explorer.root-dir:./workspace}")
    private String configuredRootDir;

    private Path workspaceRoot;

    // Pattern for illegal file/folder name characters: \ / : * ? " < > | \0
    private static final Pattern ILLEGAL_CHARS = Pattern.compile("[\\\\/:*?\"<>|\\x00]");

    @PostConstruct
    public void init() throws IOException {
        this.workspaceRoot = Paths.get(configuredRootDir).toAbsolutePath().normalize();
        if (!Files.exists(workspaceRoot)) {
            Files.createDirectories(workspaceRoot);
        }
        initializeSampleWorkspace();
    }

    public Path getWorkspaceRoot() {
        return workspaceRoot;
    }

    /**
     * Resolves and validates a relative path against the workspace root.
     * Guaranteed to prevent path traversal attacks.
     */
    public Path resolveSecurePath(String relativePath) {
        if (relativePath == null) {
            relativePath = "";
        }

        // Clean leading/trailing slashes and spaces
        String clean = relativePath.trim().replace('\\', '/');
        while (clean.startsWith("/")) {
            clean = clean.substring(1);
        }

        // Prevent traversal characters in explicit path segments
        if (clean.contains("..")) {
            throw new InvalidPathException("Path traversal attempt detected: '" + relativePath + "' contains illegal '..' sequence.");
        }

        Path target = workspaceRoot.resolve(clean).normalize();

        // Enforce boundary containment
        if (!target.startsWith(workspaceRoot)) {
            throw new InvalidPathException("Access denied: Resolved path lies outside the application workspace root.");
        }

        return target;
    }

    /**
     * Validates that an item name does not contain illegal characters.
     */
    public void validateItemName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new InvalidPathException("File or folder name cannot be empty.");
        }
        String trimmed = name.trim();
        if (ILLEGAL_CHARS.matcher(trimmed).find()) {
            throw new InvalidPathException("Name contains invalid characters (\\ / : * ? \" < > |).");
        }
        if (trimmed.equals(".") || trimmed.equals("..")) {
            throw new InvalidPathException("Invalid file or folder name: '" + trimmed + "'.");
        }
    }

    /**
     * Converts an absolute Path back to a workspace-relative path string with forward slashes.
     */
    public String toRelativePathString(Path absolutePath) {
        if (absolutePath.equals(workspaceRoot)) {
            return "";
        }
        Path rel = workspaceRoot.relativize(absolutePath.normalize());
        return rel.toString().replace('\\', '/');
    }

    /**
     * Initializes default sample folders and text files for university demo/testing.
     */
    private void initializeSampleWorkspace() throws IOException {
        Path docs = workspaceRoot.resolve("Documents");
        Path downloads = workspaceRoot.resolve("Downloads");
        Path src = workspaceRoot.resolve("SourceCode");
        Path notes = workspaceRoot.resolve("Notes");

        if (!Files.exists(docs)) {
            Files.createDirectories(docs);
            Files.writeString(docs.resolve("Project_Proposal.txt"),
                    "File Explorer Application\n" +
                    "=========================\n" +
                    "Author: College Mini-Project Team\n" +
                    "Tech Stack: Java 17, Spring Boot, Java NIO, HTML5, CSS3, JavaScript\n\n" +
                    "Features:\n" +
                    "1. Real-time file & folder browsing\n" +
                    "2. Full CRUD operations (create, rename, delete, preview)\n" +
                    "3. Demonstration of Core OOP: Encapsulation, Inheritance, Polymorphism, Abstraction\n" +
                    "4. Windows File Explorer-inspired Modern UI with Dark/Light mode\n",
                    StandardCharsets.UTF_8);

            Files.writeString(docs.resolve("Meeting_Notes.txt"),
                    "Sprint Planning & OOP Design Meeting\n" +
                    "------------------------------------\n" +
                    "1. Discussed FileItem base class encapsulation.\n" +
                    "2. Verified FileDocument and FolderItem polymorphic getItemType() calls.\n" +
                    "3. Validated Path Traversal security using Java NIO Path.normalize().\n" +
                    "4. Finished frontend glassmorphism layout and icons.\n",
                    StandardCharsets.UTF_8);
        }

        if (!Files.exists(downloads)) {
            Files.createDirectories(downloads);
            Files.writeString(downloads.resolve("Release_Notes_v1.0.txt"),
                    "File Explorer v1.0.0 Release Notes\n" +
                    "----------------------------------\n" +
                    "- Full Java NIO backend\n" +
                    "- RESTful API endpoints\n" +
                    "- Breadcrumb navigation & Sidebar shortcuts\n" +
                    "- Text editor modal with live save\n" +
                    "- Sorting & search functionality\n",
                    StandardCharsets.UTF_8);

            Files.writeString(downloads.resolve("Sample_Config.json"),
                    "{\n  \"appName\": \"Modern Java File Explorer\",\n  \"version\": \"1.0.0\",\n  \"theme\": \"dark\",\n  \"maxPreviewSizeBytes\": 5242880\n}\n",
                    StandardCharsets.UTF_8);
        }

        if (!Files.exists(src)) {
            Files.createDirectories(src);
            Files.writeString(src.resolve("HelloJava.java"),
                    "public class HelloJava {\n" +
                    "    public static void main(String[] args) {\n" +
                    "        System.out.println(\"Welcome to Java OOP File Explorer!\");\n" +
                    "    }\n" +
                    "}\n",
                    StandardCharsets.UTF_8);

            Files.writeString(src.resolve("Script.js"),
                    "// Sample frontend helper script\n" +
                    "console.log('File Explorer Ready!');\n",
                    StandardCharsets.UTF_8);
        }

        if (!Files.exists(notes)) {
            Files.createDirectories(notes);
            Files.writeString(notes.resolve("OOP_Concepts_Summary.txt"),
                    "JAVA OOP CONCEPTS DEMONSTRATION IN THIS PROJECT\n" +
                    "===============================================\n\n" +
                    "1. ENCAPSULATION:\n" +
                    "   FileItem has private fields (name, path, type, size, lastModified).\n" +
                    "   Access is controlled strictly through getters and validated setters.\n\n" +
                    "2. INHERITANCE:\n" +
                    "   FileDocument and FolderItem extend the common parent class FileItem,\n" +
                    "   reusing all core attributes while adding specific traits.\n\n" +
                    "3. POLYMORPHISM:\n" +
                    "   getItemType() produces \"File\" when invoked on FileDocument and\n" +
                    "   \"Folder\" when invoked on FolderItem. Same method call, distinct behaviors!\n\n" +
                    "4. ABSTRACTION:\n" +
                    "   The FileOperations interface hides file system complexity behind\n" +
                    "   clean method declarations (listFiles, createFolder, renameItem, deleteItem).\n" +
                    "   FileExplorerService provides the Java NIO implementation.\n",
                    StandardCharsets.UTF_8);
        }
    }
}
