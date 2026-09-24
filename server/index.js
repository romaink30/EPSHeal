import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { pool } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Classe une mesure vitale : normal / à surveiller / critique.
function classify(measure) {
  if (!measure) return 'normal';
  const fc = measure.frequence_cardiaque;
  const spo2 = measure.spo2;
  if (fc >= 180 || fc <= 45 || spo2 < 92) return 'critical';
  if (fc >= 120 || fc <= 50 || spo2 < 95) return 'watch';
  return 'normal';
}

// POST /api/login { code }
app.post('/api/login', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code manquant' });

  try {
    const [medecins] = await pool.query('SELECT * FROM medecins WHERE login = ?', [code]);
    if (medecins.length > 0) {
      const m = medecins[0];
      return res.json({
        role: 'doctor',
        id: m.id,
        nom: m.nom,
        prenom: m.prenom,
        specialite: m.specialite,
      });
    }

    const [patients] = await pool.query('SELECT * FROM patients WHERE login = ?', [code]);
    if (patients.length > 0) {
      const p = patients[0];
      return res.json({
        role: 'patient',
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        dateNaissance: p.date_naissance,
        sexe: p.sexe,
        maladie: p.maladie_rythme_cardiaque,
        dateDiagnostic: p.date_diagnostic,
        etat: p.etat || 'normal', // <-- AJOUTÉ ICI POUR LE PATIENT CONNECTÉ
      });
    }

    res.status(404).json({ error: 'Badge non reconnu' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/patients — liste complète pour la vue médecin
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.nom, p.prenom, p.maladie_rythme_cardiaque, p.date_diagnostic, p.etat,
             m.frequence_cardiaque, m.spo2, m.tension_systolique, m.tension_diastolique, m.date_mesure
      FROM patients p
      LEFT JOIN mesures_vitales m ON m.id = (
        SELECT id FROM mesures_vitales WHERE patient_id = p.id ORDER BY date_mesure DESC LIMIT 1
      )
      ORDER BY p.nom, p.prenom
    `); // <-- p.etat A ÉTÉ RAJOUTÉ DANS LE SELECT CI-DESSUS

    const patients = rows.map((r) => ({
      id: r.id,
      nom: r.nom,
      prenom: r.prenom,
      maladie: r.maladie_rythme_cardiaque,
      dateDiagnostic: r.date_diagnostic,
      etat: r.etat || 'normal', // <-- TRANSMIS AU FRONT REACT
      derniereMesure: r.date_mesure
        ? {
            frequenceCardiaque: r.frequence_cardiaque,
            spo2: r.spo2,
            tensionSystolique: r.tension_systolique,
            tensionDiastolique: r.tension_diastolique,
            date: r.date_mesure,
          }
        : null,
      statut: classify(
        r.date_mesure ? { frequence_cardiaque: r.frequence_cardiaque, spo2: r.spo2 } : null
      ),
    }));

    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/patients/:id — fichier complet d'un patient
app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [patients] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]);
    if (patients.length === 0) return res.status(404).json({ error: 'Patient introuvable' });
    const p = patients[0];

    const [mesures] = await pool.query(
      'SELECT * FROM mesures_vitales WHERE patient_id = ? ORDER BY date_mesure ASC',
      [id]
    );

    res.json({
      id: p.id,
      nom: p.nom,
      prenom: p.prenom,
      dateNaissance: p.date_naissance,
      sexe: p.sexe,
      maladie: p.maladie_rythme_cardiaque,
      dateDiagnostic: p.date_diagnostic,
      etat: p.etat || 'normal', // <-- AJOUTÉ ICI AUSSI
      mesures: mesures.map((m) => ({
        date: m.date_mesure,
        frequenceCardiaque: m.frequence_cardiaque,
        tensionSystolique: m.tension_systolique,
        tensionDiastolique: m.tension_diastolique,
        spo2: m.spo2,
        notes: m.notes,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API EPSHeal sur http://localhost:${port}`));