function Dataset (options) {
  this.name = options.name;
  this.rs = {};
  return this;
}

Dataset.prototype.loadMeta = function () {
  // includes details of available recordsets
  var dataset = this;
  d3.json(dataset.name+'/meta.json',function(error,json){
    if (error) return console.warn(error);
    dataset.meta = json;
    dataset.plots = {};
    //dataset.prepareFilters();
    var elements = [];
    if (json.hasOwnProperty('mainplot')){
      if (json.mainplot.hasOwnProperty('x')){
        dataset.loadRecordSet('x',json.mainplot.x.datatype);
        elements.push('x');
      }
      if (json.mainplot.hasOwnProperty('y')){
        dataset.loadRecordSet('y',json.mainplot.y.datatype);
        elements.push('y');
      }
      if (json.mainplot.hasOwnProperty('series')){
        dataset.loadRecordSet('series',json.mainplot.series.datatype);
        elements.push('series');
      }
      dataset.plots['mainplot'] = json.mainplot
    }
    dataset.elements = elements;
    dataset.preparePlot("mainplot");
  })
  return this;
}

Dataset.prototype.hexbin = function (plot) {
  console.time('hexbin')
  var dataset = this;

  var color = d3.scale.log()
    .domain([1, 100000])
    .range(["#eeeeee", "steelblue"])
    .interpolate(d3.interpolateLab);

  var hexbin = d3.hexbin()
    .size([500, 500])
    .radius(20);
  var svg = d3.select("body").append("svg")
    .attr("width", 500)
    .attr("height", 500);
var hexagon = svg.append("g")
    .attr("class", "hexagons")
  .selectAll("path")
    .data(hexbin(plot.points))
  .enter().append("path")
    .attr("d", hexbin.hexagon(20))
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d) { return color(d.length); });
    console.timeEnd('hexbin')
  return this;
}

Dataset.prototype.preparePlot = function (plotname) {
  var dataset = this;
  check(function(){
    console.time('generate')
    var plot = dataset.plots[plotname];
    plot.x.data = dataset.rs.x.active;
    plot.y.data = dataset.rs.y.active;
    var randomX = d3.random.normal(d3.mean(dataset.rs.x.active), d3.deviation(dataset.rs.x.active)),
      randomY = d3.random.normal(d3.mean(dataset.rs.y.active), d3.deviation(dataset.rs.y.active))
      plot.x.data = d3.range(500000).map(function() { return Math.abs(randomX()); });
      plot.y.data = d3.range(500000).map(function() { return Math.abs(randomY()); });
    console.timeEnd('generate')
    console.time('prepare')
    plot.series.data = dataset.rs.series.active;
    var xScale = plot.x.scale == 'log10' ? d3.scale.log() : plot.x.scale == 'sqrt' ? d3.scale.sqrt() : d3.scale.linear()
    xScale.domain(plot.x.bounds).range([0,500]);
    var yScale = plot.y.scale == 'log10' ? d3.scale.log() : plot.y.scale == 'sqrt' ? d3.scale.sqrt() : d3.scale.linear()
    yScale.domain(plot.y.bounds).range([0,500]);
    plot.points = plot.x.data.map(function(d,i){return [xScale(d),yScale(plot.y.data[i])]});
    //plot.x.scaledData = plot.x.data.map(function(d){return xScale(d)});
    //plot.y.scaledData = plot.y.data.map(function(d){return yScale(d)});
    //plot.points = [];
    //plot.x.scaledData.forEach(function (x,i) {
    //  plot.points.push([x,plot.y.scaledData[i]])
    //})
    console.timeEnd('prepare')
    if (dataset.plots[plotname].type == 'hexbin'){
      dataset.hexbin(plot);
    }
  });
  function check(callback){
    var ready = 1;
    dataset.elements.forEach(function(el){
      if (!dataset.rs.hasOwnProperty(el)){
        ready = 0;
      }
    })
    if (ready > 0){
      setTimeout(callback.bind(null, null), 10);
    }
    else {
      setTimeout(check.bind(null, callback), 10);
    }
  }
  return this;
}


Dataset.prototype.loadRecordSet = function (id,arr) {
  // includes details of available recordsets
  var dataset = this;
  var path = arr.join('/')
  d3.json(dataset.name+'/'+path+'.json',function(error,json){
    if (error) return console.warn(error);
    dataset.rs[id] = new Recordset(id,dataset.meta.datatypes[arr[arr.length-1]],json)
  })
  return this;
}

/*
Dataset.prototype.addDatatypes = function () {
  // includes details of available recordsets
  var dataset = this;
  Object.keys(dataset.meta.datatypes).forEach(function(datatype){
    dataset.dt[datatype] = new Datatype(dataset.meta.datatypes[datatype])
    dataset.dt[datatype].bindFunctions();
  })
  return this;
}

Dataset.prototype.loadProperties = function () {
  // includes details of available recordsets
  var dataset = this;
  d3.json(dataset.name+'/properties.json',function(error,json){
    if (error) return console.warn(error);
    dataset.properties = json;
    dataset.setProperties();
  })
  return this;
}

Dataset.prototype.setProperties = function () {
  // includes details of available recordsets
  var dataset = this;
  if (dataset.properties){
    dataset.datatypes = {};
    Object.keys(dataset.properties).forEach(function(property){
      if (dataset.properties[property].hasOwnProperty("isa")){

      }
      else {
        dataset.datatypes[property] = new Datatype(dataset.properties[property])
        console.log(dataset.datatypes[property].min())
      }
    })
  }
  else {
    dataset.loadProperties();
  }
  return this;
}
*/
