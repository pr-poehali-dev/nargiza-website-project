import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeSection: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  scrollToSection: (id: string) => void;
}

const Navigation = ({ activeSection, mobileMenuOpen, setMobileMenuOpen, scrollToSection }: NavigationProps) => {
  const navigate = useNavigate();

  return (
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
            <button
              onClick={() => navigate('/videos')}
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              Клипы
            </button>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                <Icon name="Send" size={20} />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://www.instagram.com/nargizamuz?igsh=MThzaDNsYmF0cHdqdg==" target="_blank" rel="noopener noreferrer">
                <Icon name="Instagram" size={20} />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://youtube.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                <Icon name="Youtube" size={20} />
              </a>
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
            <button
              onClick={() => navigate('/videos')}
              className="text-left text-lg font-medium transition-colors hover:text-primary py-2 text-muted-foreground"
            >
              Клипы
            </button>
            <div className="flex gap-4 pt-4 border-t border-border">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                  <Icon name="Send" size={20} />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://www.instagram.com/nargizamuz?igsh=MThzaDNsYmF0cHdqdg==" target="_blank" rel="noopener noreferrer">
                  <Icon name="Instagram" size={20} />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://youtube.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                  <Icon name="Youtube" size={20} />
                </a>
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Music" size={20} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
