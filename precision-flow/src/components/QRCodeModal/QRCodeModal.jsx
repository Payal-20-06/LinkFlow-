import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../Button/Button';
import './QRCodeModal.css';

const QRCodeModal = ({ url, onClose }) => {
  const svgRef = useRef(null);

  const downloadQRCode = () => {
    if (!svgRef.current) return;
    
    // Get the SVG element
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    
    // Add XML declaration
    const sourceWithPrefix = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const urlStr = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sourceWithPrefix);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = urlStr;
    // Set filename to something recognizable
    const shortCode = url.short.split('/').pop();
    downloadLink.download = `qr-${shortCode}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="pf-qr-modal-overlay" onClick={onClose}>
      <div className="pf-qr-modal anim-fadeInUp" onClick={(e) => e.stopPropagation()}>
        <div className="pf-qr-modal__header">
          <h3 className="pf-qr-modal__title">QR Code</h3>
          <button className="pf-qr-modal__close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pf-qr-modal__content">
          <p className="pf-qr-modal__url mono">{url.short}</p>
          <div className="pf-qr-modal__qr-wrapper">
            <QRCodeSVG
              id={`qr-${url.id}`}
              ref={svgRef}
              value={url.short}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#1e1e24"}
              level={"H"}
              includeMargin={true}
              style={{ borderRadius: '8px' }}
            />
          </div>
        </div>

        <div className="pf-qr-modal__footer">
          <Button variant="primary" fullWidth onClick={downloadQRCode} icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          }>
            Download SVG
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
