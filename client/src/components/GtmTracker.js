import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GtmTracker = () => {
  const location = useLocation();

  useEffect(() => {
    
    if (window.dataLayer) {
       
      window.dataLayer.push({
        event: 'virtual_page_view',  
        page_path: location.pathname + location.search,
        page_title: document.title,  
      });
    }
  }, [location]);  
   
  return null;
};

export default GtmTracker;