function Recordset (id,options,data) {
  this.id = id;
  this.name = options.name;
  this.data = data;
  this.type = options.type;
  this.active = data.slice(0);
/*  if (options.type == "integer"){
    this.functions = ['min','max','extent','sum','mean','median','quantile','mode','variance','deviation'];
  }
  else if (options.type == "float"){
    this.functions = ['min','max','extent','sum','mean','median','quantile','mode','variance','deviation'];
  }
  else if (options.type == "percentage"){
    this.functions = ['min','max','extent','sum','mean','median','quantile','mode','variance','deviation'];
  }
  else if (options.type == "category"){
    this.functions = ['mode'];
    this.levels = options.levels;
  }
  else if (options.type == "identifier"){
    this.functions = [];
  } */
  return this;
}

d3.mode = function(arr){
  if (!arr || arr.length == 0) return undefined;
  var modeMap = {};
  var maxEl = arr[0], maxCount = 1;
  for(var i = 0; i < arr.length; i++){
    var el = arr[i];
    if(modeMap[el] == null){
      modeMap[el] = 1;
    }
    else {
      modeMap[el]++;
    }
    if(modeMap[el] > maxCount){
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}
