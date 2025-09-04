import json
import os
import pandas as pd
import matplotlib.pyplot as plt
import re

# --- Konfiguration ---

# 1. WÄHLE HIER DIE MESSUNG AUS, FÜR DIE DU EIN DIAGRAMM ERSTELLEN MÖCHTEST
MEASUREMENT_TO_PLOT = "1cycle-classic-2of5"  # Beispiele: "1cycle-co2aware-5of10", "30cycle-classic"

# 2. DIESE EINSTELLUNGEN MÜSSEN MIT DEINEM DATASCRAPER-SKRIPT ÜBEREINSTIMMEN
BASE_RESULTS_DIR = "results"
PRECACHE_OFFSET_S = 4
PRECACHE_DURATION_S = 10

# --- Hilfsfunktionen ---
def generate_plot_title(measurement_name, metric_prefix):
    """
    Generiert dynamisch einen formellen Titel für das Diagramm basierend auf dem Namen der Messung.
    """
    cycles_text = "eines Testzyklus"
    mode_text = "Konzeptmodus"
    match = re.match(r"(\d+)", measurement_name)
    if match:
        num_cycles = int(match.group(1))
        if num_cycles > 1:
            cycles_text = f"von {num_cycles} Testzyklen"
    if "classic" in measurement_name.lower():
        mode_text = "klassischen Modus"
    return f"{metric_prefix} {cycles_text} im {mode_text}"

