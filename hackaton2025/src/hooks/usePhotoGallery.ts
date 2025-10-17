import { useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Geolocation } from '@capacitor/geolocation';

const PHOTO_STORAGE = 'photos';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  liked?: boolean;
  lat?: number;
  lng?: number;
  date?: string; 
  city?: string;
}

export function usePhotoGallery() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  const savePicture = async (photo: Photo, fileName: string, lat?: number, lng?: number): Promise<UserPhoto> => {
    const base64Data = await base64FromPath(photo.webPath!);

    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
      liked: false,
      lat,
      lng,
      date: new Date().toISOString(), 
    };
  };

  useEffect(() => {
    const loadSaved = async () => {
      const { value } = await Preferences.get({ key: PHOTO_STORAGE });
      const savedPhotos = (value ? JSON.parse(value) : []) as UserPhoto[];

      for (let photo of savedPhotos) {
        const file = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;

        if (photo.date) {
          photo.date = new Date(photo.date).toISOString();
        } else {
          photo.date = new Date().toISOString();
        }
      }

      setPhotos(savedPhotos);
    };

    loadSaved();
  }, []);

  const deletePhoto = async (photo: UserPhoto) => {
    const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
    await Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });
    await Filesystem.deleteFile({ path: photo.filepath, directory: Directory.Data });
    setPhotos(newPhotos);
  };

  const toggleLike = async (photo: UserPhoto) => {
    const updatedPhotos = photos.map(p =>
      p.filepath === photo.filepath ? { ...p, liked: !p.liked } : p
    );
    setPhotos(updatedPhotos);
    await Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(updatedPhotos) });
  };

  const takePhoto = async () => {
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch (err) {
      console.warn('Impossible de récupérer la position GPS :', err);
    }

    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = Date.now() + '.jpeg';
    const savedPhoto = await savePicture(photo, fileName, lat, lng);

    const newPhotos = [savedPhoto, ...photos];
    setPhotos(newPhotos);
    await Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });
  };

  return {
    photos,
    takePhoto,
    savePicture,
    deletePhoto,
    toggleLike,
  };
}

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject('method did not return a string');
    };
    reader.readAsDataURL(blob);
  });
}
