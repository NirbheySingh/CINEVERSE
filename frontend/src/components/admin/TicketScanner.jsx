import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../services/api';
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaKeyboard } from 'react-icons/fa';

const TicketScanner = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const verifyTicket = async (ticketId) => {
    const id = String(ticketId).trim();
    if (!id) return;

    try {
      const res = await api.post('/tickets/verify', { ticketId: id });
      setScanResult(res.data.data);
    } catch (err) {
      setScanResult({
        valid: false,
        message: err.response?.data?.message || 'Verification failed',
      });
    }
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (html5QrRef.current) {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      }

      const scanner = new Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setTicketInput(decodedText);
          verifyTicket(decodedText);
          stopCamera();
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      setCameraError(err.message || 'Camera access denied. Use manual entry below.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch {
        // ignore
      }
      html5QrRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          <FaQrcode className="text-primary" /> Ticket Scanner
        </h2>
        <p className="text-gray-400 mt-2">
          Scan customer QR codes at entry. Only tickets with completed real payment are valid.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div
            id="qr-reader"
            ref={scannerRef}
            className={`w-full rounded-xl overflow-hidden bg-black/50 ${isScanning ? 'min-h-[300px]' : 'min-h-[120px] flex items-center justify-center'}`}
          >
            {!isScanning && (
              <p className="text-gray-500 text-sm p-8 text-center">Camera preview appears here</p>
            )}
          </div>

          {cameraError && (
            <p className="text-yellow-400 text-sm mt-3">{cameraError}</p>
          )}

          <div className="flex gap-3 mt-4">
            {!isScanning ? (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                Start Camera Scanner
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition"
              >
                Stop Camera
              </button>
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaKeyboard /> Manual ticket ID
          </h3>
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder="TKT-123456"
            className="w-full px-4 py-3 bg-darker border border-white/10 rounded-lg text-white font-mono mb-4 focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => verifyTicket(ticketInput)}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition"
          >
            Verify Ticket
          </button>
        </div>
      </div>

      {scanResult && (
        <div
          className={`p-6 rounded-2xl border ${
            scanResult.valid
              ? 'bg-green-500/10 border-green-500/40'
              : 'bg-red-500/10 border-red-500/40'
          }`}
        >
          <div className="flex items-start gap-4">
            {scanResult.valid ? (
              <FaCheckCircle className="text-green-400 text-4xl flex-shrink-0" />
            ) : (
              <FaTimesCircle className="text-red-400 text-4xl flex-shrink-0" />
            )}
            <div>
              <h3
                className={`text-xl font-bold ${scanResult.valid ? 'text-green-400' : 'text-red-400'}`}
              >
                {scanResult.message}
              </h3>
              {scanResult.booking && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-300">
                  <p>
                    <span className="text-gray-500">Movie:</span> {scanResult.booking.movie}
                  </p>
                  <p>
                    <span className="text-gray-500">Theatre:</span> {scanResult.booking.theatre}
                  </p>
                  <p>
                    <span className="text-gray-500">Time:</span> {scanResult.booking.time}
                  </p>
                  <p>
                    <span className="text-gray-500">Amount:</span> {scanResult.booking.currency}{' '}
                    {scanResult.booking.totalAmount}
                  </p>
                  <p className="col-span-2">
                    <span className="text-gray-500">Seats:</span>{' '}
                    {scanResult.booking.seats?.map((s) => `${s.row}${s.number}`).join(', ')}
                  </p>
                  <p>
                    <span className="text-gray-500">Ticket:</span>{' '}
                    <span className="font-mono text-white">{scanResult.booking.ticketId}</span>
                  </p>
                  {scanResult.alreadyScanned && (
                    <p className="col-span-2 text-yellow-400 font-semibold">
                      Already scanned — check ID before entry
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketScanner;
