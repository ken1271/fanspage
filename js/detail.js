$(document).ready(function(){
  getInfo()
})

function getInfo(){
  var data;
  try{
    data=window.opener.cal;
  }catch(e){
    alert('error');
  }
  render(data)
}
function render(dataArr){
  var ractive=new Ractive({
    el:'#output',
    template:'#template',
    data:{
      info:dataArr
    }
  });
}
