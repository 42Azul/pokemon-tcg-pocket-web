#!/bin/bash

# Define sets and max card number
SETS=("A1" "A1a" "A2" "P-A")
MAX_CARDS=400
OUTPUT_DIR="../public/card_images"  # Ensure this is the correct relative path
PARALLEL_DOWNLOADS=20  # Max parallel downloads at the same time

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to fetch a card image
fetch_card_image() {
  OUTPUT_DIR="../public/card_images"  # Ensure this is the correct relative path
  local SET=$1
  local NUMBER=$2
  CARD_URL="https://pocket.limitlesstcg.com/cards/$SET/$NUMBER"

  # Fetch HTML
  HTML=$(curl -s "$CARD_URL")

  # Extract the first .webp image URL (and clean encoding issues)
  IMAGE_URL=$(echo "$HTML" | grep -oE 'https://[^"]+\.webp' | head -n 1 | tr -d '\r')

  # If an image was found, download it
  if [[ -n "$IMAGE_URL" ]]; then
    FILENAME="${SET}_${NUMBER}.webp"
    echo "Downloading $IMAGE_URL -> $OUTPUT_DIR/$FILENAME"
    curl "$IMAGE_URL" -o "$OUTPUT_DIR/$FILENAME"
  else
    echo "No image found for $SET/$NUMBER."
  fi
}

# Export function so it works inside xargs
export -f fetch_card_image

# Loop through sets and download in parallel
for SET in "${SETS[@]}"; do
  echo "Processing set: $SET"
  seq 0 $((MAX_CARDS - 1)) | xargs -I {} -P $PARALLEL_DOWNLOADS bash -c "fetch_card_image $SET {}"
done

echo "All available images have been downloaded."
