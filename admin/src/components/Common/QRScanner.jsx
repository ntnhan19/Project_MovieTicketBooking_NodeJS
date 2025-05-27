import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button, useNotify } from 'react-admin';

const QRScanner = () => {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const notify = useNotify();
  const scannerRef = useRef(null);
  const isScannerActive = useRef(false);

  const startScanner = () => {
    setScanning(true);
    setError(null);
    setResult(null);
  };

  useEffect(() => {
    if (!scanning) return;

    const element = document.getElementById('qr-reader');
    if (!element) {
      const errorMessage = 'Không tìm thấy phần tử quét QR. Vui lòng kiểm tra giao diện.';
      setError(errorMessage);
      notify(errorMessage, { type: 'error' });
      setScanning(false);
      return;
    }

    const html5Qrcode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5Qrcode;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const cameraId = devices[0].id; // Chọn camera đầu tiên
          html5Qrcode
            .start(
              cameraId,
              { fps: 10, qrbox: { width: 250, height: 250 } },
              async (decodedText) => {
                try {
                  const response = await fetch('http://localhost:3000/api/tickets/validate-qr', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ qrData: decodedText }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Lỗi server: ${response.status}`);
                  }

                  const result = await response.json();
                  setResult(result);
                  notify('Xác thực thành công!', { type: 'success' });
                  await html5Qrcode.stop();
                  isScannerActive.current = false;
                  setScanning(false);
                } catch (err) {
                  const errorMessage = err.message || 'Xác thực thất bại';
                  setError(errorMessage);
                  notify(errorMessage, { type: 'error' });
                }
              },
              (err) => {
                console.warn('Lỗi quét:', err);
              }
            )
            .then(() => {
              isScannerActive.current = true;
            })
            .catch((err) => {
              const errorMessage = 'Không thể truy cập webcam: ' + err.message;
              setError(errorMessage);
              notify(errorMessage, { type: 'error' });
              setScanning(false);
            });
        } else {
          const errorMessage = 'Không tìm thấy camera trên thiết bị.';
          setError(errorMessage);
          notify(errorMessage, { type: 'error' });
          setScanning(false);
        }
      })
      .catch((err) => {
        const errorMessage = 'Lỗi khi liệt kê camera: ' + err.message;
        setError(errorMessage);
        notify(errorMessage, { type: 'error' });
        setScanning(false);
      });

    return () => {
      if (isScannerActive.current && scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            console.log('Scanner đã dừng thành công');
            isScannerActive.current = false;
          })
          .catch((err) => console.error('Lỗi dừng scanner:', err));
      }
    };
  }, [scanning, notify]);

  return (
    <div className="flex flex-col items-center">
      {!scanning && (
        <Button
          label="Bắt đầu quét"
          onClick={startScanner}
          disabled={scanning}
          variant="contained"
          className="mb-4"
        />
      )}
      <div id="qr-reader" className="w-full max-w-xs mb-4" style={{ minHeight: '250px' }}>
        {scanning && <p className="text-center text-sm">Đang tải camera...</p>}
      </div>
      {error && typeof error === 'string' && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}
      {result && (
        <div className="text-sm">
          <p><strong>Vé ID:</strong> {result.ticketId || 'N/A'}</p>
          {result.concessionOrderId && (
            <p><strong>Đơn bắp nước ID:</strong> {result.concessionOrderId}</p>
          )}
          <p><strong>Trạng thái:</strong> {result.status || 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;