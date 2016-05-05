$(document).ready(function(){
  fbinit();
  render();
  
  $(window).load(function() {
    $("#selectBirthday").birthdaypicker({
        monthFormat: "short",
        maxAge: 100,
        futureDates: false,
        defaultDate: '2016-04-01',
        dateFormat: "bigEndian",
    });
  });
})

var path="https://fans-page.firebaseio.com/";
var firebaseRef = new Firebase(path);

var ref=new Firebase('https://fanscalculation.firebaseio.com/');
ref.set('')
var url='https://graph.facebook.com/v2.5/';
var id='GoodideasStudio'
//var id='mcdonalds.tw';

var commentUrl='',
    nextUrl='';

var storage = new Storage();
var cal = new Calculation();

function render(){
    firebaseRef.set('')
    var input={
      id:'',
      date:''
    }
    var posts=[]
    var ractive=new Ractive({
      el:'#output',
      template: '#fbsearch',
      data:{
        posts:posts,
        input:input,
        show:'none',
        likesort:1,//
        commentsort:1,//
      }
    });
    //console.log(ractive.get('show'));
    //console.log('storage',storage);

    firebaseRef.on('value',function(snapshot){
      var data=storage.method.getPost.apply(storage)
      data=data.sort(function (a, b) {
        if (a.likes_total > b.likes_total) {
          return -1;
        }
        else if (a.likes_total < b.likes_total) {
          return 1;
        }
        // a must be equal to b
        return 0;
      });
      var posts=[];
      console.log('data',data);
      for(key in data){
        var post={
          key:key,
          id:data[key].id,
          message:data[key].message,
          likes:data[key].likes_total,
          comments:data[key].comments_total,
        }
        posts.push(post);
      }
      ractive.set('posts',posts);
      //ractive.set('csv',convertCSV(ractive.get('posts')));
    })
    var num=1;

    firebaseRef.on('child_added',function(snapshot){
      cal.method.addLikes.apply(cal,snapshot.val().likes);
      cal.method.addComments.apply(cal,snapshot.val().comments);
      ref.set(cal.data);
    });
    ractive.on('search',function(e){
      var formEvent=e.original.target.form;
      cal.method.reset.apply(cal);
      firebaseRef.set('');
      ref.set('');
      var year = formEvent[2].value;
      var month = dateType(formEvent[3].value);
      var day = dateType(formEvent[4].value);
      date = year + '-' + month + '-' + day;
      //console.log('date',date);
      var query='?fields=posts.since('+date+').limit(1)%7Bcomments.limit(300).summary(true)%2Clikes.limit(1000).summary(true)%2Cshares%2Cmessage%7D';
      ractive.set('show','inline-block')
      FB.getLoginStatus(function(res){
        if(res.status==='connected'){
          getInfo(url+ractive.get('input.id')+query);
        }
        else {
          FB.login(function(res){
            getInfo(url+ractive.get('input.id')+query);
          });
        }
      })
    });
    ractive.on('likes',function(e){
      openUrl(e,'likes');
    });
    ractive.on('comments',function(e){
      openUrl(e,'comments');
    })
    ractive.on('detail',function(){
      var url='./view/detail.html';
      window.open(url)
    });
    ractive.on('sortLikes',function(){
      var post=ractive.get('posts');
      if(ractive.get('likesort')>0){
        ractive.set('likesort',-1);
        post=post.sort(function(a,b){
          if (a.likes > b.likes) {
            return 1;
          }
          else if (a.likes < b.likes) {
            return -1;
          }
          return 0;
        });
      }
      else {
        ractive.set('likesort',1);
        post=post.sort(function(a,b){
          if (a.likes > b.likes) {
            return -1;
          }
          else if (a.likes < b.likes) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });
      }
      ractive.set('posts',post);
    });
    ractive.on('sortComments',function(){
      var post=ractive.get('posts');
      if(ractive.get('commentsort')>0){
        ractive.set('commentsort',-1);
        post=post.sort(function(a,b){
          if (a.comments > b.comments) {
            return 1;
          }
          else if (a.comments < b.comments) {
            return -1;
          }
          return 0;
        });
      }
      else {
        ractive.set('commentsort',1);
        post=post.sort(function(a,b){
          if (a.comments > b.comments) {
            return -1;
          }
          else if (a.comments < b.comments) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });
      }
      ractive.set('posts',post);
    });
    ractive.on('download',function(e){
      var formEvent=e.original.target.form;
      var year = formEvent[2].value;
      var month = dateType(formEvent[3].value);
      var day = dateType(formEvent[4].value);
      date = '_'+year + '-' + month + '-' + day;
      $('#datatable').tableExport({type:'csv',escape:'false',tableName:ractive.get('input.id')+date});
    })
}
function dateType(num){
  if(num.length<2){
    num='0'+num;
  }
  return num;
}
function sortLikes(a,b){
  if (a.likes_total > b.likes_total) {
    return 1;
  }
  else if (a.likes_total < b.likes_total) {
    return -1;
  }
  return 0;
}
function convertCSV(data){
  var symbol=String.fromCharCode(0x0d);
  //console.log(data);
  var str='Num,ID,Message,Likes,Comments'+"\r\n";
  for(key in data){
    for(index in data[key]){
      str+='"'+data[key][index].toString()+'"'+',';
    }
    str+="\r\n";
  }
  console.log('str',str);
  return str;
}
function openUrl(e,name){
  var url='./view/'+name+'.html?id='+e.context.key;
  window.open(url,storage.method.getPost.apply(storage)[e.context.key])
}
//<a href="data:text/csv;charset=utf-8,{{csv}}" download="data.csv"><button style='display:{{show}};' type="button" class="btn btn-default form-control col-xs-1" on-click='download'>Download</button></a>//
