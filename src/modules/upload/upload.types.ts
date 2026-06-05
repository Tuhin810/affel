export const uploadFolders = [
  "merchant/logos",
  "merchant/banners",
] as const;

export type UploadFolder =
  (typeof uploadFolders)[number];

export interface GenerateSignatureDto {
  folder: UploadFolder;
}
