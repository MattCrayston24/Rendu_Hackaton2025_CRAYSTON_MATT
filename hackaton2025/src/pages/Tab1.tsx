import { camera, trash, heart, close } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonButton,
  IonModal
} from '@ionic/react';
import './Tab1.css';
import { usePhotoGallery, UserPhoto } from '../hooks/usePhotoGallery';
import { useState } from 'react';

const Tab1: React.FC = () => {
  const { photos, takePhoto, deletePhoto, toggleLike } = usePhotoGallery();
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);

  const handleLike = (photo: UserPhoto) => {
    toggleLike(photo);
    setSelectedPhoto({ ...photo, liked: !photo.liked });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Application Photo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {photos.map((photo) => (
              <IonCol size="6" key={photo.filepath}>
                <IonImg
                  src={photo.webviewPath}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPhoto(photo)}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <IonButton
                    fill="solid"
                    color={photo.liked ? 'danger' : 'light'}
                    expand="block"
                    onClick={() => toggleLike(photo)}
                    style={{ flex: 1, marginRight: '0.25rem' }}
                  >
                    <IonIcon icon={heart} slot="icon-only" />
                  </IonButton>

                  <IonButton
                    color="danger"
                    expand="block"
                    onClick={() => deletePhoto(photo)}
                    style={{ flex: 1, marginLeft: '0.25rem' }}
                  >
                    <IonIcon icon={trash} slot="icon-only" />
                  </IonButton>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={!!selectedPhoto} onDidDismiss={() => setSelectedPhoto(null)}>
          <IonContent
            style={{
              backgroundColor: selectedPhoto?.liked ? '#7a0000' : 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <IonButton
              fill="clear"
              color="light"
              onClick={() => setSelectedPhoto(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
            >
              <IonIcon icon={close} slot="icon-only" />
            </IonButton>

            {selectedPhoto && (
              <>
                <img
                  src={selectedPhoto.webviewPath}
                  alt="Photo agrandie"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                />

                {/* Affichage des infos sur une seule ligne avec fond noir */}
                <div style={{
                  position: 'absolute',
                  left: '2rem',
                  bottom: '2rem',
                  color: 'white',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem'
                }}>
                  <span>Date: {selectedPhoto.date || 'Inconnue'}</span>
                  {selectedPhoto.lat !== undefined && selectedPhoto.lng !== undefined ? (
                    <>
                      <span>Latitude: {selectedPhoto.lat.toFixed(5)}</span>
                      <span>Longitude: {selectedPhoto.lng.toFixed(5)}</span>
                    </>
                  ) : (
                    <span>Coordonnées non disponibles</span>
                  )}
                  {selectedPhoto.city && <span>Ville: {selectedPhoto.city}</span>}
                </div>

                <div style={{
                  position: 'absolute',
                  left: '2rem',
                  bottom: '6rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem'
                }}>
                  <IonButton
                    fill="solid"
                    color={selectedPhoto.liked ? 'danger' : 'light'}
                    onClick={() => handleLike(selectedPhoto)}
                  >
                    <IonIcon icon={heart} slot="icon-only" />
                  </IonButton>

                  <IonButton
                    color="danger"
                    fill="solid"
                    onClick={() => {
                      deletePhoto(selectedPhoto);
                      setSelectedPhoto(null);
                    }}
                  >
                    <IonIcon icon={trash} slot="icon-only" />
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

export default Tab1;
