# Java OOP File Explorer Application

A full-stack, desktop-grade File Explorer web application built using **Java 17**, **Spring Boot**, **Java NIO (`java.nio.file`)**, and a **Windows File Explorer-inspired modern frontend** (HTML5, Vanilla CSS, and JavaScript).

Designed specifically for academic and mini-project demonstrations to showcase core **Object-Oriented Programming (OOP)** concepts with clean, real-world working code.

---

## 1. Technology Stack

- **Backend**: Java 17+ & Spring Boot 3.2.5
- **File System**: Java NIO.2 API (`java.nio.file.Path`, `Files`, `Paths`, `SimpleFileVisitor`)
- **Frontend**: Responsive HTML5, Vanilla CSS3 (Custom Design System with Dark/Light Modes), JavaScript (ES6+ Classes)
- **Build & Dependency Management**: Apache Maven (includes `mvnw.cmd` and `run.bat`)
- **Server**: Embedded Apache Tomcat (serving both the REST API and the frontend single-page application on port `8080`)

---

## 2. Key Features

1. **File & Folder Browsing**: Clean, intuitive Windows File Explorer-like interface.
2. **Directory Navigation**: Click into folders, use the **Back**, **Forward**, and **Up** buttons, or jump via **Interactive Breadcrumbs**.
3. **Folder Creation**: Create new directories with instant UI updates and illegal-character validation.
4. **Text File Creation**: Create new `.txt`, `.java`, `.md`, `.json`, `.css`, or `.js` files with optional initial content.
5. **Rename Operations**: Rename files and folders via right-click context menu, toolbar, or pressing `F2`.
6. **Safe Deletion**: Deletion with confirmation modal and recursive sub-tree deletion.
7. **Metadata Display**: Displays item name, file extension/type, human-readable size (`B`, `KB`, `MB`), and last modification timestamp.
8. **Built-in Text Editor & Previewer**: In-app modal with syntax styling, line numbers, word count, and live **Save Changes** capability.
9. **Instant Search**: Real-time debounce search filtering by name across directories.
10. **Multi-Column Sorting**: Sort ascending/descending by Name, Type, Size, or Date Modified.
11. **Polymorphic File Icons**: Categorized SVG icons (Folders, Text, Code, Images, PDFs, Archives, Audio, Video).
12. **Quick Access Sidebar**: One-click navigation to Workspace Home, Documents, Downloads, Source Code, and Notes.
13. **Modern UI Themes**: High-contrast Dark Mode and clean Light Mode with instant toggle and `localStorage` persistence.
14. **Dual View Modes**: Switch between Grid View (responsive cards) and List View (detailed table).
15. **OOP Education Modal**: In-app college presentation modal displaying the 4 OOP concepts with actual source code.

---

## 3. Four Core OOP Concepts Demonstration

### A. Encapsulation (`FileItem.java`)
**Purpose**: Keeps file data encapsulated within the class and controls access through getter and setter methods.
- **Code implementation**:
  ```java
  public abstract class FileItem {
      // Private fields prevent arbitrary modification from outside
      private String name;
      private String path;
      private String type;
      private long size;
      private LocalDateTime lastModified;
      private boolean readable;
      private boolean writable;

      // Controlled access with validation
      public String getName() { return name; }

      public void setName(String name) {
          if (name == null || name.trim().isEmpty()) {
              throw new IllegalArgumentException("File name cannot be empty");
          }
          this.name = name.trim();
      }
      // ...getters and setters
  }
  ```

### B. Inheritance (`FileDocument.java` & `FolderItem.java`)
**Purpose**: Allows child classes to reuse common state and behavior from the parent `FileItem` class while adding specialized fields.
- **Code implementation**:
  ```java
  // Parent Class
  public abstract class FileItem { ... }

  // Child Class 1: Reuses name, path, size; adds extension and isTextFile
  public class FileDocument extends FileItem {
      private String extension;
      private boolean textFile;
      // ...
  }

  // Child Class 2: Reuses common properties; adds directory childCount
  public class FolderItem extends FileItem {
      private int childCount;
      // ...
  }
  ```

### C. Polymorphism (`getItemType()`, `getIcon()`, `getDisplaySize()`)
**Purpose**: The same method invocation produces different outcomes depending on whether the object is a `FileDocument` or a `FolderItem`.
- **Code implementation**:
  ```java
  // In abstract base class FileItem.java:
  public abstract String getItemType();
  public abstract String getIcon();
  public abstract String getDisplaySize();

  // In FileDocument.java:
  @Override
  public String getItemType() { return "File"; }

  @Override
  public String getDisplaySize() {
      // Returns formatted bytes: "1.2 KB", "450 B"
      return formatBytes(getSize());
  }

  // In FolderItem.java:
  @Override
  public String getItemType() { return "Folder"; }

  @Override
  public String getDisplaySize() {
      // Returns item count: "4 items", "Empty"
      return childCount + " items";
  }
  ```

### D. Abstraction (`FileOperations.java` & `FileExplorerService.java`)
**Purpose**: The interface defines the available operations (contract) without exposing disk manipulation details. The service provides the Java NIO implementation.
- **Code implementation**:
  ```java
  // 1. Abstract contract interface
  public interface FileOperations {
      List<FileItem> listFiles(String path);
      FolderItem createFolder(String parentPath, String folderName);
      FileDocument createTextFile(String parentPath, String fileName, String content);
      FileItem renameItem(String path, String newName);
      boolean deleteItem(String path);
      FilePreviewResponse previewFile(String path);
      List<FileItem> searchFiles(String query, String searchRoot);
  }

  // 2. Concrete implementation using Java NIO
  @Service
  public class FileExplorerService implements FileOperations {
      @Override
      public List<FileItem> listFiles(String path) {
          Path targetDir = workspaceConfig.resolveSecurePath(path);
          // Uses java.nio.file.Files.list() internally...
      }
  }
  ```

