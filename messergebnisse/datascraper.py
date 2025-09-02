import requests
import json
import csv
import os
import time

# --- Konfiguration ---
# Definiere alle deine Messungen
CONFIG = {
    "1cycle_classic_1of5": "bc857a07-0ced-4c37-a0e8-5d1c1f383736",
    "1cycle_co2aware_1of10": "8abf2683-597e-4709-9c23-bb717317c733",
    "1cycle-co2aware-2of10": "e80e74e8-7ba0-4e34-ab97-34beff689b58",
    "1cycle-co2aware-3of10": "b148dbe2-f1f1-44dc-9954-3330ec4744e5",
    "1cycle-co2aware-4of10": "947b2a19-094f-4b0b-84f6-d3511e51ce40",
    "1cycle-co2aware-5of10": "79b0756b-b28a-4576-b2b7-7aba7feb63a5",
    "1cycle_classic": "d0ece413-bfc9-47b0-aef2-9b6f841b5379"
}

# NEU: Liste der Messungen, die in diesem Durchlauf verarbeitet werden sollen
MEASUREMENTS_TO_PROCESS = [
    "1cycle_co2aware_1of10",
    "1cycle-co2aware-2of10",
    "1cycle-co2aware-3of10",
    "1cycle-co2aware-4of10",
    "1cycle-co2aware-5of10"
]

API_KEY = "DEFAULT"
PRECACHE_OFFSET_S = 4
PRECACHE_DURATION_S = 10
BASE_RESULTS_DIR = "results"

# --- Hilfsfunktionen ---
def get_api_data(url, local_path):
    """
    Holt Daten von der API oder aus einem lokalen Cache, um die API zu schonen.
    """
    if os.path.exists(local_path):
        print(f"   -> Lade Daten aus lokaler Datei: {local_path}")
        with open(local_path, 'r') as f:
            return json.load(f)
    else:
        print(f"   -> Frage API an: {url}")
        headers = {"accept": "application/json", "X-API-Key": API_KEY}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        # Speichere die Rohdaten für die Zukunft
        with open(local_path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"   -> Rohdaten gespeichert in: {local_path}")
        time.sleep(1) # Kurz warten, um die API nicht zu überlasten
        return data

# --- Hauptskript ---
# Liste, um die Ergebnisse aller Läufe zu sammeln
all_results_for_csv = []
os.makedirs(BASE_RESULTS_DIR, exist_ok=True)

