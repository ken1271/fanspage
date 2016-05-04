$(document).ready(function(){
  fbinit();
  render();
  //searchbtn();
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
      template: '#template',
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
      ractive.set('csv',convertCSV(ractive.get('posts')));
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
      var url='./view/likes.html?id='+e.context.key
      window.open(url,storage.method.getPost.apply(storage)[e.context.key])
    })
    ractive.on('comments',function(e){
      var url='./view/comments.html?id='+e.context.key
      window.open(url)
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
  //console.log(data);
  var str='Num,ID,Message,Likes,Comments'+'\r\n';
  for(key in data){
    for(index in data[key]){
      str+=data[key][index]+',';
    }
    str=str.slice(0,str.length-1)+'\r\n';
  }
  console.log('str',str);
  return str;
}
