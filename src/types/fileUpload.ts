export type FileUploadLogType = {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  isVerified: boolean;
  remarks: string;
}