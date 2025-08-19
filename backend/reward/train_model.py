import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle
import os

# Example training set creator (you can replace with your own dataset)
def build_example_dataset():
    rows = []
    types = ["Taxpayer", "Ration Card Holder"]
    classes = ["Recyclable", "Trash"]
    for _ in range(400):
        ct = np.random.choice(types)
        cl = np.random.choice(classes)
        di = np.clip(np.random.normal(0.6, 0.2), 0, 1)  # dirtiness index
        base = 10 if cl == "Recyclable" else 5
        reward = base * (1.0 + di) + np.random.normal(0, 0.8)  # noise
        rows.append([ct, cl, di, max(0, reward)])
    return pd.DataFrame(rows, columns=["citizen_type", "classification", "dirtiness_index", "reward"])

def encode(df):
    df = df.copy()
    df["is_taxpayer"] = (df["citizen_type"].str.lower().str.startswith("tax")).astype(int)
    df["is_recyclable"] = (df["classification"].str.lower().str.startswith("recycl")).astype(int)
    X = df[["is_taxpayer", "is_recyclable", "dirtiness_index"]].values
    y = df["reward"].values
    return X, y

def main():
    # If you already have a CSV, load it here:
    # df = pd.read_csv("your_dataset.csv")
    df = build_example_dataset()

    X, y = encode(df)
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X, y)

    os.makedirs("reward", exist_ok=True)
    with open(os.path.join("reward", "model.pkl"), "wb") as f:
        pickle.dump(model, f)

    print("✅ model.pkl saved in reward/")

if __name__ == "__main__":
    main()
