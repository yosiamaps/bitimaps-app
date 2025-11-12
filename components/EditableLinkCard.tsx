import React, { useState, useEffect } from 'react';
import { LinkIcon } from './icons/LinkIcon';
import { EditIcon } from './icons/EditIcon';

interface EditableLinkCardProps {
  title: string;
  description: string;
  storageKey: string;
  defaultUrl: string;
}

const EditableLinkCard: React.FC<EditableLinkCardProps> = ({ title, description, storageKey, defaultUrl }) => {
  const [url, setUrl] = useState(defaultUrl);
  const [editUrl, setEditUrl] = useState(url);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedUrl = localStorage.getItem(storageKey);
    if (storedUrl) {
      setUrl(storedUrl);
      setEditUrl(storedUrl);
    }
  }, [storageKey]);

  const handleSave = () => {
    localStorage.setItem(storageKey, editUrl);
    setUrl(editUrl);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditUrl(url);
    setIsEditing(false);
  };

  return (
    <div className="bg-zinc-900 p-5 rounded-2xl">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-lime-500/10">
          <LinkIcon className="w-5 h-5 text-lime-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-3">
          <input
            type="url"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            className="w-full bg-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Masukkan URL baru"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors"
          >
            Buka Tautan
          </a>
          <button
            onClick={() => setIsEditing(true)}
            className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <EditIcon className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableLinkCard;