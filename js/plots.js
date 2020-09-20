
metric = "quarantine";
isDaily = false;

metricMap = new Map([
  ["tests", "tested"],
  ["positive", "tested positive"],
  ["confirmed", "confirmed"],
  ["isolation", "isolated"],
  ["quarantine", "quarantined"],
  ["active", "active cases"]
]);

function isDefined(val) {
  return val || val == 0;
}

function makeWhitelist(keys) {
  let totalKey = `${isDaily ? 'd' : 'c'}_${metric}_total`;
  let totalVal = `Total ${metricMap.get(metric)} ${isDaily ? 'daily' : 'cumulative'}`;
  let studentKey = `${isDaily ? 'd' : 'c'}_${metric}_students`;
  let studentVal = `Students ${metricMap.get(metric)} ${isDaily ? 'daily' : 'cumulative'}`;
  let facultyKey = `${isDaily ? 'd' : 'c'}_${metric}_staff`;
  let facultyVal = `Faculty ${metricMap.get(metric)} ${isDaily ? 'daily' : 'cumulative'}`;
  return {
    [totalKey]: totalVal,
    [studentKey]: studentVal,
    [facultyKey]: facultyVal
  };
}

async function makePlot() {
  dailyData = await fetch('https://zh860vat78.execute-api.us-east-1.amazonaws.com/prod/covid-data/daily')
                   .then(response => response.json())
                   .then(response => response.Items);
  dailyData = dailyData.map((item) => AWS.DynamoDB.Converter.unmarshall(item));
  dailyData = dailyData.sort((a, b) => a.date.localeCompare(b.date));

  cumulativeData = await fetch('https://zh860vat78.execute-api.us-east-1.amazonaws.com/prod/covid-data/cumulative')
                   .then(response => response.json())
                   .then(response => response.Items);
  cumulativeData = cumulativeData.map((item) => AWS.DynamoDB.Converter.unmarshall(item));
  cumulativeData = cumulativeData.sort((a, b) => a.date.localeCompare(b.date));

  myDataJson = isDaily ? dailyData : cumulativeData;

  var margin = {
    top: 20,
    right: 80,
    bottom: 30,
    left: 50
    },
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#main_plot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseDate = d3.timeParse("%Y-%m-%d");

  var x = d3.scaleTime()
    .range([0, width]);

  var y = d3.scaleLinear()
    .range([height, 0]);

  color = d3.scaleOrdinal(d3.schemeCategory10);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  var line = d3.line()
    .curve(d3.curveLinear)
    .defined(d => isDefined(d.count))
    .y(function(d) {
    return y(d.count);
    })
    .x(function(d) {
    return x(d.date);
    });

  var data = myDataJson;
  keys = new Set([].concat(...data.map((point) => Object.keys(point))));
  keys.delete('date');
  keys = Array.from(keys);

  whitelist = makeWhitelist(keys);
  color.domain(keys.filter(function(key) {
    return key in whitelist;
  }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  metrics = color.domain().map(function(name) {
    return {
    name: name,
    values: data
    .filter((d) => isDefined(d[name]))
    .map(function(d) {
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
    .attr('x', 32)
    .attr('y', function(d, i) {
    return i * 20 + 20;
    })
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d) {
    return color(d.name);
    });

  legend.append('text')
    .attr('x', 44)
    .attr('y', function(d, i) {
    return (i * 20) + 28;
    })
    .text(function(d) {
    return whitelist[d.name];
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
      return whitelist[d.name];
    });

  var mouseG = svg.append("g")
    .attr("class", "mouse-over-effects");

  mouseG.append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("stroke-dasharray", "1 1")
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
      
      if (Math.abs((xDate - d.values[idx]['date']) / (86400000)) >= 2) {
        d3.selectAll(this.childNodes).style("opacity", "0");
      } else {
        d3.selectAll(this.childNodes).style("opacity", "1");
      }

      d3.select(this).select('text')
        .text(Math.round(y.invert(ypos)));

      return "translate(" + xpos + "," + ypos +")";
      });
    });

  return myDataJson;
}

myDataJson = makePlot();