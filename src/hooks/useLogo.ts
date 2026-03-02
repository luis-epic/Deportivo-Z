import { useState, useEffect } from 'react';

export function useLogo() {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('deportivo_z_logo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
  }, []);

  const updateLogo = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      localStorage.setItem('deportivo_z_logo', base64String);
      setLogo(base64String);
      
      // Dispatch a custom event so other components can update
      window.dispatchEvent(new Event('logo-updated'));
    };
    reader.readAsDataURL(file);
  };

  // Listen for changes from other components
  useEffect(() => {
    const handleLogoUpdate = () => {
      const savedLogo = localStorage.getItem('deportivo_z_logo');
      if (savedLogo) {
        setLogo(savedLogo);
      }
    };

    window.addEventListener('logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('logo-updated', handleLogoUpdate);
  }, []);

  return { logo, updateLogo };
}
