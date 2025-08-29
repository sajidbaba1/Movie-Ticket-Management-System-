import React, { useState } from 'react';
import { ragService } from '../../services';

const SuperAdminRagChatPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string>('');
  const [sources, setSources] = useState<Array<{ id: string; title?: string; page?: number; snippet?: string }>>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const handleIndex = async () => {
    if (!file) return;
    try {
      setUploading(true);
      await ragService.indexPdf(file);
      alert('Report indexed to RAG successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to index report.');
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    try {
      setLoadingChat(true);
      const res = await ragService.chat(question.trim());
      setAnswer(res.answer);
      setSources(res.sources || []);
    } catch (e) {
      console.error(e);
      alert('Failed to get answer.');
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RAG Chat</h1>
        <p className="text-gray-600">Upload the PDF report, index it, and ask questions grounded on its content.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Index Report</h2>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={handleIndex}
            disabled={!file || uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            {uploading ? 'Indexing...' : 'Index PDF'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat</h2>
        <div className="flex items-center space-x-3 mb-4">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about metrics, trends, anomalies..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            onClick={handleAsk}
            disabled={loadingChat}
            className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
          >
            {loadingChat ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        {answer && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Answer</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {sources.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Sources</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {sources.map((s, i) => (
                <li key={s.id + i}>
                  {s.title ? `${s.title}` : 'PDF'}{s.page ? ` • p.${s.page}` : ''}
                  {s.snippet ? ` — ${s.snippet}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminRagChatPage;
