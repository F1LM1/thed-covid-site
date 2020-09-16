/*var myData = "date	New York	San Francisco	Austin\n\
20111001	63.4	62.7	72.2\n\
20111002	58.0	59.9	67.7\n\
20111003	53.3	59.1	69.4\n\
20111004	55.7	58.8	68.0\n\
20111005	64.2	58.7	72.4\n\
20111006	58.8	57.0	77.0\n\
20111007	57.9	56.7	82.3\n\
20111008	61.8	56.8	78.9\n\
20111009	69.3	56.7	68.8\n\
20111010	71.2	60.1	68.7\n\
20111011	68.7	61.1	70.3\n\
20111012	61.8	61.5	75.3\n\
20111013	63.0	64.3	76.6\n\
20111014	66.9	67.1	66.6\n\
20111015	61.7	64.6	68.0\n\
20111016	61.8	61.6	70.6\n\
20111017	62.8	61.1	71.1\n\
20111018	60.8	59.2	70.0\n\
20111019	62.1	58.9	61.6\n\
20111020	65.1	57.2	57.4\n\
20111021	55.6	56.4	64.3\n\
20111022	54.4	60.7	72.4\n";
*/
var myDataJson = [
  {
    "date": "20111001",
    "New York": "63.4",
    "San Francisco": "62.7",
    "Austin": "72.2"
  },
  {
    "date": "20111002",
    "New York": "58.0",
    "San Francisco": "59.9",
    "Austin": "67.7"
  },
  {
    "date": "20111003",
    "New York": "53.3",
    "San Francisco": "59.1",
    "Austin": "69.4"
  },
  {
    "date": "20111004",
    "New York": "55.7",
    "San Francisco": "58.8",
    "Austin": "68.0"
  },
  {
    "date": "20111005",
    "New York": "64.2",
    "San Francisco": "58.7",
    "Austin": "72.4"
  },
  {
    "date": "20111006",
    "New York": "58.8",
    "San Francisco": "57.0",
    "Austin": "77.0"
  },
  {
    "date": "20111007",
    "New York": "57.9",
    "San Francisco": "56.7",
    "Austin": "82.3"
  },
  {
    "date": "20111008",
    "New York": "61.8",
    "San Francisco": "56.8",
    "Austin": "78.9"
  },
  {
    "date": "20111009",
    "New York": "69.3",
    "San Francisco": "56.7",
    "Austin": "68.8"
  },
  {
    "date": "20111010",
    "New York": "71.2",
    "San Francisco": "60.1",
    "Austin": "68.7"
  },
  {
    "date": "20111011",
    "New York": "68.7",
    "San Francisco": null,
    "Austin": null
  },
  {
    "date": "20111012",
    "New York": "61.8",
    "San Francisco": null,
    "Austin": null
  },
  {
    "date": "20111013",
    "New York": "63.0",
    "San Francisco": "64.3",
    "Austin": "76.6"
  },
  {
    "date": "20111014",
    "New York": "66.9",
    "San Francisco": "67.1",
    "Austin": "66.6"
  },
  {
    "date": "20111015",
    "New York": "61.7",
    "San Francisco": "64.6",
    "Austin": "68.0"
  },
  {
    "date": "20111016",
    "New York": "61.8",
    "San Francisco": "61.6",
    "Austin": "70.6"
  },
  {
    "date": "20111017",
    "New York": "62.8",
    "San Francisco": "61.1",
    "Austin": "71.1"
  },
  {
    "date": "20111018",
    "New York": "60.8",
    "San Francisco": "59.2",
    "Austin": "70.0"
  },
  {
    "date": "20111019",
    "New York": "62.1",
    "San Francisco": "58.9",
    "Austin": "61.6"
  },
  {
    "date": "20111020",
    "New York": "65.1",
    "San Francisco": "57.2",
    "Austin": "57.4"
  },
  {
    "date": "20111021",
    "New York": "55.6",
    "San Francisco": "56.4",
    "Austin": "64.3"
  },
  {
    "date": "20111022",
    "New York": "54.4",
    "San Francisco": "60.7",
    "Austin": "72.4"
  }
];

var margin = {
	top: 20,
	right: 80,
	bottom: 30,
	left: 50
  },
  width = 900 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y%m%d");

var x = d3.scaleTime()
  .range([0, width]);

