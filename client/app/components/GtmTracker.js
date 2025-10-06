import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushToDataLayer } from "../lib/gtmEvents";

const GtmTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pushToDataLayer("page_view", {
      page_path: pathname + searchParams.toString(),
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
};

export default GtmTracker;