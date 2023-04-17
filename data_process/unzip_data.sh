#!/usr/bin/env zsh

echo "====== unzip data ======"
# create data folder if not exist
mkdir -p ./data

for file in ./zipped_data/*.tar.gz; do
  echo "unzip $file to ./data"
  tar -xzf "$file" -C ./data
done

echo "====== unzip data done ======"