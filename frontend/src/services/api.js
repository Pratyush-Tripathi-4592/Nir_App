export async function uploadTrash(file, citizenType, lat, lng) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("citizen_type", citizenType);
  formData.append("lat", lat);
  formData.append("lng", lng);

  const res = await fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    body: formData,
  });

  return await res.json();
}
