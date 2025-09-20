// Generic function to push events to GTM
export const pushToDataLayer = (eventName, eventData = {}) => {
  if (window && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
  } else {
    console.warn("GTM not initialized yet");
  }
};