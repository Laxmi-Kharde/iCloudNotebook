import React from 'react';
import { Edit, Trash2, Pin, Calendar, Tag } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete, onPin, viewMode }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-800 flex-1">{note.title}</h3>
              {note.isPinned && <Pin size={16} className="text-yellow-500 fill-yellow-500" />}
            </div>
            <p className="text-gray-600 mb-3">{truncateContent(note.content, 200)}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{formatDate(note.updatedAt)}</span>
                </div>
                {note.tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Tag size={14} />
                    <span>{note.tags.slice(0, 2).join(', ')}</span>
                    {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPin(note._id)}
                  className={`p-2 rounded-lg transition-colors ${
                    note.isPinned 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  <Pin size={16} className={note.isPinned ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={() => onEdit(note)}
                  className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(note._id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all group"
      style={{ backgroundColor: note.color !== '#ffffff' ? note.color : undefined }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 line-clamp-2">{note.title}</h3>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPin(note._id)}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Pin size={14} className={note.isPinned ? 'fill-current' : ''} />
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-4">{truncateContent(note.content)}</p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(note.updatedAt)}</span>
        {note.isPinned && (
          <Pin size={12} className="text-yellow-500 fill-yellow-500" />
        )}
      </div>
    </div>
  );
};

export default NoteCard;