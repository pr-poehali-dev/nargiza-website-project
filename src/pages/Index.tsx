import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';


const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };



  const gallery = [
    'https://cdn.poehali.dev/files/c8124c8a-fb2c-4862-a097-7ed5dfeb16e2.jpg',
    'https://cdn.poehali.dev/files/8c740a4e-930e-4ca5-9e0d-8f576693c135.jpg',
    'https://cdn.poehali.dev/files/61a5e76d-d6aa-4bb7-ba7f-c43a25aefb6e.jpg',
    'https://cdn.poehali.dev/files/469f299e-8ac3-4a30-850e-e1c3c53a9f06.jpg',
    'https://cdn.poehali.dev/files/44a7af92-053e-4bd1-8ae5-e3d87477fa34.jpg',
    'https://cdn.poehali.dev/files/207cbbc7-08c5-4011-a142-53a39404e9b2.jpg',
  ];



  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">NARGIZA</h1>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground"
              aria-label="Toggle menu"
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>

            <div className="hidden md:flex gap-8">
              {['home', 'gallery'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'gallery' && 'Галерея'}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                  <Icon name="Send" size={20} />
                </a>
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Instagram" size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Youtube" size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Music" size={20} />
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border animate-fade-in">
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {['home', 'gallery'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-left text-lg font-medium transition-colors hover:text-primary py-2 ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'gallery' && 'Галерея'}
                </button>
              ))}
              <div className="flex gap-4 pt-4 border-t border-border">
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                    <Icon name="Send" size={20} />
                  </a>
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="Instagram" size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="Youtube" size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="Music" size={20} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full object-cover"
          src="https://www.youtube.com/embed/df-ah9akclY?autoplay=1&mute=1&loop=1&playlist=df-ah9akclY&controls=0&showinfo=0&rel=0&modestbranding=1"
          title="Background video"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          style={{
            pointerEvents: 'none',
            transform: 'scale(1.5)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-6 animate-fade-in">
          <h2 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-2xl">
            NARGIZA
          </h2>
          <p className="text-xl md:text-2xl text-white mb-8 font-light drop-shadow-lg">
            Автор и исполнитель
          </p>
          <Button size="lg" className="group" onClick={() => scrollToSection('gallery')}>
            Смотреть галерею
            <Icon name="Image" size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      <section className="py-24 px-6 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h3 className="text-5xl font-bold mb-8">О себе</h3>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                NARGIZA — современная Казахская исполнительница, активно развивающаяся на российской музыкальной сцене с 2025 года.
              </p>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Музыкальный стиль сочетает лирические композиции с социально значимыми произведениями.
              </p>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Проект создавался самой исполнительницей для поддержки России в трудное военное время. Самой исполнительницей написано много песен на военную тему.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Последнее время после знакомства и совместной работе с музыкантом Calla Vivid часто применяется в исполнении стиль хип хоп и музыкальный стиль инди. Этот совместный творческий союз принёс положительный результат в новых композициях, которые стали более изящными и индивидуальными.
              </p>
              <div className="flex gap-4 mt-8">
                <Button variant="outline" size="lg" className="gap-2">
                  <Icon name="Music" size={20} />
                  Яндекс Музыка
                </Button>
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <a href="https://music.apple.com/tr/artist/nargiza/1720377821" target="_blank" rel="noopener noreferrer">
                    <Icon name="Music" size={20} />
                    Apple Music
                  </a>
                </Button>
              </div>
            </div>

            <div className="animate-scale-in">
              <Card>
                <CardContent className="p-8">
                  <h4 className="text-2xl font-bold mb-6">Дискография</h4>
                  
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold mb-3 text-primary">Альбомы</h5>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="Disc3" size={20} className="text-secondary" />
                      <details className="cursor-pointer group">
                        <summary className="list-none text-muted-foreground hover:text-foreground transition-colors">
                          «Никчёмная жизнь»
                          <Icon name="ChevronDown" size={16} className="inline ml-1 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="pl-8 mt-3 space-y-2 text-sm">
                          {[
                            'Когда ты один',
                            'Пустой экран',
                            'Никто не ждёт (Сл. A.Nevskiy)',
                            'Никчёмная жизнь',
                            'Когда никто не ищет',
                            'Всё проходит (Сл. Ю.Левитанский)',
                            'Мы тратим время',
                            'Забудешь',
                            'Мне нечем заняться',
                            'Одно и то же',
                            'Вся суть',
                            'Молодо зелено',
                            'Земной путь',
                            'Смартфон',
                            'Это другая я'
                          ].map((track, i) => (
                            <div key={i} className="text-muted-foreground/80">
                              {i + 1}. {track}
                            </div>
                          ))}
                          <div className="flex gap-2 pt-3">
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
                              <a href="https://music.yandex.ru/album/38836368" target="_blank" rel="noopener noreferrer">
                                <Icon name="Music" size={14} />
                                Яндекс
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
                              <a href="https://music.apple.com/tr/album/%D0%BD%D0%B8%D0%BA%D1%87%D1%91%D0%BC%D0%BD%D0%B0%D1%8F-%D0%B6%D0%B8%D0%B7%D0%BD%D1%8C/1848552571" target="_blank" rel="noopener noreferrer">
                                <Icon name="Music" size={14} />
                                Apple
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
                              <a href="https://open.spotify.com/album/2LhOw0UIUtiSxa5DVOpJ7e" target="_blank" rel="noopener noreferrer">
                                <Icon name="Music" size={14} />
                                Spotify
                              </a>
                            </Button>
                          </div>
                        </div>
                      </details>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="Disc3" size={20} className="text-secondary" />
                      <span className="text-muted-foreground">«Украина»</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className="text-lg font-semibold mb-3 text-primary">Синглы</h5>
                    <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                      {['Я волонтёр', 'Земля', 'Ты мне врёшь', 'Он занят', 'Похоронка', 'Сижу на работе', 'Immortal Regiment', 'Ты изменил мне', 'Мы вернёмся', 'Crimson Dream'].map((single, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Icon name="Music" size={14} className="text-secondary" />
                          <span>{single}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="default" 
                    className="w-full gap-2"
                    onClick={() => navigate('/albums')}
                  >
                    <Icon name="Disc3" size={18} />
                    Все альбомы
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-5xl font-bold mb-12 animate-slide-up">Галерея</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-muted-foreground">© 2024 NARGIZA. Все права защищены.</p>
            <div className="flex gap-6">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                  <Icon name="Send" size={24} />
                </a>
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Instagram" size={24} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Youtube" size={24} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Music" size={24} />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;