---

## 4. Security Architecture

- **Dedicated Sandbox Directory**: All file interactions are strictly confined to `./workspace`.
- **Path Traversal Protection**: All paths are validated using Java NIO `Path.normalize()`:
  ```java
  Path target = workspaceRoot.resolve(clean).normalize();
  if (!target.startsWith(workspaceRoot)) {
      throw new InvalidPathException("Access denied: Path traversal attempt detected.");
  }
  ```
- **File Name Sanitization**: Protects against illegal file system characters (`\ / : * ? " < > | \0`).
- **Workspace Root Guard**: Prevents renaming or deleting the workspace root itself.
- **Preview Size Guard**: Prevents memory exhaustion by capping text previews at 5MB.
- **Execution Safeguard**: Non-executable environment; files cannot be executed directly.

---

## 5. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/files?path=...` | List files and folders inside specified path |
| `POST` | `/api/files/folder` | Create a new folder (`{ parentPath, folderName }`) |
| `POST` | `/api/files/text` | Create a new text file (`{ parentPath, fileName, content }`) |
| `PUT` | `/api/files/rename` | Rename an item (`{ path, newName }`) |
| `DELETE`| `/api/files?path=...` | Delete a file or directory recursively |
| `GET` | `/api/files/preview?path=...` | Preview text file content and line metadata |
| `PUT` | `/api/files/content` | Save edited text content (`{ path, content }`) |
| `GET` | `/api/files/search?name=...` | Recursive search by file/folder name |

---

## 6. Project Directory Layout

```
miniproject/
├── pom.xml                                  # Maven project configuration
├── run.bat                                  # One-click Windows runner
├── mvnw.cmd                                 # Local Maven wrapper
├── workspace/                               # Dedicated sandboxed file workspace
│   ├── Documents/
│   │   ├── Project_Proposal.txt
│   │   └── Meeting_Notes.txt
│   ├── Downloads/
│   │   ├── Release_Notes_v1.0.txt
│   │   └── Sample_Config.json
│   ├── SourceCode/
│   │   ├── HelloJava.java
│   │   └── Script.js
│   └── Notes/
│       └── OOP_Concepts_Summary.txt
└── src/
    ├── main/
    │   ├── java/com/example/fileexplorer/
    │   │   ├── FileExplorerApplication.java
    │   │   ├── config/
    │   │   │   └── WorkspaceConfig.java
    │   │   ├── controller/
    │   │   │   └── FileExplorerController.java
    │   │   ├── dto/
    │   │   │   ├── ApiResponse.java
    │   │   │   ├── CreateFileRequest.java
    │   │   │   ├── CreateFolderRequest.java
    │   │   │   ├── RenameRequest.java
    │   │   │   ├── UpdateContentRequest.java
    │   │   │   └── FilePreviewResponse.java
    │   │   ├── exception/
    │   │   │   ├── FileExplorerException.java
    │   │   │   ├── InvalidPathException.java
    │   │   │   ├── ResourceNotFoundException.java
    │   │   │   └── GlobalExceptionHandler.java
    │   │   ├── model/
    │   │   │   ├── FileItem.java           (Encapsulation, Parent Class)
    │   │   │   ├── FileDocument.java       (Inheritance, Polymorphism)
    │   │   │   └── FolderItem.java         (Inheritance, Polymorphism)
    │   │   ├── operations/
    │   │   │   └── FileOperations.java     (Abstraction Interface)
    │   │   └── service/
    │   │       └── FileExplorerService.java(Java NIO Implementation)
    │   └── resources/
    │       ├── application.properties
    │       └── static/
    │           ├── index.html              (Modern Windows Explorer UI)
    │           ├── css/
    │           │   └── styles.css          (Glassmorphism, Dark/Light Themes)
    │           └── js/
    │               └── app.js              (Frontend Controller & REST Client)
    └── test/
        └── java/com/example/fileexplorer/
            └── FileExplorerApplicationTests.java (JUnit 5 Tests)
```

---

## 7. How to Run the Application

### Option A: One-Click Runner (Windows)
Double-click `run.bat` or run in terminal:
```cmd
.\run.bat
```

### Option B: Using Maven Wrapper
```cmd
.\mvnw.cmd spring-boot:run
```

### Option C: Running the Tests
```cmd
.\mvnw.cmd test
```

### Accessing the Web Application
Once the terminal displays `Tomcat started on port 8080`, open your web browser at:
```
http://localhost:8080/
```

---

## 8. Live Demo & CI/CD Deployment

- **GitHub Repository**: [https://github.com/ithimath/file_explorer.git](https://github.com/ithimath/file_explorer.git)
- **GitHub Pages Live Demo**: [https://ithimath.github.io/file_explorer/](https://ithimath.github.io/file_explorer/)
- **Automated CI/CD**:
  - `ci.yml`: Builds and packages the Spring Boot JAR with JDK 17 and Maven, running all unit tests.
  - `deploy.yml`: Deploys the interactive web application to GitHub Pages.

