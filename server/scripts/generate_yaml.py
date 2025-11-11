import random
import yaml
from datetime import datetime
import argparse

# --- ENUMS ---
MOODS = ["SADNESS", "SORROW", "LONGING", "APATHY", "CALM"]
WEAPON_TYPES = ["HAMMER", "SHOTGUN", "RIFLE"]

# --- DATA GENERATION ---
def generate_coordinates():
    return {
        "x": round(random.uniform(-1000, 1000), 3),
        "y": random.randint(-1000, 1000)
    }

def generate_human(human_id: int, name: str, car_ids: list[int]) -> dict:
    return {
        "name": name,
        "coordinates": generate_coordinates(),
        "realHero": random.choice([True, False]),
        "hasToothpick": random.choice([True, False, None]),
        "car": random.choice(car_ids),
        "mood": random.choice(MOODS),
        "impactSpeed": random.randint(0, 300),
        "soundtrackName": f"Track_{random.randint(1,100)}",
        "minutesOfWaiting": random.choice([None, random.randint(1, 120)]),
        "weaponType": random.choice(WEAPON_TYPES),
        "_version": random.randint(1, 10)
    }

def generate_yaml(num_entities: int, car_ids: list[int], start_id: int = 1, duplicate_chance: float = 0.1) -> str:
    humans = []
    used_names = []

    for i in range(num_entities):
        # Decide whether to reuse an existing name (create a duplicate)
        if used_names and random.random() < duplicate_chance:
            name = random.choice(used_names)  # Pick a previous name for duplication
        else:
            name = f"Human_{i + start_id}"
            used_names.append(name)

        humans.append(generate_human(i + start_id, name, car_ids))

    return yaml.dump(humans, sort_keys=False, allow_unicode=True)

# --- CLI ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate YAML for HumanBeing entities (with occasional duplicates).")
    parser.add_argument("-n", "--num", type=int, required=True, help="Number of entities to generate.")
    parser.add_argument("-s", "--start-id", type=int, default=1, help="Names starting id.")
    parser.add_argument("--cars", nargs="+", type=int, required=True, help="List of available car IDs.")
    parser.add_argument("-o", "--output", default="humans.yaml", help="Output YAML filename.")
    parser.add_argument("-d", "--duplicate-chance", type=float, default=0.1,
                        help="Chance (0–1) for generating duplicate names. Default: 0.1 (10%).")

    args = parser.parse_args()

    yaml_output = generate_yaml(args.num, args.cars, args.start_id, args.duplicate_chance)

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(yaml_output)

    print(f"✅ Generated {args.num} HumanBeing entities to '{args.output}' (duplicates ≈ {args.duplicate_chance*100:.0f}%)")
