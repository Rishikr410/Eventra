import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import "./style/Notes.css";

const Notes = () => {
  const { user, notes, setNotes, showToast, searchQuery } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    tags: "",
  });

  const userNotes = notes.filter((note) => note.userId === user.id);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleNotes = normalizedQuery
    ? userNotes.filter((note) =>
        `${note.title} ${note.content} ${note.category || ""} ${(note.tags || []).join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : userNotes;
  const sectionCoins = userNotes.length * 2;

  const handleChange = (e) => {
    // Notes form ke liye common input handler use kiya hai.
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNote) {
      // Edit case me old note update ho raha hai aur edit history bhi maintain kar raha hu.
      const updated = notes.map((note) =>
        note.id === editingNote.id
          ? {
              ...note,
              ...formData,
              tags: formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
              editHistory: [
                ...(Array.isArray(note.editHistory) ? note.editHistory : []),
                {
                  id: Date.now(),
                  editedAt: new Date().toISOString(),
                  summary: "Note content updated",
                },
              ],
            }
          : note,
      );
      setNotes(updated);
      showToast("Note updated", "success");
    } else {
      // New note create karte time tags ko comma separated text se array me convert kar raha hu.
      const newNote = {
        id: Date.now(),
        userId: user.id,
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        editHistory: [],
      };
      setNotes([...notes, newNote]);
      showToast("Note added", "success");
    }
    setShowForm(false);
    setEditingNote(null);
    setFormData({ title: "", content: "", category: "General", tags: "" });
  };

  const handleEdit = (note) => {
    // Edit pe click karne par selected note ka data form me fill ho jata hai.
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || "General",
      tags: Array.isArray(note.tags) ? note.tags.join(", ") : "",
    });
    setShowForm(true);
  };

  const handleDelete = (noteId) => {
    // Delete confirm diya so note galti se remove na ho.
    if (window.confirm("Delete this note?")) {
      setNotes(notes.filter((note) => note.id !== noteId));
      showToast("Note deleted", "success");
    }
  };

  return (
    <div className="notes-page p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📝 My Notes</h1>
          <p className="text-gray-600">{visibleNotes.length} notes</p>
          <p className="text-sm text-gray-500">Coins earned in this section: {sectionCoins}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + New Note
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingNote ? "Edit Note" : "Add Note"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="General">General</option>
                  <option value="Study">Study</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Ideas">Ideas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="example, urgent, team"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingNote ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
                    setFormData({
                      title: "",
                      content: "",
                      category: "General",
                      tags: "",
                    });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {note.title}
            </h3>
            <div className="d-flex gap-2 flex-wrap mb-2">
              <span className="badge text-bg-primary">{note.category || "General"}</span>
              {(note.tags || []).map((tag) => (
                <span key={tag} className="badge text-bg-light border">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
            {note.editHistory?.length ? (
              <div className="small text-gray-500 mb-3">
                Last edited:{" "}
                {new Date(
                  note.editHistory[note.editHistory.length - 1].editedAt,
                ).toLocaleString()}
              </div>
            ) : null}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(note)}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {visibleNotes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {normalizedQuery ? "No matching notes" : "No notes yet"}
            </h3>
            <p className="text-gray-600">
              {normalizedQuery
                ? `Try a different search for "${searchQuery}".`
                : 'Click "+ New Note" to create your first note.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
