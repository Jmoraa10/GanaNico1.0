import React from 'react';

interface SessionExpireDialogProps {
  open: boolean;
  onClose: () => void;
  onRelogin: () => void;
}

const SessionExpireDialog: React.FC<SessionExpireDialogProps> = ({ open, onClose, onRelogin }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <h2 className="text-xl font-bold text-red-700 mb-4">Sesión expirada</h2>
        <p className="mb-4 text-gray-700">
          Parcero ojo pues,Su sesión expiró, por favor reinicie sesión en una nueva ventana para no perder los datos.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Regresar a la venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpireDialog;
