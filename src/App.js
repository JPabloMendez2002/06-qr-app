import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import QRCode from "qrcode.react";
import "./App.css";
import jsqr from "jsqr";
import "bootstrap/dist/css/bootstrap.min.css";

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

function App() {
  const webcamRef = useRef(null);
  const [qrData, setQRData] = useState(null);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const [isCameraFacingFront, setIsCameraFacingFront] = useState(true);
  const [scannedDataList, setScannedDataList] = useState([]);

  useEffect(() => {
    askForCameraPermission();
  }, []);

  const askForCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const tracks = stream.getTracks();
      const hasBackCamera = tracks.some(
        (track) => track.getSettings().facingMode === "environment"
      );

      if (!hasBackCamera) {
        alert("El dispositivo no tiene una cámara trasera disponible.");
      }

      tracks.forEach((track) => track.stop());
    } catch (error) {
      alert("No se pudo acceder a la cámara del dispositivo.");
    }
  };

  const captureQRCode = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, image.width, image.height);

      const imageData = context.getImageData(0, 0, image.width, image.height);
      const code = jsqr(imageData.data, imageData.width, imageData.height);

      if (code) {
        const scannedData = code.data;
        setScannedDataList([...scannedDataList, scannedData]);
      } else {
        alert("No se encontró un código QR válido en la imagen.");
      }
    };
  };

  const toggleCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setFacingMode(
        (prevState) =>
          prevState === FACING_MODE_USER
            ? FACING_MODE_ENVIRONMENT
            : FACING_MODE_USER
      );
    }
  };

  return (
    <div className="App">
      <h1>Pruebas de Scanner QR</h1>
      <div className="camera-container">
        <Webcam
          audio={false}
          mirrored={!isCameraFacingFront}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ width: "100%", height: "100%" }}
          videoConstraints={{
            facingMode: facingMode,
          }}
        />
        <div className="camera-capture-button">
          <button className="btn btn-primary" onClick={captureQRCode}>
            Capturar QR
          </button>
          <button className="btn btn-secondary" onClick={toggleCamera}>
            Voltear Cámara
          </button>
        </div>
        <div className="scanned-data-table">
          <h2>Datos Escaneados</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Dato Escaneado</th>
              </tr>
            </thead>
            <tbody>
              {scannedDataList.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
