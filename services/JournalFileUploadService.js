// Journal File Upload Service
// Handles uploading files to Supabase storage bucket for journal attachments

import { getSupabaseClient } from '@/utils/supabaseWellness';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export class JournalFileUploadService {
  static bucketName = 'journal_storage';

  /**
   * Upload a file to journal storage
   * @param {{ uri: string, name: string, size: number, type: string }} file - RN asset object
   * @param {string} userId - User ID for organizing files
   * @param {string} journalEntryId - Journal entry ID (optional)
   * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
   */
  static async uploadFile(file, userId, journalEntryId = null) {
    try {
      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File size exceeds 2MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        };
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `File type ${file.type} is not allowed. Allowed types: images, videos, PDFs, and documents.`
        };
      }

      // Generate unique file path
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize filename

      const filePath = `${userId}/${journalEntryId || 'temp'}/${timestamp}_${randomId}_${sanitizedFileName}.${fileExtension}`;

      // Read file as base64 from URI
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Decode base64 to binary array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload file to Supabase storage
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, bytes, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        console.error('Upload error:', error);
        console.error('Upload details:', {
          filePath,
          bucketName: this.bucketName,
          fileSize: file.size,
          fileType: file.type,
        });
        return {
          success: false,
          error: `Upload failed: ${error.message}`,
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    } catch (error) {
      console.error('File upload service error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }
  }

  /**
   * Upload multiple files
   * @param {Array<{ uri: string, name: string, size: number, type: string }>} files - RN asset objects
   * @param {string} userId - User ID
   * @param {string} journalEntryId - Journal entry ID (optional)
   * @returns {Promise<Array>} Array of upload results
   */
  static async uploadMultipleFiles(files, userId, journalEntryId = null) {
    const uploadPromises = Array.from(files).map((file) =>
      this.uploadFile(file, userId, journalEntryId)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Upload multiple files using Edge Function (fallback method)
   * @param {Array<{ uri: string, name: string, size: number, type: string }>} files - RN asset objects
   * @param {string} userId - User ID
   * @param {string} journalEntryId - Journal entry ID (optional)
   * @returns {Promise<Array>} Array of upload results
   */
  static async uploadMultipleFilesDirect(files, userId, journalEntryId = null) {
    const uploadPromises = Array.from(files).map((file) =>
      this.uploadFileDirect(file, userId, journalEntryId)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Upload a file using Edge Function (works with Clerk auth)
   * @param {{ uri: string, name: string, size: number, type: string }} file - RN asset object
   * @param {string} userId - User ID for organizing files
   * @param {string} journalEntryId - Journal entry ID (optional)
   * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
   */
  static async uploadFileDirect(file, userId, journalEntryId = null) {
    try {
      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File size exceeds 2MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        };
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `File type ${file.type} is not allowed. Allowed types: images, videos, PDFs, and documents.`,
        };
      }

      // Get Supabase URL for edge function
      const supabase = await getSupabaseClient();
      const supabaseUrl = supabase.supabaseUrl;
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/journal-file-upload`;

      // Create form data using RN-compatible approach
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
      formData.append('userId', userId);
      formData.append('journalEntryId', journalEntryId || 'temp');

      // Upload using edge function
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function upload error:', {
          status: response.status,
          error: errorText,
        });
        return {
          success: false,
          error: `Upload failed: ${response.status} ${errorText}`,
        };
      }

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Upload failed',
        };
      }

      return {
        success: true,
        url: result.url,
        path: result.path,
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
      };
    } catch (error) {
      console.error('Edge function upload service error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }
  }

  /**
   * Delete a file from storage
   * @param {string} filePath - Path of file to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async deleteFile(filePath) {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        return {
          success: false,
          error: `Delete failed: ${error.message}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      };
    }
  }

  /**
   * Get file info from URL
   * @param {string} url - Public URL of the file
   * @returns {Object} File information
   */
  static getFileInfoFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const fileExtension = fileName.split('.').pop();

      // Determine file type from extension
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const videoExtensions = ['mp4', 'webm', 'mov'];
      const docExtensions = ['pdf', 'doc', 'docx', 'txt'];

      let fileType = 'file';
      if (imageExtensions.includes(fileExtension.toLowerCase())) {
        fileType = 'image';
      } else if (videoExtensions.includes(fileExtension.toLowerCase())) {
        fileType = 'video';
      } else if (docExtensions.includes(fileExtension.toLowerCase())) {
        fileType = 'document';
      }

      return {
        fileName,
        fileExtension,
        fileType,
        url,
      };
    } catch (error) {
      console.error('Error parsing file URL:', error);
      return {
        fileName: 'Unknown',
        fileExtension: '',
        fileType: 'file',
        url,
      };
    }
  }

  /**
   * Convert base64 data URL to RN-compatible asset object
   * Replaces web's dataUrlToFile — saves base64 to a temp file and returns an asset
   * @param {string} dataUrl - Base64 data URL
   * @param {string} fileName - Name for the file
   * @returns {Promise<{ uri: string, name: string, type: string }>} RN asset object
   */
  static async dataUrlToFile(dataUrl, fileName) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const base64 = arr[1];

    // Write base64 to a temp file in RN
    const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(tempUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      uri: tempUri,
      name: fileName,
      type: mime,
    };
  }

  /**
   * Resize image file if it's too large
   * Replaces web's canvas-based resizing with expo-image-manipulator
   * @param {{ uri: string, name: string, type: string }} file - RN asset object
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @param {number} quality - JPEG quality (0-1)
   * @returns {Promise<{ uri: string, name: string, type: string }>} Resized RN asset object
   */
  static async resizeImageFile(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    const result = await ImageManipulator.manipulateAsync(
      file.uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      name: file.name,
      type: file.type || 'image/jpeg',
    };
  }
}