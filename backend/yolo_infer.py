import numpy as np

# Try to import ultralytics YOLO
_YOLO_AVAILABLE = True
try:
    from ultralytics import YOLO
    _yolo_model = YOLO("yolov8n.pt")
except Exception:
    _YOLO_AVAILABLE = False
    _yolo_model = None

def _yolo_classify(pil_img):
    """
    Returns an overall classification, confidence, and a list of all detections.
    """
    # Using a lower confidence threshold to detect more objects
    res = _yolo_model.predict(pil_img, conf=0.1, verbose=False) 
    
    names = _yolo_model.names
    recyclable_keywords = {"bottle", "can", "paper", "cardboard", "cup", "plastic", "tin"}

    recyclable_hits = 0
    total_hits = 0
    detections = []

    for r in res:
        if r.boxes is None:
            continue
        
        # Extract boxes, confidence scores, and class IDs
        boxes = r.boxes.xyxy.cpu().numpy().astype(int)
        confidences = r.boxes.conf.cpu().numpy().astype(float)
        class_ids = r.boxes.cls.cpu().numpy().astype(int)

        for i, cls_id in enumerate(class_ids):
            total_hits += 1
            cls_name = names.get(cls_id, "").lower()
            is_recyclable = any(k in cls_name for k in recyclable_keywords)

            if is_recyclable:
                recyclable_hits += 1
            
            # Add detection details to the list
            detections.append({
                "box": boxes[i].tolist(), # [x1, y1, x2, y2]
                "label": "recyclable" if is_recyclable else "trash",
                "confidence": float(confidences[i])
            })

    if total_hits == 0:
        return "Trash", 0.30, []

    ratio = recyclable_hits / total_hits
    overall_classification = "Recyclable" if ratio >= 0.5 else "Trash"
    overall_confidence = ratio if overall_classification == "Recyclable" else 1 - ratio
    
    return overall_classification, float(overall_confidence), detections

def _simple_fallback(pil_img):
    """
    Fallback classifier (very rough): uses image "green-ness" as a silly proxy.
    Only to keep demo working without YOLO installed.
    """
    arr = np.array(pil_img.resize((224, 224)))
    green_ratio = arr[:, :, 1].mean() / (arr.mean() + 1e-6)
    # If "greener" → guess Recyclable (demo only)
    if green_ratio > 1.05:
        return "Recyclable", min(0.95, (green_ratio - 1.0)), []
    else:
        return "Trash", min(0.90, 1.05 - green_ratio), []

def classify_image(pil_img):
    if _YOLO_AVAILABLE and _yolo_model is not None:
        try:
            return _yolo_classify(pil_img)
        except Exception:
            pass
    return _simple_fallback(pil_img)