// utils/lastVisit.ts
export function setReportsLastVisit() {
  localStorage.setItem("lastReportsVisit", new Date().toISOString());
}

export function getReportsLastVisit(): Date | null {
  const ts = localStorage.getItem("lastReportsVisit");
  return ts ? new Date(ts) : null;
}
