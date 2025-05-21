import express from "express";

const router = express.Router();

let notes = [];

export default (db) => {
  //Create a note
  router.post("/notes", async (req, res) => {
    const { title, content, tags = [], is_pinned = false, user_id } = req.body;

    if (!user_id) {
      return res.status(400).send("User ID required");
    }

    const result = await db.execute({
      sql: `
        INSERT INTO notes (title , content , tags , is_pinned , user_id)
        VALUES ( ? , ? , ? , ? , ? )
      `,
      args: [title , content , JSON.stringify(tags) , is_pinned ? 1 : 0, user_id],
    })
    res.status(201).json({
      id: Number(result.lastInsertRowid),
      title,
      content,
      tags,
      is_pinned,
      user_id,
    });
  });

  //Create note
  router.post("/notes", (req, res) => {
    const { title, content, tag } = req.body;
    const newNote = {
      id: notes.length + 1,
      title: title,
      content: content,
      tag: tag,
    };
    notes.push(newNote);
    res.status(201).json(notes);
  });

  //Read by filter(optional)
  router.get("/notes", (req, res) => {
    const title = req.query.title;
    const tag = req.query.tag;

    let filteredNote = notes;
    if (tag) {
      filteredNote = filteredNote.filter((note) => note.tag === tag);
    }
    if (title) {
      filteredNote = filteredNote.filter((note) =>
        note.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    res.send(filteredNote);
  });

  //Create a user
  router.post("/users", async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).send("Name and email are required");
    }

    const result = await db.execute({
      sql: "INSERT INTO users (name, email) VALUES ( ? , ? )",
      args: [name, email],
    });
    res.status(201).json({
      id: Number(result.lastInsertRowid),
      name,
      email,
    });
  });
  return router;
};
