// src/features/ProcessMining/components/UI/Portal.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";

/**
 * Props for the Portal component.
 *
 * @interface PortalProps
 * @property {React.ReactNode} children - The content to render inside the portal.
 */
interface PortalProps {
  children: React.ReactNode;
}

/**
 * Portal component creates a React Portal to render children into a DOM node
 * that exists outside the DOM hierarchy of the parent component.
 *
 * This component checks if a DOM element with the id 'portal-root' exists.
 * If it does not exist, it creates one, sets it up with fixed positioning and full-screen dimensions,
 * and appends it to the document body. When the component unmounts,
 * it removes the 'portal-root' element if it has no child elements.
 *
 * @param {PortalProps} props - The properties for the component.
 * @returns {JSX.Element | null} The portal element with rendered children or null if the portal is not ready.
 */
export const Portal: React.FC<PortalProps> = ({ children }) => {
  // State to hold the portal root element.
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Try to find an existing element with id 'portal-root'
    let element = document.getElementById('portal-root');
    
    // If the element does not exist, create and append it.
    if (!element) {
      element = document.createElement('div');
      element.id = 'portal-root';
      element.className = 'fixed inset-0 w-full h-full z-50 pointer-events-none';
      document.body.appendChild(element);
    }
    // Set the portalRoot state.
    setPortalRoot(element);

    // Cleanup function: remove the portal-root element if it's empty.
    return () => {
      const portalElement = document.getElementById('portal-root');
      if (portalElement && portalElement.childElementCount === 0) {
        portalElement.remove();
      }
    };
  }, []);

  // If the portal root exists, render children inside the portal; otherwise, return null.
  return portalRoot ? ReactDOM.createPortal(children, portalRoot) : null;
};
