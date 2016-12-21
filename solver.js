fs  = require('fs');
PNG = require('node-png').PNG;

// Image height and width
var height = 0;
var width  = 0;

// Color pixel
function colorPixel (solution, idx) {
	// On default transparent, set visible by changing opacity
	solution[idx+3] = 255;
};

// Next step
function nextStep (source, solution, idx, left, right, straight) {
	// Colors
	var a = source[idx];
	var b = source[idx+1];
	var c = source[idx+2];
	// Check the pixel color
	if (a===182 && b===149 && c===72) {
		right(source, solution, idx);
	} else if (a===123 && b===131 && c===154) {
		left(source, solution, idx);
	} else if (a!==51 || b!==69 || c!==169) {
		straight(source, solution, idx);
	}
};

// Draw line up
function drawUp (source, solution, idx) {
	var newIdx = idx - 4 * width;
	colorPixel(solution, newIdx);
	nextStep(source, solution, newIdx, drawLeft, drawRight, drawUp);
};

// Draw line right
function drawRight (source, solution, idx) {
	var newIdx = idx + 4;
	colorPixel(solution, newIdx);
	nextStep(source, solution, newIdx, drawUp, drawDown, drawRight);
};

// Draw line down
function drawDown (source, solution, idx) {
	var newIdx = idx + 4 * width;
	colorPixel(solution, newIdx);
	nextStep(source, solution, newIdx, drawRight, drawLeft, drawDown);
};

// Draw line left
function drawLeft (source, solution, idx) {
	var newIdx = idx - 4;
	colorPixel(solution, newIdx);
	nextStep(source, solution, newIdx, drawDown, drawUp, drawLeft);
};

// Open the puzzle image as a promise
var getSourceImage = new Promise(function (resolve, reject) {
	fs.createReadStream('pahkina.png')
	.pipe(new PNG({
		filterType: 4
	}))
	.on('parsed', function (data) {
		height = this.height;
		width  = this.width;
		resolve(data);
	})
	.on('error', function (error) {
		reject(error);
	});
});

// Draw the solution from the source
function drawSolution (source) {
	// A copy of the source image to work as our drawing pad
	var solution = Buffer.alloc(source.length);
	// Go through all pixels in the puzzle image
	for (var xy = 0; xy < height*width; xy++) {
		var idx = xy*4; // Each pixel is 4 slots. 3 for colors and 1 for opacity.
		// Colors
		var a = source[idx];
		var b = source[idx+1];
		var c = source[idx+2];
		// Check pixel if we should start drawing
		if (a===7 && b===84 && c===19) {
			colorPixel(solution, idx);
			drawUp(source, solution, idx);
		} else if (a===139 && b===57 && c===137) {
			colorPixel(solution, idx);
			drawLeft(source, solution, idx);
		}
	}
	return solution;
};

// Save the solution in a new PNG file
function saveSolution (solution) {
	var png = new PNG({
		width      : width,
		height     : height,
		filterType : -1
	});
	png.data = solution;
	png.pack().pipe(fs.createWriteStream('solution.png'));
	return true;
};

// Solve the puzzle
getSourceImage
.then(drawSolution)
.then(saveSolution)
.then(function () {
	console.log('Solution.png successfully generated!');
})
.catch(function (error) {
	console.log(error);
});