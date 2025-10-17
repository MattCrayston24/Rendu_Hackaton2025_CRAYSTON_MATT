import { IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { usePhotoGallery, UserPhoto } from '../hooks/usePhotoGallery';
import './Tab2.css';
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWNyYXlzdG9uIiwiYSI6ImNtZ3Q2N3dqbjAweGgyanMxc2tkeXFkc2wifQ.exdB7OyM7A4ieHiGrKwebw';
mapboxgl.accessToken = MAPBOX_TOKEN;

const Tab2: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { photos } = usePhotoGallery();
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [5.4474, 43.5297],
        zoom: 12,
      });
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    const currentMap = map.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const groupedPhotos: Record<string, UserPhoto[]> = {};
    photos.forEach(photo => {
      if (photo.lat !== undefined && photo.lng !== undefined) {
        const key = `${photo.lat.toFixed(5)}-${photo.lng.toFixed(5)}`; // arrondi pour éviter les micro-variations GPS
        if (!groupedPhotos[key]) groupedPhotos[key] = [];
        groupedPhotos[key].push(photo);
      }
    });

    Object.keys(groupedPhotos).forEach(key => {
      const group = groupedPhotos[key];
      const { lat, lng } = group[0];

      let popupHTML = '';
      if (group.length > 1) {
        const imagesHTML = group
          .map((p, i) =>
            `<img src="${p.webviewPath}" class="carousel-image" style="display:${i === 0 ? 'block' : 'none'};width:180px;border-radius:8px;"/>`
          )
          .join('');

        popupHTML = `
          <div style="text-align:center;position:relative;width:190px;">
            ${imagesHTML}
            <button class="carousel-btn prev-btn" style="position:absolute;left:0;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;font-size:18px;padding:4px 8px;border-radius:4px;">⟨</button>
            <button class="carousel-btn next-btn" style="position:absolute;right:0;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;font-size:18px;padding:4px 8px;border-radius:4px;">⟩</button>
            <div class="carousel-dots" style="margin-top:5px;">
              ${group.map((_, i) => `<span class="dot" style="height:8px;width:8px;margin:2px;background:${i===0?'#333':'#bbb'};border-radius:50%;display:inline-block;"></span>`).join('')}
            </div>
          </div>
        `;
      } else {
        popupHTML = `<img src="${group[0].webviewPath}" width="150" style="border-radius:8px;"/>`;
      }

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);
      const marker = new mapboxgl.Marker()
        .setLngLat([lng!, lat!])
        .setPopup(popup)
        .addTo(currentMap);

      markersRef.current.push(marker);

      marker.getElement().addEventListener('click', () => {
        setTimeout(() => {
          const images = document.querySelectorAll<HTMLImageElement>('.carousel-image');
          const dots = document.querySelectorAll<HTMLElement>('.dot');
          let currentIndex = 0;

          const showImage = (index: number) => {
            images.forEach((img, i) => (img.style.display = i === index ? 'block' : 'none'));
            dots.forEach((dot, i) => (dot.style.background = i === index ? '#333' : '#bbb'));
          };

          document.querySelector('.prev-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
          });

          document.querySelector('.next-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
          });
        }, 150);
      });
    });

    currentMap.resize();
  }, [photos]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carte interactive</IonTitle>
        </IonToolbar>
      </IonHeader>

      <div
        ref={mapContainer}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%',
        }}
      />
    </IonPage>
  );
};

export default Tab2;
