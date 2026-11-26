import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { FindTicketsPage } from './pages/FindTicketsPage';
import { ProgrammePage } from './pages/ProgrammePage';
import { AboutPage } from './pages/AboutPage';
import { ConferencePage } from './pages/ConferencePage';
import {
  MinistersPage,
  CampInfoPage,
  FaqPage,
  ContactPage,
  LegalPage,
} from './pages/SecondaryPages';

function normalizePath(raw: string): string {
  const path = raw.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

export default function App() {
  const [path, setPath] = useState<string>(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setPath(normalizePath(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (nextPath: string) => {
    const clean = normalizePath(nextPath);
    if (clean !== path) {
      window.history.pushState({}, '', nextPath);
      setPath(clean);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (path) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/register':
        return <RegisterPage onNavigate={navigate} />;
      case '/find-my-tickets':
        return <FindTicketsPage onNavigate={navigate} />;
      case '/programme':
        return <ProgrammePage onNavigate={navigate} />;
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/conference':
        return <ConferencePage onNavigate={navigate} />;
      case '/ministers':
        return <MinistersPage onNavigate={navigate} />;
      case '/camp-info':
        return <CampInfoPage onNavigate={navigate} />;
      case '/faq':
        return <FaqPage onNavigate={navigate} />;
      case '/contact':
        return <ContactPage onNavigate={navigate} />;
      case '/terms':
        return <LegalPage mode="terms" onNavigate={navigate} />;
      case '/privacy':
        return <LegalPage mode="privacy" onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#4b5563]">
      <Header currentPath={path} onNavigate={navigate} />
      <main id="main" className="flex-1">
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
