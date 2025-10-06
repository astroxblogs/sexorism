  
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function ScrollToTop() {
  const pathname = usePathname();

    
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

   
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); 

  return null;  
}

export default ScrollToTop;