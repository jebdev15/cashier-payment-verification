export type FileUploadLogType = {
  id: number;
  referenceId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  isVerified: boolean;
  remarks: string;
}