var y = d3.scaleLinear()
  .range([height, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y);

var line = d3.line()
  .curve(d3.curveLinear)
  .defined(d => d.count)
  .y(function(d) {
	return y(d.count);
  })
  .x(function(d) {
	return x(d.date);
  });

var svg = d3.select("#main_plot").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data = myDataJson;

color.domain(Object.keys(data[0]).filter(function(key) {
  return key !== "date";
}));

data.forEach(function(d) {
  d.date = parseDate(d.date);
});

var metrics = color.domain().map(function(name) {
  return {
	name: name,
	values: data.map(function(d) {
	  return {
		date: d.date,
		count: d[name]
	  };
	})
  };
});

x.domain(d3.extent(data, function(d) {
  return d.date;
}));

y.domain([
  d3.min(metrics, function(c) {
	return d3.min(c.values, function(v) {
	  return v.count;
	});
  }),
  d3.max(metrics, function(c) {
	return d3.max(c.values, function(v) {
	  return v.count;
	});
  })
]);

var legend = svg.selectAll('g')
  .data(metrics)
  .enter()
  .append('g')
  .attr('class', 'legend');

legend.append('rect')
  .attr('x', width - 20)
  .attr('y', function(d, i) {
	return i * 20;
  })
  .attr('width', 10)
  .attr('height', 10)
  .style('fill', function(d) {
	return color(d.name);
  });

legend.append('text')
  .attr('x', width - 8)
  .attr('y', function(d, i) {
	return (i * 20) + 9;
  })
  .text(function(d) {
	return d.name;
  });

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("count (ºF)");

var metric = svg.selectAll(".metric")
  .data(metrics)
  .enter().append("g")
  .attr("class", "metric");

metric.append("path")
  .attr("class", "line")
  .attr("d", function(d) {
	return line(d.values);
  })
  .style("stroke", function(d) {
	return color(d.name);
  });

// Add the line
metric.selectAll(".dot")
  .data(function(d) { return d.values; })
  .enter()
  .append("circle")
	.attr("class", "dot")
	.attr("fill", "white")
	.attr("stroke", function (d) { return color(this.parentNode.__data__.name) })
	.attr("stroke-width", "1.5px")
	.attr("cx", function(d) { return x(d.date) })
	.attr("cy", function(d) { return y(d.count) })
	.attr("r", 3)

metric.append("text")
  .datum(function(d) {
	return {
	  name: d.name,
	  value: d.values[d.values.length - 1]
	};
  })
  .attr("transform", function(d) {
	return "translate(" + x(d.value.date) + "," + y(d.value.count) + ")";
  })
  .attr("x", 3)
  .attr("dy", ".35em")
  .text(function(d) {
	return d.name;
  });

var mouseG = svg.append("g")
  .attr("class", "mouse-over-effects");

mouseG.append("path") // this is the black vertical line to follow mouse
  .attr("class", "mouse-line")
  .style("stroke", "black")
  .style("stroke-width", "1px")
  .style("opacity", "0");

var lines = document.getElementsByClassName('line');

var mousePerLine = mouseG.selectAll('.mouse-per-line')
  .data(metrics)
  .enter()
  .append("g")
  .attr("class", "mouse-per-line");

mousePerLine.append("circle")
  .attr("r", 7)
  .style("stroke", function(d) {
	return color(d.name);
  })
  .style("fill", "none")
  .style("stroke-width", "1px")
  .style("opacity", "0");

mousePerLine.append("text")
  .attr("transform", "translate(10,3)");

mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
  .attr('width', width) // can't catch mouse events on a g element
  .attr('height', height)
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .on('mouseout', function() { // on mouse out hide line, circles and text
	d3.select(".mouse-line")
	  .style("opacity", "0");
	d3.selectAll(".mouse-per-line circle")
	  .style("opacity", "0");
	d3.selectAll(".mouse-per-line text")
	  .style("opacity", "0");
  })
  .on('mouseover', function() { // on mouse in show line, circles and text
	d3.select(".mouse-line")
	  .style("opacity", "1");
	d3.selectAll(".mouse-per-line circle")
	  .style("opacity", "1");
	d3.selectAll(".mouse-per-line text")
	  .style("opacity", "1");
  })
  .on('mousemove', (event) => { // mouse moving over canvas
	var mouse = d3.pointer(event);
	d3.select(".mouse-line")
	  .attr("d", function() {
		var d = "M" + mouse[0] + "," + height;
		d += " " + mouse[0] + "," + 0;
		return d;
	  });

	d3.selectAll(".mouse-per-line")
	  .attr("transform", function(d, i) {
		//console.log(width/mouse[0])
		var xDate = x.invert(mouse[0]),
			bisect = d3.bisector(function(d) { return d.date; }).center;
			idx = bisect(d.values, xDate);
		
		xpos = x(d.values[idx]['date'])
		ypos = y(d.values[idx]['count'])

		d3.selectAll(".mouse-per-line circle")
		  .filter((d, i) => !d.values[idx]['count'])
		  .style("opacity", "0");
		d3.selectAll(".mouse-per-line circle")
		  .filter((d, i) => d.values[idx]['count'])
		  .style("opacity", "1");
		d3.selectAll(".mouse-per-line text")
		  .filter((d, i) => !d.values[idx]['count'])
		  .style("opacity", "0");
		d3.selectAll(".mouse-per-line text")
		  .filter((d, i) => d.values[idx]['count'])
		  .style("opacity", "1");

		d3.select(this).select('text')
		  .text(y.invert(ypos));

		return "translate(" + xpos + "," + ypos +")";
	  });
  });

