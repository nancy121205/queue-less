import pytesseract
from PIL import Image

image = Image.open("page.png")  # any image with text on it
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
text = pytesseract.image_to_string(image)
print(text)