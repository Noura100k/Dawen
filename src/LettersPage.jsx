import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

function Canvas({ canvasRef, currentColor }) {
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevX, setPrevX] = useState(0);
  const [prevY, setPrevY] = useState(0);


  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);
  }, [canvasRef]);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    setPrevX(e.clientX - canvasRef.current.getBoundingClientRect().left);
    setPrevY(e.clientY - canvasRef.current.getBoundingClientRect().top);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const x = e.clientX - canvasRef.current.getBoundingClientRect().left;
    const y = e.clientY - canvasRef.current.getBoundingClientRect().top;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    setPrevX(x);
    setPrevY(y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      style={{ border: '1px solid black' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}

function LettersPage() {
  const canvasRef = useRef(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [randomLetter, setRandomLetter] = useState('');
  const [response, setResponse] = useState(null); // New state variable



  const handleSave = async () => {
    try {
      const formData = new FormData();
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        const blob = dataURLtoBlob(dataURL);
        formData.append(`image`, blob, `canvas.png`);
        console.log(randomLetter)
        formData.append(`letter`, randomLetter);
   

      const respons = await axios.post('http://127.0.0.1:8000/ImageUploadLetter/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(respons.data); // Set the response in the state

      console.log('Images sent successfully!');
      console.log(respons);
    } catch (error) {
      console.error('Error sending images:', error);
    }
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };


  const handleClear = () => {
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleColorChange = (e) => {
    setCurrentColor(e.target.value);
  };

  useEffect(() => {
    const letters = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
    const randomIndex = Math.floor(Math.random() * letters.length);
    setRandomLetter(letters[randomIndex]);
  }, []);

  return (
    <div className="container">
      <div className="title">الحروف</div>
      <div className="subtitle">اكتب الحرف: {randomLetter}</div>
      <div className="canvas">
        <Canvas canvasRef={canvasRef} currentColor={currentColor} />
      </div>
      <div className="button-group">
        <input type="color" value={currentColor} onChange={handleColorChange} />
        <button className="save-button" onClick={handleSave}>حفظ</button>
        <button className="random-letter-button" onClick={handleClear}>مسح</button>
      </div>
      {response && (
        <div>
          <h2 className="subtitle">{response.correction}</h2>
          <h2 className="subtitle"> التنبؤ: {response.AutoWord}</h2>

        </div>
      )}
    </div>
  );
}

export default LettersPage;