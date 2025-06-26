# SVG Bulk Processor

Built upon SVG Iconset Cropper (https://github.com/jgillick/SVGIconsetCropper), but adapted for specific use case. Additional this tool will rename all files to a pattern of 'icon--name.svg' etc. It will also convert all fill attributes to 'currentColor'. 

This tool automatically trims the whitespace from around a batch of SVG icons, using the method developed by the awesome [svgcrop.com](https://svgcrop.com/) ([source](https://github.com/sdennett55/svg_crop/)).

## Usage

### 1. Setup the cropper

Clone this repo and install the dependencies:

```shell
git clone https://github.com/rhysmatthew/svg-bulk-processor.git

cd svg-bulk-processor

yarn install
```

### 2. Add your source SVGs into /input or other source folder

### 3. Start the cropper tool server

```shell
yarn cropper

# Alternatively, you can specify the input and output directories
yarn cropper --in ./icons --out ./cropped/
```

### 4. Crop SVGs

Cropping happens in the browser, so open your browser to http://localhost:{port}/ and then press the Start button.

Now sit back and wait for the cropped SVG icons to fill the output directory.