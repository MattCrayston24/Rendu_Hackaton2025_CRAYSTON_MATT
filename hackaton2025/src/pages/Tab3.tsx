import { camera, trash, heart, close, chevronBack, chevronForward } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonButton,
  IonIcon,
  IonModal
} from '@ionic/react';
import './Tab3.css';
import { usePhotoGallery, UserPhoto } from '../hooks/usePhotoGallery';
import { useState } from 'react';

const Tab3: React.FC = () => {
  const { photos, deletePhoto, toggleLike } = usePhotoGallery();
  const likedPhotos = photos.filter(photo => photo.liked);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto = selectedIndex !== null ? likedPhotos[selectedIndex] : null;

  const handleLike = (photo: UserPhoto) => {
    toggleLike(photo);
  };

  const nextPhoto = () => {
    if (selectedIndex !== null && selectedIndex < likedPhotos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Photos likées</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid className="photo-grid">
          <IonRow>
            {likedPhotos.map((photo, index) => (
              <IonCol
                size="6"
                className={`photo-col ${likedPhotos.length === 1 ? 'single-photo' : ''}`}
                key={photo.filepath}
              >
                <IonImg
                  src={photo.webviewPath}
                  className={`photo-img ${likedPhotos.length === 1 ? 'single-photo' : ''}`}
                  onClick={() => setSelectedIndex(index)}
                />

                <div className="photo-actions">
                  <IonButton
                    fill="solid"
                    color={photo.liked ? 'danger' : 'light'}
                    onClick={() => handleLike(photo)}
                  >
                    <IonIcon icon={heart} slot="icon-only" />
                  </IonButton>

                  <IonButton
                    color="danger"
                    fill="solid"
                    onClick={() => deletePhoto(photo)}
                  >
                    <IonIcon icon={trash} slot="icon-only" />
                  </IonButton>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonModal isOpen={selectedIndex !== null} onDidDismiss={() => setSelectedIndex(null)}>
          <IonContent className={`photo-modal-content ${selectedPhoto?.liked ? 'liked' : ''}`}>
            {/* Bouton fermer */}
            <IonButton className="photo-modal-close" fill="clear" onClick={() => setSelectedIndex(null)}>
              <IonIcon icon={close} />
            </IonButton>

            {/* Flèche gauche */}
            {selectedIndex !== null && selectedIndex > 0 && (
              <IonButton className="photo-arrow left" fill="clear" onClick={prevPhoto}>
                <IonIcon icon={chevronBack} />
              </IonButton>
            )}

            {/* Flèche droite */}
            {selectedIndex !== null && selectedIndex < likedPhotos.length - 1 && (
              <IonButton className="photo-arrow right" fill="clear" onClick={nextPhoto}>
                <IonIcon icon={chevronForward} />
              </IonButton>
            )}

            {selectedPhoto && (
              <>
                <img
                  src={selectedPhoto.webviewPath}
                  className="photo-modal-img-no-radius"
                  alt="Photo agrandie"
                />

                <div className="photo-info-line">
                  <span>Date : {selectedPhoto.date || 'Inconnue'}</span>
                  {selectedPhoto.lat !== undefined && selectedPhoto.lng !== undefined ? (
                    <>
                      <span>Lat : {selectedPhoto.lat.toFixed(5)}</span>
                      <span>Lng : {selectedPhoto.lng.toFixed(5)}</span>
                    </>
                  ) : (
                    <span>Coordonnées non disponibles</span>
                  )}
                  {selectedPhoto.city && <span>Ville : {selectedPhoto.city}</span>}
                </div>

                <div className="photo-modal-actions">
                  <IonButton
                    fill="clear"
                    color={selectedPhoto.liked ? 'danger' : 'light'}
                    onClick={() => handleLike(selectedPhoto)}
                  >
                    <IonIcon icon={heart} />
                  </IonButton>

                  <IonButton
                    fill="clear"
                    color="danger"
                    onClick={() => {
                      deletePhoto(selectedPhoto);
                      setSelectedIndex(null);
                    }}
                  >
                    <IonIcon icon={trash} />
                  </IonButton>
                </div>
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
