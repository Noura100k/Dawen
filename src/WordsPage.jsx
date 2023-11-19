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

function WordsPage() {
  const [response, setResponse] = useState(null); // New state variable
  const canvasRefs = [useRef(null), useRef(null), useRef(null)];
  const [currentColor, setCurrentColor] = useState('#000000');

  const [data, setData] = useState(null);
  const [nonDiacriticsList, setNonDiacriticsList] = useState([]);
  const [randomWord, setRandomWord] = useState('');

  useEffect(() => {
    fetch('././response_1700329445790.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(jsonData => {
        setData(jsonData);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  useEffect(() => {
    if (data) {
      const filteredArray = data
        .filter(item => item.nonDiacriticsLemma.length === 3)
        .map(item => item.nonDiacriticsLemma);
      setNonDiacriticsList(filteredArray);
    }
  }, [data]);

  useEffect(() => {
    if (nonDiacriticsList.length > 0) {
      const randomIndex = Math.floor(Math.random() * nonDiacriticsList.length);
      setRandomWord(nonDiacriticsList[randomIndex]);
    }
  }, [nonDiacriticsList]);

  const handleSaveAll = async () => {
    try {
      const formData = new FormData();

      canvasRefs.forEach((canvasRef, index) => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        const blob = dataURLtoBlob(dataURL);
        formData.append(`image${index + 1}`, blob, `canvas_${index + 1}.png`);
      });
      formData.append('word',randomWord)
      const respons = await axios.post('http://127.0.0.1:8000/image-upload/', formData, {
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

  const handleClearAll = () => {
    canvasRefs.forEach((canvasRef) => {
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });
  };

  const handleColorChange = (e) => {
    setCurrentColor(e.target.value);
  };

  return (
    <div className="container">
      <h1 className="title">اكتب الكلمة</h1>
      <div>
        <h2>{randomWord}</h2>
      </div>
      <div style={{ display: 'flex' }}>
        {canvasRefs.map((canvasRef, index) => (
          <Canvas key={index} canvasRef={canvasRef} currentColor={currentColor} />
        ))}
      </div>
      <div className="button-group">
        <input type="color" value={currentColor} onChange={handleColorChange} />
        <button className="save-button" onClick={handleSaveAll}>
          حفظ
        </button>
        <button className="random-letter-button" onClick={handleClearAll}>
          مسح
        </button>
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

export default WordsPage;