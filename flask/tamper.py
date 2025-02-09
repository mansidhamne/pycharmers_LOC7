import cv2
import numpy as np

def apply_laplacian(image):
    """Detects sharp changes using the Laplacian operator."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)  # Apply Laplacian filter
    return laplacian

def detect_text_regions(image):
    """Finds text regions using contour detection on thresholded image."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find contours of potential text regions
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    text_regions = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w > 10 and h > 10:  # Filter small noise
            text_regions.append((x, y, w, h))
    
    return text_regions

def highlight_significant_text(image, laplacian, text_regions, deviation_factor=1.5):
    """Highlights text that deviates significantly from the mean intensity."""
    abs_laplacian = cv2.convertScaleAbs(laplacian)
    laplacian_colored = cv2.cvtColor(abs_laplacian, cv2.COLOR_GRAY2BGR)

    # Compute mean pixel value of all text regions
    pixel_values = [np.mean(abs_laplacian[y:y+h, x:x+w]) for (x, y, w, h) in text_regions]
    mean_pixel_value = np.mean(pixel_values) if pixel_values else 0
    std_dev = np.std(pixel_values) if pixel_values else 0

    tampered = False
    for (x, y, w, h) in text_regions:
        region_mean = np.mean(abs_laplacian[y:y+h, x:x+w])
        if abs(region_mean - mean_pixel_value) > deviation_factor * std_dev:
            cv2.rectangle(laplacian_colored, (x, y), (x + w, y + h), (0, 0, 255), 2)
            tampered = True  # If at least one box is drawn, mark as tampered

    return laplacian_colored, tampered

def detect_tampering(image_path):
    """Detects tampering using a simple bounding box mechanism."""
    image = cv2.imread(image_path)
    laplacian = apply_laplacian(image)
    text_regions = detect_text_regions(image)
    laplacian_with_boxes, tampered = highlight_significant_text(image, laplacian, text_regions)

    # Print tampering status
    result_text = "Tampered" if tampered else "Not Tampered"
    print(f"Tampering Status: {result_text}")

    return tampered

    # Display results
    # cv2.putText(laplacian_with_boxes, result_text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    # cv2.imshow("Original Image", image)
    # cv2.imshow("Highlighted Text", laplacian_with_boxes)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()