import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";
import api from "@/api"; // sesuaikan path axios instance kamu

export default function PilihSekolah() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/schools/public-list")
      .then((res) => setSchools(res.data))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, []);

  const pilih = async (slug) => {
    setSaving(true);
    await Preferences.set({ key: "tenant_slug", value: slug });
    navigate("/");
  };

  if (loading) return <p>Memuat daftar sekolah...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Pilih Sekolah</h2>

      {schools.length === 0 && <p>Belum ada sekolah tersedia.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {schools.map((s) => (
          <li key={s.id} style={{ marginBottom: 8 }}>
            <button
              onClick={() => pilih(s.slug)}
              disabled={saving}
              style={{ width: "100%", padding: 12, textAlign: "left" }}
            >
              {s.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}