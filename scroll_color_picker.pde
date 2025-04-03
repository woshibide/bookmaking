// Global color values (HSB)
float currentH = 180; // starting hue (0-360)
float currentS = 50;  // starting saturation (0-100)
float currentB = 90;  // starting brightness (0-100)
boolean showCopied = false;
int copiedTime = 0;

void setup() {
  fullScreen();
  colorMode(HSB, 360, 100, 100);
  textAlign(CENTER, CENTER);
}

void draw() {
  background(currentH, currentS, currentB);
  
  // Draw labels
  pushStyle();
  blendMode(DIFFERENCE);
  textSize(36);
  text("H", width/6, height - 40);
  text("S", width/2, height - 40);
  text("B", 5 * width/6, height - 40);
  popStyle();
  
  // Color conversion
  color c = color(currentH, currentS, currentB);
  int r = round(red(c));    // FIX: Use rounding instead of truncation
  int g = round(green(c));  // for accurate RGB values
  int b = round(blue(c));
  
  // Info text
  String info = "HSB: " 
    + nf(currentH, 0, 1) + ", " 
    + nf(currentS, 0, 1) + ", " 
    + nf(currentB, 0, 1)
    + "\nRGB: " + r + ", " + g + ", " + b
    + "\nHEX: " + String.format("#%02X%02X%02X", r, g, b);

  pushStyle();
  blendMode(DIFFERENCE);
  textSize(16);
  textAlign(LEFT, TOP);
  text(info, 20, 20);
  
  // Copy confirmation
  if (showCopied && millis() - copiedTime < 2000) {
    textSize(12);
    text("copied HEX.", 20, height - 60);
  } else {
    showCopied = false;
  }
  popStyle();
}

void mouseWheel(MouseEvent event) {
  float e = event.getCount();
  if (mouseX < width/3) {
    currentH = constrain(currentH - e, 0, 360);
  } else if (mouseX < 2*width/3) {
    currentS = constrain(currentS - e, 0, 100);
  } else {
    currentB = constrain(currentB - e, 0, 100);
  }
}

void mousePressed() {
  if (mouseButton == LEFT) {
    color c = color(currentH, currentS, currentB);
    String hex = String.format("#%02X%02X%02X", 
      round(red(c)), round(green(c)), round(blue(c)));
    copyToClipboard(hex);
    showCopied = true;
    copiedTime = millis();
  }
}

void copyToClipboard(String text) {
  java.awt.datatransfer.StringSelection selection = 
    new java.awt.datatransfer.StringSelection(text);
  java.awt.Toolkit.getDefaultToolkit().getSystemClipboard().setContents(selection, null);
}
