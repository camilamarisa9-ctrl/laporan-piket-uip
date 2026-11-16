const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const fetchReports = async () => {
  if (!SCRIPT_URL) return [];
  const res = await fetch(`${SCRIPT_URL}?action=getReports`);
  const json = await res.json();
  return json.data || [];
};

export const fetchEmployees = async () => {
  if (!SCRIPT_URL) {
    return [
      "Anggi Dwi Saputra", "Dhiyaul Husni", "Hilham Haqki", "Jafriadi",
      "Fitria Dewi Sartika", "Yanti Sevmon Eleveni", "Jhonnedi",
      "Elmeindriani Wyaharnal", "Wilson Herman"
    ];
  }
  const res = await fetch(`${SCRIPT_URL}?action=getEmployees`);
  const json = await res.json();
  return json.data || [];
};

export const submitReportToSheet = async (formData) => {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "submitReport", ...formData }),
  });
  return await res.json();
};

export const validateReportInSheet = async (idLaporan, status) => {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "validateReport", idLaporan, status }),
  });
  return await res.json();
};

export const addEmployeeToSheet = async (nama) => {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "addEmployee", nama }),
  });
  return await res.json();
};