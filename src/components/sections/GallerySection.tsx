import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const gallery = [
  'https://cdn.poehali.dev/files/c8124c8a-fb2c-4862-a097-7ed5dfeb16e2.jpg',
  'https://cdn.poehali.dev/files/8c740a4e-930e-4ca5-9e0d-8f576693c135.jpg',
  'https://cdn.poehali.dev/files/61a5e76d-d6aa-4bb7-ba7f-c43a25aefb6e.jpg',
  'https://cdn.poehali.dev/files/469f299e-8ac3-4a30-850e-e1c3c53a9f06.jpg',
  'https://cdn.poehali.dev/files/44a7af92-053e-4bd1-8ae5-e3d87477fa34.jpg',
  'https://cdn.poehali.dev/files/207cbbc7-08c5-4011-a142-53a39404e9b2.jpg',
  'https://cdn.poehali.dev/files/6e664d2a-d6bb-4e1a-884f-6fe844889d2c.jpg',
  'https://cdn.poehali.dev/files/7cfb1c54-5be8-486f-b126-6039752e5677.jpg',
  'https://cdn.poehali.dev/files/83c64ba9-9359-4f30-a131-6ec03d3e84d2.jpg',
  'https://cdn.poehali.dev/files/1d071cd8-6992-4a04-8cd0-91e1c505b8e1.jpg',
];

const GallerySection = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  return (
    <section id="gallery" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none"></div>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">Галерея</h3>
          <p className="text-xl text-muted-foreground">Моменты из моей творческой жизни</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer animate-scale-in shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => openLightbox(index)}
            >
              <img 
                src={image} 
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Icon name="ZoomIn" size={48} className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
              </div>
            </div>
          ))}
        </div>

        {lightboxOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-6 right-6 text-white hover:text-primary transition-colors z-50 bg-black/50 rounded-full p-2"
              aria-label="Закрыть"
            >
              <Icon name="X" size={32} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-6 text-white hover:text-primary transition-colors z-50"
              aria-label="Предыдущее фото"
            >
              <Icon name="ChevronLeft" size={48} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-6 text-white hover:text-primary transition-colors z-50"
              aria-label="Следующее фото"
            >
              <Icon name="ChevronRight" size={48} />
            </button>

            <img
              src={gallery[currentImageIndex]}
              alt={`Gallery ${currentImageIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm z-50">
              {currentImageIndex + 1} / {gallery.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
