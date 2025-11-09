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

def generate_human(human_id: int, car_ids: list[int]) -> dict:
    return {
        # "id": human_id,
        "name": f"Human_{human_id}",
        "coordinates": generate_coordinates(),
        # "creationDate": datetime.utcnow().isoformat(),
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

def generate_yaml(num_entities: int, car_ids: list[int], start_id: int = 1) -> str:
    humans = [generate_human(i + start_id, car_ids) for i in range(num_entities)]
    return yaml.dump(humans, sort_keys=False, allow_unicode=True)

# --- CLI ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate YAML for HumanBeing entities.")
    parser.add_argument("-n", "--num", type=int, required=True, help="Number of entities to generate.")
    parser.add_argument("-s", "--start-id", type=int, default=1, help="Names starting id")
    parser.add_argument("--cars", nargs="+", type=int, required=True, help="List of available car IDs.")
    parser.add_argument("-o", "--output", default="humans.yaml", help="Output YAML filename.")

    args = parser.parse_args()

    yaml_output = generate_yaml(args.num, args.cars, args.start_id)

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(yaml_output)

    print(f"✅ Generated {args.num} HumanBeing entities to '{args.output}'")
