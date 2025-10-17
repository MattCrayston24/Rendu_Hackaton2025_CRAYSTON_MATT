import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonViewDidEnter } from '@ionic/react';
import mapboxgl from 'mapbox-gl';
import { useRef } from 'react';
import { usePhotoGallery, UserPhoto } from '../hooks/usePhotoGallery';
import './Tab2.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGdycyIsImEiOiJjbWd0NjRiMG4wMHpzMmtxa2J6Z3ZmZDU2In0.DMtbtG-18hAPyVn6gon5xw';
mapboxgl.accessToken = MAPBOX_TOKEN;

const Tab2: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { photos } = usePhotoGallery();

  useIonViewDidEnter(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [5.4474, 43.5297],
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    setTimeout(() => map.current?.resize(), 200);

    updateMarkers();
  });

  const updateMarkers = () => {
    if (!map.current) return;
    const currentMap = map.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const grouped: Record<string, UserPhoto[]> = {};
    photos.forEach(photo => {
      if (photo.lat !== undefined && photo.lng !== undefined) {
        const key = `${photo.lat.toFixed(5)}-${photo.lng.toFixed(5)}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(photo);
      }
    });

    Object.values(grouped).forEach(group => {
      const { lat, lng } = group[0];

      const isGroup = group.length > 1;

      // Marker element
      let marker: mapboxgl.Marker;
      if (isGroup) {
        const el = document.createElement('div');
        el.className = 'marker-group';
        el.textContent = `${group.length}`;
        marker = new mapboxgl.Marker({ element: el }).setLngLat([lng!, lat!]).addTo(currentMap);
      } else {
        // Epingle rouge pour une seule photo
        marker = new mapboxgl.Marker({ color: '#ff3b30' }).setLngLat([lng!, lat!]).addTo(currentMap);
      }

      // Popup
      const popup = new mapboxgl.Popup({ offset: 25 });
      const popupEl = document.createElement('div');
      popupEl.className = 'popup-container';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'popup-close';
      closeBtn.innerHTML = '✖';
      closeBtn.onclick = () => popup.remove();
      popupEl.appendChild(closeBtn);

      const imgEl = document.createElement('img');
      imgEl.src = group[0].webviewPath || '';
      imgEl.className = 'popup-photo';
      popupEl.appendChild(imgEl);

      const info = document.createElement('div');
      info.className = 'photo-info';
      info.textContent = group[0].date ? new Date(group[0].date).toLocaleString() : '';
      popupEl.appendChild(info);

      if (isGroup) {
        const controls = document.createElement('div');
        controls.className = 'popup-controls';
        const prev = document.createElement('button');
        prev.className = 'popup-prev';
        prev.textContent = '◀';
        const next = document.createElement('button');
        next.className = 'popup-next';
        next.textContent = '▶';
        controls.appendChild(prev);
        controls.appendChild(next);
        popupEl.appendChild(controls);

        let idx = 0;
        const showImage = (i: number) => {
          imgEl.src = group[i].webviewPath || '';
          info.textContent = group[i].date ? new Date(group[i].date).toLocaleString() : '';
        };
        prev.onclick = () => { idx = (idx - 1 + group.length) % group.length; showImage(idx); };
        next.onclick = () => { idx = (idx + 1) % group.length; showImage(idx); };
      }

      popup.setDOMContent(popupEl);
      marker.setPopup(popup);
      markersRef.current.push(marker);
    });
  };

  if (map.current) updateMarkers();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carte interactive</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div
          ref={mapContainer}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '100vh',
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
