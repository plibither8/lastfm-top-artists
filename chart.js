const d3 = {
	...require('d3@5'),
	...require('d3-array@2')
};

const svg = d3.create('svg')
	.attr('viewBox', [0, 0, width, height]);

const updateBars = bars(svg);
const updateAxis = axis(svg);
const updateLabels = labels(svg);
const updateTicker = ticker(svg);

yield svg.node();

for (const keyframe of keyframes) {
	const transition = svg.transition()
		.duration(duration)
		.ease(d3.easeLinear);

	// Extract the top bar’s value.
	x.domain([0, keyframe[1][0].value]);

	updateAxis(keyframe, transition);
	updateBars(keyframe, transition);
	updateLabels(keyframe, transition);
	updateTicker(keyframe, transition);

	invalidation.then(() => svg.interrupt());
	await transition.end();
}
