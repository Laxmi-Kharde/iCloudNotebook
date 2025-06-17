import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, LogOut, User, Pin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notesAPI } from '../../services/api';
import NoteCard from '../Notes/NoteCard';
import NoteForm from '../Notes/NoteForm';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterBy, setFilterBy] = useState('all');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getNotes();
      setNotes(response.data);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      const response = await notesAPI.createNote(noteData);
      setNotes([response.data, ...notes]);
      setShowNoteForm(false);
      toast.success('Note created successfully!');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (noteId, noteData) => {
    try {
      const response = await notesAPI.updateNote(noteId, noteData);
      setNotes(notes.map(note => note._id === noteId ? response.data : note));
      setEditingNote(null);
      toast.success('Note updated successfully!');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.deleteNote(noteId);
        setNotes(notes.filter(note => note._id !== noteId));
        toast.success('Note deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handlePinNote = async (noteId) => {
    const note = notes.find(n => n._id === noteId);
    try {
      const response = await notesAPI.updateNote(noteId, { 
        ...note, 
        isPinned: !note.isPinned 
      });
      setNotes(notes.map(n => n._id === noteId ? response.data : n));
      toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'pinned' && note.isPinned) ||
                         (filterBy === 'recent' && new Date(note.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesFilter;
  });

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">iC</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ICloudNotebook
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>Welcome, {user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            >
              <option value="all">All Notes</option>
              <option value="pinned">Pinned</option>
              <option value="recent">Recent</option>
            </select>

            <div className="flex bg-white/50 rounded-xl border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={20} />
              </button>
            </div>

            <button
              onClick={() => setShowNoteForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Plus size={20} />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Notes Display */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notes found</h3>
            <p className="text-gray-500 mb-6">Create your first note to get started!</p>
            <button
              onClick={() => setShowNoteForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Create Note
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Pin size={18} className="text-yellow-500" />
                  <h2 className="text-lg font-semibold text-gray-700">Pinned Notes</h2>
                </div>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {pinnedNotes.map(note => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={setEditingNote}
                      onDelete={handleDeleteNote}
                      onPin={handlePinNote}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Other Notes</h2>
                )}
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {unpinnedNotes.map(note => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={setEditingNote}
                      onDelete={handleDeleteNote}
                      onPin={handlePinNote}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Form Modal */}
      {(showNoteForm || editingNote) && (
        <NoteForm
          note={editingNote}
          onSave={editingNote ? handleUpdateNote : handleCreateNote}
          onCancel={() => {
            setShowNoteForm(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
