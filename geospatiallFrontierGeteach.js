ui.root.clear();
var leftMap = ui.Map();
var rightMap = ui.Map();

//Cloud Mask Function
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

//Loading two maps filter dates and clouds
var left = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate('2018-10-01', '2018-11-01')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .map(maskS2clouds);
var right = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate('2019-10-01', '2019-11-01')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .map(maskS2clouds);                  

//Set/configure bands
var rgbVis = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

//add layers getData --> Set Bands --> Title
leftMap.addLayer(left.median(), rgbVis, 'October 2018');
rightMap.addLayer(right.median(), rgbVis, 'October 2019');

// Create a SplitPanel to hold the adjacent, linked maps.
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  wipe: true,
  style: {stretch: 'both'}
});

ui.root.widgets().reset([splitPanel]);
var linker = ui.Map.Linker([leftMap, rightMap]);
leftMap.setCenter(-121.6800915, 39.76368, 12);