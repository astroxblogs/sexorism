 
import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

   
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []); 

  return null;  
}

export default ScrollToTop;