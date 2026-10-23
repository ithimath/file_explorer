package com.example.fileexplorer;

import com.example.fileexplorer.dto.FilePreviewResponse;
import com.example.fileexplorer.exception.InvalidPathException;
import com.example.fileexplorer.model.FileDocument;
import com.example.fileexplorer.model.FileItem;
import com.example.fileexplorer.model.FolderItem;
import com.example.fileexplorer.operations.FileOperations;
import com.example.fileexplorer.service.FileExplorerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FileExplorerApplicationTests {

    @Autowired
    private FileOperations fileOperations;

    @Autowired
    private FileExplorerService fileExplorerService;

    @Test
    @DisplayName("OOP Concept 1: Verify Encapsulation on FileItem")
    void testEncapsulation() {
        FileDocument doc = new FileDocument();
        doc.setName("test.txt");
        doc.setSize(1024);
        doc.setType("Text File");
        doc.setLastModified(LocalDateTime.now());
        doc.setReadable(true);
        doc.setWritable(true);

        assertEquals("test.txt", doc.getName());
        assertEquals(1024, doc.getSize());
        assertEquals("Text File", doc.getType());
        assertTrue(doc.isReadable());
        assertTrue(doc.isWritable());

        // Validate encapsulation protects against null or empty names
        assertThrows(IllegalArgumentException.class, () -> doc.setName("   "));
    }

    @Test
    @DisplayName("OOP Concept 2: Verify Inheritance (FileDocument & FolderItem inherit from FileItem)")
    void testInheritance() {
        FileItem doc = new FileDocument("doc.txt", "doc.txt", "File", 500, LocalDateTime.now(), true, true, "txt", true);
        FileItem folder = new FolderItem("MyFolder", "MyFolder", "Folder", 0, LocalDateTime.now(), true, true, 2);

        // Subclasses are instances of parent FileItem
        assertTrue(doc instanceof FileItem);
        assertTrue(folder instanceof FileItem);

        // Inherited getter behavior
        assertEquals("doc.txt", doc.getName());
        assertEquals("MyFolder", folder.getName());
    }

    @Test
    @DisplayName("OOP Concept 3: Verify Polymorphism (getItemType produces different outputs)")
    void testPolymorphism() {
        FileItem doc = new FileDocument("sample.java", "sample.java", "File", 200, LocalDateTime.now(), true, true, "java", true);
        FileItem folder = new FolderItem("src", "src", "Folder", 0, LocalDateTime.now(), true, true, 5);

        // Polymorphic call to getItemType()
        assertEquals("File", doc.getItemType());
        assertEquals("Folder", folder.getItemType());

        // Polymorphic icon resolution
        assertEquals("file-code", doc.getIcon());
        assertEquals("folder", folder.getIcon());
    }

    @Test
    @DisplayName("OOP Concept 4: Verify Abstraction (FileOperations interface used polymorphically)")
    void testAbstraction() {
        assertNotNull(fileOperations);
        assertTrue(fileOperations instanceof FileExplorerService);

        // Call method defined on FileOperations interface
        List<FileItem> items = fileOperations.listFiles("");
        assertNotNull(items);
        assertFalse(items.isEmpty(), "Workspace should contain sample items initialized at startup");
    }

    @Test
    @DisplayName("Security: Path Traversal attempts should be blocked with InvalidPathException")
    void testSecurityPathTraversal() {
        assertThrows(InvalidPathException.class, () -> fileOperations.listFiles("../"));
        assertThrows(InvalidPathException.class, () -> fileOperations.listFiles("../../windows/system32"));
        assertThrows(InvalidPathException.class, () -> fileOperations.createFolder("", "../malicious"));
    }

    @Test
    @DisplayName("File CRUD Operations: Create, Preview, Rename, Delete")
    void testFileCrudOperations() {
        String testFileName = "junit_test_file.txt";
        String testContent = "Hello from JUnit test suite!";

        // 1. Create
        FileDocument created = fileOperations.createTextFile("", testFileName, testContent);
        assertNotNull(created);
        assertEquals(testFileName, created.getName());

        // 2. Preview
        FilePreviewResponse preview = fileOperations.previewFile(testFileName);
        assertEquals(testContent, preview.getContent());

        // 3. Rename
        String renamedFileName = "junit_renamed_file.txt";
        FileItem renamed = fileOperations.renameItem(testFileName, renamedFileName);
        assertEquals(renamedFileName, renamed.getName());

        // 4. Delete
        boolean deleted = fileOperations.deleteItem(renamedFileName);
        assertTrue(deleted);
    }
}