for mode_name in MEASUREMENTS_TO_PROCESS:
    try:
        messung_id = CONFIG[mode_name]
        is_co2_aware_mode = "co2aware" in mode_name.lower()

        print("\n" + "="*60)
        print(f"VERARBEITE: '{mode_name}' ({messung_id})")
        print("="*60)

        # Verzeichnisse für Rohdaten anlegen
        run_dir = os.path.join(BASE_RESULTS_DIR, mode_name)
        os.makedirs(run_dir, exist_ok=True)

        # 1. 'notes'-Daten abrufen (mit Caching)
        notes_path = os.path.join(run_dir, "notes.json")
        notes_url = f"https://api.green-coding.io/v1/notes/{messung_id}"
        notes_api_data = get_api_data(notes_url, notes_path)

        ts = {"runtime_start": None, "runtime_end": None, "passive_1_start": None, "passive_1_end": None}
        if notes_api_data.get("success"):
            for note in notes_api_data["data"]:
                message, timestamp = note[2], note[3]
                if message == "Starting phase [RUNTIME]": ts["runtime_start"] = timestamp
                elif message == "Ending phase [RUNTIME] [UNPADDED]": ts["runtime_end"] = timestamp
                elif message == "PHASE:PASSIVE_1_START": ts["passive_1_start"] = timestamp
                elif message == "PHASE:PASSIVE_1_END": ts["passive_1_end"] = timestamp

        if not all([ts["runtime_start"], ts["runtime_end"]]):
            raise ValueError("Konnte RUNTIME Start/Ende nicht in den 'notes' finden.")

        # 2. Precaching-Fenster berechnen
        precache_ts = {"start": None, "end": None, "duration_s": 0}
        if is_co2_aware_mode:
            if not all([ts["passive_1_start"], ts["passive_1_end"]]):
                raise ValueError("Konnte PASSIVE_1 Start/Ende nicht finden.")
            us_per_second = 1_000_000
            precache_ts["start"] = ts["passive_1_start"] + PRECACHE_OFFSET_S * us_per_second
            precache_ts["end"] = precache_ts["start"] + PRECACHE_DURATION_S * us_per_second
            precache_ts["duration_s"] = (precache_ts["end"] - precache_ts["start"]) / us_per_second
            if precache_ts["end"] >= ts["passive_1_end"]:
                 print("WARNUNG: Precaching-Ende liegt nach dem Ende von PHASE_PASSIVE_1!")

        # 3. 'measurements'-Daten abrufen (mit Caching)
        measurements_path = os.path.join(run_dir, "measurements.json")
        measurements_url = f"https://api.green-coding.io/v1/measurements/single/{messung_id}"
        measurements_api_data = get_api_data(measurements_url, measurements_path)

        # 4. Messdaten verarbeiten
        results = {'precache': {}, 'other_runtime': {}} # Vereinfacht
        for key in results: results[key] = {'energy_uj': 0, 'network_bytes': 0, 'count': 0}
        
        if measurements_api_data.get("success"):
            for record in measurements_api_data["data"]:
                if len(record) < 5: continue
                record_timestamp = record[1]
                if ts["runtime_start"] <= record_timestamp <= ts["runtime_end"]:
                    bucket = 'other_runtime'
                    if is_co2_aware_mode and precache_ts["start"] <= record_timestamp <= precache_ts["end"]:
                        bucket = 'precache'
                    
                    metric_name, value = record[2], record[3]
                    results[bucket]['count'] += 1
                    if metric_name == "psu_energy_ac_mcp_machine": results[bucket]['energy_uj'] += value
                    elif "network" in metric_name and "cgroup" in metric_name: results[bucket]['network_bytes'] += value
        
        # 5. Ergebnisse für diesen Lauf zusammenstellen
        total_energy_uj = results['precache']['energy_uj'] + results['other_runtime']['energy_uj']
        total_network_bytes = results['precache']['network_bytes'] + results['other_runtime']['network_bytes']

        run_summary = {
            "measurement_name": mode_name,
            "measurement_id": messung_id,
            "runtime_duration_s": (ts["runtime_end"] - ts["runtime_start"]) / 1_000_000,
            "precache_duration_s": precache_ts["duration_s"],
            "precache_energy_mwh": results['precache']['energy_uj'] / 3_600_000,
            "precache_network_mb": results['precache']['network_bytes'] / (1024*1024),
            "other_runtime_energy_mwh": results['other_runtime']['energy_uj'] / 3_600_000,
            "other_runtime_network_mb": results['other_runtime']['network_bytes'] / (1024*1024),
            "total_energy_mwh": total_energy_uj / 3_600_000,
            "total_network_mb": total_network_bytes / (1024*1024)
        }
        all_results_for_csv.append(run_summary)
        print(f"   -> Verarbeitung für '{mode_name}' abgeschlossen.")

    except Exception as e:
        print(f"FEHLER bei der Verarbeitung von '{mode_name}': {e}")
        # Optional: Hier könnten Fehler auch in die CSV geschrieben werden

# --- Nach der Schleife: Alle Ergebnisse in eine CSV-Datei schreiben ---
csv_file_path = os.path.join(BASE_RESULTS_DIR, "master_results.csv")
print("\n" + "="*60)
print(f"Alle Messungen verarbeitet. Schreibe Ergebnisse in: {csv_file_path}")
print("="*60)

if all_results_for_csv:
    # Definiere die Spaltenüberschriften für die CSV-Datei
    fieldnames = [
        "measurement_name", "measurement_id", "runtime_duration_s",
        "precache_duration_s", "precache_energy_mwh", "precache_network_mb",
        "other_runtime_energy_mwh", "other_runtime_network_mb",
        "total_energy_mwh", "total_network_mb"
    ]
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_results_for_csv)
    print("CSV-Datei erfolgreich erstellt.")
else:
    print("Keine Ergebnisse zum Speichern vorhanden.")