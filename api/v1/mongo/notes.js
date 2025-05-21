import express from "express";
import { Note } from "../../../models/Note.js";
import {
  createNote,
  deleteNote,
  getAllNote,
  updateNote,
} from "./controllers/notesControllers.js";
import authUser from "../../../middleware/auth.js";

const router = express.Router();

//Get all notes
router.get("/notes", getAllNote);

//Create a note
router.post("/notes", createNote);

//Update a note
router.patch("/notes/:_id", updateNote);

//Delete a note
router.delete("/notes/:_id", deleteNote);

router.get("/get-all-notes", async (_req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1, isPinned: -1 });
    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Failed to fetch all notes",
      details: err.message,
    });
  }
});

router.put("/edit-note/:noteId", authUser , async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
})

router.get("/get-note/:noteId", authUser, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    // Find the note by ID and ensure it belongs to the logged-in user
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    return res.json({
      error: false,
      note,
      message: "Note retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

router.post("/add-note", authUser ,async (req, res) => {
  const { title, content, tags = [], isPinned = false } = req.body;

  const userId = req.user.userId;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  if (!userId) {
    return res
      .status(401)
      .json({ error: true, message: "Unauthorized - no user ID found" });
  }

  try {
    const note = await Note.create({
      title,
      content,
      tags,
      isPinned,
      userId, // 🔥 Save user as ObjectId reference
    });

    return res.status(201).json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

export default router;
