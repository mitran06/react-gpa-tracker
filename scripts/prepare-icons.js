// This script will help you scale up your small icon
// Run this with Node.js after placing your small icon in the assets folder

const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

// Make sure the directories exist
const dirs = ["./assets", "./assets/adaptive-icon"]
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Path to your small icon
const smallIconPath = "./assets/small-icon.png" // Place your 56x54 icon here

async function createIcons() {
  try {
    // Create app icon (1024x1024)
    await sharp(smallIconPath)
      .resize(1024, 1024, {
        fit: "contain",
        background: { r: 18, g: 18, b: 18, alpha: 1 }, // Dark background (#121212)
      })
      .toFile("./assets/icon.png")
    console.log("✅ Created app icon")

    // Create adaptive icon foreground
    await sharp(smallIconPath)
      .resize(1024, 1024, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .toFile("./assets/adaptive-icon/foreground.png")
    console.log("✅ Created adaptive icon foreground")

    // Create splash screen with icon centered
    await sharp({
      create: {
        width: 1242,
        height: 2436,
        channels: 4,
        background: { r: 18, g: 18, b: 18, alpha: 1 }, // Dark background (#121212)
      },
    })
      .composite([
        {
          input: await sharp(smallIconPath).resize(400, 400, { fit: "contain" }).toBuffer(),
          gravity: "center",
        },
      ])
      .toFile("./assets/splash.png")
    console.log("✅ Created splash screen")

    console.log("All icons created successfully!")
  } catch (error) {
    console.error("Error creating icons:", error)
  }
}

createIcons()
