import React from 'react';
import { CheckCircle, AlertCircle, Settings, ExternalLink } from 'lucide-react';

export interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'error';
  category: 'payment' | 'accounting' | 'communication' | 'banking';
  features: string[];
  setupUrl?: string;
  documentationUrl?: string;
}

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConfigure,
  onConnect,
  onDisconnect,
}) => {
  const getStatusColor = () => {
    switch (integration.status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (integration.status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (integration.status) {
      case 'connected':
        return 'Bağlı';
      case 'error':
        return 'Hata';
      default:
        return 'Bağlı Değil';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">{integration.logo}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-500">{integration.description}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor()}`}
        >
          {getStatusIcon()}
          {getStatusText()}
        </span>
      </div>

      {/* Features */}
      <div className="mb-4">
        <ul className="space-y-2">
          {integration.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {integration.status === 'connected' ? (
          <>
            <button
              onClick={() => onConfigure(integration.id)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              Ayarlar
            </button>
            <button
              onClick={() => onDisconnect(integration.id)}
              className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Bağlantıyı Kes
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect(integration.id)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Bağlan
          </button>
        )}
        {integration.documentationUrl && (
          <a
            href={integration.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            title="Dokümantasyon"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
