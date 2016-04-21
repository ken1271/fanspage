$(document).ready(function(){
  getInfo()
})

function getInfo(){
  var path="https://fanscalculation.firebaseio.com/";
  var firebaseRef = new Firebase(path);
  firebaseRef.on('value',function(snapshot){
    var data=snapshot.val();
    render(data)
  });
}
function render(dataArr){
  var ractive=new Ractive({
    el:'#output',
    template:'#template',
    data:{
      info:dataArr
    }
  });
  console.log(dataArr);
}
function splitUrl() {
    var args = new Object(); //object for search
    var query = location.search.substring(1); //substring from '?'
    var pairs = query.split('&'); //remove '&' type=array
    for (var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf('=');
        if (pos == -1) continue; //if !'=' return -1; continue
        var argname = pairs[i].substring(0, pos);
        var value = pairs[i].substring(pos + 1);
        args[argname] = unescape(value); //
    }
    return args;
}
