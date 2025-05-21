import { Note } from "../../../../models/Note.js";

export const getAllNote = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1, isPinned: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch all notes",
      details: err.message,
    });
  }
};

export const createNote = async (req, res) => {
  const { title, content, tags = [], isPinned = false, userId } = req.body;

  try {
    const note = await Note.create({
      title,
      content,
      tags,
      isPinned,
      userId,
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to create note",
      details: err.message,
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const updateNote = await Note.findByIdAndUpdate(
      req.params._id,
      { $set: req.body },
      { new: true }
    );
    if (!updateNote) {
      res.status(404).send("Can't find note id");
    }
    res.json(updateNote);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to update note",
      details: err.message,
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const deleteNote = await Note.findByIdAndDelete(req.params._id);
    if (!deleteNote) {
      res.status(404).send("Can't find note id");
    }
    res
      .status(204)
      .json({ success: true, message: "Note deleted", data: deleteNote });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to delete note",
      details: err.message,
    });
  }
};
