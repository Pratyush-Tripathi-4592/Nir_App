import json
import math
import os

class DirtinessIndex:
    def __init__(self, data_path="data/dirtiness_points.json"):
        self.data_path = data_path
        if not os.path.exists(self.data_path):
            # Seed with Chennai areas (you can edit later)
            seed = [
                {"lat": 13.0418, "lng": 80.2337, "score": 0.90}, # T. Nagar
                {"lat": 13.0860, "lng": 80.2101, "score": 0.70}, # Anna Nagar
                {"lat": 12.9791, "lng": 80.2209, "score": 0.50}, # Velachery
                {"lat": 13.0067, "lng": 80.2550, "score": 0.60}, # Adyar
            ]
            os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
            with open(self.data_path, "w") as f:
                json.dump(seed, f, indent=2)
            points_data = seed
        else:
            with open(self.data_path, "r") as f:
                points_data = json.load(f)

        # UPDATED LINE: This now correctly reads the list of objects
        self.points = [
            [float(p["lat"]), float(p["lng"]), float(p["score"])] for p in points_data
        ]

    def get_points(self):
        # This function reads the raw data from the file for the API endpoint
        with open(self.data_path, "r") as f:
            return json.load(f)

    @staticmethod
    def _haversine(lat1, lon1, lat2, lon2):
        """Great-circle distance in kilometers"""
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c + 1e-6  # avoid division by zero

    def get_index(self, lat, lon):
        """
        Inverse-distance weighted average of k nearest points (k=3).
        Returns value in [0,1].
        """
        k = 3
        dists = []
        for (plat, plon, val) in self.points:
            d = self._haversine(lat, lon, plat, plon)
            dists.append((d, val))

        dists.sort(key=lambda x: x[0])
        use = dists[:min(k, len(dists))]

        # If extremely close to one point, return that value
        if use and use[0][0] < 0.25:
            return max(0.0, min(1.0, use[0][1]))

        # Inverse Distance Weighting (IDW)
        num, den = 0.0, 0.0
        for d, v in use:
            w = 1.0 / (d ** 2)
            num += w * v
            den += w

        if den == 0:
            return 0.5  # fallback default

        return max(0.0, min(1.0, num / den))