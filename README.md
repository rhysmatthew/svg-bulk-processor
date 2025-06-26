# SVG Bulk Processor

Built upon SVG Iconset Cropper (https://github.com/jgillick/SVGIconsetCropper), but adapted for specific use case. Additionally this tool will rename all files with a pattern of 'icon--{name}.svg'. It will also convert all fill attributes to 'currentColor'. 

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

### 3. Start the SVG Bulk Processor server

```shell
yarn process

# Alternatively, you can specify the input and output directories
yarn process --in ./icons --out ./cropped/

# Add the outline flag to append '-outline' to the filenames, useful for duplicate icons that are the outlined versions of the same icon. 
yarn process --is-outline=true
```

### 4. Crop SVGs

Cropping happens in the browser, so open your browser to http://localhost:{port}/ and then press the Start button.

Now sit back and wait for the cropped SVG icons to fill the output directory.
