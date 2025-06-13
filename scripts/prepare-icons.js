// Production-ready icon preparation script for GPA Calculator
// This script generates all required icons for APK building and Play Store submission
// Run with: node scripts/prepare-icons.js

const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

// Ensure required directories exist
const dirs = [
  "./assets", 
  "./assets/adaptive-icon",
  "./assets/store-assets",
  "./assets/screenshots"
]

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  }
})

// Configuration for all required icon sizes
const iconSizes = {
  // App icons
  "icon.png": 1024,
  "adaptive-icon/foreground.png": 1024,
  "adaptive-icon/background.png": 1024,
  
  // Store assets
  "store-assets/app-icon-512.png": 512,
  "store-assets/feature-graphic.png": { width: 1024, height: 500 },
  
  // Splash screen
  "splash.png": 1024,
  
  // Favicon
  "favicon.png": 48
}

// Path to your source icon (should be high quality PNG, 1024x1024 recommended)
const sourceIconPath = "./assets/icon.png"

async function createIcons() {
  try {
    // Check if source icon exists
    if (!fs.existsSync(sourceIconPath)) {
      console.log("❌ Source icon not found at ./assets/icon.png")
      console.log("📝 Please place your high-quality app icon (1024x1024 PNG) at ./assets/icon.png")
      return
    }

    console.log("🚀 Starting icon generation...")
    
    // Get source image info
    const sourceImage = sharp(sourceIconPath)
    const metadata = await sourceImage.metadata()
    console.log(`📊 Source image: ${metadata.width}x${metadata.height}`)

    // Generate all required icons
    for (const [filename, size] of Object.entries(iconSizes)) {
      const outputPath = `./assets/${filename}`
      
      try {
        if (typeof size === 'number') {
          // Square icons
          await sourceImage
            .resize(size, size, { 
              kernel: sharp.kernel.lanczos3,
              fit: 'cover',
              position: 'center'
            })
            .png({ quality: 100, compressionLevel: 6 })
            .toFile(outputPath)
          
          console.log(`✅ Generated: ${filename} (${size}x${size})`)
        } else {
          // Non-square assets (like feature graphic)
          if (filename.includes('feature-graphic')) {
            // Create a feature graphic with app icon centered
            const background = sharp({
              create: {
                width: size.width,
                height: size.height,
                channels: 4,
                background: { r: 98, g: 0, b: 238, alpha: 1 } // Primary app color
              }
            })

            const iconOverlay = await sourceImage
              .resize(300, 300)
              .png()
              .toBuffer()

            await background
              .composite([{
                input: iconOverlay,
                left: Math.floor((size.width - 300) / 2),
                top: Math.floor((size.height - 300) / 2)
              }])
              .png({ quality: 100 })
              .toFile(outputPath)
            
            console.log(`✅ Generated: ${filename} (${size.width}x${size.height})`)
          }
        }
      } catch (error) {
        console.log(`❌ Failed to generate ${filename}:`, error.message)
      }
    }

    // Create adaptive icon background (solid color)
    const adaptiveBackground = sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 98, g: 0, b: 238, alpha: 1 } // App primary color
      }
    })

    await adaptiveBackground
      .png({ quality: 100 })
      .toFile('./assets/adaptive-icon/background.png')
    
    console.log("✅ Generated: adaptive-icon/background.png")

    // Copy main icon as adaptive foreground
    await sourceImage
      .resize(1024, 1024)
      .png({ quality: 100 })
      .toFile('./assets/adaptive-icon/foreground.png')
    
    console.log("✅ Generated: adaptive-icon/foreground.png")

    console.log("\n🎉 Icon generation complete!")
    console.log("📋 Generated files:")
    console.log("   • App icon (1024x1024)")
    console.log("   • Adaptive icons (foreground + background)")
    console.log("   • Play Store assets (512x512 icon, feature graphic)")
    console.log("   • Splash screen icon")
    console.log("   • Favicon")
    
    console.log("\n📱 Next steps for APK building:")
    console.log("   1. Update app.json with correct icon paths")
    console.log("   2. Run: eas build --platform android --profile preview")
    console.log("   3. Test the generated APK")
    console.log("   4. For production: eas build --platform android --profile production")

  } catch (error) {
    console.error("❌ Error generating icons:", error)
  }
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
