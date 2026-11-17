const path = require("node:path");
const express = require("express");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;
const pool = new Pool();

let baseConnectee = false;

const ARTICLES_DEPART = [
  ["Lait demi-écrémé", "2 L", "Frais"],
  ["Pâtes complètes", "500 g", "Épicerie"],
  ["Pommes Golden", "1 kg", "Fruits & Légumes"]
];

async function connecterLaBase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id serial PRIMARY KEY,
        nom text NOT NULL,
        quantite text NOT NULL,
        rayon text NOT NULL,
        cree_le timestamptz DEFAULT now()
      )
    `);

    const { rows } = await pool.query("SELECT count(*)::int AS total FROM articles");
    if (rows[0].total === 0) {
      for (const a of ARTICLES_DEPART) {
        await pool.query(
          "INSERT INTO articles (nom, quantite, rayon) VALUES ($1, $2, $3)",
          a
        );
      }
      console.log("Base : table créée et remplie avec 3 articles d'exemple");
    }

    baseConnectee = true;
    console.log("Base : connectée");
  } catch (err) {
    baseConnectee = false;
    console.log("Base : non connectée (" + err.message + "), nouvel essai dans 2 s");
    setTimeout(connecterLaBase, 2000);
  }
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/sante", (req, res) => {
  res.json({
    api: "ok",
    base: baseConnectee ? "connectée" : "non connectée"
  });
});

app.get("/api/articles", async (req, res) => {
  if (!baseConnectee) return res.status(503).json({ erreur: "Base non connectée" });
  const { rows } = await pool.query("SELECT id, nom, quantite, rayon FROM articles ORDER BY id DESC");
  res.json(rows);
});

app.post("/api/articles", async (req, res) => {
  if (!baseConnectee) return res.status(503).json({ erreur: "Base non connectée" });
  const { nom, quantite, rayon } = req.body || {};
  if (!nom || !quantite || !rayon) {
    return res.status(400).json({ erreur: "Tous les champs sont obligatoires" });
  }
  const { rows } = await pool.query(
    "INSERT INTO articles (nom, quantite, rayon) VALUES ($1, $2, $3) RETURNING id, nom, quantite, rayon",
    [nom, quantite, rayon]
  );
  res.status(201).json(rows[0]);
});

app.delete("/api/articles/:id", async (req, res) => {
  if (!baseConnectee) return res.status(503).json({ erreur: "Base non connectée" });
  await pool.query("DELETE FROM articles WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log("Liste de courses : démarrée sur le port " + PORT);
  connecterLaBase();
});

process.on("SIGTERM", () => process.exit(0));