// Entirely synthetic examples. Dates follow the current week; no real patient data.
export function sampleData(ownerId, now = new Date()) {
  const base = new Date(now);
  base.setHours(9, 0, 0, 0);
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  const names = ['Demo Ana', 'Demo Luka', 'Demo Mia', 'Demo Ivan', 'Demo Ema', 'Demo Noa'];
  const vaccines = ['moderna', 'pfizer', 'astrazeneca', 'johnson', 'pfizer', 'moderna'];
  const prefix = ownerId.slice(0, 24);
  const patients = names.map((name, i) => ({
    id: `${prefix}${String(i + 1).padStart(12, '0')}`, name,
    dob: new Date(Date.UTC(1980 + i * 4, i, 12)).toISOString(),
    mbo: `DEMO0000${i + 1}`, vaccine: vaccines[i], vaxxed: 'first',
    target: vaccines[i] === 'johnson' ? 'first' : 'second', link: `${ownerId}-${i}`,
  }));
  const events = patients.map((patient, i) => {
    const date = new Date(base); date.setDate(date.getDate() + i % 5); date.setHours(9 + Math.floor(i / 5));
    return { id: `${prefix}${String(i + 101).padStart(12, '0')}`, date: date.toISOString(), type: 'first',
      identifier: `DEMO-${i + 1}`, link: patient.link, patient };
  });
  return { patients, events };
}
