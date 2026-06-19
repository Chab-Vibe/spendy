/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Az ImageCapture nincs a standard lib.dom.d.ts-ben — minimál deklaráció.
declare class ImageCapture {
  constructor(track: MediaStreamTrack)
  takePhoto(photoSettings?: { imageWidth?: number; imageHeight?: number }): Promise<Blob>
}
