import React, { useState, useEffect } from "react";
import {
  Building2, LogIn, LogOut, CheckCircle2, FileText, Users,
  Activity, Download, Plus, Upload, RefreshCw, ShieldCheck, Clock, Check, X
} from "lucide-react";
import {
  fetchReports,
  fetchEmployees,
  submitReportToSheet,
  validateReportInSheet,
  addEmployeeToSheet
} from "./services/api";

const USERS = {
  petugas: { pass: "karyawan123", role: "Karyawan / Petugas Piket", name: "Petugas Operasional" },
  admin: { pass: "admin123", role: "Admin / HRGA", name: "Admin HRGA" },
  headunit: { pass: "head123", role: "Head Unit", name: "Irwansyah Putra (Head Unit)" }
};

const KONTRAKTOR_LIST = [
  { key: "bimaSakti", label: "Bima Sakti Engineering" },
  { key: "alivaMandiri", label: "Aliva Mandiri" },
  { key: "empatSaudara", label: "Empat Saudara" },
  { key: "jackElektro", label: "Jack Elektro" }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [penerimaList, setPenerimaList] = useState(["Irwansyah Putra"]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const initialForm = {
    tanggalLaporan: "",
    namaPetugas: "",
    trukPkJumlah: "",
    trukPkTotal: "",
    trukPkGantung: "",
    trukPkAlasan: "",
    lansirCpkoJumlah: "",
    lansirCpkoTotal: "",
    mesinRunning: "",
    mesinStop: "",
    aktivitasHmpke: "",
    kontraktor: {
      bimaSakti: { bekerja: "", apd: "", sop: "" },
      alivaMandiri: { bekerja: "", apd: "", sop: "" },
      empatSaudara: { bekerja: "", apd: "", sop: "" },
      jackElektro: { bekerja: "", apd: "", sop: "" }
    },
    catatanTemuan: "",
    ditujukanKepada: "Irwansyah Putra",
    fileName: "",
    fileData: ""
  };
  const [formData, setFormData] = useState(initialForm);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newPenerimaName, setNewPenerimaName] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [empData, repData] = await Promise.all([fetchEmployees(), fetchReports()]);
      setEmployees(empData);
      setReports(repData);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const userKey = loginForm.username.toLowerCase().trim();
    const matched = USERS[userKey];
    if (matched && matched.pass === loginForm.password) {
      setCurrentUser({ username: userKey, ...matched });
      setShowLoginModal(false);
      setLoginError("");
      setLoginForm({ username: "", password: "" });
      loadInitialData();
    } else {
      setLoginError("Username atau Password salah!");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileData: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleKontraktorChange = (kKey, category, value) => {
    setFormData((prev) => ({
      ...prev,
      kontraktor: {
        ...prev.kontraktor,
        [kKey]: {
          ...prev.kontraktor[kKey],
          [category]: prev.kontraktor[kKey][category] === value ? "" : value
        }
      }
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitReportToSheet(formData);
      triggerToast("Laporan Berhasil Terkirim ke Google Spreadsheet!");
      setFormData(initialForm);
      await loadInitialData();
    } catch (error) {
      triggerToast("Terjadi kesalahan saat mengirim laporan.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (idLaporan, status) => {
    setLoading(true);
    try {
      await validateReportInSheet(idLaporan, status);
      triggerToast(`Laporan ${idLaporan} berhasil diubah menjadi ${status}`);
      await loadInitialData();
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;
    setLoading(true);
    try {
      await addEmployeeToSheet(newEmployeeName.trim());
      setEmployees([...employees, newEmployeeName.trim()]);
      setNewEmployeeName("");
      triggerToast("Data Karyawan berhasil ditambahkan!");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = Object.keys(reports[0]).filter((k) => k !== "rowIndex");
    const csvRows = [
      headers.join(","),
      ...reports.map((r) =>
        headers.map((h) => `"${String(r[h] || "").replace(/"/g, '""')}"`).join(",")
      )
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_Laporan_Piket_UIP_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // 1. LANDING PAGE
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight block leading-none text-white">
                  PT. USAHA INTI PADANG
                </span>
                <span className="text-xs font-medium text-blue-400 tracking-wider uppercase mt-1 block">
                  Palm Kernel & CPKO Operations
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden bg-slate-950 text-white py-24 sm:py-32 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              Portal Operasional & Pelaporan Shift
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white">
              Sistem Manajemen Laporan Piket Karyawan PT. USAHA INTI PADANG
            </h1>
            <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Platform digital terintegrasi untuk pelaporan shift harian, monitoring Truk PK & Lansir CPKO, status operasional pabrik, serta pengawasan K3/SOP kontraktor secara real-time.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-to-r from-white via-sky-100 to-blue-200 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-xl transition hover:-translate-y-0.5 cursor-pointer"
            >
              Login ke Sistem
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 flex-1">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Standar Operasional Utama</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <FileText className="w-6 h-6 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-900 mb-2">Logistik PK & Lansir CPKO</h3>
              <p className="text-sm text-slate-600">Pencatatan akurat jumlah armada truk masuk/keluar, total tonase (mt), serta evaluasi kendala antrean.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <Activity className="w-6 h-6 text-sky-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-900 mb-2">Monitoring Plant Run</h3>
              <p className="text-sm text-slate-600">Pelaporan jam operasional mesin (Running/Stop) dan aktivitas lansir HMPKE secara terstruktur.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <ShieldCheck className="w-6 h-6 text-indigo-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-900 mb-2">Kepatuhan SOP & APD</h3>
              <p className="text-sm text-slate-600">Pengawasan langsung mitra kontraktor di area pabrik terkait kelengkapan APD dan SOP kerja.</p>
            </div>
          </div>
        </section>

        <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-center border-t border-slate-900 text-xs">
          <p className="font-bold text-white">PT. USAHA INTI PADANG</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} PT. Usaha Inti Padang. by CAMILA MARISA.</p>
        </footer>

        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Login Sistem Laporan Piket</h3>
                <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer">&times;</button>
              </div>

              {loginError && <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg mb-4">{loginError}</div>}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Karyawan / Admin(HRGA) / Headunit"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-white via-sky-200 to-blue-500 shadow cursor-pointer">
                  Masuk
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. DASHBOARD SETELAH LOGIN
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 z-50 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <header className="bg-slate-900 text-white shadow sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight">PT. USAHA INTI PADANG</h1>
              <span className="text-xs text-blue-300">{currentUser.role}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={loadInitialData} title="Refresh Data" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setCurrentUser(null)} className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {/* KARYAWAN: INPUT LAPORAN */}
        {currentUser.username === "petugas" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white py-8 px-6 text-center border-b-4 border-blue-500">
              <h2 className="text-2xl font-extrabold tracking-wide">LAPORAN PIKET KARYAWAN</h2>
              <p className="text-blue-200 text-sm mt-1">PT. USAHA INTI PADANG</p>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 sm:p-8 space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Laporan : *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalLaporan}
                    onChange={(e) => setFormData({ ...formData, tanggalLaporan: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Petugas : *</label>
                  <select
                    required
                    value={formData.namaPetugas}
                    onChange={(e) => setFormData({ ...formData, namaPetugas: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Please Select</option>
                    {employees.map((emp, i) => (
                      <option key={i} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">LAPORAN JUMLAH TRUK PK DAN LANSIR CPKO</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Jumlah Truk : *</label>
                    <input type="number" required value={formData.trukPkJumlah} onChange={(e) => setFormData({ ...formData, trukPkJumlah: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total (mt) : *</label>
                    <input type="number" step="0.01" required value={formData.trukPkTotal} onChange={(e) => setFormData({ ...formData, trukPkTotal: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Gantung : *</label>
                    <input type="text" required value={formData.trukPkGantung} onChange={(e) => setFormData({ ...formData, trukPkGantung: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alasan : *</label>
                  <textarea rows="3" required value={formData.trukPkAlasan} onChange={(e) => setFormData({ ...formData, trukPkAlasan: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">LANSIR CPKO</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Jumlah Truk : *</label>
                    <input type="number" required value={formData.lansirCpkoJumlah} onChange={(e) => setFormData({ ...formData, lansirCpkoJumlah: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total (mt) : *</label>
                    <input type="number" step="0.01" required value={formData.lansirCpkoTotal} onChange={(e) => setFormData({ ...formData, lansirCpkoTotal: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">PLANT RUN</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mesin Running : *</label>
                    <input type="text" required value={formData.mesinRunning} onChange={(e) => setFormData({ ...formData, mesinRunning: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mesin Stop : *</label>
                    <input type="text" required value={formData.mesinStop} onChange={(e) => setFormData({ ...formData, mesinStop: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Aktivitas Lansir HMPKE : *</label>
                  <textarea rows="2" required value={formData.aktivitasHmpke} onChange={(e) => setFormData({ ...formData, aktivitasHmpke: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">LAPORAN KERJA KONTRAKTOR</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-sm text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-3 text-left">Nama Kontraktor</th>
                        <th className="p-3">Bekerja</th>
                        <th className="p-3">Tidak Bekerja</th>
                        <th className="p-3">APD Lengkap</th>
                        <th className="p-3">APD Tidak Lengkap</th>
                        <th className="p-3">Bekerja Sesuai SOP</th>
                        <th className="p-3">Tidak Sesuai SOP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {KONTRAKTOR_LIST.map((k) => {
                        const state = formData.kontraktor[k.key];
                        return (
                          <tr key={k.key} className="hover:bg-slate-50">
                            <td className="p-3 text-left font-semibold text-slate-800">{k.label}</td>
                            {["Bekerja", "Tidak Bekerja"].map((opt) => (
                              <td key={opt} className="p-3">
                                <input type="checkbox" checked={state.bekerja === opt} onChange={() => handleKontraktorChange(k.key, "bekerja", opt)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                              </td>
                            ))}
                            {["APD Lengkap", "APD Tidak Lengkap"].map((opt) => (
                              <td key={opt} className="p-3">
                                <input type="checkbox" checked={state.apd === opt} onChange={() => handleKontraktorChange(k.key, "apd", opt)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                              </td>
                            ))}
                            {["Bekerja Sesuai SOP", "Bekerja Tidak Sesuai SOP"].map((opt) => (
                              <td key={opt} className="p-3">
                                <input type="checkbox" checked={state.sop === opt} onChange={() => handleKontraktorChange(k.key, "sop", opt)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Catatan Temuan : *</label>
                  <textarea rows="4" required value={formData.catatanTemuan} onChange={(e) => setFormData({ ...formData, catatanTemuan: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unggah Dokumentasi : *</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:bg-slate-50 transition">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="font-semibold text-slate-700 text-sm">{formData.fileName ? formData.fileName : "Browse Files"}</span>
                    <input type="file" accept="image/*,.pdf" required onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ditujukan Kepada : *</label>
                  <select required value={formData.ditujukanKepada} onChange={(e) => setFormData({ ...formData, ditujukanKepada: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white">
                    {penerimaList.map((p, idx) => (<option key={idx} value={p}>{p}</option>))}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-extrabold text-slate-900 text-lg bg-gradient-to-r from-white via-sky-200 to-blue-500 shadow-lg hover:opacity-95 transition cursor-pointer">
                {loading ? "Mengirim..." : "Submit Laporan Piket"}
              </button>
            </form>
          </div>
        )}

        {/* ADMIN / HRGA: KELOLA KARYAWAN, PANTAU, VALIDASI, UNDUH REKAP */}
        {currentUser.username === "admin" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Dashboard Admin / HRGA</h2>
                <p className="text-sm text-slate-500">Kelola data karyawan, pemantauan laporan, validasi, dan unduh rekapitulasi</p>
              </div>
              <button onClick={handleExportCSV} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Unduh Rekapitulasi</span>
              </button>
            </div>

            {/* Kelola Data Karyawan */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Kelola Data Karyawan</span>
              </h3>
              <form onSubmit={handleAddEmployee} className="flex gap-2 mb-4 max-w-md">
                <input
                  type="text"
                  placeholder="Nama Karyawan Baru..."
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {employees.map((emp, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200">
                    {emp}
                  </span>
                ))}
              </div>
            </div>

            {/* Memantau & Memvalidasi Laporan */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Pemantauan & Validasi Laporan Piket Karyawan</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase">
                    <tr>
                      <th className="p-4">ID & Tanggal</th>
                      <th className="p-4">Petugas</th>
                      <th className="p-4">Truk PK / CPKO</th>
                      <th className="p-4">Dokumentasi</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Aksi Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">Belum ada data laporan dari Google Spreadsheet.</td>
                      </tr>
                    ) : (
                      reports.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{r["ID Laporan"]}</span>
                            <span className="text-xs text-slate-500">{r["Tanggal Laporan"]}</span>
                          </td>
                          <td className="p-4 font-medium">{r["Nama Petugas"]}</td>
                          <td className="p-4 text-xs">
                            <div>PK: {r["Truk PK (Jumlah)"]} Truk ({r["Truk PK Total (mt)"]} mt)</div>
                            <div>CPKO: {r["Lansir CPKO (Jumlah)"]} Truk ({r["Lansir CPKO Total (mt)"]} mt)</div>
                          </td>
                          <td className="p-4">
                            {r["Link Dokumentasi"] && r["Link Dokumentasi"] !== "-" ? (
                              <a href={r["Link Dokumentasi"]} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs font-semibold">
                                Lihat File
                              </a>
                            ) : <span className="text-xs text-slate-400">-</span>}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r["Status Validasi"] === "Tervalidasi" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {r["Status Validasi"] || "Menunggu Validasi"}
                            </span>
                          </td>
                          <td className="p-4 flex items-center gap-2">
                            {r["Status Validasi"] !== "Tervalidasi" ? (
                              <button onClick={() => handleValidate(r["ID Laporan"], "Tervalidasi")} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer">
                                <Check className="w-3.5 h-3.5" /> Validasi
                              </button>
                            ) : (
                              <button onClick={() => handleValidate(r["ID Laporan"], "Menunggu Validasi")} className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer">
                                <X className="w-3.5 h-3.5" /> Batalkan
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* HEAD UNIT: MEMANTAU KEGIATAN LAPORAN SECARA REAL-TIME */}
        {currentUser.username === "headunit" && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-bold">Executive Dashboard — Head Unit</h2>
              <p className="text-sm text-slate-300 mt-1">
                Pemantauan kegiatan laporan piket karyawan secara real-time.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Laporan Masuk</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{reports.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Tonase Truk PK (mt)</span>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">
                  {reports.reduce((acc, r) => acc + (parseFloat(r["Truk PK Total (mt)"]) || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Lansir CPKO (mt)</span>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {reports.reduce((acc, r) => acc + (parseFloat(r["Lansir CPKO Total (mt)"]) || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Live Feed Pemantauan Laporan Operasional</span>
              </h3>
              {reports.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
                  Belum ada laporan aktif yang masuk.
                </div>
              ) : (
                reports.map((r, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-bold text-slate-900">{r["Nama Petugas"]}</span>
                        <span className="text-xs text-slate-500 ml-2">({r["Tanggal Laporan"]})</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r["Status Validasi"] === "Tervalidasi" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {r["Status Validasi"] || "Menunggu Validasi"}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600">
                      <div>
                        <p><strong>Truk PK:</strong> {r["Truk PK (Jumlah)"]} Truk | {r["Truk PK Total (mt)"]} mt (Gantung: {r["Truk PK Gantung"]})</p>
                        <p><strong>Lansir CPKO:</strong> {r["Lansir CPKO (Jumlah)"]} Truk | {r["Lansir CPKO Total (mt)"]} mt</p>
                        <p><strong>Plant Run:</strong> Running ({r["Mesin Running"]}) / Stop ({r["Mesin Stop"]})</p>
                      </div>
                      <div>
                        <p><strong>Bima Sakti:</strong> {r["Bima Sakti Engineering"]}</p>
                        <p><strong>Aliva Mandiri:</strong> {r["Aliva Mandiri"]}</p>
                        <p><strong>Empat Saudara:</strong> {r["Empat Saudara"]}</p>
                        <p><strong>Jack Elektro:</strong> {r["Jack Elektro"]}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700">
                      <strong>Catatan Temuan:</strong> {r["Catatan Temuan"]}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}