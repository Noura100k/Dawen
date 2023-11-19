import React, { useState } from 'react';
import LettersPage from './LettersPage';
import WordsPage from './WordsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('letters');

  const switchPage = (page) => {
    setCurrentPage(page);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', marginBottom: '16px' }}>
        <button
          style={{ fontSize: '24px', fontWeight: 'bold', padding: '12px 24px', backgroundColor: '#8CA9AD', color: 'white', marginRight: '16px' }}
          onClick={() => switchPage('letters')}
        >
صفحة الحروف        </button>
        <button
          style={{ fontSize: '24px', fontWeight: 'bold', padding: '12px 24px', backgroundColor: '#8CA9AD', color: 'white' }}
          onClick={() => switchPage('words')}
        >
صفحة الكلمات        </button>
      </div>
      {currentPage === 'letters' && <LettersPage />}
      {currentPage === 'words' && <WordsPage />}
    </div>
  );
}

export default App;