# --- Hauptskript ---
def create_visualizations():
    """
    Hauptfunktion zur Erstellung und Speicherung der Diagramme für eine einzelne Messung.
    """
    plt.rcParams['font.size'] = 11
    plt.rcParams['axes.titlesize'] = 18
    plt.rcParams['axes.labelsize'] = 18
    plt.rcParams['xtick.labelsize'] = 18
    plt.rcParams['ytick.labelsize'] = 18
    plt.rcParams['legend.fontsize'] = 18
    
    try:
        print("="*60)
        print(f"ERSTELLE DIAGRAMME FÜR: '{MEASUREMENT_TO_PLOT}'")
        print("="*60)

        run_dir = os.path.join(BASE_RESULTS_DIR, MEASUREMENT_TO_PLOT)
        notes_path = os.path.join(run_dir, "notes.json")
        measurements_path = os.path.join(run_dir, "measurements.json")

        if not os.path.exists(notes_path) or not os.path.exists(measurements_path):
            raise FileNotFoundError(f"Benötigte Daten nicht gefunden in: {run_dir}.")

        print(f"1. Lade 'notes' aus: {notes_path}")
        with open(notes_path, 'r') as f:
            notes_api_data = json.load(f)

        ts = {"runtime_start": None, "runtime_end": None, "passive_1_start": None}
        if notes_api_data.get("success"):
            for note in notes_api_data["data"]:
                message, timestamp = note[2], note[3]
                if message == "Starting phase [RUNTIME]": ts["runtime_start"] = timestamp
                elif message == "Ending phase [RUNTIME] [UNPADDED]": ts["runtime_end"] = timestamp
                elif message == "PHASE:PASSIVE_1_START": ts["passive_1_start"] = timestamp
        
        if not all([ts["runtime_start"], ts["runtime_end"]]):
            raise ValueError("Konnte RUNTIME Start/Ende in den 'notes' nicht finden.")

        precache_ts = {"start": None, "end": None}
        if ts["passive_1_start"]:
            us_per_second = 1_000_000
            precache_ts["start"] = ts["passive_1_start"] + PRECACHE_OFFSET_S * us_per_second
            precache_ts["end"] = precache_ts["start"] + PRECACHE_DURATION_S * us_per_second
        else:
            print("WARNUNG: 'PHASE:PASSIVE_1_START' nicht gefunden. Referenzlinien können nicht gezeichnet werden.")

        print(f"2. Lade 'measurements' aus: {measurements_path}")
        with open(measurements_path, 'r') as f:
            measurements_api_data = json.load(f)

        energy_data, network_data = [], []
        if measurements_api_data.get("success"):
            for record in measurements_api_data["data"]:
                if len(record) < 5: continue
                record_timestamp = record[1]
                if ts["runtime_start"] <= record_timestamp <= ts["runtime_end"]:
                    relative_time_s = (record_timestamp - ts["runtime_start"]) / 1_000_000
                    metric_name, value = record[2], record[3]
                    if metric_name == "psu_energy_ac_mcp_machine":
                        energy_data.append((relative_time_s, value))
                    elif "network" in metric_name and "cgroup" in metric_name:
                        network_data.append((relative_time_s, value / (1024*1024)))

        print("3. Erstelle und speichere Diagramme...")
        
        # --- Diagramm 1: Machine Energy ---
        if energy_data:
            df_energy = pd.DataFrame(energy_data, columns=['time_s', 'energy_uj'])
            plt.figure(figsize=(15, 8)) # Höhe leicht angepasst für mehr Platz unten
            plt.plot(df_energy['time_s'], df_energy['energy_uj'], label='Energieverbrauch', color='royalblue')
            
            if precache_ts["start"]:
                start_line = (precache_ts["start"] - ts["runtime_start"]) / 1_000_000
                end_line = (precache_ts["end"] - ts["runtime_start"]) / 1_000_000
                plt.axvline(x=start_line, color='red', linestyle='--', label='Precaching Zeitfenster Beginn')
                plt.axvline(x=end_line, color='green', linestyle='--', label='Precaching Zeitfenster Ende')

            title = generate_plot_title(MEASUREMENT_TO_PLOT, "Energieverbrauchsprofil")
            plt.title(title)
            plt.xlabel('Zeit seit Runtime-Start (Sekunden)')
            plt.ylabel('Energieverbrauch (µJ)')
            
            # NEU: Legende unter dem Diagramm platzieren
            plt.legend(loc='upper center', bbox_to_anchor=(0.5, -0.15), ncol=3)
            
            plt.grid(True, which='both', linestyle='--', linewidth=0.5)
            # tight_layout wird entfernt, da bbox_inches='tight' das besser regelt
            energy_plot_path = os.path.join(run_dir, 'plot_machine_energy.png')
            
            # NEU: bbox_inches='tight' sorgt dafür, dass die Legende nicht abgeschnitten wird
            plt.savefig(energy_plot_path, bbox_inches='tight')
            plt.close()
            print(f"   -> Diagramm gespeichert: {energy_plot_path}")

        # --- Diagramm 2: Network I/O ---
        if network_data:
            df_network = pd.DataFrame(network_data, columns=['time_s', 'network_mb'])
            plt.figure(figsize=(15, 8)) # Höhe leicht angepasst für mehr Platz unten
            plt.plot(df_network['time_s'], df_network['network_mb'], label='Netzwerk I/O', color='darkorange')

            if precache_ts["start"]:
                start_line = (precache_ts["start"] - ts["runtime_start"]) / 1_000_000
                end_line = (precache_ts["end"] - ts["runtime_start"]) / 1_000_000
                plt.axvline(x=start_line, color='red', linestyle='--', label='Precaching Zeitfenster Beginn')
                plt.axvline(x=end_line, color='green', linestyle='--', label='Precaching Zeitfenster Ende')

            title = generate_plot_title(MEASUREMENT_TO_PLOT, "Netzwerknutzungsprofil")
            plt.title(title)
            plt.xlabel('Zeit seit Runtime-Start (Sekunden)')
            plt.ylabel('Netzwerknutzung (MB)')
            
            # NEU: Legende unter dem Diagramm platzieren
            plt.legend(loc='upper center', bbox_to_anchor=(0.5, -0.11), ncol=3)

            plt.grid(True, which='both', linestyle='--', linewidth=0.5)
            network_plot_path = os.path.join(run_dir, 'plot_network_io.png')
            
            # NEU: bbox_inches='tight' sorgt dafür, dass die Legende nicht abgeschnitten wird
            plt.savefig(network_plot_path, bbox_inches='tight')
            plt.close()
            print(f"   -> Diagramm gespeichert: {network_plot_path}")

    except (FileNotFoundError, ValueError, KeyError) as e:
        print(f"\nFEHLER: {e}")
    except Exception as e:
        print(f"\nEin unerwarteter Fehler ist aufgetreten: {e}")

if __name__ == "__main__":
    create_visualizations()