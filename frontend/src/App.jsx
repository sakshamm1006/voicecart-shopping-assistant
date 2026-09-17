import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import './App.css';

function App() {
  const { transcript, isListening, error, startListening, stopListening } = useSpeechRecognition();

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
    </div>
  );
}

export default App;