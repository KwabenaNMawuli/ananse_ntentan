const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

class FileService {
  constructor() {
    this.bucket = null;
  }

  initialize() {
    if (!this.bucket) {
      const db = mongoose.connection.db;
      this.bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    }
    return this.bucket;
  }

  async uploadFile(buffer, filename, metadata = {}) {
    try {
      const bucket = this.initialize();
      
      return new Promise((resolve, reject) => {
        const options = { 
          metadata,
          contentType: metadata.contentType || 'application/octet-stream'
        };
        
        const uploadStream = bucket.openUploadStream(filename, options);
        
        uploadStream.on('finish', () => {
          resolve(uploadStream.id);
        });
        
        uploadStream.on('error', (error) => {
          reject(error);
        });
        
        uploadStream.end(buffer);
      });
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async downloadFile(fileId) {
    try {
      const bucket = this.initialize();
      
      return new Promise((resolve, reject) => {
        const chunks = [];
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
        
        downloadStream.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        downloadStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        
        downloadStream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const bucket = this.initialize();
      await bucket.delete(new mongoose.Types.ObjectId(fileId));
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  async getFileStream(fileId) {
    try {
      const bucket = this.initialize();
      return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    } catch (error) {
      console.error('File stream error:', error);
      throw error;
    }
  }
}

module.exports = new FileService();
