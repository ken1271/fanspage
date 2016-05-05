$(document).ready(function(){
  getInfo()
});

function getInfo(){
  var data;
  try{
    data=window.opener.cal;
  }catch(e){
    alert('error');
  }
  render(data.data);
}
function render(dataArr){
  var ractive=new Ractive({
    el:'#output',
    template:'#template',
    data:{
      info:dataArr
    }
  });
  ractive.on('download',function(){
    $('#datatable').tableExport({type:'csv',escape:'false',tableName:window.opener.id+window.opener.date+'_total'});
  })
}
