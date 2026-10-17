import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useShoppingList } from './hooks/useShoppingList';
import { parseIntent } from './services/api';
import ShoppingList from './components/ShoppingList';
import './App.css';

function App() {
  const { transcript, isListening, error, startListening, stopListening } = useSpeechRecognition();
  const { items, feedback, applyIntent, removeItem } = useShoppingList();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const wasListening = useRef(false);

  // When listening stops and there's a transcript, parse it and update the list
  useEffect(() => {
    if (wasListening.current && !isListening && transcript.trim()) {
      (async () => {
        setLoading(true);
        setApiError(null);
        try {
          applyIntent(await parseIntent(transcript));
        } catch (e) {
          setApiError(e.message);
        } finally {
          setLoading(false);
        }
      })();
    }
    wasListening.current = isListening;
  }, [isListening, transcript, applyIntent]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="app">
      <h1>VoiceCart</h1>

      <button
        onClick={handleMicClick}
        className={isListening ? 'mic-btn listening' : 'mic-btn'}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? '⏹️' : '🎤'}
      </button>
      <p className="mic-label">{isListening ? 'Listening…' : 'Tap to speak'}</p>

      <div className={transcript ? 'transcript-box has-text' : 'transcript-box'}>
        <p>{transcript || 'Try "Add 2 bottles of water"…'}</p>
      </div>

      {error && <p className="error">{error}</p>}
      {apiError && <p className="error">{apiError}</p>}
      {loading && <p className="status">🤔 Understanding…</p>}
      {feedback.text && !loading && (
        <div key={feedback.n} className={`toast ${feedback.kind}`}>
          {feedback.text}
        </div>
      )}

      <ShoppingList items={items} onRemove={removeItem} />
    </div>
  );
}

export default App;