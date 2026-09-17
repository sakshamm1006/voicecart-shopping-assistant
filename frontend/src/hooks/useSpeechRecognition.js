import { useState, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
    const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;      // stop automatically after user pauses
    recognition.interimResults = true;   // give us live partial results, not just final
    recognition.lang = 'en-US';

    return recognition;
  }, []);

    const startListening = useCallback(() => {
    setError(null);
    setTranscript('');

    const recognition = initRecognition();
    if (!recognition) return; // browser not supported, error already set

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow mic permissions.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Try again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [initRecognition]);

    const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
  };
}