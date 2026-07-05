import React from 'react';
import { useLocation } from 'react-router-dom';

// Mount-time slide-in transition: when the route changes the inner wrapper
// is keyed by pathname so it remounts and plays the slide-in animation.
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    // Play mount animation
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className="relative overflow-hidden">
      <div
        key={location.pathname}
        className={`w-full h-full transition-transform duration-300 ease-out ${entered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageTransition;
