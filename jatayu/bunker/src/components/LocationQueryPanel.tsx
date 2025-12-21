import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Send, Lightbulb } from 'lucide-react';

interface LocationQueryPanelProps {
  coordinates: { lat: number; lng: number };
  isVisible: boolean;
  onClose: () => void;
  onAskQuestion: (question: string, coordinates: { lat: number; lng: number }) => void;
}

const LocationQueryPanel: React.FC<LocationQueryPanelProps> = ({
  coordinates,
  isVisible,
  onClose,
  onAskQuestion
}) => {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAskQuestion(question.trim(), coordinates);
      setQuestion('');
      onClose();
    }
  };

  const quickQuestions = [
    "What's the weather like here?",
    "Is this area safe for hiking?",
    "What's the air quality here?",
    "Are there any environmental concerns?",
    "What's the development potential?",
    "Is this location flood-prone?"
  ];

  const handleQuickQuestion = (quickQuestion: string) => {
    onAskQuestion(quickQuestion, coordinates);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl max-w-md z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <div>
                <h3 className="text-sm font-semibold text-white">Location Selected</h3>
                <p className="text-xs text-gray-400">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Custom Question Input */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about this location..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!question.trim()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Questions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-white">Quick Questions</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {quickQuestions.map((quickQuestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(quickQuestion)}
                    className="text-left p-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
                  >
                    {quickQuestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-xs text-blue-300">
                💡 Click anywhere on the map to select a different location, or ask questions about this spot to get detailed spatial analysis.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationQueryPanel;
