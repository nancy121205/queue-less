import pymupdf

doc = pymupdf.open("test.pdf")
for page in doc:
    pix = page.get_pixmap()
    pix.save(f"page.png")