package com.example.fileexplorer.operations;

import com.example.fileexplorer.dto.FilePreviewResponse;
import com.example.fileexplorer.model.FileDocument;
import com.example.fileexplorer.model.FileItem;
import com.example.fileexplorer.model.FolderItem;

import java.util.List;

/**
 * Interface defining abstract file system operations.
 * 
 * OOP Concept 4: ABSTRACTION
 * - Declares the contract for file operations without exposing internal implementation details.
 * - Callers only rely on these method signatures, not whether files are stored locally,
 *   via Java NIO, in cloud storage, or in memory.
 */
public interface FileOperations {

    /**
     * Lists all files and directories in the given directory path.
     * 
     * @param path Relative path inside the workspace
     * @return List of FileItem (polymorphic FileDocument and FolderItem objects)
     */
    List<FileItem> listFiles(String path);

    /**
     * Creates a new folder inside the specified parent path.
     * 
     * @param parentPath Relative path to the parent directory
     * @param folderName Name of the new folder to create
     * @return Created FolderItem instance
     */
    FolderItem createFolder(String parentPath, String folderName);

    /**
     * Creates a new text file with optional initial content.
     * 
     * @param parentPath Relative path to the parent directory
     * @param fileName Name of the new text file
     * @param content Initial text content
     * @return Created FileDocument instance
     */
    FileDocument createTextFile(String parentPath, String fileName, String content);

    /**
     * Renames a file or folder.
     * 
     * @param path Relative path of the item to rename
     * @param newName New name for the item
     * @return Updated FileItem instance
     */
    FileItem renameItem(String path, String newName);

    /**
     * Deletes a file or directory.
     * 
     * @param path Relative path of the item to delete
     * @return true if deletion succeeded
     */
    boolean deleteItem(String path);

    /**
     * Previews the content and metadata of a text file.
     * 
     * @param path Relative path to the text file
     * @return FilePreviewResponse with text content and metadata
     */
    FilePreviewResponse previewFile(String path);

    /**
     * Updates/saves text content inside an existing file.
     * 
     * @param path Relative path to the text file
     * @param content New text content to save
     * @return Updated FilePreviewResponse
     */
    FilePreviewResponse saveFileContent(String path, String content);

    /**
     * Searches for files and folders matching the given search query.
     * 
     * @param query Search keyword
     * @param searchRoot Relative path to search from (or root if null/empty)
     * @return List of matching FileItem objects
     */
    List<FileItem> searchFiles(String query, String searchRoot);
}
