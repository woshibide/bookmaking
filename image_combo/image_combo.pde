import java.io.File;
import java.util.ArrayList;
import java.util.Stack;

ArrayList<String> imageNames = new ArrayList<String>();
Stack<String> leftImageHistory = new Stack<String>();
Stack<String> rightImageHistory = new Stack<String>();

PImage leftImage;
PImage rightImage;

void setup() {
  fullScreen();
  
  // Get list of image files in the data folder
  File dataFolder = new File(sketchPath("data"));
  File[] files = dataFolder.listFiles();
  
  for (File file : files) {
    if (file.isFile()) {
      String name = file.getName();
      // Check if file is an image
      if (name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".png") ||
          name.toLowerCase().endsWith(".jpeg") || name.toLowerCase().endsWith(".gif")) {
        imageNames.add(name);
      }
    }
  }
  
  if (imageNames.size() < 2) {
    println("Need at least two images in the data folder.");
    exit();
  }
  
  // Initialize image histories
  leftImageHistory.push(imageNames.get(0)); // Start with the first image
  rightImageHistory.push(imageNames.get(1)); // Start with the second image
  
  // Load initial images
  leftImage = loadImage(leftImageHistory.peek());
  rightImage = loadImage(rightImageHistory.peek());
}

void draw() {
  background(255);
  
  // Display left image
  if (leftImage != null) {
    displayImage(leftImage, 0, 0, width/2, height);
  }
  
  // Display right image
  if (rightImage != null) {
    displayImage(rightImage, width/2, 0, width/2, height);
  }
  
  // Display image names at the bottom
  push();
  blendMode(EXCLUSION);
  fill(255);
  textSize(18);
  textAlign(LEFT, BOTTOM);
  text(leftImageHistory.peek(), 10, height - 10);
  text(rightImageHistory.peek(), (width/2) + 20, height - 10);
  pop();
}

void mouseClicked() {
  if (mouseX < width/2) {
    // Left half
    if (mouseButton == RIGHT) {
      revertLeftImage();
    } else if (mouseButton == LEFT) {
      changeLeftImage();
    }
  } else {
    // Right half
    if (mouseButton == RIGHT) {
      revertRightImage();
    } else if (mouseButton == LEFT) {
      changeRightImage();
    }
  }
}

void changeLeftImage() {
  String currentName = leftImageHistory.peek();
  String newName = getRandomImageNameExcluding(currentName);
  leftImageHistory.push(newName);
  
  // Load the new image
  leftImage = loadImage(newName);
}

void revertLeftImage() {
  if (leftImageHistory.size() > 1) {
    leftImageHistory.pop();
    String previousName = leftImageHistory.peek();
    
    // Load the previous image
    leftImage = loadImage(previousName);
  }
}

void changeRightImage() {
  String currentName = rightImageHistory.peek();
  String newName = getRandomImageNameExcluding(currentName);
  rightImageHistory.push(newName);
  
  // Load the new image
  rightImage = loadImage(newName);
}

void revertRightImage() {
  if (rightImageHistory.size() > 1) {
    rightImageHistory.pop();
    String previousName = rightImageHistory.peek();
    
    // Load the previous image
    rightImage = loadImage(previousName);
  }
}

String getRandomImageNameExcluding(String excludeName) {
  if (imageNames.size() <= 1) return excludeName;
  String newName;
  do {
    int index = (int)random(imageNames.size());
    newName = imageNames.get(index);
  } while (newName.equals(excludeName));
  return newName;
}

void displayImage(PImage img, float x, float y, float maxWidth, float maxHeight) {
  float imgAspect = (float)img.width / img.height;
  float areaAspect = maxWidth / maxHeight;
  
  float drawWidth, drawHeight;
  
  if (imgAspect > areaAspect) {
    // Image is wider than the area
    drawWidth = maxWidth;
    drawHeight = maxWidth / imgAspect;
  } else {
    // Image is taller than the area
    drawHeight = maxHeight;
    drawWidth = maxHeight * imgAspect;
  }
  
  float drawX = x + (maxWidth - drawWidth) / 2;
  float drawY = y + (maxHeight - drawHeight) / 2;
  
  image(img, drawX, drawY, drawWidth, drawHeight);
}
