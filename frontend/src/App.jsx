import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { parseIntent } from './services/api';
import './App.css';

function App() {
  const { transcript, isListening, error, startListening, stopListening } = useSpeechRecognition();
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const wasListening = useRef(false);

  // When listening stops and we have a transcript, send it to the backend
  useEffect(() => {
    if (wasListening.current && !isListening && transcript.trim()) {
      (async () => {
        setLoading(true);
        setApiError(null);
        setParsed(null);
        try {
          setParsed(await parseIntent(transcript));
        } catch (e) {
          setApiError(e.message);
        } finally {
          setLoading(false);
        }
      })();
    }
    wasListening.current = isListening;
  }, [isListening, transcript]);

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

      <button onClick={handleMicClick} className={isListening ? 'mic-btn listening' : 'mic-btn'}>
        {isListening ? '🎙️ Listening...' : '🎤 Tap to speak'}
      </button>

      {error && <p className="error">{error}</p>}

      <div className="transcript-box">
        <p>{transcript || 'Say something like "Add milk"...'}</p>
      </div>

      {loading && <p>🤔 Understanding...</p>}
      {apiError && <p className="error">{apiError}</p>}
      {parsed && <pre className="parsed">{JSON.stringify(parsed, null, 2)}</pre>}
    </div>
  );
}

export default App;