// Global color values (HSB)
float currentH = 180; // starting hue (0-360)
float currentS = 50;  // starting saturation (0-100)
float currentB = 90;  // starting brightness (0-100)

void setup() {
  fullScreen();
  // Use HSB mode with the desired ranges for hue, saturation, brightness.
  colorMode(HSB, 360, 100, 100);
  // Use smooth text and centered alignment for the influence letters.
  textAlign(CENTER, CENTER);
}

void draw() {
  // Draw the background using the current HSB values.
  background(currentH, currentS, currentB);
  
  // Draw vertical lines to visually split the screen into 3 equal parts.
  // stroke(0, 0, 100); // white stroke for contrast
  // strokeWeight(2);
  // line(width/3, 0, width/3, height);
  // line(2 * width/3, 0, 2 * width/3, height);
  
  // Draw the influence labels ("H", "S", "B") in the center of each container using DIFFERENCE mode.
  pushStyle();
  blendMode(DIFFERENCE);
  textSize(36);
  // No need to set fill since the difference mode inverts the underlying colors.
  text("H", width/6 , height - 40);
  text("S", width/2, height - 40);
  text("B", 5 * width/6, height - 40);
  popStyle();
  
  // Prepare info string to display current HSB, plus computed RGB and HEX.
  String info = "HSB: " 
                + nf(currentH, 0, 1) + ", " 
                + nf(currentS, 0, 1) + ", " 
                + nf(currentB, 0, 1);
                
  // Get the current background color as a color variable.
  color c = color(currentH, currentS, currentB);
  // Extract RGB components (they are automatically scaled to 0-255).
  int r = int(red(c));
  int g = int(green(c));
  int b = int(blue(c));
  info += "\nRGB: " + r + ", " + g + ", " + b;
  // Convert RGB to HEX string.
  String hex = String.format("#%02X%02X%02X", r, g, b);
  info += "\nHEX: " + hex;
  
  // Draw the info text in the top left corner using DIFFERENCE mode.
  pushStyle();
  blendMode(DIFFERENCE);
  textSize(16);
  textAlign(LEFT, TOP);
  text(info, 20, 20);
  popStyle();
}

void mouseWheel(MouseEvent event) {
  float e = event.getCount(); // scroll direction (typically ±1)
  
  // Determine which third of the screen the mouse is in.
  if (mouseX < width/3) {
    // Left third controls Hue
    currentH = constrain(currentH + e, 0, 360);
  } else if (mouseX < 2 * width/3) {
    // Middle third controls Saturation
    currentS = constrain(currentS + e, 0, 100);
  } else {
    // Right third controls Brightness
    currentB = constrain(currentB + e, 0, 100);
  }
}

void mousePressed() {
  // If left mouse button is clicked, copy the HEX color to the clipboard.
  if (mouseButton == LEFT) {
    // Get the current background color.
    color c = color(currentH, currentS, currentB);
    int r = int(red(c));
    int g = int(green(c));
    int b = int(blue(c));
    String hex = String.format("#%02X%02X%02X", r, g, b);
    copyToClipboard(hex);
  }
}

// Uses Java's AWT library to copy text to the system clipboard.
void copyToClipboard(String text) {
  java.awt.datatransfer.StringSelection selection = new java.awt.datatransfer.StringSelection(text);
  java.awt.Toolkit.getDefaultToolkit().getSystemClipboard().setContents(selection, null);
}
