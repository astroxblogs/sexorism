import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pushToDataLayer } from "../utils/gtmEvents";

const GtmTracker = () => {
  const location = useLocation();

  useEffect(() => {
    pushToDataLayer("page_view", {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);

  return null;
};

export default GtmTracker;
