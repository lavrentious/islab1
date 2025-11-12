import argparse
import json
import os
import random

import yaml

# --- ENUMS ---
MOODS = ["SADNESS", "SORROW", "LONGING", "APATHY", "CALM"]
WEAPON_TYPES = ["HAMMER", "SHOTGUN", "RIFLE"]

# --- SAMPLE CARS ---
CAR_POOL = [
    {"name": "honda civic", "cool": True},
    {"name": "toyota corolla", "cool": False},
    {"name": "mazda mx-5", "cool": True},
    {"name": "volvo 240", "cool": None},
    {"name": "ford mustang", "cool": True},
]


# --- DATA GENERATION ---
def generate_coordinates():
    return {
        "x": round(random.uniform(-1000, 1000), 3),
        "y": random.randint(-1000, 1000),
    }


def generate_human(
    human_id: int, name: str, car_ids: list[int], use_car_object_chance: float
) -> dict:
    # Sometimes use a full car object from CAR_POOL instead of an ID
    if random.random() < use_car_object_chance:
        car_value = random.choice(CAR_POOL)
    else:
        car_value = random.choice(car_ids)

    return {
        "name": name,
        "coordinates": generate_coordinates(),
        "realHero": random.choice([True, False]),
        "hasToothpick": random.choice([True, False, None]),
        "car": car_value,
        "mood": random.choice(MOODS),
        "impactSpeed": random.randint(0, 300),
        "soundtrackName": f"Track_{random.randint(1,100)}",
        "minutesOfWaiting": random.choice([None, random.randint(1, 120)]),
        "weaponType": random.choice(WEAPON_TYPES),
    }


def generate_entities(
    num_entities: int,
    car_ids: list[int],
    start_id: int = 1,
    duplicate_chance: float = 0.1,
    use_car_object_chance: float = 0.15,
) -> list[dict]:
    """
    Generates humans with occasional duplicate names and occasional full car objects.
    """
    humans = []
    used_names = []

    for i in range(num_entities):
        # Occasionally duplicate names
        if used_names and random.random() < duplicate_chance:
            name = random.choice(used_names)
        else:
            name = f"Human_{i + start_id}"
            used_names.append(name)

        humans.append(
            generate_human(i + start_id, name, car_ids, use_car_object_chance)
        )

    return humans


def serialize_data(data: list[dict], output_path: str) -> str:
    """
    Serialize data based on file extension.
    Supported: .yaml, .yml, .json
    """
    ext = os.path.splitext(output_path)[1].lower()

    if ext in (".yaml", ".yml"):
        return yaml.dump(data, sort_keys=False, allow_unicode=True)
    elif ext == ".json":
        return json.dumps(data, indent=2, ensure_ascii=False)
    else:
        raise ValueError(f"Unsupported file format '{ext}'. Use .yaml, .yml, or .json.")


# --- CLI ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate entities (HumanBeing) data in YAML or JSON format."
    )
    parser.add_argument(
        "-n", "--num", type=int, required=True, help="Number of entities to generate."
    )
    parser.add_argument(
        "-s", "--start-id", type=int, default=1, help="Names starting id."
    )
    parser.add_argument(
        "--cars", nargs="+", type=int, required=True, help="List of available car IDs."
    )
    parser.add_argument(
        "-o",
        "--output",
        default="humans.yaml",
        help="Output filename (.yaml, .yml, or .json).",
    )
    parser.add_argument(
        "-d",
        "--duplicate-chance",
        type=float,
        default=0.1,
        help="Chance (0–1) for generating duplicate names. Default: 0.1 (10%).",
    )
    parser.add_argument(
        "-c",
        "--car-object-chance",
        type=float,
        default=0.15,
        help="Chance (0–1) to use a full car object instead of an ID. Default: 0.15 (15%).",
    )

    args = parser.parse_args()

    humans = generate_entities(
        args.num,
        args.cars,
        args.start_id,
        args.duplicate_chance,
        args.car_object_chance,
    )

    output_data = serialize_data(humans, args.output)

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(output_data)

    print(
        f"✅ Generated {args.num} HumanBeing entities to '{args.output}' "
        f"(duplicates ≈ {args.duplicate_chance*100:.0f}%, car objects ≈ {args.car_object_chance*100:.0f}%)"
    )
