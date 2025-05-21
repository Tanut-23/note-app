import express from "express";

const router = express.Router();

export default (db) => {
  //Read a user
  router.get("/users", async (req, res) => {
    try {
      const result = await db.execute({
        sql: "SELECT id, name, email FROM users",
        args: [],
      });

      const users = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
      }));

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Error fetching users");
    }
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
